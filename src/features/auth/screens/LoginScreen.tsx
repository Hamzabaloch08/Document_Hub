import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { loginPayload, loginUser } from "../redux/authThunks";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();

  const payload: loginPayload = {
    email,
    password,
  };

  const handleLogin = async () => {
    try {
      const response = await dispatch(loginUser(payload)).unwrap();
      if (response.success) {
        console.log("API Response:", response);
        const storedUser = await AsyncStorage.getItem("user");
        console.log(
          "profile data:",
          storedUser ? JSON.parse(storedUser) : null,
        );

        router.replace("/(tabs)");
        return;
      }
    } catch (err: any) {
      console.log("Login Error:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-8">
              {/* Logo & Branding */}
              <View className="items-center mb-12">
                <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl items-center justify-center shadow-2xl mb-4">
                  <Feather name="layers" size={32} color="white" />
                </View>
                <Text className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  DocuHub
                </Text>
                <Text className="text-blue-300 text-sm font-semibold mt-2 tracking-wider">
                  Smart Documentation Hub
                </Text>
              </View>

              {/* Heading */}
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold text-center" style={{ fontFamily: 'Outfit' }}>
                  Welcome Back
                </Text>
                <Text className="text-blue-200 text-sm font-medium mt-2 text-center">
                  Sign in to your account
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                {error && (
                  <View className="mb-6 bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-start gap-3">
                    <Feather name="alert-circle" size={20} color="#DC2626" />
                    <Text className="text-red-700 text-sm font-semibold flex-1">
                      {error}
                    </Text>
                  </View>
                )}

                {/* Email Input Card */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Email Address
                  </Text>
                  <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="mail" size={18} color="#0EA5E9" />
                    <TextInput
                      className="flex-1 text-base text-slate-900 ml-3 font-medium"
                      placeholder="name@company.com"
                      placeholderTextColor="#CBD5E1"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input Card */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Password
                  </Text>
                  <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="lock" size={18} color="#0EA5E9" />
                    <TextInput
                      className="flex-1 text-base text-slate-900 ml-3 font-medium"
                      placeholder="Enter your password"
                      placeholderTextColor="#CBD5E1"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color="#0EA5E9"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <View className="flex-row justify-end mb-6">
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text className="text-xs font-bold text-blue-600 tracking-wider">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={() => handleLogin()}
                  activeOpacity={0.8}
                  disabled={loading}
                  className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg transition ${
                    loading
                      ? "bg-slate-300 shadow-none"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-300"
                  }`}
                >
                  {loading && <Feather name="loader" size={18} color="white" />}
                  <Text className="text-white text-base font-bold tracking-wider">
                    {loading ? "Signing In..." : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Signup Link */}
              <View className="mt-8 items-center">
                <Text className="text-slate-300 text-sm font-medium">
                  Don't have an account?{" "}
                  <Text
                    className="text-blue-600 font-bold"
                    onPress={() => router.replace("/(auth)/signup")}
                  >
                    Sign Up
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
