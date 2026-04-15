import {
    clearWorkspaceDocuments
} from "@/src/features/document/redux/documentSlice";
import {
    deleteDocument,
    fetchWorkspaceDocuments
} from "@/src/features/document/redux/documentThunks";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import {
    setSelectedWorkspace
} from "../redux/workspaceSlice";
import {
    addWorkspaceMember,
    fetchWorkspaceById
} from "../redux/workspaceThunks";

// ── HTML Content Wrapper ──
const buildHtml = (content: string) => `
<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    body{margin:0;padding:20px;font-family:-apple-system,system-ui;color:#000;background:#fff;line-height:1.6;}
    h1,h2{margin:0 0 10px;font-weight:900;}
    p{margin:0 0 10px;color:#333;}
    img{max-width:100%;border-radius:12px;}
    pre{padding:12px;background:#f4f4f4;border-radius:8px;overflow-x:auto;}
  </style>
</head>
<body>${content || "<p style='color:#999'>No content.</p>"}</body>
</html>`;

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { id: workspaceId } = useLocalSearchParams<{ id: string }>();

  // ── Redux State ──
  const { selectedWorkspace, selectedWorkspaceMembers, actionLoading, error } =
    useSelector((s: RootState) => s.workspace);
  const {
    workspaceDocuments,
    loading: docsLoading,
    actionLoading: docActionLoading,
  } = useSelector((s: RootState) => s.document);

  // ── Local UI State ──
  const [currentUserId, setCurrentUserId] = useState("");
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  // ── Hydrate User ──
  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (raw) setCurrentUserId(JSON.parse(raw)?._id || "");
    });
  }, []);

  // ── Initial Fetch ──
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceById(workspaceId));
      dispatch(fetchWorkspaceDocuments(workspaceId));
    }
    return () => {
      dispatch(setSelectedWorkspace(null));
      dispatch(clearWorkspaceDocuments());
    };
  }, [workspaceId]);

  // ── Role Logic ──
  const userRole = useMemo(() => {
    const member = selectedWorkspaceMembers.find((m) => {
      const uid = typeof m.userId === "string" ? m.userId : m.userId?._id;
      return uid === currentUserId;
    });
    return member?.role || "viewer";
  }, [selectedWorkspaceMembers, currentUserId]);

  const canEdit = userRole === "admin" || userRole === "editor";
  const isAdmin = userRole === "admin";

  // ── Handlers ──
  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    const res = await dispatch(
      addWorkspaceMember({
        workspaceId: workspaceId!,
        email: memberEmail.trim(),
        role: "viewer",
      }),
    );
    if (addWorkspaceMember.fulfilled.match(res)) {
      setMemberEmail("");
      dispatch(fetchWorkspaceById(workspaceId!));
    }
  };

  const handleDeleteDoc = (docId: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          dispatch(deleteDocument(docId)).then(() =>
            dispatch(fetchWorkspaceDocuments(workspaceId!)),
          ),
      },
    ]);
  };

  if (!workspaceId) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Minimal Header ── */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => nav.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <View className="bg-black px-4 py-1.5 rounded-full">
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">
            {userRole}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 mt-4">
          <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[3px] mb-2">
            Workspace
          </Text>
          <Text className="text-4xl font-black text-black leading-tight tracking-tighter">
            {selectedWorkspace?.name || "Loading..."}
          </Text>
          <Text className="text-gray-400 font-medium mt-3 text-base leading-6">
            {selectedWorkspace?.description ||
              "A workspace for your brilliant ideas and shared documents."}
          </Text>

          {/* ── Stats Bar ── */}
          <View className="flex-row items-center gap-6 mt-8 py-6 border-y border-gray-50">
            <TouchableOpacity
              onPress={() => setShowMembers(!showMembers)}
              className="flex-row items-center gap-2"
            >
              <View className="w-8 h-8 items-center justify-center bg-gray-50 rounded-lg">
                <Feather name="users" size={14} color="black" />
              </View>
              <Text className="text-sm font-black text-black">
                {selectedWorkspaceMembers.length} Members
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 items-center justify-center bg-gray-50 rounded-lg">
                <Feather name="folder" size={14} color="black" />
              </View>
              <Text className="text-sm font-black text-black">
                {workspaceDocuments.length} Documents
              </Text>
            </View>
          </View>

          {/* ── Admin: Add Member ── */}
          {isAdmin && (
            <View className="mt-8 bg-gray-50 p-6 rounded-[32px]">
              <Text className="text-[10px] font-black text-black uppercase tracking-widest mb-4">
                Add Contributor
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  placeholder="Invite by email"
                  placeholderTextColor="#999"
                  className="flex-1 bg-white px-5 py-3.5 rounded-2xl font-bold text-black border border-gray-100"
                />
                <TouchableOpacity
                  onPress={handleAddMember}
                  className="w-14 h-14 bg-black rounded-2xl items-center justify-center"
                >
                  <Feather name="user-plus" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Members List ── */}
          {showMembers && (
            <View className="mt-8 bg-gray-50 p-6 rounded-[32px]">
              <Text className="text-[10px] font-black text-black uppercase tracking-widest mb-4">
                Workspace Members
              </Text>
              {selectedWorkspaceMembers.length > 0 ? (
                selectedWorkspaceMembers.map((member, index) => {
                  const userId =
                    typeof member.userId === "string"
                      ? member.userId
                      : member.userId?._id;
                  const userName =
                    typeof member.userId === "string"
                      ? "User"
                      : member.userId?.name || "User";
                  const userEmail =
                    typeof member.userId === "string"
                      ? "N/A"
                      : member.userId?.email || "N/A";
                  return (
                    <View
                      key={index}
                      className="bg-white p-4 rounded-xl mb-3 flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-black">
                          {userName}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                          {userEmail}
                        </Text>
                      </View>
                      <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                        <Text className="text-[10px] font-bold text-gray-700 uppercase">
                          {member.role}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text className="text-sm text-gray-400 text-center py-4">
                  No members yet
                </Text>
              )}
            </View>
          )}

          {/* ── Documents Section ── */}
          <View className="mt-12 flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[3px] mb-1">
                Index
              </Text>
              <Text className="text-2xl font-black text-black">Documents.</Text>
            </View>
            {canEdit && (
              <TouchableOpacity
                onPress={() =>
                  nav.push({
                    pathname: "/(workspace)/edit-doc",
                    params: { workspaceId },
                  })
                }
                className="bg-black px-5 py-2.5 rounded-2xl flex-row items-center gap-2"
              >
                <Feather name="plus" size={16} color="white" />
                <Text className="text-white text-xs font-black uppercase">
                  Create
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {docsLoading ? (
            <ActivityIndicator color="black" className="mt-10" />
          ) : (
            <View className="gap-4">
              {workspaceDocuments.map((doc) => {
                const isOpen = viewingDocId === doc._id;
                return (
                  <View
                    key={doc._id}
                    className="bg-white border border-gray-100 rounded-[32px] overflow-hidden"
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setViewingDocId(isOpen ? null : doc._id)}
                      className="p-6 flex-row items-center justify-between"
                    >
                      <View className="flex-1 pr-4">
                        <Text className="text-lg font-black text-black">
                          {doc.title}
                        </Text>
                        <Text className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-widest">
                          {doc.visibility}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isOpen ? "#000" : "#F9FAFB",
                        }}
                      >
                        <Feather
                          name={isOpen ? "chevron-up" : "chevron-right"}
                          size={18}
                          color={isOpen ? "white" : "black"}
                        />
                      </View>
                    </TouchableOpacity>

                    {isOpen && (
                      <View className="px-6 pb-6 animate-in fade-in duration-300">
                        <View className="h-[300px] bg-white rounded-3xl overflow-hidden border border-gray-50">
                          <WebView
                            originWhitelist={["*"]}
                            source={{ html: buildHtml(doc.content) }}
                            style={{ flex: 1 }}
                            scrollEnabled={true}
                          />
                        </View>
                        {canEdit && (
                          <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                              onPress={() =>
                                nav.push({
                                  pathname: "/(workspace)/edit-doc",
                                  params: {
                                    docId: doc._id,
                                    workspaceId,
                                    title: doc.title,
                                  },
                                })
                              }
                              className="flex-1 bg-black py-4 rounded-2xl items-center justify-center flex-row gap-2"
                            >
                              <Feather name="edit-2" size={14} color="white" />
                              <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                Edit
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteDoc(doc._id)}
                              className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center font-black"
                            >
                              <Feather
                                name="trash-2"
                                size={18}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {workspaceDocuments.length === 0 && !docsLoading && (
            <View className="py-20 items-center justify-center bg-gray-50 rounded-[40px]">
              <Feather name="file-text" size={40} color="#DDD" />
              <Text className="text-gray-400 font-black mt-4 uppercase tracking-widest">
                Empty Workspace
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
