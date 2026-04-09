import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-3 rounded-3xl border border-slate-700 bg-slate-900 p-5">
          <Text className="text-2xl font-bold text-white">Ali Raza</Text>
          <Text className="mt-1 text-slate-300">Product Documentation Lead</Text>
          <Text className="mt-2 text-slate-400">ali.raza@docuhub.app</Text>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <Text className="text-lg font-bold text-white">Overview</Text>
          <Text className="mt-3 text-slate-300">Role: Workspace Admin</Text>
          <Text className="mt-2 text-slate-300">Active Workspaces: 3</Text>
          <Text className="mt-2 text-slate-300">Docs Authored: 142</Text>
          <Text className="mt-2 text-slate-300">Comments Resolved: 311</Text>
        </View>

        <View className="mb-8 mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <Text className="text-lg font-bold text-white">Recent Contribution</Text>
          <Text className="mt-3 rounded-xl bg-slate-800 px-3 py-2 text-slate-200">
            Published "Q2 Product Playbook"
          </Text>
          <Text className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-slate-200">
            Updated "API Integration Guidelines"
          </Text>
          <Text className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-slate-200">
            Replied on 6 unresolved comments
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
