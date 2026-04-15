import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="px-8 py-16">
          {/* Logo */}
          <View className="items-center mb-12">
            <View className="w-12 h-12 bg-black rounded-xl items-center justify-center shadow-lg shadow-gray-200">
              <Feather name="layers" size={24} color="white" />
            </View>
            <Text className="mt-4 text-2xl font-black text-black tracking-[-1px]">
              DocuHub.
            </Text>
          </View>

          <Text className="text-[32px] font-black text-black leading-[38px] tracking-[-1px] text-center">
            Log in.
          </Text>
          <Text className="text-gray-400 text-base font-medium mt-3 text-center px-6">
            Enter your credentials to access the hub.
          </Text>

          {/* Form - Restored Boxed Style */}
          <View className="mt-12">
            {error && (
              <View className="mb-6 bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <Text className="text-red-600 text-sm font-bold ml-3 flex-1">
                  {error}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                Email address
              </Text>
              <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                <TextInput
                  className="flex-1 text-base font-bold text-black h-full"
                  placeholder="name@company.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                Password
              </Text>
              <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                <TextInput
                  className="flex-1 text-base font-bold text-black h-full"
                  placeholder="*********"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  autoComplete="off"
                  keyboardType={showPassword ? "visible-password" : "default"}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
              <View className="flex flex-row justify-end mt-2 pr-1">
                {/* Forgot Password Link - RIGHT SIDE */}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text className="text-[10px] font-black text-black uppercase tracking-[1px]">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleLogin()}
              activeOpacity={0.8}
              disabled={loading}
              className={`h-14 rounded-2xl items-center justify-center shadow-lg mt-4 ${
                loading ? "bg-gray-400 shadow-none" : "bg-black shadow-gray-200"
              }`}
            >
              <Text className="text-white text-[15px] font-black uppercase tracking-[2px]">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-12 items-center">
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-gray-400 font-bold uppercase tracking-[1px] text-[10px]">
                New Member? <Text className="text-black">Join now</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
