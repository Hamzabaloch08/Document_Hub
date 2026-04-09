import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const settingsGroups = [
  {
    title: "Workspace Controls",
    items: ["Invite Members", "Manage Roles", "Edit Workspace Details"],
  },
  {
    title: "Documentation Preferences",
    items: ["Default Visibility", "Comment Moderation", "Publishing Rules"],
  },
  {
    title: "Security",
    items: ["Email Verification", "Password Policy", "Session Management"],
  },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-3xl font-bold text-white">Settings</Text>
        <Text className="mt-1 text-slate-400">
          Configure your workspace and collaboration preferences.
        </Text>

        <View className="mb-8 mt-5 space-y-3">
          {settingsGroups.map((group) => (
            <View key={group.title} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
              <Text className="text-lg font-semibold text-white">{group.title}</Text>
              <View className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <Text key={item} className="rounded-xl bg-slate-800 px-3 py-2 text-slate-200">
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
