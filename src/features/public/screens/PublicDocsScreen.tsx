import { clearDocumentError } from "@/src/features/document/redux/documentSlice";
import {
    fetchPublicDocuments,
    searchPublicDocuments,
} from "@/src/features/document/redux/documentThunks";
import { DocumentItem } from "@/src/features/document/types/documentTypes";
import { useDebounce } from "@/src/shared/hooks/useDebounce";
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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const getWorkspaceLabel = (doc: DocumentItem) =>
  typeof doc.workspaceId === "string"
    ? doc.workspaceId
    : doc.workspaceId?.name || doc.workspaceId?._id || "Workspace";

const getExcerpt = (content?: string) => {
  if (!content) return "No description available.";
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
};

export default function PublicDocsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { publicDocuments, loading, error } = useSelector(
    (state: RootState) => state.document,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const debouncedQuery = useDebounce(searchQuery.trim(), 350);

  useEffect(() => {
    AsyncStorage.getItem("tokenGenerate").then((token) => {
      setHasToken(Boolean(token));
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
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => dispatch(clearDocumentError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleOpen = (docId: string) => {
    nav.push(`/(public)/doc-detail?docId=${docId}`);
  };

  const visibleDocuments = publicDocuments.filter((doc) => {
    if (doc.status === "draft") return false;
    return doc.visibility === "public";
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-5 border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            Discovery
          </Text>
          <Text className="text-2xl font-black tracking-tighter text-black">
            Public Docs.
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {!hasToken && (
            <TouchableOpacity
              onPress={() => nav.push("/(auth)/login")}
              className="px-3 py-2 rounded-xl bg-black"
            >
              <Text className="text-white text-[10px] font-black uppercase tracking-[1px]">
                Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          <View className="bg-white h-14 px-5 rounded-2xl flex-row items-center border border-gray-100 mb-6">
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

          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-1">
            Open Knowledge
          </Text>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Fetching documents...</Text>
            </View>
          ) : visibleDocuments.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center">
              <Feather name="file-text" size={32} color="#D1D5DB" />
              <Text className="text-black font-black mt-4">No public docs</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery ? "Try another search" : "No documents published"}
              </Text>
            </View>
          ) : (
            visibleDocuments.map((doc) => {
              return (
                <TouchableOpacity
                  key={doc._id}
                  className="mb-3 rounded-2xl border border-gray-100 bg-white p-4"
                  activeOpacity={0.85}
                  onPress={() => handleOpen(doc._id)}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text
                        className="text-[16px] font-black text-black"
                        numberOfLines={1}
                      >
                        {doc.title}
                      </Text>
                      <Text
                        className="text-gray-500 text-[12px] mt-2 leading-5"
                        numberOfLines={3}
                      >
                        {getExcerpt(doc.content)}
                      </Text>

                      <View className="flex-row items-center mt-3 gap-2">
                        <View className="bg-black px-2 py-1 rounded-full">
                          <Text className="text-white text-[9px] font-bold uppercase">
                            {doc.visibility}
                          </Text>
                        </View>
                        <View className="bg-gray-100 px-2 py-1 rounded-full">
                          <Text
                            className="text-gray-600 text-[9px] font-bold uppercase"
                            numberOfLines={1}
                          >
                            {getWorkspaceLabel(doc)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-center gap-2">
                      <View className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center">
                        <Feather name="book-open" size={14} color="black" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
