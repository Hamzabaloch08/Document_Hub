import { clearDocumentError } from "@/src/features/document/redux/documentSlice";
import { deleteDocument, fetchPublicDocuments, markDocumentAsRead, searchPublicDocuments } from "@/src/features/document/redux/documentThunks";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "@/src/shared/hooks/useDebounce";

const buildHtml = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; line-height: 1.65; }
      h1,h2,h3 { margin: 0 0 12px; }
      p { margin: 0 0 12px; }
      img { max-width: 100%; height: auto; border-radius: 12px; }
    </style>
  </head>
  <body>${content || "<p>No content.</p>"}</body>
</html>
`;

export default function PublicDocsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { publicDocuments, loading, actionLoading, error } = useSelector((state: RootState) => state.document);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const debouncedQuery = useDebounce(searchQuery.trim(), 350);

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

  useEffect(() => {
    dispatch(fetchPublicDocuments());
  }, [dispatch]);

  useEffect(() => {
    if (debouncedQuery.length === 0) {
      dispatch(fetchPublicDocuments());
    } else {
      dispatch(searchPublicDocuments({ query: debouncedQuery }));
    }
  }, [debouncedQuery, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: () => dispatch(clearDocumentError()) }]);
    }
  }, [error, dispatch]);

  const handleOpen = (docId: string, wsId: string) => {
    dispatch(markDocumentAsRead({ documentId: docId }));
    if (wsId) nav.push(`/(workspace)/detail?id=${wsId}&docId=${docId}`);
  };

  const handleDelete = (doc: any) => {
    Alert.alert("Delete", `Delete "${doc.title}"?`, [
      { text: "Cancel" },
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
    ]);
  };

  const canManage = userRole === "admin" || userRole === "editor";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-6 border-b border-gray-50 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">Discovery</Text>
          <Text className="text-2xl font-black tracking-tighter text-black">Public Docs.</Text>
        </View>
        <Feather name="globe" size={22} color="black" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          <View className="bg-white h-14 px-5 rounded-2xl flex-row items-center border border-gray-100 mb-8">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search public docs..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-sm font-bold text-black"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-5 ml-1">Open Knowledge</Text>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Loading...</Text>
            </View>
          ) : publicDocuments.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center">
              <Feather name="file-text" size={32} color="#D1D5DB" />
              <Text className="text-black font-black mt-4">No public docs</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery ? "Try another search" : "No documents published"}
              </Text>
            </View>
          ) : (
            publicDocuments
              .filter((doc: any) => doc.status !== "draft")
              .map((doc: any) => {
              const wsId = typeof doc.workspaceId === "string" ? doc.workspaceId : doc.workspaceId?._id;
              return (
                <View key={doc._id} className="mb-5 rounded-3xl border border-gray-100 bg-white overflow-hidden">
                  <View className="px-5 pt-5 pb-4 border-b border-gray-50">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-lg font-black text-black">{doc.title}</Text>
                        <View className="flex-row items-center mt-2 gap-1">
                          <View className="bg-black px-2 py-0.5 rounded-full">
                            <Text className="text-white text-[9px] font-bold uppercase">{doc.visibility}</Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        {canManage && (
                          <TouchableOpacity
                            onPress={() => handleDelete(doc)}
                            disabled={actionLoading}
                            className="w-9 h-9 rounded-full border border-red-100 items-center justify-center bg-red-50"
                          >
                            <Feather name="trash-2" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleOpen(doc._id, wsId)}
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
                  <View className="h-[350px] bg-white">
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: buildHtml(doc.content) }}
                      style={{ backgroundColor: "transparent" }}
                      scrollEnabled
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      onShouldStartLoadWithRequest={(req) => {
                        if (req.navigationType === "click" && req.url !== "about:blank") {
                          return false;
                        }
                        return true;
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}