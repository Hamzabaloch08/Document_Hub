import { fetchDraftDocuments } from "@/src/features/document/redux/documentThunks";
import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { draftDocuments } = useSelector((s: RootState) => s.document);
  const [parseData, setParseData] = useState<any>(null);
  const isViewer =
    String(parseData?.role || "viewer").toLowerCase() === "viewer";

  useEffect(() => {
    const getUserData = async () => {
      try {
        const profileData = await AsyncStorage.getItem("user");
        if (profileData) {
          setParseData(JSON.parse(profileData));
        }
      } catch (error) {
        console.log("Error parsing user data:", error);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    dispatch(fetchDraftDocuments());
  }, [dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-6 border-b border-gray-200 flex-row justify-between items-end">
        <View>
          <Text className="text-sm font-bold uppercase tracking-widest text-gray-600">
            Welcome Back
          </Text>
          <Text
            className="text-3xl font-black tracking-tight text-black"
            style={{ fontFamily: "Outfit" }}
          >
            {parseData?.username || "Profile"}
          </Text>
        </View>
        <TouchableOpacity
          className="pb-1 w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
          onPress={() => router.push("/(user)/settings")}
        >
          <Feather name="settings" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {/* User Profile Card */}
          <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
            <View className="flex-row items-center mb-6">
              <View className="w-20 h-20 bg-black items-center justify-center rounded-2xl overflow-hidden">
                {parseData?.image ? (
                  <Image
                    source={{ uri: parseData.image }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                  />
                ) : (
                  <Text className="text-white text-3xl font-black">
                    {parseData?.username
                      ? parseData.username.substring(0, 2).toUpperCase()
                      : "US"}
                  </Text>
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text
                  className="text-xl font-bold text-black"
                  numberOfLines={1}
                >
                  {parseData?.username || "Loading..."}
                </Text>
                <Text
                  className="text-sm font-medium text-gray-600 mt-1"
                  numberOfLines={1}
                >
                  {parseData?.email || "Loading..."}
                </Text>
                <View className="flex-row items-center mt-2 gap-2">
                  <View className="bg-gray-200 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-black capitalize">
                      {parseData?.role || "Viewer"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(user)/edit-profile")}
              className="bg-gray-100 h-12 rounded-lg items-center justify-center border border-gray-300 flex-row gap-2"
            >
              <Feather name="edit-3" size={16} color="black" />
              <Text className="text-black font-bold text-sm">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-white rounded-2xl p-6 border border-gray-200">
              <View className="bg-gray-100 w-12 h-12 rounded-lg items-center justify-center mb-3">
                <Feather name="folder" size={20} color="black" />
              </View>
              <Text className="text-3xl font-black text-black">12</Text>
              <Text className="text-xs font-semibold text-gray-600 mt-2 tracking-wider">
                Workspaces
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-6 border border-gray-200">
              <View className="bg-gray-100 w-12 h-12 rounded-lg items-center justify-center mb-3">
                <Feather name="file-text" size={20} color="black" />
              </View>
              <Text className="text-3xl font-black text-black">
                {draftDocuments.length}
              </Text>
              <Text className="text-xs font-semibold text-gray-600 mt-2 tracking-wider">
                Drafts
              </Text>
            </View>
          </View>

          {/* Settings Section */}
          <Text className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4 ml-1">
            Settings & Tools
          </Text>

          <View className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            {[
              { name: "Security", icon: "shield" },
              { name: "Preferences", icon: "sliders" },
              { name: "Sync Status", icon: "refresh-cw" },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.name}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  i !== arr.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <View className="flex-row items-center gap-4">
                  <Feather name={item.icon as any} size={18} color="black" />
                  <Text className="text-base font-semibold text-black">
                    {item.name}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}

            {!isViewer && (
              <TouchableOpacity
                onPress={() => router.push("/(user)/drafts")}
                className="flex-row items-center justify-between px-6 py-4 border-t border-gray-200"
              >
                <View className="flex-row items-center gap-4">
                  <Feather name="file-text" size={18} color="black" />
                  <Text className="text-base font-semibold text-black">
                    My Drafts
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="bg-gray-200 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-bold text-black">
                      {draftDocuments.length}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.clear();
              router.replace("/(auth)/login");
            }}
            activeOpacity={0.8}
            className="bg-black h-14 rounded-lg items-center justify-center flex-row gap-2"
          >
            <Feather name="log-out" size={18} color="white" />
            <Text className="text-white font-bold text-base">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
