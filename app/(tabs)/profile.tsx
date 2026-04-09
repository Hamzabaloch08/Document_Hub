import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. Header */}
      <View className="px-8 py-8 border-b border-gray-100 flex-row justify-between items-end bg-white">
        <View>
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-300">Identity</Text>
            <Text className="text-[28px] font-black tracking-tighter text-black">Profile.</Text>
        </View>
        <TouchableOpacity className="pb-1">
            <Feather name="settings" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          
          {/* 2. User Card - Normal Radius */}
          <View className="flex-row items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-50 mb-10">
             <View className="w-16 h-16 bg-black items-center justify-center rounded-xl">
                <Text className="text-white text-2xl font-black">AC</Text>
             </View>
             <View className="ml-5 flex-1">
                <Text className="text-xl font-black text-black">Alex Carter</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px] mt-1">Lead Architect • Pro Hub</Text>
             </View>
          </View>

          {/* 3. Stats Grid - Normal Radius */}
          <View className="flex-row gap-4 mb-10">
             <View className="flex-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50">
                <Text className="text-3xl font-black text-black">12</Text>
                <Text className="text-[10px] font-black uppercase tracking-[1px] mt-1 text-gray-400">Documents</Text>
             </View>
             <View className="flex-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50">
                <Text className="text-3xl font-black text-black">07</Text>
                <Text className="text-[10px] font-black uppercase tracking-[1px] mt-1 text-gray-400">Drafts</Text>
             </View>
          </View>

          {/* 4. Preferences - Normal Spacing */}
          <Text className="text-[10px] font-black uppercase tracking-[3px] mb-6 ml-1 text-gray-400">Settings</Text>
          
          <View className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-50 overflow-hidden">
            {[
              { n: "Security Protocols", i: "shield" },
              { n: "Hub Preferences", i: "sliders" },
              { n: "Sync Status", i: "refresh-cw" },
            ].map((item, i, arr) => (
               <TouchableOpacity key={item.n} className={`flex-row items-center justify-between p-5 ${i !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <View className="flex-row items-center">
                     <Feather name={item.i as any} size={18} color="black" />
                     <Text className="ml-4 text-sm font-bold text-black uppercase tracking-[0.5px]">{item.n}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#D1D5DB" />
               </TouchableOpacity>
            ))}
          </View>

          {/* 5. Log Out - Normal Radius */}
          <TouchableOpacity 
            onPress={() => router.replace("/login")}
            activeOpacity={0.8}
            className="mt-12 bg-black h-14 rounded-2xl items-center justify-center shadow-lg shadow-gray-200"
          >
             <Text className="text-white font-black uppercase tracking-[2px] text-xs">Log out</Text>
          </TouchableOpacity>

        </View>
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
