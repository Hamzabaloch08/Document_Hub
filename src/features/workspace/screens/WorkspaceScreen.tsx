import { clearWorkspaceDocuments } from "@/src/features/document/redux/documentSlice";
import {
    deleteDocument,
    fetchWorkspaceDocuments,
    updateDocument,
} from "@/src/features/document/redux/documentThunks";
import { DocumentItem } from "@/src/features/document/types/documentTypes";
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
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWorkspace } from "../redux/workspaceSlice";
import {
    addWorkspaceMember,
    fetchWorkspaceById,
    removeWorkspaceMember,
} from "../redux/workspaceThunks";

const getExcerpt = (content?: string) => {
  if (!content) return "No description available.";
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
};

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { id: workspaceId } = useLocalSearchParams<{ id: string }>();

  const { selectedWorkspace, selectedWorkspaceMembers, actionLoading } =
    useSelector((s: RootState) => s.workspace);
  const { workspaceDocuments, loading: docsLoading } = useSelector(
    (s: RootState) => s.document,
  );

  const [currentUserId, setCurrentUserId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [openVisibilityMenuDocId, setOpenVisibilityMenuDocId] = useState<
    string | null
  >(null);
  const [updatingVisibilityDocId, setUpdatingVisibilityDocId] = useState<
    string | null
  >(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setCurrentUserId(parsed?._id || "");
      } catch {
        setCurrentUserId("");
      }
    });
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    dispatch(fetchWorkspaceById(workspaceId));
    dispatch(fetchWorkspaceDocuments(workspaceId));

    return () => {
      dispatch(setSelectedWorkspace(null));
      dispatch(clearWorkspaceDocuments());
    };
  }, [dispatch, workspaceId]);

  const userRole = useMemo(() => {
    const member = selectedWorkspaceMembers.find((m) => {
      const uid = typeof m.userId === "string" ? m.userId : m.userId?._id;
      return uid === currentUserId;
    });
    return member?.role || "viewer";
  }, [selectedWorkspaceMembers, currentUserId]);

  const canEdit = userRole === "admin" || userRole === "editor";
  const isAdmin = userRole === "admin";
  const canViewMembersList = isAdmin || userRole === "editor";

  const visibleDocuments = workspaceDocuments.filter((doc) => {
    if (userRole === "viewer") {
      return doc.visibility === "public";
    }
    return true;
  });

  const handleAddMember = async () => {
    if (!workspaceId || !memberEmail.trim()) return;

    const result = await dispatch(
      addWorkspaceMember({
        workspaceId,
        email: memberEmail.trim(),
        role: "viewer",
      }),
    );

    if (addWorkspaceMember.fulfilled.match(result)) {
      setMemberEmail("");
      dispatch(fetchWorkspaceById(workspaceId));
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (!workspaceId) return;

    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await dispatch(deleteDocument(docId));
          dispatch(fetchWorkspaceDocuments(workspaceId));
        },
      },
    ]);
  };

  const handleRemoveMember = (member: any) => {
    if (!workspaceId) return;

    const memberId =
      typeof member.userId === "string" ? member.userId : member.userId?._id;
    const memberName =
      typeof member.userId === "string"
        ? "this user"
        : member.userId?.name || "this user";

    if (!memberId) return;

    Alert.alert("Remove member", `Remove ${memberName} from this workspace?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(
            removeWorkspaceMember({
              workspaceId,
              userId: memberId,
            }),
          );

          if (removeWorkspaceMember.fulfilled.match(result)) {
            dispatch(fetchWorkspaceById(workspaceId));
          }
        },
      },
    ]);
  };

  const handleUpdateDocVisibility = async (
    doc: DocumentItem,
    visibility: "public" | "private",
  ) => {
    if (!workspaceId || doc.visibility === visibility) return;

    setUpdatingVisibilityDocId(doc._id);
    const result = await dispatch(
      updateDocument({
        id: doc._id,
        data: { visibility },
      }),
    );

    if (updateDocument.fulfilled.match(result)) {
      dispatch(fetchWorkspaceDocuments(workspaceId));
    }
    setUpdatingVisibilityDocId(null);
  };

  if (!workspaceId) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => nav.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <View className="ml-3">
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            Workspace
          </Text>
          <Text className="text-[16px] font-black text-black">Details</Text>
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

          <View className="flex-row items-center gap-6 mt-8 py-6 border-y border-gray-50">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 items-center justify-center bg-gray-50 rounded-lg">
                <Feather name="users" size={14} color="black" />
              </View>
              <Text className="text-sm font-black text-black">
                {selectedWorkspaceMembers.length} Members
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 items-center justify-center bg-gray-50 rounded-lg">
                <Feather name="folder" size={14} color="black" />
              </View>
              <Text className="text-sm font-black text-black">
                {visibleDocuments.length} Documents
              </Text>
            </View>
          </View>

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

          {canViewMembersList && (
            <View className="mt-8 bg-gray-50 p-6 rounded-[32px]">
              <Text className="text-[10px] font-black text-black uppercase tracking-widest mb-4">
                Workspace Members
              </Text>
              {selectedWorkspaceMembers.length > 0 ? (
                selectedWorkspaceMembers.map((member, index) => {
                  const memberId =
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
                      key={member._id || String(index)}
                      className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-3">
                          <Feather name="user" size={16} color="#111827" />
                        </View>
                        <View className="flex-1 pr-2">
                          <Text className="text-sm font-bold text-black">
                            {userName}
                          </Text>
                          <Text
                            className="text-xs text-gray-400 mt-1"
                            numberOfLines={1}
                          >
                            {userEmail}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2 ml-2">
                        <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                          <Text className="text-[10px] font-bold text-gray-700 uppercase">
                            {member.role}
                          </Text>
                        </View>

                        {isAdmin &&
                          member.role !== "admin" &&
                          memberId !== currentUserId && (
                            <TouchableOpacity
                              onPress={() => handleRemoveMember(member)}
                              disabled={actionLoading}
                              className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                            >
                              <Feather name="x" size={14} color="#DC2626" />
                            </TouchableOpacity>
                          )}
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

          {userRole === "viewer" && (
            <View className="mt-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <Text className="text-[11px] font-bold text-gray-600">
                You can only view member count in this workspace.
              </Text>
            </View>
          )}

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
          ) : visibleDocuments.length === 0 ? (
            <View className="py-20 items-center justify-center bg-gray-50 rounded-[40px]">
              <Feather name="file-text" size={40} color="#DDD" />
              <Text className="text-gray-400 font-black mt-4 uppercase tracking-widest">
                {userRole === "viewer"
                  ? "No Public Documents"
                  : "Empty Workspace"}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {visibleDocuments.map((doc) => {
                const isUpdatingVisibility =
                  updatingVisibilityDocId === doc._id;
                const isDropdownOpen = openVisibilityMenuDocId === doc._id;
                return (
                  <View
                    key={doc._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 pr-2">
                        <View className="w-9 h-9 rounded-lg bg-gray-50 items-center justify-center mb-2">
                          <Feather name="file-text" size={16} color="black" />
                        </View>
                        <Text
                          className="text-[17px] font-black text-black"
                          numberOfLines={1}
                        >
                          {doc.title}
                        </Text>
                        <Text
                          className="text-sm text-gray-500 mt-2 leading-5"
                          numberOfLines={3}
                        >
                          {getExcerpt(doc.content)}
                        </Text>

                        <View className="flex-row items-center gap-2 mt-3">
                          <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                            <Text className="text-[9px] font-black text-gray-600 uppercase">
                              {doc.visibility}
                            </Text>
                          </View>
                          {doc.status === "draft" && (
                            <View className="bg-yellow-100 px-2.5 py-1 rounded-full">
                              <Text className="text-[9px] font-black text-yellow-700 uppercase">
                                Draft
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          nav.push(
                            `/(workspace)/doc-detail?workspaceId=${workspaceId}&docId=${doc._id}`,
                          )
                        }
                        className="w-10 h-10 rounded-full bg-black items-center justify-center"
                      >
                        <Feather name="chevron-right" size={18} color="white" />
                      </TouchableOpacity>
                    </View>

                    {canEdit && (
                      <View className="mt-4 border-t border-gray-100 pt-4">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-2">
                          Visibility
                        </Text>
                        <View className="relative">
                          <TouchableOpacity
                            disabled={isUpdatingVisibility}
                            onPress={() =>
                              setOpenVisibilityMenuDocId(
                                isDropdownOpen ? null : doc._id,
                              )
                            }
                            className="h-11 px-4 rounded-xl border border-gray-200 bg-white flex-row items-center justify-between"
                          >
                            <Text className="text-[12px] font-bold text-gray-700 capitalize">
                              {doc.visibility}
                            </Text>
                            {isUpdatingVisibility ? (
                              <ActivityIndicator size="small" color="#111827" />
                            ) : (
                              <Feather
                                name={
                                  isDropdownOpen ? "chevron-up" : "chevron-down"
                                }
                                size={16}
                                color="#6B7280"
                              />
                            )}
                          </TouchableOpacity>

                          {isDropdownOpen && !isUpdatingVisibility && (
                            <View className="mt-2 border border-gray-200 rounded-xl bg-white overflow-hidden">
                              <TouchableOpacity
                                onPress={() => {
                                  setOpenVisibilityMenuDocId(null);
                                  handleUpdateDocVisibility(doc, "private");
                                }}
                                className={`px-4 py-3 ${doc.visibility === "private" ? "bg-gray-100" : "bg-white"}`}
                              >
                                <Text className="text-[12px] font-semibold text-gray-800">
                                  Private
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  setOpenVisibilityMenuDocId(null);
                                  handleUpdateDocVisibility(doc, "public");
                                }}
                                className={`px-4 py-3 border-t border-gray-100 ${doc.visibility === "public" ? "bg-gray-100" : "bg-white"}`}
                              >
                                <Text className="text-[12px] font-semibold text-gray-800">
                                  Public
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        <View className="flex-row gap-2 mt-2">
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
                            className="flex-1 bg-black py-3 rounded-xl items-center justify-center flex-row gap-2"
                          >
                            <Feather name="edit-2" size={14} color="white" />
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                              Edit
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteDoc(doc._id)}
                            className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center"
                          >
                            <Feather name="trash-2" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {actionLoading && updatingVisibilityDocId && (
        <View className="absolute bottom-6 self-center bg-black px-4 py-2 rounded-full">
          <Text className="text-white text-[10px] font-bold uppercase">
            Updating visibility...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
