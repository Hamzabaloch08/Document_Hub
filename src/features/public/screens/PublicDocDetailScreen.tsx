import {
    createDocumentComment,
    createPublicHomepageComment,
    fetchDocumentComments,
    fetchPublicHomepageComments,
} from "@/src/features/comment/redux/commentThunks";
import { CommentItem } from "@/src/features/comment/types/commentTypes";
import { fetchPublicDocuments } from "@/src/features/document/redux/documentThunks";
import { DocumentItem } from "@/src/features/document/types/documentTypes";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
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
      a { color: #111827; }
    </style>
  </head>
  <body>${content || "<p>No content available.</p>"}</body>
</html>
`;

const getWorkspaceLabel = (doc: DocumentItem) =>
  typeof doc.workspaceId === "string"
    ? doc.workspaceId
    : doc.workspaceId?.name || doc.workspaceId?._id || "Workspace";

const getCommentName = (comment: CommentItem) => {
  if (typeof comment.userId === "string") return "Guest";
  return comment.userId?.username || "Guest";
};

export default function PublicDocDetailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();
  const params = useLocalSearchParams<{ docId?: string }>();

  const { publicDocuments, loading } = useSelector(
    (state: RootState) => state.document,
  );

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("tokenGenerate").then((token) => {
      setHasToken(Boolean(token));
    });
  }, []);

  useEffect(() => {
    dispatch(fetchPublicDocuments());
  }, [dispatch]);

  const doc = useMemo(() => {
    return publicDocuments.find((item) => item._id === params.docId);
  }, [params.docId, publicDocuments]);

  useEffect(() => {
    const loadComments = async () => {
      if (!params.docId) return;

      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const result = hasToken
          ? await dispatch(fetchDocumentComments(params.docId)).unwrap()
          : await dispatch(fetchPublicHomepageComments(params.docId)).unwrap();
        setComments(result);
      } catch (error: any) {
        setComments([]);
        setCommentsError(
          hasToken
            ? error?.message || "Failed to load comments"
            : "Login to load all comments. You can still post a new one.",
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [dispatch, params.docId, hasToken]);

  const handleSendComment = async () => {
    if (!params.docId || !commentText.trim()) return;

    setSendingComment(true);
    try {
      const result = hasToken
        ? await dispatch(
            createDocumentComment({
              documentId: params.docId,
              text: commentText.trim(),
            }),
          ).unwrap()
        : await dispatch(
            createPublicHomepageComment({
              documentId: params.docId,
              text: commentText.trim(),
            }),
          ).unwrap();
      setComments((current) => [result, ...current]);
      setCommentText("");
      setCommentsError(null);
    } catch (error: any) {
      setCommentsError(error?.message || "Failed to send comment");
    } finally {
      setSendingComment(false);
    }
  };

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-5 pb-8">
              <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[1.5px]">
                Public Document
              </Text>
              <Text className="text-[27px] font-black text-black mt-2 leading-8">
                {doc.title}
              </Text>

              <View className="flex-row gap-2 mt-3 mb-5 flex-wrap">
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

              <View className="h-[420px] rounded-2xl border border-gray-100 overflow-hidden bg-white mb-6">
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

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[1.5px]">
                    Comments
                  </Text>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px]">
                    {hasToken ? "Member" : "Guest"}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 leading-5">
                  {commentsError ||
                    "Write a note below. Login shows the full synced thread."}
                </Text>
              </View>

              <View className="mb-4 bg-white border border-gray-100 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] ml-1">
                    Write a comment
                  </Text>
                  <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[1px]">
                    Tap and type
                  </Text>
                </View>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write your comment..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  className="min-h-[96px] text-black font-medium bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3"
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={handleSendComment}
                  disabled={sendingComment || !commentText.trim()}
                  className={`mt-3 h-12 rounded-2xl items-center justify-center flex-row gap-2 ${
                    sendingComment || !commentText.trim()
                      ? "bg-gray-300"
                      : "bg-black"
                  }`}
                >
                  {sendingComment ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="message-circle" size={16} color="white" />
                      <Text className="text-white font-black uppercase tracking-[1px] text-xs">
                        Comment
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-2">
                <View className="flex-row items-center justify-between mb-3 ml-1">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px]">
                    Recent Comments
                  </Text>
                  <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[1px]">
                    {comments.length}
                  </Text>
                </View>

                {commentsLoading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator color="#000" />
                  </View>
                ) : comments.length === 0 ? (
                  <View className="bg-white border border-gray-100 rounded-2xl p-5">
                    <Text className="text-gray-500 text-sm">
                      No comments yet.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {comments.map((comment) => (
                      <View
                        key={comment._id}
                        className="bg-white border border-gray-100 rounded-2xl p-4"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center gap-2">
                            <View className="w-7 h-7 rounded-full bg-black items-center justify-center">
                              <Text className="text-[9px] font-black text-white uppercase">
                                {getCommentName(comment).slice(0, 2)}
                              </Text>
                            </View>
                            <Text className="text-[11px] font-black text-black uppercase tracking-[1px]">
                              {getCommentName(comment)}
                            </Text>
                          </View>
                          <Text className="text-[9px] text-gray-400 uppercase font-bold">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : "Now"}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-700 leading-5">
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
