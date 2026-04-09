import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const adminItems = [
  "Manage Users",
  "Workspace Access Policies",
  "Role Permission Matrix",
  "Audit & Activity Logs",
];

export default function AdminScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-3xl font-bold text-white">Admin Panel</Text>
        <Text className="mt-1 text-slate-400">
          High-level controls for users, roles, and system governance.
        </Text>

        <View className="mb-8 mt-5 space-y-3">
          {adminItems.map((item) => (
            <Text key={item} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-200">
              {item}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

