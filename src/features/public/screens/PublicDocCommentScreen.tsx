import {
    createPublicHomepageComment,
    fetchPublicHomepageComments,
} from "@/src/features/comment/redux/commentThunks";
import { CommentItem } from "@/src/features/comment/types/commentTypes";
import { AppDispatch } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
import { useDispatch } from "react-redux";

interface PublicDocCommentScreenProps {
  documentId: string;
  onClose?: () => void;
}

const getCommentName = (comment: CommentItem) => {
  if (typeof comment.userId === "string") return "Guest";
  return comment.userId?.username || "Guest";
};

const getCommentTime = (createdAt: string) => {
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch {
    return "Recently";
  }
};

export default function PublicDocCommentScreen({
  documentId,
  onClose,
}: PublicDocCommentScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
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
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const result = await dispatch(
        fetchPublicHomepageComments(documentId),
      ).unwrap();
      setComments(Array.isArray(result) ? result : []);
    } catch (error: any) {
      setCommentsError(error?.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    if (!hasToken) {
      setCommentsError("Please log in to comment");
      return;
    }

    setSendingComment(true);
    try {
      const newComment = await dispatch(
        createPublicHomepageComment({
          documentId,
          text: commentText.trim(),
        }),
      ).unwrap();
      setComments([newComment, ...comments]);
      setCommentText("");
      Keyboard.dismiss();
    } catch (error: any) {
      setCommentsError(error?.message || "Failed to send comment");
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
          <Text className="text-lg font-black text-black">Comments</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        {/* Comments List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-4"
        >
          {commentsLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#000" />
              <Text className="mt-3 text-sm text-gray-400">
                Loading comments...
              </Text>
            </View>
          ) : commentsError ? (
            <View className="flex-1 items-center justify-center">
              <Feather name="alert-circle" size={32} color="#ef4444" />
              <Text className="mt-2 text-sm text-gray-500">
                {commentsError}
              </Text>
            </View>
          ) : comments.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Feather name="message-circle" size={32} color="#cbd5e1" />
              <Text className="mt-2 text-sm text-gray-400">
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {comments.map((comment) => (
                <View
                  key={comment._id}
                  className="pb-4 border-b border-gray-100"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-black">
                        {getCommentName(comment)}
                      </Text>
                      <Text className="text-[11px] text-gray-400 mt-1">
                        {getCommentTime(comment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-700 mt-2 leading-[1.5]">
                    {comment.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Comment Input */}
        {hasToken && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="px-6 py-4 border-t border-gray-100 bg-white">
              <View className="flex-row items-end gap-3">
                <TextInput
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm text-black"
                  placeholder="Write a comment..."
                  placeholderTextColor="#94a3b8"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                  editable={!sendingComment}
                />
                <TouchableOpacity
                  onPress={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    commentText.trim() && !sendingComment
                      ? "bg-black"
                      : "bg-gray-200"
                  }`}
                >
                  {sendingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
