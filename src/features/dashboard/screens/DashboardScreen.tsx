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
import { fetchUserWorkspaces } from "@/src/features/workspace/redux/workspaceThunks";
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

  const {
    publicDocuments,
    recentDocuments,
    loading: docsLoading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.document);
  const { workspaces, loading: wsLoading } = useSelector(
    (state: RootState) => state.workspace,
  );

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

  const displayWorkspaces = workspaces.slice(0, 3);
  const dashboardDocuments = (isViewer ? publicDocuments : recentDocuments)
    .filter((doc) => doc.status !== "draft")
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-5 flex-row justify-between items-start bg-white border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-[11px] font-black text-gray-300 uppercase tracking-[2px] mb-1">
            DocuHub
          </Text>
          <Text className="text-[26px] font-black tracking-tighter text-black leading-8">
            {isViewer
              ? "Explore Docs."
              : isAdmin
                ? "Admin Dashboard."
                : "Workspace Hub."}
          </Text>
          {userName ? (
            <Text className="text-[12px] font-semibold text-gray-500 mt-1">
              Welcome back, {userName}
            </Text>
          ) : null}
        </View>
        <View className="items-end gap-1">
          <View
            className={`px-3 py-1.5 rounded-full ${
              isAdmin ? "bg-black" : isEditor ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-[9px] font-black uppercase tracking-[1.5px] ${
                isAdmin || isEditor ? "text-white" : "text-gray-600"
              }`}
            >
              {userRole || "viewer"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-black p-5 rounded-2xl">
              <Text className="text-4xl font-black text-white">
                {workspaces.length}
              </Text>
              <Text className="text-[9px] font-black text-white/70 uppercase tracking-[1px] mt-2">
                {isViewer ? "Workspaces" : isAdmin ? "Total Hubs" : "My Hubs"}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <Text className="text-4xl font-black text-black">
                {isViewer ? publicDocuments.length : recentDocuments.length}
              </Text>
              <Text className="text-[9px] font-black text-gray-500 uppercase tracking-[1px] mt-2">
                {isViewer ? "Public Docs" : "Recent Docs"}
              </Text>
            </View>
          </View>

          {isViewer && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-black p-6 rounded-2xl mb-6"
              onPress={() => nav.push("/(tabs)/public")}
            >
              <Text className="text-white text-[20px] font-black tracking-tight leading-7 mb-3">
                Browse Public{"\n"}Knowledge Base.
              </Text>
              <View className="bg-white/20 px-2.5 py-1 rounded-lg self-start">
                <Text className="text-white text-[8px] font-bold uppercase tracking-[1px]">
                  Public Access
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {!isViewer && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-black p-6 rounded-2xl mb-6 flex-row items-center justify-between"
              onPress={() => nav.push("/(tabs)/workspaces")}
            >
              <View className="flex-1 pr-4">
                <Text className="text-white text-[18px] font-black tracking-tight leading-6 mb-2">
                  {isAdmin
                    ? "Unified System\nManagement."
                    : "Continue Working\non Documents."}
                </Text>
                <View className="bg-white/20 px-2.5 py-1 rounded-lg self-start">
                  <Text className="text-white text-[8px] font-bold uppercase tracking-[1px]">
                    {isAdmin ? "Admin Controls" : "Editor Access"}
                  </Text>
                </View>
              </View>
              <View className="w-12 h-12 items-center justify-center">
                <Feather
                  name={isAdmin ? "layers" : "edit-3"}
                  size={28}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          )}

          {!isViewer && displayWorkspaces.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-4 px-0.5">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
                  {isAdmin ? "Featured Hubs" : "Assigned Hubs"}
                </Text>
                <TouchableOpacity
                  onPress={() => nav.push("/(tabs)/workspaces")}
                >
                  <Text className="text-[12px] font-bold text-black border-b border-black">
                    Explore all
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-8 py-2 mb-8"
                scrollEventThrottle={16}
              >
                {wsLoading ? (
                  <ActivityIndicator color="#000" className="py-8 px-8" />
                ) : (
                  displayWorkspaces.map((ws, idx) => (
                    <TouchableOpacity
                      key={ws._id}
                      className={`w-[170px] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:opacity-70 ${
                        idx !== displayWorkspaces.length - 1 ? "mr-4" : "mr-6"
                      }`}
                      onPress={() =>
                        nav.push(`/(workspace)/detail?id=${ws._id}`)
                      }
                    >
                      <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center mb-3">
                        <Feather name="briefcase" size={18} color="#000" />
                      </View>
                      <Text
                        className="text-[13px] font-black text-black leading-4"
                        numberOfLines={2}
                      >
                        {ws.name}
                      </Text>
                      <Text className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mt-2">
                        {ws.visibility || "private"}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          )}

          <View className="flex-row justify-between items-center mb-4 px-0.5">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
              {isViewer ? "Shared Documents" : "Recent Views"}
            </Text>
            {isViewer && (
              <TouchableOpacity onPress={() => nav.push("/(tabs)/public")}>
                <Text className="text-[12px] font-bold text-black border-b border-black">
                  Search all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {docsLoading ? (
            <ActivityIndicator color="#000" className="py-8" />
          ) : dashboardDocuments.length === 0 ? (
            <View className="bg-gray-50 p-8 rounded-2xl border border-gray-100 items-center">
              <Feather name="inbox" size={28} color="#999" />
              <Text className="font-black text-black mt-3">
                No documents available
              </Text>
              <Text className="mt-2 text-gray-500 text-center text-[13px]">
                {isViewer
                  ? "The public knowledge base is empty."
                  : "You haven't viewed any documents recently."}
              </Text>
            </View>
          ) : (
            dashboardDocuments.map((doc) => (
              <TouchableOpacity
                key={doc._id}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-2 active:opacity-70"
                onPress={() => {
                  dispatch(markDocumentAsRead({ documentId: doc._id }));
                  const wsId = getWorkspaceId(doc);
                  if (wsId) {
                    nav.push(
                      `/(workspace)/doc-detail?workspaceId=${wsId}&docId=${doc._id}`,
                    );
                  }
                }}
              >
                <View className="w-11 h-11 bg-gray-50 rounded-lg items-center justify-center flex-shrink-0">
                  <Feather name="file-text" size={18} color="#000" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-[14px] font-black text-black leading-4"
                    numberOfLines={1}
                  >
                    {doc.title}
                  </Text>
                  <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    {doc.visibility} • {getWorkspaceLabel(doc)}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color="#D1D5DB"
                  className="ml-2 flex-shrink-0"
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          className="absolute bottom-32 right-6 w-14 h-14 bg-black rounded-full items-center justify-center shadow-lg active:opacity-80"
          onPress={() => nav.push("/(tabs)/workspaces")}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
