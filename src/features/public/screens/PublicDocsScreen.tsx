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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-6 py-5 flex-row justify-between items-center bg-white">
        <View>
          <Text className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Discover
          </Text>
          <Text
            className="text-3xl font-black tracking-tight text-black"
            style={{ fontFamily: "Outfit" }}
          >
            Public Docs
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {!hasToken && (
            <TouchableOpacity
              onPress={() => nav.push("/(auth)/login")}
              className="px-4 py-2 rounded-lg bg-black"
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-6 pb-40">
          <View className="bg-white h-14 px-5 rounded-lg flex-row items-center border border-gray-200 mb-6">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search documents..."
              placeholderTextColor="#D1D5DB"
              className="flex-1 ml-3 text-base font-medium text-black"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 ml-1">
            Open Knowledge
          </Text>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Fetching documents...</Text>
            </View>
          ) : visibleDocuments.length === 0 ? (
            <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
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
                  className="mb-3 rounded-lg bg-white p-4 border border-gray-200"
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
                      <View className="w-9 h-9 rounded-full items-center justify-center">
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
