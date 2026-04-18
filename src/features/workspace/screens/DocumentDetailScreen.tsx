import { fetchWorkspaceDocuments } from "@/src/features/document/redux/documentThunks";
import { DocumentItem } from "@/src/features/document/types/documentTypes";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";

const buildHtml = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body { margin: 0; padding: 18px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; line-height: 1.7; }
      h1, h2, h3 { margin: 0 0 12px; }
      p { margin: 0 0 12px; }
      img { max-width: 100%; height: auto; border-radius: 10px; }
      pre { padding: 12px; border-radius: 10px; background: #f8fafc; overflow-x: auto; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    </style>
  </head>
  <body>${content || "<p>No content available.</p>"}</body>
</html>
`;

const getWorkspaceLabel = (doc: DocumentItem) =>
  typeof doc.workspaceId === "string"
    ? doc.workspaceId
    : doc.workspaceId?.name || doc.workspaceId?._id || "Workspace";

export default function DocumentDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const params = useLocalSearchParams<{
    workspaceId?: string;
    docId?: string;
  }>();

  const {
    workspaceDocuments,
    publicDocuments,
    recentDocuments,
    draftDocuments,
    loading,
  } = useSelector((state: RootState) => state.document);

  useEffect(() => {
    if (params.workspaceId) {
      dispatch(fetchWorkspaceDocuments(params.workspaceId));
    }
  }, [dispatch, params.workspaceId]);

  const doc = useMemo(() => {
    const allDocs = [
      ...workspaceDocuments,
      ...publicDocuments,
      ...recentDocuments,
      ...draftDocuments,
    ];

    return allDocs.find((item) => item._id === params.docId);
  }, [
    draftDocuments,
    params.docId,
    publicDocuments,
    recentDocuments,
    workspaceDocuments,
  ]);

  if (!params.docId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-black font-black">Invalid document request</Text>
      </SafeAreaView>
    );
  }

  if (loading && !doc) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#000" />
      </SafeAreaView>
    );
  }

  if (!doc) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6 items-center justify-center">
        <Feather name="file-x" size={30} color="#94A3B8" />
        <Text className="mt-3 text-black font-black">Document not found</Text>
        <TouchableOpacity
          onPress={() => nav.back()}
          className="mt-5 px-5 py-3 rounded-xl bg-black"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => nav.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Feather name="arrow-left" size={18} color="black" />
        </TouchableOpacity>
        <View className="bg-black px-3 py-1.5 rounded-full">
          <Text className="text-[9px] font-black text-white uppercase">
            {doc.visibility}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5 pb-8">
          <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[1.5px]">
            Document Detail
          </Text>
          <Text className="text-[27px] font-black text-black mt-2 leading-8">
            {doc.title}
          </Text>

          <View className="flex-row gap-2 mt-3 mb-5">
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-[9px] font-black text-gray-600 uppercase">
                {getWorkspaceLabel(doc)}
              </Text>
            </View>
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-[9px] font-black text-gray-600 uppercase">
                {doc.status || "published"}
              </Text>
            </View>
          </View>

          <View className="h-[620px] rounded-2xl border border-gray-100 overflow-hidden bg-white">
            <WebView
              originWhitelist={["*"]}
              source={{ html: buildHtml(doc.content) }}
              style={{ backgroundColor: "transparent" }}
              showsVerticalScrollIndicator={false}
              onShouldStartLoadWithRequest={(req) => {
                if (
                  req.navigationType === "click" &&
                  req.url !== "about:blank"
                ) {
                  return false;
                }
                return true;
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
