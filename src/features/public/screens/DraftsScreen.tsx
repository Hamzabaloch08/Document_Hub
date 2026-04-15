import { clearDocumentError } from "@/src/features/document/redux/documentSlice";
import {
    deleteDocument,
    fetchUserWorkspaces,
    updateDocument,
} from "@/src/features/document/redux/documentThunks";
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

export default function DraftsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const { workspaceDocuments, loading, actionLoading, error } = useSelector(
    (state: RootState) => state.document,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">(
    "viewer",
  );
  const debouncedQuery = useDebounce(searchQuery.trim(), 350);

  // Get draft docs from all workspaces
  const draftDocs = workspaceDocuments.filter(
    (doc: any) => doc.status === "draft",
  );

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
    dispatch(fetchUserWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => dispatch(clearDocumentError()) },
      ]);
    }
  }, [error, dispatch]);

  const handlePublish = (doc: any) => {
    Alert.alert("Publish", `Publish "${doc.title}"?`, [
      { text: "Cancel" },
      {
        text: "Publish",
        onPress: async () => {
          await dispatch(
            updateDocument({ id: doc._id, data: { status: "published" } }),
          );
          dispatch(fetchUserWorkspaces());
        },
      },
    ]);
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
            dispatch(fetchUserWorkspaces());
          }
        },
      },
    ]);
  };

  const handleEdit = (doc: any) => {
    nav.push({
      pathname: "/(workspace)/edit-doc",
      params: { docId: doc._id, title: doc.title, visibility: doc.visibility },
    });
  };

  const filteredDrafts = draftDocs.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-6 border-b border-gray-50 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            Work In Progress
          </Text>
          <Text className="text-2xl font-black tracking-tighter text-black">
            Drafts.
          </Text>
        </View>
        <Feather name="edit-3" size={22} color="black" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          <View className="bg-white h-14 px-5 rounded-2xl flex-row items-center border border-gray-100 mb-8">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search drafts..."
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
            Your Drafts
          </Text>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="mt-3 text-gray-500">Loading...</Text>
            </View>
          ) : filteredDrafts.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center">
              <Feather name="edit-3" size={32} color="#D1D5DB" />
              <Text className="text-black font-black mt-4">No drafts</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery
                  ? "Try another search"
                  : "Start writing your first draft"}
              </Text>
            </View>
          ) : (
            filteredDrafts.map((doc: any) => (
              <View
                key={doc._id}
                className="mb-5 rounded-3xl border border-gray-100 bg-white overflow-hidden"
              >
                <View className="px-5 pt-5 pb-4 border-b border-gray-50">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-black text-black">
                        {doc.title}
                      </Text>
                      <View className="flex-row items-center mt-2 gap-1">
                        <View className="bg-gray-200 px-2 py-0.5 rounded-full">
                          <Text className="text-gray-600 text-[9px] font-bold uppercase">
                            Draft
                          </Text>
                        </View>
                        <View className="bg-black px-2 py-0.5 rounded-full ml-2">
                          <Text className="text-white text-[9px] font-bold uppercase">
                            {doc.visibility}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handlePublish(doc)}
                        disabled={actionLoading}
                        className="w-9 h-9 rounded-full border border-green-100 items-center justify-center bg-green-50"
                      >
                        <Feather name="send" size={14} color="#16A34A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEdit(doc)}
                        disabled={actionLoading}
                        className="w-9 h-9 rounded-full border border-blue-100 items-center justify-center bg-blue-50"
                      >
                        <Feather name="edit-2" size={14} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(doc)}
                        disabled={actionLoading}
                        className="w-9 h-9 rounded-full border border-red-100 items-center justify-center bg-red-50"
                      >
                        <Feather name="trash-2" size={14} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
