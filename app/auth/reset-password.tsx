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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                <Feather name="arrow-left" size={24} color="#1D2B9A" />
            </TouchableOpacity>
            <Text className="ml-2 text-lg font-bold text-[#1D2B9A]">Security</Text>
        </View>
        <Text className="text-xl font-black text-[#111827]">DocuHub</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-10">
          <Text className="text-[42px] font-black text-[#111827] leading-[50px]">Reset Password</Text>
          <Text className="text-gray-500 text-lg mt-3 leading-7">
            Create a new, strong password for your account.
          </Text>

          <View className="mt-12 space-y-8">
            {/* New Password */}
            <View>
               <Text className="text-sm font-bold text-[#111827] mb-2.5">New Password</Text>
               <View className="flex-row items-center bg-white px-4 h-16 rounded-2xl border border-gray-100 shadow-sm">
                  <TextInput
                    className="flex-1 text-base font-semibold text-[#111827] h-full"
                    placeholder="••••••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={20} color="#64748B" />
                  </TouchableOpacity>
               </View>
               
               {/* Strength Meter */}
               <View className="flex-row gap-2 mt-6">
                  <View className="flex-1 h-1.5 rounded-full bg-[#1D2B9A]" />
                  <View className="flex-1 h-1.5 rounded-full bg-[#1D2B9A]" />
                  <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
                  <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
               </View>

               <View className="flex-row flex-wrap gap-x-6 gap-y-3 mt-4">
                  <View className="flex-row items-center">
                     <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center">
                        <Feather name="check" size={12} color="#1D2B9A" />
                     </View>
                     <Text className="ml-2 text-sm font-bold text-[#1D2B9A]">Min. 8 characters</Text>
                  </View>
                  <View className="flex-row items-center">
                     <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center">
                        <View className="w-2 h-2 rounded-full bg-gray-400" />
                     </View>
                     <Text className="ml-2 text-sm font-bold text-gray-500">One special character</Text>
                  </View>
                  <View className="flex-row items-center">
                     <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center">
                        <View className="w-2 h-2 rounded-full bg-gray-400" />
                     </View>
                     <Text className="ml-2 text-sm font-bold text-gray-500">One number</Text>
                  </View>
               </View>
            </View>

            {/* Confirm Password */}
            <View className="mt-8">
               <Text className="text-sm font-bold text-[#111827] mb-2.5">Confirm Password</Text>
               <View className="flex-row items-center bg-white px-4 h-16 rounded-2xl border border-gray-100 shadow-sm">
                  <TextInput
                    className="flex-1 text-base font-semibold text-[#111827] h-full"
                    placeholder="••••••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPass}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={20} color="#64748B" />
                  </TouchableOpacity>
               </View>
            </View>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              className="mt-10 bg-[#1D2B9A] h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-900/40"
            >
              <Text className="text-white text-lg font-black mr-3">Update Password</Text>
              <Feather name="lock" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Security Tip Card */}
          <View className="mt-12 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                    <Feather name="info" size={20} color="#1D2B9A" />
                </View>
                <Text className="ml-3 font-black text-[#111827] text-lg">Security Tip</Text>
             </View>
             <Text className="text-gray-500 leading-6">Avoid using easily guessable information like your name, birthday, or common words. Using a password manager can help you store complex, unique passwords safely.</Text>
          </View>

          <View className="mt-20 items-center">
             <Text className="text-[11px] font-black text-gray-400 tracking-[1px] uppercase">Encrypted End-to-End • DocuHub Authority</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
