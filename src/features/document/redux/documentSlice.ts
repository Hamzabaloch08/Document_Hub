import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentItem } from "../types/documentTypes";
import {
    createDocument,
    deleteDocument,
    fetchDraftDocuments,
    fetchPublicDocuments,
    fetchRecentDocuments,
    fetchWorkspaceDocuments,
    markDocumentAsRead,
    searchPublicDocuments,
    updateDocument,
} from "./documentThunks";

interface DocumentState {
  workspaceDocuments: DocumentItem[];
  publicDocuments: DocumentItem[];
  recentDocuments: DocumentItem[];
  draftDocuments: DocumentItem[];
  loading: boolean;
  actionLoading: boolean;
  deletingDocumentId: string | null;
  openingDocumentId: string | null;
  error: string | null;
  successMessage: string | null;
  activeWorkspaceId: string | null;
}

const initialState: DocumentState = {
  workspaceDocuments: [],
  publicDocuments: [],
  recentDocuments: [],
  draftDocuments: [],
  loading: false,
  actionLoading: false,
  deletingDocumentId: null,
  openingDocumentId: null,
  error: null,
  successMessage: null,
  activeWorkspaceId: null,
};

const mergeDocument = (docs: DocumentItem[], nextDoc: DocumentItem) => {
  const exists = docs.some((doc) => doc._id === nextDoc._id);
  if (!exists) {
    return [nextDoc, ...docs];
  }

  return docs.map((doc) => (doc._id === nextDoc._id ? nextDoc : doc));
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
    clearDocumentSuccess: (state) => {
      state.successMessage = null;
    },
    clearWorkspaceDocuments: (state) => {
      state.workspaceDocuments = [];
      state.activeWorkspaceId = null;
    },
    setRecentDocuments: (state, action: PayloadAction<DocumentItem[]>) => {
      state.recentDocuments = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaceDocuments.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.activeWorkspaceId = action.meta.arg;
      })
      .addCase(fetchWorkspaceDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaceDocuments = action.payload;
      })
      .addCase(fetchWorkspaceDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch workspace documents";
      })

      .addCase(fetchPublicDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.publicDocuments = action.payload;
      })
      .addCase(fetchPublicDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch public documents";
      })

      .addCase(searchPublicDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPublicDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.publicDocuments = action.payload;
      })
      .addCase(searchPublicDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to search public documents";
      })

      .addCase(fetchRecentDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.recentDocuments = action.payload;
      })
      .addCase(fetchRecentDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch recent documents";
      })

      .addCase(fetchDraftDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDraftDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.draftDocuments = action.payload;
      })
      .addCase(fetchDraftDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch draft documents";
      })

      .addCase(createDocument.pending, (state) => {
        state.actionLoading = true;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.workspaceDocuments = [
          action.payload,
          ...state.workspaceDocuments,
        ];
        if (action.payload.status === "draft") {
          state.draftDocuments = mergeDocument(
            state.draftDocuments,
            action.payload,
          );
        }
        state.successMessage = "Document created successfully";
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.error = action.payload || "Failed to create document";
      })

      .addCase(updateDocument.pending, (state) => {
        state.actionLoading = true;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.workspaceDocuments = mergeDocument(
          state.workspaceDocuments,
          action.payload,
        );
        state.publicDocuments = mergeDocument(
          state.publicDocuments,
          action.payload,
        );
        state.recentDocuments = mergeDocument(
          state.recentDocuments,
          action.payload,
        );
        if (action.payload.status === "draft") {
          state.draftDocuments = mergeDocument(
            state.draftDocuments,
            action.payload,
          );
        } else {
          state.draftDocuments = state.draftDocuments.filter(
            (doc) => doc._id !== action.payload._id,
          );
        }
        state.successMessage = "Document updated successfully";
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.openingDocumentId = null;
        state.error = action.payload || "Failed to update document";
      })

      .addCase(deleteDocument.pending, (state, action) => {
        state.actionLoading = true;
        state.deletingDocumentId = action.meta.arg;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.workspaceDocuments = state.workspaceDocuments.filter(
          (doc) => doc._id !== action.payload.id,
        );
        state.publicDocuments = state.publicDocuments.filter(
          (doc) => doc._id !== action.payload.id,
        );
        state.recentDocuments = state.recentDocuments.filter(
          (doc) => doc._id !== action.payload.id,
        );
        state.draftDocuments = state.draftDocuments.filter(
          (doc) => doc._id !== action.payload.id,
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.actionLoading = false;
        state.deletingDocumentId = null;
        state.error = action.payload || "Failed to delete document";
      })

      .addCase(markDocumentAsRead.pending, (state, action) => {
        state.actionLoading = true;
        state.openingDocumentId = action.meta.arg.documentId;
        state.error = null;
      })
      .addCase(markDocumentAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.openingDocumentId = null;
        state.successMessage = action.payload;
      })
      .addCase(markDocumentAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.openingDocumentId = null;
        state.error = action.payload || "Failed to mark document as read";
      });
  },
});

export const {
  clearDocumentError,
  clearDocumentSuccess,
  clearWorkspaceDocuments,
  setRecentDocuments,
} = documentSlice.actions;

export default documentSlice.reducer;
