import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const recentSearches = [
  "Engineering Handbook",
  "Product Release Workflow",
  "HR Leave Process",
  "Design System Components",
];

const categories = [
  {
    name: "Documents",
    icon: "document-text-outline",
    color: "bg-blue-100 text-blue-600",
    iconColor: "#2563EB",
  },
  {
    name: "Workspaces",
    icon: "briefcase-outline",
    color: "bg-purple-100 text-purple-600",
    iconColor: "#9333EA",
  },
  {
    name: "People",
    icon: "people-outline",
    color: "bg-pink-100 text-pink-600",
    iconColor: "#DB2777",
  },
  {
    name: "Media",
    icon: "image-outline",
    color: "bg-amber-100 text-amber-600",
    iconColor: "#D97706",
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top"]}>
      {/* Header & Search Input */}
      <View className="px-6 pt-4 pb-2 bg-white rounded-b-[32px] shadow-sm z-10">
        <Text className="text-[32px] font-extrabold text-[#111827] mb-4">
          Search
        </Text>

        <View className="flex-row items-center bg-[#F4F4F5] rounded-2xl px-4 py-3 border border-gray-100 mb-6">
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search anything..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-3 text-base text-gray-900 font-medium"
            style={{ paddingVertical: 0 }} // Fix for Android centering
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">
          Browse by Category
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              className="w-[48%] bg-white rounded-2xl p-4 flex-row items-center shadow-sm border border-gray-50"
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${cat.color.split(" ")[0]}`}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={cat.iconColor}
                />
              </View>
              <Text className="ml-3 font-semibold text-gray-800 text-sm">
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Searches */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
            Recent
          </Text>
          <TouchableOpacity>
            <Text className="text-[13px] font-bold text-purple-600">Clear</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-8 space-y-3">
          {recentSearches.map((result, idx) => (
            <TouchableOpacity
              key={idx}
              className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
            >
              <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center mr-4">
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">
                {result}
              </Text>
              <Feather name="arrow-up-left" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
