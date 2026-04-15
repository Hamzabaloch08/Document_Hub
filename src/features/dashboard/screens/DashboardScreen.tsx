import {
    clearDocumentError,
    clearDocumentSuccess,
} from "@/src/features/document/redux/documentSlice";
import {
    fetchPublicDocuments,
    fetchRecentDocuments,
    markDocumentAsRead,
} from "@/src/features/document/redux/documentThunks";
import { DocumentItem } from "@/src/features/document/types/documentTypes";
import {
    fetchUserWorkspaces,
} from "@/src/features/workspace/redux/workspaceThunks";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const getWorkspaceLabel = (doc: DocumentItem) => {
  if (typeof doc.workspaceId === "string") return doc.workspaceId;
  return doc.workspaceId?.name || doc.workspaceId?._id || "Workspace";
};

const getWorkspaceId = (doc: DocumentItem) => {
  if (typeof doc.workspaceId === "string") return doc.workspaceId;
  return doc.workspaceId?._id || "";
};

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();

  const { publicDocuments, recentDocuments, loading: docsLoading, error, successMessage } =
    useSelector((state: RootState) => state.document);
  const { workspaces, loading: wsLoading } = useSelector((state: RootState) => state.workspace);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          const role = parsed.role?.toLowerCase() || "viewer";
          setUserRole(role);
          setUserName(parsed.username || "");
          // Fetch workspaces for all roles
          dispatch(fetchUserWorkspaces());
          // Admin/Editor: fetch recent docs; Viewer: fetch public docs
          if (role === "viewer") {
            dispatch(fetchPublicDocuments());
          } else {
            dispatch(fetchRecentDocuments());
            dispatch(fetchPublicDocuments());
          }
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [dispatch]);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="black" />
      </SafeAreaView>
    );
  }

  const isAdmin = userRole === "admin";
  const isEditor = userRole === "editor";
  const isViewer = userRole === "viewer" || !userRole;

  // Admin: show all workspaces (max 3); Editor: show assigned workspaces (max 3)
  const displayWorkspaces = workspaces.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-6 flex-row justify-between items-center bg-white border-b border-gray-50">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            DocuHub
          </Text>
          <Text className="text-[24px] font-black tracking-tighter text-black">
            {isViewer ? "Explore Docs." : isAdmin ? "Admin Dashboard." : "Workspace Hub."}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View
            className={`px-3 py-1 rounded-full ${
              isAdmin
                ? "bg-black"
                : isEditor
                ? "bg-gray-800"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-[9px] font-black uppercase tracking-[1.5px] ${
                isAdmin || isEditor ? "text-white" : "text-gray-500"
              }`}
            >
              {userRole || "viewer"}
            </Text>
          </View>
          {userName ? (
            <Text className="text-[10px] font-bold text-gray-400">{userName}</Text>
          ) : null}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">

          {/* ── ADMIN / EDITOR: Stats ── */}
          {!isViewer && (
            <View className="flex-row gap-4 mb-8">
              <View className="flex-1 bg-black p-5 rounded-2xl">
                <Text className="text-3xl font-black text-white">
                  {workspaces.length}
                </Text>
                <Text className="text-[10px] font-black text-white/60 uppercase tracking-[1px] mt-1">
                  {isAdmin ? "Total Hubs" : "My Hubs"}
                </Text>
              </View>
              <View className="flex-1 bg-white p-5 rounded-2xl border border-gray-100">
                <Text className="text-3xl font-black text-black">
                  {recentDocuments.length}
                </Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-1">
                  Total Docs
                </Text>
              </View>
            </View>
          )}

          {/* ── VIEWER: Hero CTA ── */}
          {isViewer && (
            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-black p-8 rounded-2xl mb-8"
              onPress={() => nav.push("/(tabs)/public")}
            >
              <Text className="text-white text-[22px] font-black tracking-tight leading-7">
                Browse Public{"\n"}Knowledge Base.
              </Text>
              <View className="bg-white/20 px-2 py-0.5 rounded-lg self-start mt-3">
                <Text className="text-white text-[9px] font-bold uppercase tracking-[1px]">
                  Public Access
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── ADMIN/EDITOR: Primary CTA ── */}
          {!isViewer && (
            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-black p-8 rounded-2xl mb-8 flex-row items-center justify-between"
              onPress={() => nav.push("/(tabs)/workspaces")}
            >
              <View className="flex-1">
                <Text className="text-white text-[20px] font-black tracking-tight leading-7">
                  {isAdmin ? "Unified System\nManagement." : "Continue Working\non Documents."}
                </Text>
                <View className="bg-white/20 px-2 py-0.5 rounded-lg self-start mt-3">
                  <Text className="text-white text-[9px] font-bold uppercase tracking-[1px]">
                    {isAdmin ? "Admin Controls" : "Editor Access"}
                  </Text>
                </View>
              </View>
              <Feather name={isAdmin ? "layers" : "edit-3"} size={32} color="white" />
            </TouchableOpacity>
          )}

          {/* ── WORKSPACES (Admin/Editor) ── */}
          {!isViewer && displayWorkspaces.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
                  {isAdmin ? "Featured Hubs" : "Assigned Hubs"}
                </Text>
                <TouchableOpacity onPress={() => nav.push("/(tabs)/workspaces")}>
                  <Text className="text-xs font-bold text-black border-b border-gray-100 pb-0.5">
                    Explore all
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6 mb-8"
              >
                {wsLoading ? (
                  <ActivityIndicator color="#000" className="py-8 px-8" />
                ) : (
                  displayWorkspaces.map((ws) => (
                    <TouchableOpacity
                      key={ws._id}
                      className="w-[160px] bg-white p-5 rounded-2xl border border-gray-100 mr-3 shadow-sm "
                      onPress={() => nav.push(`/(workspace)/detail?id=${ws._id}`)}
                    >
                      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mb-3">
                        <Feather name="briefcase" size={18} color="black" />
                      </View>
                      <Text className="text-sm font-black text-black" numberOfLines={1}>
                        {ws.name}
                      </Text>
                      <Text className="text-[9px] font-bold uppercase tracking-[1px] text-gray-400 mt-1">
                        {ws.visibility || "private"}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          )}

          {/* ── CONTENT SECTION ── */}
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
              {isViewer ? "Shared Documents" : "Recent Views"}
            </Text>
            {isViewer && (
              <TouchableOpacity onPress={() => nav.push("/(tabs)/public")}>
                <Text className="text-xs font-bold text-black border-b border-gray-100 pb-0.5">
                  Search all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {docsLoading ? (
            <ActivityIndicator color="#000" className="py-8" />
          ) : (isViewer ? publicDocuments.slice(0, 5) : recentDocuments).length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center">
              <Text className="font-black text-black">No documents available</Text>
              <Text className="mt-2 text-gray-500 text-center text-sm">
                {isViewer ? "The public knowledge base is empty." : "You haven't viewed any documents recently."}
              </Text>
            </View>
          ) : (
            (isViewer ? publicDocuments.slice(0, 5) : recentDocuments).map((doc) => (
              <TouchableOpacity
                key={doc._id}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm "
                onPress={() => {
                  dispatch(markDocumentAsRead({ documentId: doc._id }));
                  const wsId = getWorkspaceId(doc);
                  if (wsId) {
                    nav.push(`/(workspace)/detail?id=${wsId}&docId=${doc._id}`);
                  }
                }}
              >
                <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center">
                  <Feather name="file-text" size={18} color="black" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base font-black text-black leading-5" numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    {doc.visibility} • {getWorkspaceLabel(doc)}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB - Admin only (create workspace or doc) */}
      {isAdmin && (
        <TouchableOpacity
          className="absolute bottom-24 right-6 w-14 h-14 bg-black rounded-2xl items-center justify-center shadow-lg "
          onPress={() => nav.push("/(tabs)/workspaces")}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
