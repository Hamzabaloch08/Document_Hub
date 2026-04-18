import {
    deleteDocument,
    fetchDraftDocuments,
    updateDocument,
} from "@/src/features/document/redux/documentThunks";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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

export default function DraftsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { draftDocuments, loading, deletingDocumentId } = useSelector(
    (s: RootState) => s.document,
  );

  useEffect(() => {
    const checkRole = async () => {
      try {
        const rawUser = await AsyncStorage.getItem("user");
        if (!rawUser) return;

        const parsedUser = JSON.parse(rawUser);
        const role = String(parsedUser?.role || "viewer").toLowerCase();
        if (role === "viewer") {
          router.replace("/(tabs)/index");
        }
      } catch {
        router.replace("/(tabs)/index");
      }
    };

    checkRole();
  }, [router]);

  useEffect(() => {
    dispatch(fetchDraftDocuments());
  }, [dispatch]);

  const handleDeleteDraft = (docId: string, title: string) => {
    Alert.alert("Delete Draft", `Delete "${title}"?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await dispatch(deleteDocument(docId));
        },
      },
    ]);
  };

  const handlePublishDraft = (docId: string, title: string) => {
    Alert.alert("Publish Draft", `Publish "${title}"?`, [
      { text: "Cancel" },
      {
        text: "Publish",
        onPress: async () => {
          await dispatch(
            updateDocument({
              id: docId,
              data: { status: "published" },
            }),
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[2px]">
            Work In Progress
          </Text>
          <Text className="text-2xl font-black text-black">Drafts.</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-8">
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="black" />
              <Text className="text-gray-400 mt-4 font-bold">
                Loading drafts...
              </Text>
            </View>
          ) : draftDocuments.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Feather name="file-text" size={48} color="#DDD" />
              <Text className="text-gray-400 font-black mt-4 uppercase tracking-widest text-base">
                No Drafts Yet
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                Start creating a document and save it as a draft
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {draftDocuments.map((doc) => (
                <View
                  key={doc._id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                >
                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 pr-3">
                        <Text
                          className="text-base font-black text-black"
                          numberOfLines={1}
                        >
                          {doc.title}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1 uppercase">
                          {typeof doc.workspaceId === "string"
                            ? "Workspace"
                            : doc.workspaceId?.name || "Workspace"}
                        </Text>
                      </View>
                      <View className="bg-yellow-100 px-2 py-1 rounded-lg">
                        <Text className="text-[10px] font-black text-yellow-700 uppercase">
                          Draft
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/(workspace)/edit-doc",
                            params: {
                              docId: doc._id,
                              workspaceId:
                                typeof doc.workspaceId === "string"
                                  ? doc.workspaceId
                                  : doc.workspaceId?._id,
                              title: doc.title,
                            },
                          })
                        }
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 bg-black rounded-lg"
                      >
                        <Feather name="edit-2" size={14} color="white" />
                        <Text className="text-white text-[11px] font-black uppercase">
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handlePublishDraft(doc._id, doc.title)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 bg-green-50 rounded-lg border border-green-200"
                      >
                        <Feather name="send" size={14} color="#16A34A" />
                        <Text className="text-green-700 text-[11px] font-black uppercase">
                          Publish
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteDraft(doc._id, doc.title)}
                        disabled={deletingDocumentId === doc._id}
                        className="w-11 h-11 items-center justify-center bg-red-50 rounded-lg border border-red-100"
                      >
                        {deletingDocumentId === doc._id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Feather name="trash-2" size={16} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {draftDocuments.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(workspace)/edit-doc",
                })
              }
              className="mt-8 bg-black py-4 rounded-2xl items-center justify-center flex-row gap-2"
            >
              <Feather name="plus" size={18} color="white" />
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                New Draft
              </Text>
            </TouchableOpacity>
          )}

          {draftDocuments.length === 0 && !loading && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(workspace)/edit-doc",
                })
              }
              className="mt-8 bg-black py-4 rounded-2xl items-center justify-center flex-row gap-2"
            >
              <Feather name="plus" size={18} color="white" />
              <Text className="text-white text-sm font-black uppercase tracking-widest">
                New Draft
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
