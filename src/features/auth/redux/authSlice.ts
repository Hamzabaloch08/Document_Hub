import { createSlice } from "@reduxjs/toolkit";
import {
    changePasswordUser,
    forgetPasswordUser,
    loginUser,
    registerUser,
    updateProfile,
    User,
    verifyOtpUser,
} from "./authThunks";

export interface AuthState {
  user: User | null;
  success: boolean;
  error: string | null;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  success: false,
  error: null,
  loading: false,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearState: () => initialState,
  },
  extraReducers(builder) {
    builder
      // --- Login User ---
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokenGenerate;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error occurred";
      })

      // --- Register User ---
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.final;
        state.accessToken = action.payload.final?.token || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // --- Forget Password ---
      .addCase(forgetPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgetPasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(forgetPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset email";
      })

      // --- Verify OTP ---
      .addCase(verifyOtpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyOtpUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
        state.success = false;
      })

      // --- Update Profile ---
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (state.user) {
          state.user = { ...state.user, ...action.payload.updateData };
        } else {
          state.user = action.payload.updateData;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Profile update failed";
        state.success = false;
      })
      .addCase(changePasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { clearState } = authSlice.actions;

export default authSlice.reducer;
