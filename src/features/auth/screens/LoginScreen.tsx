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
    <SafeAreaView className="flex-1 bg-white">
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
            <View className="px-6 py-12">
              {/* Logo & Branding */}
              <View className="items-center mb-12">
                <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-4">
                  <Feather name="layers" size={32} color="white" />
                </View>
                <Text className="text-4xl font-black text-black" style={{ fontFamily: 'Outfit' }}>
                  DocuHub
                </Text>
                <Text className="text-gray-600 text-sm font-medium mt-2 tracking-wider">
                  Documentation Hub
                </Text>
              </View>

              {/* Heading */}
              <View className="mb-8">
                <Text className="text-black text-3xl font-bold text-center" style={{ fontFamily: 'Outfit' }}>
                  Welcome Back
                </Text>
                <Text className="text-gray-600 text-base font-medium mt-3 text-center">
                  Sign in to your account
                </Text>
              </View>

              {/* Form Card */}
              <View className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                {/* Email Input */}
                <View className="mb-6">
                  <Text className="text-sm font-bold text-black mb-3">
                    Email Address
                  </Text>
                  <View className="border-b border-black pb-4 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base text-black font-medium"
                      placeholder="name@company.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-sm font-bold text-black mb-3">
                    Password
                  </Text>
                  <View className="border-b border-black pb-4 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base text-black font-medium"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
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
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <View className="flex-row justify-end">
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text className="text-sm font-bold text-black">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <View className="mb-6 p-4 border-l-4 border-black bg-gray-50">
                  <Text className="text-black text-sm font-semibold">
                    {error}
                  </Text>
                </View>
              )}

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={() => handleLogin()}
                activeOpacity={0.8}
                disabled={loading}
                className={`h-14 rounded-lg items-center justify-center flex-row gap-2 ${
                  loading ? "bg-gray-300" : "bg-black"
                }`}
              >
                {loading && <Feather name="loader" size={18} color="white" />}
                <Text className="text-white text-base font-bold">
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              {/* Signup Link */}
              <View className="mt-10 items-center">
                <Text className="text-gray-600 text-base font-medium">
                  Don't have an account?{" "}
                  <Text
                    className="text-black font-bold"
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
