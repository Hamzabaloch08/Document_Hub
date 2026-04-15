import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../config/apiClient";
import {
  AddWorkspaceMemberPayload,
  CreateWorkspacePayload,
  RemoveWorkspaceMemberPayload,
  UpdateWorkspacePayload,
  Workspace,
  WorkspaceDetailsResponse,
  WorkspaceResponse,
  WorkspacesResponse,
} from "../types/workspaceTypes";

const getErrorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  if (typeof data === "string") {
    const trimmed = data.replace(/\s+/g, " ").trim();
    if (trimmed) return trimmed;
  }
  return data?.message || data?.error || error?.message || fallback;
};

const extractWorkspaces = (data: Workspace[] | WorkspacesResponse): Workspace[] =>
  Array.isArray(data) ? data : (data?.workspaces ?? []);

// ─── Fetch User Workspaces ────────────────────────────────────────────────────
// Backend returns only the workspaces the authenticated user can access
// (all for admin, assigned for editor/viewer) — role determined by JWT token
export const fetchUserWorkspaces = createAsyncThunk<
  Workspace[],
  void,
  { rejectValue: string }
>("workspace/fetchUserWorkspaces", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Workspace[] | WorkspacesResponse>("/api/workspace");
    return extractWorkspaces(response.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch workspaces"));
  }
});

// ─── Create Workspace ─────────────────────────────────────────────────────────
export const createWorkspace = createAsyncThunk<
  Workspace,
  CreateWorkspacePayload,
  { rejectValue: string }
>("workspace/createWorkspace", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<WorkspaceResponse>("/api/workspace", payload);
    return response.data.workspace;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to create workspace"));
  }
});

// ─── Fetch Workspace By ID ────────────────────────────────────────────────────
export const fetchWorkspaceById = createAsyncThunk<
  WorkspaceDetailsResponse,
  string,
  { rejectValue: string }
>("workspace/fetchWorkspaceById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<WorkspaceDetailsResponse>(`/api/workspace/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to fetch workspace details"));
  }
});

// ─── Add Workspace Member ─────────────────────────────────────────────────────
export const addWorkspaceMember = createAsyncThunk<
  string,
  AddWorkspaceMemberPayload,
  { rejectValue: string }
>("workspace/addWorkspaceMember", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/workspace/add-member", payload);
    return response.data?.message || "Member added successfully";
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to add member"));
  }
});

// ─── Remove Workspace Member ──────────────────────────────────────────────────
export const removeWorkspaceMember = createAsyncThunk<
  string,
  RemoveWorkspaceMemberPayload,
  { rejectValue: string }
>("workspace/removeWorkspaceMember", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.delete("/api/workspace/remove-member", { data: payload });
    return response.data?.message || "Member removed successfully";
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to remove member"));
  }
});

// ─── Update Workspace ─────────────────────────────────────────────────────────
export const updateWorkspace = createAsyncThunk<
  Workspace,
  UpdateWorkspacePayload,
  { rejectValue: string }
>("workspace/updateWorkspace", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put<WorkspaceResponse>(`/api/workspace/${id}`, data);
    return response.data.workspace;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to update workspace"));
  }
});

// ─── Delete Workspace ─────────────────────────────────────────────────────────
export const deleteWorkspace = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("workspace/deleteWorkspace", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/api/workspace/${id}`);
    return { id, message: response.data?.message || "Workspace deleted" };
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to delete workspace"));
  }
});
