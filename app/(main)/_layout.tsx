import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="workspaces" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="comments" />
      <Stack.Screen name="search" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

