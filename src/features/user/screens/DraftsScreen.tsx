import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DraftsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[2px]">
            Work In Progress
          </Text>
          <Text className="text-2xl font-black text-black">Drafts.</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-8">
          {/* Empty State */}
          <View className="py-20 items-center justify-center">
            <Feather name="file-text" size={48} color="#DDD" />
            <Text className="text-gray-400 font-black mt-4 uppercase tracking-widest text-base">
              No Drafts Yet
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Start creating a document and save it as a draft
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(workspace)/edit-doc",
              })
            }
            className="mt-8 bg-black py-4 rounded-2xl items-center justify-center flex-row gap-2"
          >
            <Feather name="plus" size={18} color="white" />
            <Text className="text-white text-sm font-black uppercase tracking-widest">
              New Draft
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
