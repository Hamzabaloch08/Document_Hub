import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <View className="px-8 py-16">
          {/* Logo */}
          <View className="items-center mb-12">
             <View className="w-12 h-12 bg-black rounded-xl items-center justify-center shadow-lg shadow-gray-200">
                <Feather name="layers" size={24} color="white" />
             </View>
             <Text className="mt-4 text-2xl font-black text-black tracking-[-1px]">DocuHub.</Text>
          </View>

          <Text className="text-[32px] font-black text-black leading-[38px] tracking-[-1px] text-center">Log in.</Text>
          <Text className="text-gray-400 text-base font-medium mt-3 text-center px-6">
            Enter your credentials to access the hub.
          </Text>

          {/* Form - Restored Boxed Style */}
          <View className="mt-12">
            <View className="mb-5">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Email address</Text>
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
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Password</Text>
              <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                <TextInput
                  className="flex-1 text-base font-bold text-black h-full"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {/* Forgot Password Link - RIGHT SIDE */}
              <TouchableOpacity 
                onPress={() => router.push("/auth/forgot-password")}
                className="mt-3 self-end pr-1"
              >
                <Text className="text-[11px] font-black text-black uppercase tracking-[1px] border-b border-gray-200">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              activeOpacity={0.8}
              className="bg-black h-14 rounded-2xl items-center justify-center shadow-lg shadow-gray-200 mt-4"
            >
              <Text className="text-white text-[15px] font-black uppercase tracking-[2px]">Sign In</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-12 items-center">
            <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-gray-400 font-bold uppercase tracking-[1px] text-[10px]">New Member? <Text className="text-black">Join now</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
