import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const docs = [
  { id: 1, title: "Public Architecture Guide", author: "Mozilla Clean", reads: "128k" },
  { id: 2, title: "React Dev Handbook", author: "Meta Eng", reads: "450k" },
  { id: 3, title: "Zero Trust Handbook", author: "Cloudflare", reads: "22k" },
];

export default function PublicDocsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-6 border-b border-gray-50 flex-row justify-between items-center bg-white">
        <View>
            <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">Discovery</Text>
            <Text className="text-2xl font-black tracking-tighter text-black">Public Hub.</Text>
        </View>
        <Feather name="globe" size={24} color="black" />
      </View>

      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8 pb-40">
          
          {/* Search - Pure White */}
          <View className="bg-white h-14 px-5 rounded-2xl flex-row items-center border border-gray-100 mb-10">
             <Feather name="search" size={18} color="#94A3B8" />
             <TextInput 
                placeholder="Search global assets..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-3 text-sm font-bold text-black"
             />
          </View>

          {/* List - Pure White Cards */}
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Open Knowledge</Text>
          
          {docs.map((doc) => (
             <TouchableOpacity key={doc.id} className="flex-row items-center bg-white p-5 rounded-2xl border border-gray-100 mb-4 shadow-sm shadow-gray-50">
                <View className="w-12 h-12 border border-gray-100 rounded-xl items-center justify-center">
                   <Feather name="book-open" size={20} color="black" />
                </View>
                <View className="ml-4 flex-1">
                   <Text className="text-base font-black text-black leading-5">{doc.title}</Text>
                   <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{doc.author} • {doc.reads} views</Text>
                </View>
                <TouchableOpacity className="w-8 h-8 rounded-full border border-gray-100 items-center justify-center">
                  <Feather name="plus" size={16} color="black" />
                </TouchableOpacity>
             </TouchableOpacity>
          ))}

          {/* Featured CTA - Clean White/Black Look */}
          <TouchableOpacity className="mt-10 bg-black p-8 rounded-2xl shadow-xl shadow-gray-400 flex-row items-center">
             <View className="w-12 h-12 border border-white/20 rounded-xl items-center justify-center mr-4">
                <Feather name="share-2" size={20} color="white" />
             </View>
             <View className="flex-1">
                <Text className="text-white text-xl font-black leading-7">Share your knowledge with everyone.</Text>
             </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
