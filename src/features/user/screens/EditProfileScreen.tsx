import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/src/store/store";
import { updateProfile } from "../../auth/redux/authThunks";

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isLoading } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Fetch initial profile data directly from storage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username || "");
          setEmail(user.email || "");
          setRole(user.role || "");
          setBio(user.bio || "");
          setImageUri(user.image || null);
        }
      } catch (error) {
        console.log("Error loading user data", error);
      }
    };
    fetchUserData();
  }, []);

  // Request access and open the image gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Allows user to crop
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8, // Compress slightly for better performance
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Could not select an image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required.");
      return;
    }

    // Send image separately via form-data in thunk and keep text fields as JSON.
    const resultAction = await dispatch(
      updateProfile({
        username,
        bio,
        imageUri,
      }),
    );

    if (updateProfile.fulfilled.match(resultAction)) {
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      console.log("Profile update rejected payload:", resultAction.payload);
      Alert.alert(
        "Error",
        typeof resultAction.payload === "string"
          ? resultAction.payload
          : "Failed to update profile.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl border border-gray-100"
          disabled={isLoading}
        >
          <Feather name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-black tracking-tighter text-black">
          Edit Profile.
        </Text>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white px-6 py-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={pickImage}
              disabled={isLoading}
              className="relative w-24 h-24 bg-black items-center justify-center rounded-2xl shadow-lg shadow-gray-200 overflow-hidden"
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 96, height: 96, borderRadius: 16 }}
                />
              ) : (
                <Text className="text-white text-3xl font-black">
                  {username ? username.substring(0, 2).toUpperCase() : "US"}
                </Text>
              )}
              <View className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm shadow-gray-100">
                <Feather name="camera" size={14} color="black" />
              </View>
            </TouchableOpacity>
            <Text className="text-[10px] text-gray-400 font-bold uppercase mt-4">
              Tap to change
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-2 ml-1">
                Username
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-black font-bold h-14"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
              />
            </View>

            <View className="mt-6">
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-2 ml-1">
                Bio
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-black font-bold h-24"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!isLoading}
                textAlignVertical="top"
              />
            </View>

            <View className="mt-6">
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-2 ml-1">
                Email Address
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-400 font-bold h-14"
                value={email}
                editable={false}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-[10px] text-gray-400 mt-2 ml-1 font-semibold">
                Email address cannot be changed here.
              </Text>
            </View>

            <View className="mt-6">
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-2 ml-1">
                Role
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-400 font-bold h-14"
                value={role}
                editable={false}
                placeholder="Current role"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`mt-12 h-14 rounded-2xl flex-row items-center justify-center shadow-lg ${
              isLoading ? "bg-gray-300 shadow-none" : "bg-black shadow-gray-200"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black uppercase tracking-[2px] text-xs">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
