import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,
          borderTopColor: "#E2E8F0",
          height: Platform.OS === "ios" ? 94 : 80,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 32 : 16,
          position: "absolute",
          elevation: 0,
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#CBD5E1",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          marginTop: 6,
          textTransform: "capitalize",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="grid" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="public"
        options={{
          title: "Public Docs",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="globe" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspaces"
        options={{
          title: "Workspaces",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="layers" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}


