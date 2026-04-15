import { createSlice } from "@reduxjs/toolkit";
import { assignUserRole, fetchAllUsers, User } from "./usersThunks";

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const existingUser = state.users.find(
          (u) => u.email === updatedUser.email,
        );
        if (existingUser) {
          existingUser.role = updatedUser.role;
        }
      })
      .addCase(assignUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;
