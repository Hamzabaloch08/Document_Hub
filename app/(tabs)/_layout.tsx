import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer" | null>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const role = (parsed?.role || "viewer").toLowerCase();
          if (role === "admin" || role === "editor" || role === "viewer") {
            setUserRole(role as any);
          } else {
            setUserRole("viewer");
          }
        } else {
          setUserRole("viewer");
        }
      } catch {
        setUserRole("viewer");
      } finally {
        setIsRoleLoaded(true);
      }
    };
    getUser();
  }, []);

  const isAdmin = userRole === "admin";
  const isEditor = userRole === "editor";
  const isViewer = userRole === "viewer";

  // Don't render tabs until role is loaded (prevents flicker)
  if (!isRoleLoaded) return null;

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
          marginTop: 4,
          textTransform: "capitalize",
          letterSpacing: 0.3,
        },
      }}
    >
      {/* ── Home / Dashboard ─────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={22} color={color} />
          ),
        }}
      />

      {/* ── Public Docs — visible to all ─────────────────────────── */}
      <Tabs.Screen
        name="public"
        options={{
          title: "Public",
          tabBarIcon: ({ color }) => (
            <Feather name="globe" size={22} color={color} />
          ),
        }}
      />

      {/* ── Workspaces — Admin sees all, Editor sees assigned, Viewer hidden ── */}
      <Tabs.Screen
        name="workspaces"
        options={{
          title: "Workspaces",
          // Viewer has no workspaces tab
          href: isRoleLoaded && isViewer ? null : "/(tabs)/workspaces",
          tabBarIcon: ({ color }) => (
            <Feather name="layers" size={22} color={color} />
          ),
        }}
      />

      {/* ── Users — Admin only ────────────────────────────────────── */}
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          href: isRoleLoaded && isAdmin ? "/(tabs)/users" : null,
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />

      {/* ── Profile — visible to all ──────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
