import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { name: "Getting Started", docs: 42 },
  { name: "API References", docs: 88 },
  { name: "Playbooks", docs: 36 },
  { name: "Policies", docs: 22 },
];

export default function CategoriesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-3xl font-bold text-white">Categories</Text>
        <Text className="mt-1 text-slate-400">Organize workspace documents by topic.</Text>

        <View className="mb-8 mt-5 space-y-3">
          {categories.map((category) => (
            <View
              key={category.name}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4"
            >
              <Text className="text-lg font-semibold text-white">{category.name}</Text>
              <Text className="mt-1 text-slate-300">{category.docs} docs</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

