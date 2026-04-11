import React from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const items = [
  { id: 1, name: "Engineering Core", members: 12, files: 450, icon: "code" },
  { id: 2, name: "Product Design", members: 8, files: 120, icon: "feather" },
  { id: 3, name: "Marketing Hub", members: 15, files: 89, icon: "send" },
];

export default function WorkspacesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-8 py-8 border-b border-gray-50 flex-row justify-between items-center">
        <View>
            <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">Teams</Text>
            <Text className="text-[28px] font-black tracking-tighter text-black">Workspaces.</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-black rounded-2xl items-center justify-center">
            <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-8 ml-2">Internal Hubs</Text>
          
          <View className="flex-row flex-wrap gap-4">
            {items.map((workspace) => (
              <TouchableOpacity key={workspace.id} className="w-full bg-white p-8 rounded-[40px] shadow-sm shadow-gray-100 mb-4 items-center">
                 <View className="w-20 h-20 bg-gray-50 rounded-[32px] items-center justify-center mb-6">
                    <Feather name={workspace.icon as any} size={32} color="black" />
                 </View>
                 <Text className="text-2xl font-black text-black text-center">{workspace.name}</Text>
                 <Text className="text-xs text-gray-400 font-bold uppercase tracking-[1.5px] mt-2">{workspace.members} Contributors • {workspace.files} Assets</Text>
                 
                 <View className="mt-8 bg-gray-50 h-10 px-6 rounded-full items-center justify-center border border-gray-100">
                    <Text className="text-[10px] font-bold text-black uppercase tracking-[1.5px]">Enter Workspace</Text>
                 </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
