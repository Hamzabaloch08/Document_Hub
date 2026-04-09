import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const comments = [
  "Can we add API response examples here?",
  "Please update this section for v2 rollout.",
  "Great guide, add troubleshooting points too.",
  "Pending approval from workspace admin.",
];

export default function CommentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-3xl font-bold text-white">Comments</Text>
        <Text className="mt-1 text-slate-400">Track discussion and feedback across docs.</Text>

        <View className="mb-8 mt-5 space-y-3">
          {comments.map((comment) => (
            <Text key={comment} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-200">
              {comment}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

