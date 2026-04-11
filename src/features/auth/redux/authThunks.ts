import api from "@/src/config/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface loginPayload {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  bio: string;
  email: string;
  password?: string;
  image: string;
  role: string;
  isVerified: boolean;
  isLoggedIn: boolean;
  token?: string;
  otp?: string | null;
  otpExpiry?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface loginResponse {
  message: string;
  success: boolean;
  tokenGenerate: string;
  refreshToken: string;
  user: User;
}

export interface registerPayload {
  username?: string;
  email: string;
  password: string;
}

export interface registerResponse {
  message: string;
  success: boolean;
  final: User;
}

export const loginUser = createAsyncThunk<
  loginResponse,
  loginPayload,
  { rejectValue: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("user/login", credentials);
    const profileData = response?.data?.user;
    if (profileData) {
      await AsyncStorage.setItem("user", JSON.stringify(profileData));
    }
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login Failed");
  }
});

export const registerUser = createAsyncThunk<
  registerResponse,
  registerPayload,
  { rejectValue: string }
>("user/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("user/register", credentials);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Registration Failed",
    );
  }
});

// --- FORGOT & RESET PASSWORD THUNKS ---

export interface forgetPasswordPayload {
  email: string;
}

export interface verifyOtpPayload {
  email: string;
  otp: string;
}

export interface changePasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface genericResponse {
  message: string;
  success: boolean;
}

export const forgetPasswordUser = createAsyncThunk<
  genericResponse,
  forgetPasswordPayload,
  { rejectValue: string }
>("user/forgetPassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("user/forgetPassword", payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to send reset email",
    );
  }
});

export const verifyOtpUser = createAsyncThunk<
  genericResponse,
  verifyOtpPayload,
  { rejectValue: string }
>("user/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await api.post(`user/verifyOtp/${encodedEmail}`, { otp });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "OTP verification failed",
    );
  }
});

export const changePasswordUser = createAsyncThunk<
  genericResponse,
  changePasswordPayload,
  { rejectValue: string }
>(
  "user/changePassword",
  async ({ email, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await api.post(`user/changePassword/${encodedEmail}`, {
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
