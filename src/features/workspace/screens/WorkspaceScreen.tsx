import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const workspaces = [
  { name: "Engineering", members: 22, docs: 487, role: "Admin" },
  { name: "Product", members: 14, docs: 312, role: "Editor" },
  { name: "HR & Ops", members: 12, docs: 175, role: "Viewer" },
];

export default function WorkspaceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-3xl font-bold text-white">My Workspaces</Text>
        <Text className="mt-1 text-slate-400">
          Manage documentation spaces for your teams.
        </Text>

        <View className="mt-5 space-y-3">
          {workspaces.map((workspace) => (
            <View
              key={workspace.name}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4"
            >
              <Text className="text-xl font-semibold text-white">{workspace.name}</Text>
              <Text className="mt-1 text-slate-300">
                {workspace.members} members • {workspace.docs} docs • {workspace.role}
              </Text>
            </View>
          ))}
        </View>

        <View className="mb-8 mt-6 flex-row gap-3">
          <Link
            href="/(main)/dashboard"
            className="rounded-xl border border-indigo-400 bg-indigo-500 px-4 py-3 font-semibold text-white"
          >
            Open Dashboard
          </Link>
          <Link
            href="/(main)/profile"
            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 font-semibold text-slate-100"
          >
            Profile
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
