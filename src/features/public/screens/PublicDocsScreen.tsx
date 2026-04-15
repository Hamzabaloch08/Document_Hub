import {
    clearDocumentError,
    clearDocumentSuccess,
} from "@/src/features/document/redux/documentSlice";
import {
    createDocument,
    deleteDocument,
    fetchPublicDocuments,
    markDocumentAsRead,
    searchPublicDocuments,
    updateDocument,
} from "@/src/features/document/redux/documentThunks";
import { DocumentItem, DocumentVisibility } from "@/src/features/document/types/documentTypes";
import { fetchUserWorkspaces } from "@/src/features/workspace/redux/workspaceThunks";
import { useDebounce } from "@/src/shared/hooks/useDebounce";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useDispatch, useSelector } from "react-redux";

// ── HTML renderer for doc content ────────────────────────────────────────────
const buildDocumentHtml = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0; padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0f172a; background: #ffffff;
        line-height: 1.65; word-break: break-word;
      }
      h1,h2,h3,h4,h5,h6 { margin: 0 0 12px; line-height: 1.25; }
      p { margin: 0 0 12px; }
      ul,ol { padding-left: 22px; margin: 0 0 12px; }
      li { margin-bottom: 8px; }
      pre { margin:16px 0; padding:14px; border-radius:16px; background:#0f172a; color:#e2e8f0; overflow-x:auto; white-space:pre-wrap; word-break:break-word; }
      code { padding:2px 6px; border-radius:8px; background:#f1f5f9; color:#111827; font-size:0.95em; }
      pre code { padding:0; background:transparent; color:inherit; }
      blockquote { margin:16px 0; padding:0 0 0 14px; border-left:4px solid #cbd5e1; color:#475569; }
      img,video { max-width:100%; height:auto; border-radius:12px; }
      table { width:100%; border-collapse:collapse; margin:16px 0; }
      th,td { border:1px solid #e2e8f0; padding:10px; text-align:left; vertical-align:top; }
      hr { border:0; border-top:1px solid #e2e8f0; margin:18px 0; }
    </style>
  </head>
  <body>${content || "<p>No content available.</p>"}</body>
</html>
`;

const formatDate = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const getWorkspaceId = (doc: DocumentItem) => {
  if (typeof doc.workspaceId === "string") return doc.workspaceId;
  return doc.workspaceId?._id || "";
};

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = () => ({
  title: "",
  content: "",
  visibility: "public" as DocumentVisibility,
  workspaceId: "",
});

export default function PublicDocsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();

  const { publicDocuments, loading, actionLoading, error, successMessage } =
    useSelector((state: RootState) => state.document);
  const { workspaces } = useSelector((state: RootState) => state.workspace);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery.trim(), 350);

  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">("viewer");

  // ── Create / Edit modal state ─────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const titleInputRef = useRef<TextInput>(null);
  const editorRef = useRef<RichEditor>(null);

  // ── Load user role + workspaces (for create form) ─────────────────────────
  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (!raw) return;
      try {
        const u = JSON.parse(raw);
        const r = (u?.role || "viewer").toLowerCase();
        if (r === "admin" || r === "editor" || r === "viewer") {
          setUserRole(r as any);
          // Load workspaces so the create-doc picker is populated
          if (r === "admin" || r === "editor") {
            dispatch(fetchUserWorkspaces());
          }
        }
      } catch {}
    });
  }, [dispatch]);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPublicDocuments());
  }, [dispatch]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length === 0) {
      dispatch(fetchPublicDocuments());
    } else {
      dispatch(searchPublicDocuments({ query: debouncedQuery }));
    }
  }, [debouncedQuery, dispatch]);

  // ── Error / success handlers ──────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    Alert.alert("Error", error, [
      { text: "OK", onPress: () => dispatch(clearDocumentError()) },
    ]);
  }, [dispatch, error]);

  useEffect(() => {
    if (!successMessage) return;
    dispatch(clearDocumentSuccess());
  }, [dispatch, successMessage]);

  // ── Open a document (navigate to workspace detail) ────────────────────────
  const handleOpenDocument = (doc: DocumentItem) => {
    dispatch(markDocumentAsRead({ documentId: doc._id }));
    const wsId = getWorkspaceId(doc);
    if (wsId) nav.push(`/(workspace)/detail?id=${wsId}&docId=${doc._id}`);
  };

  // ── Open form for CREATE ──────────────────────────────────────────────────
  const handleOpenCreate = () => {
    nav.push({
      pathname: "/(workspace)/edit-doc",
      params: {}, // User will select workspace in the new screen if we want, or we can just send the first one
    });
  };

  // ── Open form for EDIT ────────────────────────────────────────────────────
  const handleOpenEdit = (doc: DocumentItem) => {
    nav.push({
      pathname: "/(workspace)/edit-doc",
      params: {
        docId: doc._id,
        workspaceId: getWorkspaceId(doc),
        title: doc.title,
        content: doc.content,
        visibility: doc.visibility,
      },
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (doc: DocumentItem) => {
    Alert.alert(
      "Delete Document",
      `Delete "${doc.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(deleteDocument(doc._id));
            if (deleteDocument.fulfilled.match(result)) {
              dispatch(fetchPublicDocuments());
            }
          },
        },
      ],
    );
  };

  const canManage = userRole === "admin" || userRole === "editor";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Header ── */}
      <View className="px-6 py-6 border-b border-gray-50 flex-row justify-between items-center bg-white">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            Discovery
          </Text>
          <Text className="text-2xl font-black tracking-tighter text-black">
            Public Docs.
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          {canManage && (
            <TouchableOpacity
              onPress={handleOpenCreate}
              className="w-10 h-10 bg-black rounded-xl items-center justify-center"
            >
              <Feather name="plus" size={18} color="white" />
            </TouchableOpacity>
          )}
          <Feather name="globe" size={22} color="black" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          {/* Search */}
          <View className="bg-white h-14 px-5 rounded-2xl flex-row items-center border border-gray-100 mb-8">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search public knowledge..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-sm font-bold text-black"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-5 ml-1">
            Open Knowledge
          </Text>

          {/* Doc List */}
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Loading public docs...</Text>
            </View>
          ) : publicDocuments.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center">
              <Feather name="file-text" size={32} color="#D1D5DB" />
              <Text className="text-black font-black mt-4">No public docs found</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery ? "Try a different keyword." : "No documents have been made public yet."}
              </Text>
            </View>
          ) : (
            publicDocuments.map((doc) => (
              <View
                key={doc._id}
                className="mb-5 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm shadow-gray-50"
              >
                {/* Doc header */}
                <View className="px-5 pt-5 pb-4 border-b border-gray-50">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-black text-black leading-6">
                        {doc.title}
                      </Text>
                      <View className="flex-row items-center mt-2 flex-wrap gap-1">
                        <View className="bg-black px-2 py-0.5 rounded-full">
                          <Text className="text-white text-[9px] font-bold uppercase tracking-[1px]">
                            {doc.visibility}
                          </Text>
                        </View>
                        <Text className="text-[10px] font-bold text-gray-300">•</Text>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px]">
                          {formatDate(doc.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row gap-2 items-center">
                      {canManage && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleOpenEdit(doc)}
                            disabled={actionLoading}
                            className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center bg-gray-50"
                          >
                            <Feather name="edit-2" size={14} color="black" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(doc)}
                            disabled={actionLoading}
                            className="w-9 h-9 rounded-full border border-red-100 items-center justify-center bg-red-50"
                          >
                            <Feather name="trash-2" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleOpenDocument(doc)}
                        disabled={actionLoading}
                        className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center"
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <Feather name="book-open" size={14} color="black" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Content preview */}
                <View className="h-[350px] bg-white">
                  <WebView
                    originWhitelist={["*"]}
                    source={{ html: buildDocumentHtml(doc.content) }}
                    style={{ backgroundColor: "transparent" }}
                    scrollEnabled
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
