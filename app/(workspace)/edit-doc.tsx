import {
    createDocument,
    updateDocument,
    fetchWorkspaceDocuments,
} from "@/src/features/document/redux/documentThunks";
import {
    DocumentItem,
    DocumentVisibility,
} from "@/src/features/document/types/documentTypes";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
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
import { useDispatch, useSelector } from "react-redux";

export default function EditDocScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const params = useLocalSearchParams<{
    workspaceId?: string;
    docId?: string;
    title?: string;
    visibility?: string;
  }>();

  // ALL HOOKS BEFORE ANY CONDITIONALS
  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const isEditing = !!params.docId;
  const { actionLoading, workspaceDocuments } = useSelector(
    (s: RootState) => s.document,
  );
  const { workspaces } = useSelector((s: RootState) => s.workspace);
  const [selectedWsId, setSelectedWsId] = useState(params.workspaceId || "");
  const [title, setTitle] = useState(params.title || "");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility>("private");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const editorRef = useRef<RichEditor>(null);

  // Derive content from Redux when editing (avoids passing large HTML as a route param)
  const existingDoc: DocumentItem | undefined = params.docId
    ? workspaceDocuments.find((d) => d._id === params.docId)
    : undefined;

  // Initialize content from existing doc
  useEffect(() => {
    if (existingDoc?.content) {
      setContent(existingDoc.content);
    }
  }, [existingDoc?.content]);

  // Initialize visibility from existing doc
  useEffect(() => {
    if (existingDoc?.visibility) {
      setVisibility(existingDoc.visibility as DocumentVisibility);
    }
    if (existingDoc?.title) {
      setTitle(existingDoc.title);
    }
    if (existingDoc?.status) {
      setStatus(existingDoc.status as "draft" | "published");
    }
  }, [existingDoc?.visibility, existingDoc?.title, existingDoc?.status]);

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (!raw) return;
      try {
        const u = JSON.parse(raw);
        const r = (u?.role || "viewer").toLowerCase();
        if (r === "admin" || r === "editor" || r === "viewer") {
          setUserRole(r as any);
        }
      } catch {}
    });
  }, []);

  if (userRole === "viewer") {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg font-black text-black">Access Denied</Text>
        <Text className="text-gray-500 mt-2">Viewers cannot edit documents</Text>
        <TouchableOpacity onPress={() => nav.back()} className="mt-6 px-6 py-3 bg-black rounded-2xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert("Validation", "Please enter a document title.");
      return;
    }

    const targetWsId = selectedWsId || params.workspaceId;
    if (!isEditing && !targetWsId) {
      Alert.alert("Validation", "Please select a workspace for this document.");
      return;
    }

    let result: any;
    if (isEditing && params.docId) {
      result = await dispatch(
        updateDocument({
          id: params.docId,
          data: { title: trimmedTitle, content, visibility, status },
        }),
      );
    } else if (targetWsId) {
      result = await dispatch(
        createDocument({
          workspaceId: targetWsId,
          title: trimmedTitle,
          content,
          visibility,
          status,
        }),
      );
    }

    if (
      updateDocument.fulfilled.match(result) ||
      createDocument.fulfilled.match(result)
    ) {
      if (!isEditing && targetWsId) {
        // After creating, go directly to workspace or drafts based on status
        await dispatch(fetchWorkspaceDocuments(targetWsId));
        nav.replace(`/(workspace)/detail?id=${targetWsId}`);
      } else {
        // After editing, go back
        nav.back();
      }
    } else if (
      updateDocument.rejected.match(result) ||
      createDocument.rejected.match(result)
    ) {
      Alert.alert(
        "Error",
        result.payload?.message || "Failed to save document. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-50 flex-row items-center justify-between bg-white">
        <View>
            <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
              {isEditing ? "Modify" : "Compose"}
            </Text>
            <Text className="text-xl font-black tracking-tighter text-black">
              {isEditing ? "Edit Doc." : "New Document."}
            </Text>
          </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6 pb-20">
            {/* Workspace Selector (only when creating without workspace context) */}
            {!isEditing && !params.workspaceId && (
              <>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] mb-3 ml-1">
                  Destination Workspace
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-8"
                >
                  {workspaces.map((ws) => (
                    <TouchableOpacity
                      key={ws._id}
                      onPress={() => setSelectedWsId(ws._id)}
                      className={`mr-3 px-4 py-2.5 rounded-2xl border ${
                        selectedWsId === ws._id
                          ? "bg-black border-black"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black uppercase tracking-[1px] ${
                          selectedWsId === ws._id ? "text-white" : "text-black"
                        }`}
                      >
                        {ws.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {workspaces.length === 0 && (
                    <Text className="text-xs font-bold text-gray-300 italic">
                      No workspaces available
                    </Text>
                  )}
                </ScrollView>
              </>
            )}

            {/* Title Input */}
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] mb-3 ml-1">
              Document Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title here..."
              placeholderTextColor="#CBD5E1"
              className="text-2xl font-black text-black mb-8 p-0"
              multiline
            />

            {/* Visibility Toggle */}
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] mb-3 ml-1">
              Visibility Settings
            </Text>
            <View className="flex-row gap-3 mb-8">
              {(["private", "public"] as DocumentVisibility[]).map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVisibility(v)}
                  className={`flex-1 py-3.5 rounded-2xl border items-center ${
                    visibility === v
                      ? "bg-black border-black"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase tracking-[1px] ${
                      visibility === v ? "text-white" : "text-black"
                    }`}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Editing: Show Status Toggle */}
            {/* Editor Toolbar */}
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] mb-3 ml-1">
              Content Editor
            </Text>
            <View className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
              <RichToolbar
                editor={editorRef}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.heading1,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.blockquote,
                  actions.code,
                  actions.undo,
                  actions.redo,
                ]}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottomWidth: 1,
                  borderColor: "#F1F5F9",
                }}
              />
              <RichEditor
                ref={editorRef}
                initialContentHTML={content}
                placeholder="Start writing something amazing..."
                onChange={setContent}
                style={{ minHeight: 400 }}
                editorStyle={{
                  backgroundColor: "#FFFFFF",
                  contentCSSText:
                    "font-size: 16px; min-height: 400px; padding: 20px;",
                }}
                useContainer={true}
                startZoomSupportWebView={false}
              />
            </View>
          </View>
        </ScrollView>

        {/* Dual Save Buttons at Bottom */}
        <View className="px-6 py-4 border-t border-gray-50 bg-white flex-row gap-3">
          <TouchableOpacity
            onPress={() => nav.back()}
            className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center"
          >
            <Feather name="x" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              setStatus("draft");
              await handleSave();
            }}
            disabled={actionLoading}
            className={`flex-1 py-3 rounded-2xl items-center flex-row gap-2 border-2 ${
              actionLoading
                ? "bg-gray-100 border-gray-200"
                : "bg-white border-gray-200"
            }`}
          >
            {actionLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Feather name="save" size={16} color="black" />
                <Text className="text-black font-black uppercase tracking-[1px] text-xs">
                  Draft
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              setStatus("published");
              await handleSave();
            }}
            disabled={actionLoading}
            className={`flex-1 py-3 rounded-2xl items-center flex-row gap-2 ${
              actionLoading ? "bg-gray-300" : "bg-black"
            }`}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={16} color="white" />
                <Text className="text-white font-black uppercase tracking-[1px] text-xs">
                  Publish
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
