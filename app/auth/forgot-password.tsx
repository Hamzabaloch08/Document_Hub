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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <View className="px-10 py-20">
          {/* Header */}
          <View className="items-center mb-12">
             <View className="w-12 h-12 bg-black rounded-xl items-center justify-center shadow-lg shadow-gray-200">
                <Feather name="shield" size={24} color="white" />
             </View>
             <Text className="mt-4 text-2xl font-black text-black tracking-[-1px]">Security.</Text>
          </View>

          <Text className="text-[32px] font-black text-black leading-[38px] tracking-[-1px] text-center">Reset Access.</Text>
          <Text className="text-gray-400 text-sm font-medium mt-3 text-center px-4">
            Enter your email to receive recovery instructions.
          </Text>

          {/* Form - Standardized */}
          <View className="mt-12">
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Registered Email</Text>
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

            <TouchableOpacity
              onPress={() => router.push("/auth/reset-password")}
              activeOpacity={0.8}
              className="bg-black h-14 rounded-2xl items-center justify-center shadow-lg shadow-gray-200"
            >
              <Text className="text-white text-[15px] font-black uppercase tracking-[2px]">Send Instructions</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.back()}
              className="mt-10 self-center flex-row items-center"
            >
                <Feather name="arrow-left" size={14} color="gray" />
                <Text className="ml-2 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Return to login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
