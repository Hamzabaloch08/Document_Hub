import api from "@/src/config/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    CreateDocumentPayload,
    DocumentItem,
    DocumentResponse,
    MarkDocumentReadPayload,
    SearchPublicDocumentsPayload,
    UpdateDocumentPayload,
} from "../types/documentTypes";

const getErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (typeof data === "string") {
    const trimmed = data.replace(/\s+/g, " ").trim();
    if (trimmed) {
      const looksLikeHtml = /<!doctype html>|<html[\s>]/i.test(trimmed);
      if (!looksLikeHtml) return trimmed;
    }
  }

  const responseMessage = data?.message || data?.error;
  if (responseMessage) return responseMessage;

  if (error?.response?.status) {
    return `Backend request failed (${error.response.status}). Please check the server.`;
  }

  return error?.message || fallback;
};

const pickDocuments = (data: any): DocumentItem[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.documents)) return data.documents;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.data?.documents)) return data.data.documents;
  if (Array.isArray(data?.data?.docs)) return data.data.docs;
  return [];
};

const pickSingleDocument = (data: any): DocumentItem | null =>
  data?.document ?? data?.doc ?? data?.data?.document ?? data?.data ?? null;

const getRoleFromStorage = async (): Promise<"admin" | "editor" | "viewer"> => {
  try {
    const rawUser = await AsyncStorage.getItem("user");
    if (!rawUser) return "viewer";
    const parsed = JSON.parse(rawUser);
    const role = String(parsed?.role || "viewer").toLowerCase();
    if (role === "admin" || role === "editor" || role === "viewer") return role;
  } catch {}
  return "viewer";
};

// ─── Fetch Workspace Documents ────────────────────────────────────────────────
export const fetchWorkspaceDocuments = createAsyncThunk<
  DocumentItem[],
  string,
  { rejectValue: string }
>(
  "document/fetchWorkspaceDocuments",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/documents/${workspaceId}?status=published`,
      );
      const docs = pickDocuments(response.data);
      console.log("[DEBUG] Fetched workspace documents:", docs);
      docs.forEach((doc) => {
        console.log(
          `[DEBUG] Doc "${doc.title}" - status: ${doc.status}, visibility: ${doc.visibility}`,
        );
      });
      return docs;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch workspace documents"),
      );
    }
  },
);

// ─── Create Document ──────────────────────────────────────────────────────────
export const createDocument = createAsyncThunk<
  DocumentItem,
  CreateDocumentPayload,
  { rejectValue: string }
>("document/createDocument", async (payload, { rejectWithValue }) => {
  try {
    console.log("[DEBUG] Creating document with payload:", payload);
    const response = await api.post<DocumentResponse | any>(
      "/api/documents",
      payload,
    );
    console.log(
      "[DEBUG] Document created, full response:",
      JSON.stringify(response.data, null, 2),
    );
    const document = pickSingleDocument(response.data);
    if (!document?._id) throw new Error("Invalid create document response");
    console.log(
      "[DEBUG] Parsed document - title:",
      document.title,
      "status:",
      document.status,
      "visibility:",
      document.visibility,
    );
    return document;
  } catch (error: any) {
    console.error(
      "[DEBUG] Create document error:",
      error?.response?.data || error?.message,
    );
    return rejectWithValue(getErrorMessage(error, "Failed to create document"));
  }
});

// ─── Update Document ──────────────────────────────────────────────────────────
export const updateDocument = createAsyncThunk<
  DocumentItem,
  UpdateDocumentPayload,
  { rejectValue: string }
>("document/updateDocument", async ({ id, data }, { rejectWithValue }) => {
  try {
    console.log("[DEBUG] Updating document with id:", id, "data:", data);
    const response = await api.put<DocumentResponse | any>(
      `/api/documents/${id}`,
      data,
    );
    console.log(
      "[DEBUG] Document updated, full response:",
      JSON.stringify(response.data, null, 2),
    );
    const document = pickSingleDocument(response.data);
    if (!document?._id) throw new Error("Invalid update document response");
    console.log(
      "[DEBUG] Parsed updated document - title:",
      document.title,
      "status:",
      document.status,
    );
    return document;
  } catch (error: any) {
    console.error(
      "[DEBUG] Update document error:",
      error?.response?.data || error?.message,
    );
    return rejectWithValue(getErrorMessage(error, "Failed to update document"));
  }
});

// ─── Delete Document ──────────────────────────────────────────────────────────
export const deleteDocument = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("document/deleteDocument", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/api/documents/${id}`);
    return { id, message: response.data?.message || "Document deleted" };
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to delete document"));
  }
});

// ─── Fetch Draft Documents ────────────────────────────────────────────────────
export const fetchDraftDocuments = createAsyncThunk<
  DocumentItem[],
  void,
  { rejectValue: string }
>("document/fetchDraftDocuments", async (_, { rejectWithValue }) => {
  try {
    const role = await getRoleFromStorage();
    // Get all documents and filter by status=draft locally
    const endpoint =
      role === "admin" ? "/api/documents/admin/all" : "/api/documents/public";
    const response = await api.get(endpoint);
    const docs = pickDocuments(response.data);

    // Filter by draft status
    const drafts = docs.filter((doc) => doc.status === "draft");

    console.log("[DEBUG] Fetched draft documents:", drafts);
    drafts.forEach((doc) => {
      console.log(
        `[DEBUG] Draft "${doc.title}" - content length: ${doc.content?.length || 0}, has content: ${!!doc.content}`,
      );
    });
    return drafts;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch draft documents"),
    );
  }
});

// ─── Fetch Recent Documents ───────────────────────────────────────────────────
export const fetchRecentDocuments = createAsyncThunk<
  DocumentItem[],
  void,
  { rejectValue: string }
>("document/fetchRecentDocuments", async (_, { rejectWithValue }) => {
  try {
    const role = await getRoleFromStorage();
    // Fallback to list endpoints since /recent is missing on backend
    const endpoint =
      role === "admin" ? "/api/documents/admin/all" : "/api/documents/public";

    const response = await api.get(endpoint);
    const docs = pickDocuments(response.data);

    // Sort by createdAt or updatedAt desc locally
    return docs
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch recent documents"),
    );
  }
});

// ─── Fetch Public Documents ───────────────────────────────────────────────────
export const fetchPublicDocuments = createAsyncThunk<
  DocumentItem[],
  void,
  { rejectValue: string }
>("document/fetchPublicDocuments", async (_, { rejectWithValue }) => {
  try {
    const role = await getRoleFromStorage();
    const endpoint =
      role === "admin" ? "/api/documents/admin/all" : "/api/documents/public";
    const response = await api.get(endpoint);
    return pickDocuments(response.data);
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch public documents"),
    );
  }
});

// ─── Search Public Documents ──────────────────────────────────────────────────
export const searchPublicDocuments = createAsyncThunk<
  DocumentItem[],
  SearchPublicDocumentsPayload,
  { rejectValue: string }
>("document/searchPublicDocuments", async ({ query }, { rejectWithValue }) => {
  try {
    const encoded = encodeURIComponent(query);
    const response = await api.get(`/user/search-item?q=${encoded}`);
    return pickDocuments(response.data);
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to search documents"),
    );
  }
});

// ─── Mark Document As Read ────────────────────────────────────────────────────
export const markDocumentAsRead = createAsyncThunk<
  string,
  MarkDocumentReadPayload,
  { rejectValue: string }
>(
  "document/markDocumentAsRead",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      await api.get(`/api/documents/single/${documentId}`);
      return "Document opened";
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to open document"));
    }
  },
);
