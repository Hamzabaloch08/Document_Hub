import {
    clearDocumentError,
    clearDocumentSuccess,
    clearWorkspaceDocuments,
} from "@/src/features/document/redux/documentSlice";
import {
    createDocument,
    deleteDocument,
    fetchWorkspaceDocuments,
    markDocumentAsRead,
    updateDocument,
} from "@/src/features/document/redux/documentThunks";
import { DocumentItem, DocumentVisibility } from "@/src/features/document/types/documentTypes";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    RichEditor,
    RichToolbar,
    actions,
} from "react-native-pell-rich-editor";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import {
    clearWorkspaceError,
    clearWorkspaceSuccess,
    setSelectedWorkspace,
} from "../redux/workspaceSlice";
import {
    addWorkspaceMember,
    fetchWorkspaceById,
    removeWorkspaceMember,
} from "../redux/workspaceThunks";
import { WorkspaceMember } from "../types/workspaceTypes";

// ── HTML renderer ─────────────────────────────────────────────────────────────
const buildHtml = (content: string) => `
<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    :root{color-scheme:light;}
    body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;background:#fff;line-height:1.65;word-break:break-word;}
    h1,h2,h3,h4,h5,h6{margin:0 0 12px;line-height:1.25;}
    p{margin:0 0 12px;}
    ul,ol{padding-left:22px;margin:0 0 12px;}
    li{margin-bottom:6px;}
    pre{margin:16px 0;padding:14px;border-radius:12px;background:#0f172a;color:#e2e8f0;overflow-x:auto;white-space:pre-wrap;word-break:break-word;}
    code{padding:2px 6px;border-radius:6px;background:#f1f5f9;color:#111827;font-size:.95em;}
    pre code{padding:0;background:transparent;color:inherit;}
    blockquote{margin:16px 0;padding:0 0 0 14px;border-left:4px solid #cbd5e1;color:#475569;}
    img,video{max-width:100%;height:auto;border-radius:10px;}
    table{width:100%;border-collapse:collapse;margin:16px 0;}
    th,td{border:1px solid #e2e8f0;padding:10px;text-align:left;vertical-align:top;}
    hr{border:0;border-top:1px solid #e2e8f0;margin:16px 0;}
  </style>
</head>
<body>${content || "<p style='color:#94a3b8'>No content yet.</p>"}</body>
</html>`;

const stripHtml = (v: string) => v.replace(/<[^>]*>?/gm, " ").trim();

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { id: rawId, docId: rawDocId } = useLocalSearchParams<{ id?: string; docId?: string }>();
  const workspaceId = Array.isArray(rawId) ? rawId[0] : rawId;
  const requestedDocId = Array.isArray(rawDocId) ? rawDocId[0] : rawDocId;

  const {
    selectedWorkspace, selectedWorkspaceMembers,
    actionLoading, error, successMessage,
  } = useSelector((s: RootState) => s.workspace);

  const {
    workspaceDocuments, loading: docsLoading,
    actionLoading: docActionLoading, error: docsError, successMessage: docsSuccess,
  } = useSelector((s: RootState) => s.document);

  // ── User / role ───────────────────────────────────────────────────────────
  const [currentUserId, setCurrentUserId] = useState("");
  const [globalRole, setGlobalRole] = useState<"admin" | "editor" | "viewer">("viewer");

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (!raw) return;
      const u = JSON.parse(raw);
      setCurrentUserId(u?._id || "");
      setGlobalRole((u?.role || "viewer").toLowerCase() as any);
    });
  }, []);

  // ── Feature deriving ──────────────────────────────────────────────────────
  const workspaceRole = useMemo(() => {
    if (globalRole === "admin") return "admin";
    const memberRecord = selectedWorkspaceMembers.find((m) => {
      const uid = typeof m.userId === "string" ? m.userId : m.userId?._id;
      return uid === currentUserId;
    });
    return memberRecord?.role || "viewer";
  }, [currentUserId, globalRole, selectedWorkspaceMembers]);

  const canManage = workspaceRole === "admin";
  const canEdit = workspaceRole === "admin" || workspaceRole === "editor";

  // ── Editor state ──────────────────────────────────────────────────────────
  const editorRef = useRef<RichEditor>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docVisibility, setDocVisibility] = useState<DocumentVisibility>("private");

  // Member add state
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceMember["role"]>("viewer");

  // ── Fetch workspace + docs ────────────────────────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;
    dispatch(fetchWorkspaceById(workspaceId));
    dispatch(fetchWorkspaceDocuments(workspaceId));
    return () => {
      dispatch(setSelectedWorkspace(null));
      dispatch(clearWorkspaceDocuments());
    };
  }, [dispatch, workspaceId]);

  // ── Error/success alerts ──────────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    Alert.alert("Workspace Error", error, [
      { text: "OK", onPress: () => dispatch(clearWorkspaceError()) },
    ]);
  }, [error, dispatch]);

  useEffect(() => {
    if (!successMessage) return;
    Alert.alert("Success", successMessage, [
      { text: "OK", onPress: () => dispatch(clearWorkspaceSuccess()) },
    ]);
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (!docsError) return;
    Alert.alert("Document Error", docsError, [
      { text: "OK", onPress: () => dispatch(clearDocumentError()) },
    ]);
  }, [docsError, dispatch]);

  useEffect(() => {
    if (!docsSuccess) return;
    dispatch(clearDocumentSuccess());
  }, [docsSuccess, dispatch]);

  // ── Auto-open doc from deep link ──────────────────────────────────────────
  useEffect(() => {
    if (!requestedDocId || workspaceDocuments.length === 0) return;
    const target = workspaceDocuments.find((d) => d._id === requestedDocId);
    if (!target) return;
    if (canEdit) {
      if (selectedDocId === requestedDocId) return;
      openEditor(target._id, target.title, target.content, target.visibility);
    } else {
      if (viewingDocId === requestedDocId) return;
      setViewingDocId(requestedDocId);
    }
  }, [requestedDocId, workspaceDocuments, canEdit]);

  // ── Editor helpers ────────────────────────────────────────────────────────
  const openEditor = (id: string, title: string, content: string, vis: DocumentVisibility) => {
    setSelectedDocId(id);
    setDocTitle(title);
    setDocContent(content);
    setDocVisibility(vis);
    editorRef.current?.setContentHTML(content);
  };

  const resetEditor = () => {
    setSelectedDocId(null);
    setDocTitle("");
    setDocContent("");
    setDocVisibility("private");
    editorRef.current?.setContentHTML("");
  };

  const handleOpenDoc = (doc: DocumentItem) => {
    dispatch(markDocumentAsRead({ documentId: doc._id }));
    if (canEdit) {
      nav.push({
        pathname: "/(workspace)/edit-doc",
        params: {
          docId: doc._id,
          workspaceId: workspaceId,
          title: doc.title,
          visibility: doc.visibility,
        },
      });
    } else {
      setViewingDocId((cur) => (cur === doc._id ? null : doc._id));
    }
  };

  const handleCreateDoc = () => {
    if (!workspaceId || !canEdit) return;
    nav.push({
      pathname: "/(workspace)/edit-doc",
      params: { workspaceId },
    });
  };

  // ── Delete doc ────────────────────────────────────────────────────────────
  const handleDeleteDoc = (docId: string, title: string) => {
    if (!canEdit) return;
    Alert.alert("Delete Document", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const result = await dispatch(deleteDocument(docId));
          if (deleteDocument.fulfilled.match(result) && workspaceId) {
            dispatch(fetchWorkspaceDocuments(workspaceId));
          }
        },
      },
    ]);
  };

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!workspaceId || !canManage) return;
    const email = memberEmail.trim();
    if (!email) { Alert.alert("Validation", "Email is required."); return; }
    const result = await dispatch(addWorkspaceMember({ workspaceId, email, role: memberRole }));
    if (addWorkspaceMember.fulfilled.match(result)) {
      setMemberEmail("");
      dispatch(fetchWorkspaceById(workspaceId));
    }
  };

  // ── Remove member ─────────────────────────────────────────────────────────
  const handleRemoveMember = (member: WorkspaceMember) => {
    if (!workspaceId || !canManage) return;
    const label =
      typeof member.userId === "string"
        ? member.userId
        : member.userId?.username || member.userId?.email || "this member";
    Alert.alert("Remove Member", `Remove ${label}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          const uid = typeof member.userId === "string" ? member.userId : member.userId._id;
          const result = await dispatch(removeWorkspaceMember({ workspaceId, userId: uid }));
          if (removeWorkspaceMember.fulfilled.match(result)) {
            dispatch(fetchWorkspaceById(workspaceId));
          }
        },
      },
    ]);
  };

  // ── No workspaceId guard ──────────────────────────────────────────────────
  if (!workspaceId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="alert-circle" size={40} color="#D1D5DB" />
          <Text className="text-xl font-black text-black text-center mt-4">
            No workspace selected.
          </Text>
          <TouchableOpacity onPress={() => nav.back()} className="mt-6 bg-black px-6 py-3 rounded-2xl">
            <Text className="text-white font-black uppercase tracking-[1px]">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const workspaceTitle = selectedWorkspace?.name || "Workspace";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Header ── */}
      <View className="px-6 py-5 border-b border-gray-50 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            Workspace
          </Text>
          <Text className="text-[22px] font-black tracking-tighter text-black" numberOfLines={1}>
            {workspaceTitle}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`px-3 py-1 rounded-full ${canManage ? "bg-black" : canEdit ? "bg-gray-800" : "bg-gray-100"}`}>
            <Text className={`text-[9px] font-black uppercase tracking-[1px] ${canManage || canEdit ? "text-white" : "text-gray-500"}`}>
              {workspaceRole}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => nav.back()}
            className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
          >
            <Feather name="x" size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">

          {/* ── Workspace info card ── */}
          {actionLoading && !selectedWorkspace ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Loading workspace...</Text>
            </View>
          ) : selectedWorkspace ? (
            <>
              <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm shadow-gray-50 mb-6">
                <Text className="text-lg font-black text-black">{selectedWorkspace.name}</Text>
                <Text className="mt-1.5 text-gray-500 text-sm">
                  {selectedWorkspace.description || "No description added."}
                </Text>
                <View className="mt-3 flex-row items-center gap-3">
                  <View className="bg-black px-3 py-1 rounded-full">
                    <Text className="text-white text-[9px] font-bold uppercase tracking-[1px]">
                      {selectedWorkspace.visibility || "private"}
                    </Text>
                  </View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px]">
                    {selectedWorkspaceMembers.length} member{selectedWorkspaceMembers.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {/* ── MEMBERS section (admin only) ── */}
              {canManage && (
                <>
                  {/* Add member form */}
                  <View className="bg-gray-50 border border-gray-100 rounded-3xl p-5 mb-5">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3">
                      Add Member
                    </Text>
                    <TextInput
                      value={memberEmail}
                      onChangeText={setMemberEmail}
                      placeholder="member@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black font-bold mb-3"
                    />
                    {/* Role selector */}
                    <View className="flex-row gap-2 mb-3">
                      {(["viewer", "editor", "admin"] as const).map((r) => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setMemberRole(r)}
                          className={`flex-1 py-2.5 rounded-xl border items-center ${memberRole === r ? "bg-black border-black" : "bg-white border-gray-200"}`}
                        >
                          <Text className={`text-[10px] font-black uppercase tracking-[1px] ${memberRole === r ? "text-white" : "text-black"}`}>
                            {r}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={handleAddMember}
                      disabled={actionLoading}
                      className={`rounded-2xl py-3 items-center ${actionLoading ? "bg-gray-300" : "bg-black"}`}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-black uppercase tracking-[1px] text-xs">
                          Add Member
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Members list */}
                  {selectedWorkspaceMembers.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1">
                        Members ({selectedWorkspaceMembers.length})
                      </Text>
                      {selectedWorkspaceMembers.map((member) => {
                        const label =
                          typeof member.userId === "string"
                            ? member.userId
                            : member.userId?.username || member.userId?.email || "Unknown";
                        return (
                          <View
                            key={member._id || `${member.workspaceId}-${label}`}
                            className="bg-white border border-gray-100 rounded-2xl p-4 mb-2 flex-row items-center justify-between"
                          >
                            <View className="flex-1 pr-3">
                              <Text className="text-black font-black text-sm" numberOfLines={1}>{label}</Text>
                              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-[1px] mt-0.5">
                                {member.role}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRemoveMember(member)}
                              disabled={actionLoading}
                              className="w-9 h-9 rounded-full bg-red-50 border border-red-100 items-center justify-center"
                            >
                              <Feather name="user-x" size={14} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </>
              )}

              {/* Non-admin notice */}
              {!canManage && (
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
                  <Text className="text-gray-500 font-bold text-sm">
                    {canEdit
                      ? "You can create and edit documents in this workspace."
                      : "You have read-only access to this workspace."}
                  </Text>
                </View>
              )}

              {/* ── DOCUMENTS header ── */}
              <View className="flex-row justify-between items-center mb-4 ml-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                  Documents ({workspaceDocuments.length})
                </Text>
                {canEdit && (
                  <TouchableOpacity
                    onPress={handleCreateDoc}
                    className="flex-row items-center gap-1 bg-black px-3 py-1.5 rounded-xl shadow"
                  >
                    <Feather name="plus" size={12} color="white" />
                    <Text className="text-white text-[9px] font-black uppercase tracking-[1px]">New Doc</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Docs list */}
              {docsLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#000" />
                  <Text className="mt-3 text-gray-500">Loading documents...</Text>
                </View>
              ) : workspaceDocuments.length === 0 ? (
                <View className="bg-white border border-gray-100 rounded-3xl p-8 items-center">
                  <Feather name="file-text" size={32} color="#D1D5DB" />
                  <Text className="text-black font-black mt-4">No documents yet</Text>
                  <Text className="text-gray-500 text-center mt-2 text-sm">
                    {canEdit
                      ? "Create your first document above."
                      : "Ask an editor or admin to add documents."}
                  </Text>
                </View>
              ) : (
                workspaceDocuments.map((doc) => {
                  const isViewing = viewingDocId === doc._id;
                  return (
                    <View
                      key={doc._id}
                      className="bg-white border border-gray-100 rounded-3xl mb-4 overflow-hidden"
                    >
                      {/* Doc header row */}
                      <TouchableOpacity
                        className="flex-row items-center p-5"
                        onPress={() => handleOpenDoc(doc)}
                      >
                        <View className="flex-1 pr-3">
                          <Text className="text-base font-black text-black" numberOfLines={1}>
                            {doc.title}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-1">
                            <View className={`px-2 py-0.5 rounded-full ${doc.visibility === "public" ? "bg-black" : "bg-gray-100"}`}>
                              <Text className={`text-[8px] font-black uppercase tracking-[1px] ${doc.visibility === "public" ? "text-white" : "text-gray-500"}`}>
                                {doc.visibility}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Feather
                          name={isViewing ? "chevron-up" : "chevron-down"}
                          size={18}
                          color="#CBD5E1"
                        />
                      </TouchableOpacity>

                      {/* Viewer: WebView content preview always shown when tapped */}
                      {isViewing && (
                        <View className="border-t border-gray-50">
                          <View className="h-[400px]">
                            <WebView
                              originWhitelist={["*"]}
                              source={{ html: buildHtml(doc.content) }}
                              style={{ backgroundColor: "transparent" }}
                              scrollEnabled
                              nestedScrollEnabled
                              showsVerticalScrollIndicator={false}
                            />
                          </View>
                          
                          {canEdit && (
                            <View className="flex-row gap-2 px-5 pb-5 pt-3">
                              <TouchableOpacity
                                onPress={() => handleOpenDoc(doc)}
                                className="flex-1 bg-black py-3 rounded-2xl items-center flex-row justify-center gap-2"
                              >
                                <Feather name="edit-3" size={14} color="white" />
                                <Text className="text-[10px] font-black uppercase tracking-[1px] text-white">
                                  Modify Document
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleDeleteDoc(doc._id, doc.title)}
                                disabled={docActionLoading}
                                className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl items-center justify-center"
                              >
                                <Feather name="trash-2" size={16} color="#DC2626" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}

              {/* Reload docs button on error */}
              {docsError && (
                <TouchableOpacity
                  onPress={() => dispatch(fetchWorkspaceDocuments(workspaceId))}
                  className="mt-3 self-center bg-white border border-gray-200 rounded-xl px-5 py-3"
                >
                  <Text className="text-xs font-black uppercase tracking-[1px] text-black">
                    Retry Loading Docs
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View className="items-center py-16">
              <Feather name="alert-circle" size={36} color="#D1D5DB" />
              <Text className="text-lg font-black text-black mt-4">Workspace not found</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                This workspace may have been deleted or the ID is invalid.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
