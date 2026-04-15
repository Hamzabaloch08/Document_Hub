import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../config/apiClient";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface AssignRolePayload {
  email: string;
  newRole: "admin" | "editor" | "viewer" | string;
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

// ─── Fetch All Users (Admin only) ─────────────────────────────────────────────
export const fetchAllUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchAllUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/user/all-users");
    return response.data.users;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch users",
    );
  }
});

// ─── Assign User Role (Admin only) ────────────────────────────────────────────
export const assignUserRole = createAsyncThunk<
  AssignRoleResponse,
  AssignRolePayload,
  { rejectValue: string }
>("users/assignRole", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/user/assign-role", payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to assign role",
    );
  }
});
