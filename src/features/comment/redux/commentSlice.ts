import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentItem } from "../types/commentTypes";
import {
    createDocumentComment,
    createPublicHomepageComment,
    deleteDocumentComment,
    deletePublicHomepageComment,
    fetchDocumentComments,
    fetchPublicHomepageComments,
    updatePublicHomepageComment,
} from "./commentThunks";

interface CommentState {
  publicComments: CommentItem[];
  documentComments: Record<string, CommentItem[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  publicComments: [],
  documentComments: {},
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Public Homepage Comments
    builder
      .addCase(fetchPublicHomepageComments.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("[Comment] Fetching public homepage comments...");
      })
      .addCase(
        fetchPublicHomepageComments.fulfilled,
        (state, action: PayloadAction<CommentItem[]>) => {
          state.loading = false;
          state.publicComments = action.payload;
          if (action.payload.length === 0) {
            console.log("[Comment] No public comments fetched (may be unauthenticated or no comments available)");
          } else {
            console.log(
              `[Comment] Successfully fetched ${action.payload.length} public comments`,
            );
          }
        },
      )
      .addCase(
        fetchPublicHomepageComments.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
          console.error("[Comment Error] Failed to fetch public comments:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Create Public Homepage Comment
    builder
      .addCase(createPublicHomepageComment.pending, (state) => {
        console.log("[Comment] Creating public homepage comment...");
      })
      .addCase(
        createPublicHomepageComment.fulfilled,
        (state, action: PayloadAction<CommentItem>) => {
          state.publicComments.unshift(action.payload);
          console.log("[Comment] Successfully created public comment:", {
            id: action.payload._id,
            text: action.payload.text,
          });
        },
      )
      .addCase(
        createPublicHomepageComment.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          console.error("[Comment Error] Failed to create public comment:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Update Public Homepage Comment
    builder
      .addCase(
        updatePublicHomepageComment.pending,
        (state) => {
          console.log("[Comment] Updating public homepage comment...");
        },
      )
      .addCase(
        updatePublicHomepageComment.fulfilled,
        (state, action: PayloadAction<CommentItem>) => {
          const index = state.publicComments.findIndex(c => c._id === action.payload._id);
          if (index > -1) {
            state.publicComments[index] = action.payload;
          }
          console.log("[Comment] Successfully updated public comment:", action.payload._id);
        },
      )
      .addCase(
        updatePublicHomepageComment.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          console.error("[Comment Error] Failed to update public comment:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Delete Public Homepage Comment
    builder
      .addCase(
        deletePublicHomepageComment.pending,
        (state) => {
          console.log("[Comment] Deleting public homepage comment...");
        },
      )
      .addCase(
        deletePublicHomepageComment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.publicComments = state.publicComments.filter(c => c._id !== action.payload);
          console.log("[Comment] Successfully deleted public comment:", action.payload);
        },
      )
      .addCase(
        deletePublicHomepageComment.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          console.error("[Comment Error] Failed to delete public comment:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Fetch Document Comments
    builder
      .addCase(fetchDocumentComments.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("[Comment] Fetching document comments...");
      })
      .addCase(
        fetchDocumentComments.fulfilled,
        (state, action: PayloadAction<CommentItem[]>) => {
          state.loading = false;
          console.log(
            `[Comment] Successfully fetched ${action.payload.length} document comments`,
          );
        },
      )
      .addCase(
        fetchDocumentComments.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
          console.error("[Comment Error] Failed to fetch document comments:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Create Document Comment
    builder
      .addCase(createDocumentComment.pending, (state) => {
        console.log("[Comment] Creating document comment...");
      })
      .addCase(
        createDocumentComment.fulfilled,
        (state, action: PayloadAction<CommentItem>) => {
          console.log("[Comment] Successfully created document comment:", {
            id: action.payload._id,
            text: action.payload.text,
          });
        },
      )
      .addCase(
        createDocumentComment.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          console.error("[Comment Error] Failed to create document comment:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );

    // Delete Document Comment
    builder
      .addCase(
        deleteDocumentComment.pending,
        (state) => {
          console.log("[Comment] Deleting document comment...");
        },
      )
      .addCase(
        deleteDocumentComment.fulfilled,
        (state, action: PayloadAction<string>) => {
          console.log("[Comment] Successfully deleted document comment:", action.payload);
        },
      )
      .addCase(
        deleteDocumentComment.rejected,
        (state, action: PayloadAction<any>) => {
          state.error = action.payload;
          console.error("[Comment Error] Failed to delete document comment:", {
            error: action.payload,
            timestamp: new Date().toISOString(),
          });
        },
      );
  },
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;
