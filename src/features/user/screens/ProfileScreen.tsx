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
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-6 border-b border-slate-200 flex-row justify-between items-end bg-white shadow-sm">
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Welcome Back
          </Text>
          <Text
            className="text-3xl font-black tracking-tight text-slate-900"
            style={{ fontFamily: "Outfit" }}
          >
            {parseData?.username || "Profile"}
          </Text>
        </View>
        <TouchableOpacity
          className="pb-1 w-10 h-10 bg-slate-100 rounded-lg items-center justify-center"
          onPress={() => router.push("/(user)/settings")}
        >
          <Feather name="settings" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {/* User Profile Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-8 border border-slate-100">
            <View className="flex-row items-center mb-6">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center rounded-2xl overflow-hidden shadow-md">
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
                  className="text-xl font-bold text-slate-900"
                  numberOfLines={1}
                >
                  {parseData?.username || "Loading..."}
                </Text>
                <Text
                  className="text-sm font-medium text-slate-600 mt-1"
                  numberOfLines={1}
                >
                  {parseData?.email || "Loading..."}
                </Text>
                <View className="flex-row items-center mt-2 gap-2">
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-blue-700 capitalize">
                      {parseData?.role || "Viewer"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(user)/edit-profile")}
              className="bg-blue-50 h-12 rounded-xl items-center justify-center border border-blue-200 flex-row gap-2"
            >
              <Feather name="edit-3" size={16} color="#2563EB" />
              <Text className="text-blue-600 font-bold text-sm">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <View className="bg-gradient-to-br from-purple-100 to-purple-50 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Feather name="folder" size={20} color="#A855F7" />
              </View>
              <Text className="text-3xl font-black text-slate-900">12</Text>
              <Text className="text-xs font-semibold text-slate-500 mt-2 tracking-wider">
                Workspaces
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <View className="bg-gradient-to-br from-yellow-100 to-yellow-50 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Feather name="file-text" size={20} color="#CA8A04" />
              </View>
              <Text className="text-3xl font-black text-slate-900">
                {draftDocuments.length}
              </Text>
              <Text className="text-xs font-semibold text-slate-500 mt-2 tracking-wider">
                Drafts
              </Text>
            </View>
          </View>

          {/* Settings Section */}
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">
            Settings & Tools
          </Text>

          <View className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-6">
            {[
              { name: "Security", icon: "shield", color: "text-red-600" },
              { name: "Preferences", icon: "sliders", color: "text-blue-600" },
              { name: "Sync Status", icon: "refresh-cw", color: "text-green-600" },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.name}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  i !== arr.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <View className="flex-row items-center gap-4">
                  <View className={`bg-slate-50 w-10 h-10 rounded-lg items-center justify-center`}>
                    <Feather name={item.icon as any} size={18} color={item.color.split('-')[1]} />
                  </View>
                  <Text className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}

            {!isViewer && (
              <TouchableOpacity
                onPress={() => router.push("/(user)/drafts")}
                className="flex-row items-center justify-between px-6 py-4 border-t border-slate-100"
              >
                <View className="flex-row items-center gap-4">
                  <View className="bg-slate-50 w-10 h-10 rounded-lg items-center justify-center">
                    <Feather name="file-text" size={18} color="#7C3AED" />
                  </View>
                  <Text className="text-sm font-semibold text-slate-900">
                    My Drafts
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="bg-yellow-100 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-bold text-yellow-700">
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
            className="bg-gradient-to-r from-red-600 to-red-700 h-14 rounded-2xl items-center justify-center shadow-lg shadow-red-200 flex-row gap-2"
          >
            <Feather name="log-out" size={18} color="white" />
            <Text className="text-white font-bold text-base tracking-wide">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
