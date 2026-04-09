import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const documents = [
  { title: "Engineering Handbook", status: "Published", workspace: "Engineering" },
  { title: "Q2 Product Playbook", status: "Draft", workspace: "Product" },
  { title: "Onboarding Checklist", status: "Published", workspace: "HR & Ops" },
  { title: "Design System Guidelines", status: "Published", workspace: "Design" },
];

export default function DocumentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-6 py-6 border-b border-outline/50 bg-white">
        <Text className="text-2xl font-headline font-bold text-on-background">Documents</Text>
        <Text className="text-sm text-on-surface-variant mt-1">Manage your team's knowledge bases</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {documents.map((doc) => (
            <View key={doc.title} className="bg-white border border-outline rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <View className="bg-primary/10 px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">{doc.workspace}</Text>
                </View>
                <View className={`px-2 py-0.5 rounded ${doc.status === 'Draft' ? 'bg-secondary/10' : 'bg-green-100'}`}>
                   <Text className={`text-[10px] font-bold uppercase tracking-widest ${doc.status === 'Draft' ? 'text-secondary' : 'text-green-700'}`}>{doc.status}</Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-on-background">{doc.title}</Text>
              <View className="flex-row items-center mt-3 pt-3 border-t border-outline/30">
                 <Text className="text-xs text-on-surface-variant">Last edited 3 days ago</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}

