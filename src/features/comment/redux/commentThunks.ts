import api from "@/src/config/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CommentItem, CreateCommentPayload } from "../types/commentTypes";

const getErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (typeof data === "string") {
    const trimmed = data.replace(/\s+/g, " ").trim();
    if (trimmed && !/<!doctype html>|<html[\s>]/i.test(trimmed)) {
      return trimmed;
    }
  }

  const responseMessage = data?.message || data?.error;
  if (responseMessage) return responseMessage;

  if (error?.response?.status) {
    return `Request failed (${error.response.status}). Please try again.`;
  }

  return error?.message || fallback;
};

const pickComments = (data: any): CommentItem[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data?.comments)) return data.data.comments;
  return [];
};

const pickComment = (data: any): CommentItem | null =>
  data?.data ?? data?.comment ?? data?.data?.comment ?? null;

// Fetch comments for a document (authenticated)
export const fetchDocumentComments = createAsyncThunk<
  CommentItem[],
  string,
  { rejectValue: string }
>(
  "comment/fetchDocumentComments",
  async (documentId, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Fetching authenticated document comments for:", documentId);
      const response = await api.get(`/user/get-comments/${documentId}`);
      console.log("[Thunk] Fetched authenticated document comments:", response.data);
      return pickComments(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn("[Thunk] No comments found for document:", documentId);
        return [];
      }
      console.error("[Thunk Error] Failed to fetch comments:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to fetch comments"));
    }
  },
);

// Create a comment on a document (authenticated)
export const createDocumentComment = createAsyncThunk<
  CommentItem,
  CreateCommentPayload,
  { rejectValue: string }
>(
  "comment/createDocumentComment",
  async ({ documentId, text }, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Creating authenticated comment:", { documentId, textLength: text.length });
      const response = await api.post("/user/send-Comment", {
        documentId,
        text,
      });
      const comment = pickComment(response.data);
      if (!comment?._id) throw new Error("Invalid comment response");
      console.log("[Thunk] Authenticated comment created successfully:", comment._id);
      return comment;
    } catch (error: any) {
      console.error("[Thunk Error] Failed to create comment:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to send comment"));
    }
  },
);

// Delete a comment on a document (authenticated)
export const deleteDocumentComment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "comment/deleteDocumentComment",
  async (commentId, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Deleting authenticated comment:", commentId);
      await api.delete(`/user/delete-comments/${commentId}`);
      console.log("[Thunk] Authenticated comment deleted successfully:", commentId);
      return commentId;
    } catch (error: any) {
      console.error("[Thunk Error] Failed to delete comment:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to delete comment"));
    }
  },
);

// Public homepage comments - fetch both authenticated and unauthenticated
export const fetchPublicHomepageComments = createAsyncThunk<
  CommentItem[],
  string,
  { rejectValue: string }
>(
  "comment/fetchPublicHomepageComments",
  async (documentId, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Fetching homepage comments for:", documentId);
      
      let allComments: CommentItem[] = [];

      // First, always fetch public/unauthenticated comments
      try {
        console.log("[Thunk] Fetching public comments (no auth required)");
        const publicResponse = await api.get(`/user/get-UserComment-homepage/${documentId}`);
        const publicComments = pickComments(publicResponse.data);
        console.log(`[Thunk] Fetched ${publicComments.length} public comments`);
        allComments = [...allComments, ...publicComments];
      } catch (error: any) {
        console.warn(
          `[Thunk] Could not fetch public comments (status: ${error?.response?.status}):`,
          error?.response?.data?.message || error.message
        );
        // Continue anyway, don't fail
      }

      // Then, check if user is authenticated BEFORE making authenticated request
      const token = await (async () => {
        try {
          const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
          return await AsyncStorage.getItem("tokenGenerate");
        } catch {
          return null;
        }
      })();

      if (token) {
        // Only fetch authenticated comments if user is logged in
        try {
          console.log("[Thunk] User is authenticated, fetching authenticated comments");
          const authResponse = await api.get(`/user/get-comment-homepage/${documentId}`);
          const authComments = pickComments(authResponse.data);
          console.log(`[Thunk] Fetched ${authComments.length} authenticated comments`);
          
          // Deduplicate by comment ID
          allComments = Array.from(
            new Map([...allComments, ...authComments].map(c => [c._id, c])).values()
          );
        } catch (error: any) {
          console.warn(
            `[Thunk] Error fetching authenticated comments (status: ${error?.response?.status}):`,
            error?.response?.data?.message || error.message
          );
        }
      } else {
        console.log("[Thunk] User not authenticated, skipping authenticated comments");
      }

      console.log(`[Thunk] Total unique comments fetched: ${allComments.length}`);
      return allComments;
    } catch (error: any) {
      console.error("[Thunk Error] Unexpected error in fetchPublicHomepageComments:", error);
      // Return empty array instead of rejecting - we want to show the doc even without comments
      return [];
    }
  },
);

export const createPublicHomepageComment = createAsyncThunk<
  CommentItem,
  CreateCommentPayload,
  { rejectValue: string }
>(
  "comment/createPublicHomepageComment",
  async ({ documentId, text }, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Creating homepage comment:", { documentId, textLength: text.length });
      const response = await api.post("/user/send-comment-homepage", {
        documentId,
        text,
      });
      const comment = pickComment(response.data);
      if (!comment?._id) throw new Error("Invalid comment response");
      console.log("[Thunk] Homepage comment created successfully:", comment._id);
      return comment;
    } catch (error: any) {
      console.error("[Thunk Error] Failed to create homepage comment:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to send comment"));
    }
  },
);

// Update public homepage comment (unauthenticated)
export const updatePublicHomepageComment = createAsyncThunk<
  CommentItem,
  { commentId: string; text: string },
  { rejectValue: string }
>(
  "comment/updatePublicHomepageComment",
  async ({ commentId, text }, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Updating public homepage comment:", commentId);
      const response = await api.put(`/user/update-comment-homepage/${commentId}`, {
        text,
      });
      const comment = pickComment(response.data);
      if (!comment?._id) throw new Error("Invalid comment response");
      console.log("[Thunk] Public comment updated successfully:", comment._id);
      return comment;
    } catch (error: any) {
      console.error("[Thunk Error] Failed to update public comment:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to update comment"));
    }
  },
);

// Delete public homepage comment (unauthenticated)
export const deletePublicHomepageComment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "comment/deletePublicHomepageComment",
  async (commentId, { rejectWithValue }) => {
    try {
      console.log("[Thunk] Deleting public homepage comment:", commentId);
      await api.delete(`/user/delete-UserComment-homepage/${commentId}`);
      console.log("[Thunk] Public comment deleted successfully:", commentId);
      return commentId;
    } catch (error: any) {
      console.error("[Thunk Error] Failed to delete public comment:", error);
      return rejectWithValue(getErrorMessage(error, "Failed to delete comment"));
    }
  },
);
