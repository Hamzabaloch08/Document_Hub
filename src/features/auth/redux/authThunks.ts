import api from "@/src/config/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";

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

export interface updateProfileResponse {
  message: string;
  success: boolean;
  updateData: User;
}

export interface updateProfilePayload {
  username?: string;
  bio?: string;
  imageUri?: string | null;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk<
  loginResponse,
  loginPayload,
  { rejectValue: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("user/login", credentials);
    const data = response.data;

    // Persist auth data
    if (data?.user) {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    }
    await AsyncStorage.setItem("token", String(data?.user?.token ?? ""));
    await AsyncStorage.setItem("tokenGenerate", String(data?.tokenGenerate ?? ""));
    await AsyncStorage.setItem("refreshToken", String(data?.refreshToken ?? ""));

    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login Failed");
  }
});

// ─── Register ─────────────────────────────────────────────────────────────────
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

// ─── Forgot Password ──────────────────────────────────────────────────────────
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

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtpUser = createAsyncThunk<
  genericResponse,
  verifyOtpPayload,
  { rejectValue: string }
>("user/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const encoded = encodeURIComponent(email);
    const response = await api.post(`user/verifyOtp/${encoded}`, { otp });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "OTP verification failed",
    );
  }
});

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePasswordUser = createAsyncThunk<
  genericResponse,
  changePasswordPayload,
  { rejectValue: string }
>(
  "user/changePassword",
  async ({ email, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const encoded = encodeURIComponent(email);
      const response = await api.post(`user/changePassword/${encoded}`, {
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password",
      );
    }
  },
);

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk<
  updateProfileResponse,
  updateProfilePayload,
  { rejectValue: string }
>("user/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const userDataStr = await AsyncStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    const updateFields = {
      username: (payload.username || userData?.username || "").trim(),
      bio: (payload.bio || userData?.bio || "").trim(),
    };

    const formData = new FormData();
    Object.entries(updateFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const hasNewLocalImage = Boolean(
      payload.imageUri && !payload.imageUri.startsWith("http"),
    );

    if (hasNewLocalImage && payload.imageUri) {
      formData.append("image", {
        uri: payload.imageUri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
    }

    // Note: multipart/form-data — apiClient interceptor adds auth headers automatically
    const response = await api.put("user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      const current = await AsyncStorage.getItem("user");
      if (current) {
        const merged = { ...JSON.parse(current), ...response.data.updateData };
        await AsyncStorage.setItem("user", JSON.stringify(merged));
      }
    }

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update profile.",
    );
  }
});
