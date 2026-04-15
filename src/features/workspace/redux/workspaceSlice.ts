import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Workspace, WorkspaceMember } from "../types/workspaceTypes";
import {
    addWorkspaceMember,
    createWorkspace,
    deleteWorkspace,
    fetchUserWorkspaces,
    fetchWorkspaceById,
    removeWorkspaceMember,
    updateWorkspace,
} from "./workspaceThunks";

type WorkspaceState = {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  selectedWorkspaceMembers: WorkspaceMember[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
};

const initialState: WorkspaceState = {
  workspaces: [],
  selectedWorkspace: null,
  selectedWorkspaceMembers: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    clearWorkspaceError: (state) => {
      state.error = null;
    },
    clearWorkspaceSuccess: (state) => {
      state.successMessage = null;
    },
    setSelectedWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.selectedWorkspace = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchUserWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch workspaces";
      })

      .addCase(createWorkspace.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.workspaces.unshift(action.payload);
        state.successMessage = "Workspace created successfully";
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to create workspace";
      })

      .addCase(fetchWorkspaceById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedWorkspace = action.payload.workspace;
        state.selectedWorkspaceMembers = action.payload.members;
      })
      .addCase(fetchWorkspaceById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to fetch workspace details";
      })

      .addCase(addWorkspaceMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addWorkspaceMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(addWorkspaceMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to add member";
      })

      .addCase(removeWorkspaceMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(removeWorkspaceMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(removeWorkspaceMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to remove member";
      })

      .addCase(updateWorkspace.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.workspaces = state.workspaces.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace,
        );
        if (state.selectedWorkspace?._id === action.payload._id) {
          state.selectedWorkspace = action.payload;
        }
        state.successMessage = "Workspace updated successfully";
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to update workspace";
      })

      .addCase(deleteWorkspace.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.workspaces = state.workspaces.filter(
          (workspace) => workspace._id !== action.payload.id,
        );
        if (state.selectedWorkspace?._id === action.payload.id) {
          state.selectedWorkspace = null;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to delete workspace";
      });
  },
});

export const {
  clearWorkspaceError,
  clearWorkspaceSuccess,
  setSelectedWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
