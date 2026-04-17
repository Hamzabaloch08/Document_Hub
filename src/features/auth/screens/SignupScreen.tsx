import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
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
import { registerPayload, registerUser } from "../redux/authThunks";

export default function SignupScreen() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const payload: registerPayload = {
    username,
    email,
    password,
  };

  const handleRegister = async () => {
    try {
      const response = await dispatch(registerUser(payload)).unwrap();
      if (response && response.success) {
        console.log("API Response:", response);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.log("Register Error:", err);
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
              <View className="items-center mb-10">
                <View className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl items-center justify-center shadow-2xl mb-4">
                  <Feather name="layers" size={32} color="white" />
                </View>
                <Text className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  DocuHub
                </Text>
                <Text className="text-emerald-300 text-sm font-semibold mt-2 tracking-wider">
                  Join Our Community
                </Text>
              </View>

              {/* Heading */}
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold text-center" style={{ fontFamily: 'Outfit' }}>
                  Create Account
                </Text>
                <Text className="text-emerald-200 text-sm font-medium mt-2 text-center">
                  Join the documentation experts
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

                {/* Full Name Input Card */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Full Name
                  </Text>
                  <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="user" size={18} color="#10B981" />
                    <TextInput
                      className="flex-1 text-base text-slate-900 ml-3 font-medium"
                      placeholder="John Doe"
                      placeholderTextColor="#CBD5E1"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Email Input Card */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Email Address
                  </Text>
                  <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="mail" size={18} color="#10B981" />
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
                <View className="mb-2">
                  <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Password
                  </Text>
                  <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="lock" size={18} color="#10B981" />
                    <TextInput
                      className="flex-1 text-base text-slate-900 ml-3 font-medium"
                      placeholder="••••••••"
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
                        color="#10B981"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  activeOpacity={0.8}
                  disabled={loading}
                  className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg mt-8 ${
                    loading
                      ? "bg-slate-300 shadow-none"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-300"
                  }`}
                >
                  {loading && <Feather name="loader" size={18} color="white" />}
                  <Text className="text-white text-base font-bold tracking-wider">
                    {loading ? "Creating Account..." : "Create Account"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="items-center">
                <Text className="text-slate-300 text-sm font-medium">
                  Already have an account?{" "}
                  <Text
                    className="text-emerald-400 font-bold"
                    onPress={() => router.replace("/(auth)/login")}
                  >
                    Sign In
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

