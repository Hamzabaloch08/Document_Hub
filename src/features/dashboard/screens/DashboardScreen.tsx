import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const docs = [
  { id: 1, title: "Architecture Redesign", team: "Engineering", status: "Published" },
  { id: 2, title: "Marketing Strategy", team: "Growth", status: "Draft" },
  { id: 3, title: "API Documentation", team: "Dev", status: "Published" },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. Header (Standard with Border) */}
      <View className="px-6 py-6 flex-row justify-between items-center bg-white border-b border-gray-50">
        <View>
            <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">Index 01</Text>
            <Text className="text-[24px] font-black tracking-tighter text-black">DocuHub.</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
           <Feather name="search" size={18} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8 pb-40">
          
          {/* 2. Stats Banner (Standard Cards) */}
          <View className="flex-row gap-4 mb-8">
             <View className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-50">
                <Text className="text-3xl font-black text-black">14</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-1">Sites</Text>
             </View>
             <View className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-50">
                <Text className="text-3xl font-black text-black">07</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-1">Drafts</Text>
             </View>
          </View>
          
          {/* 3. Primary Action CTA - PENCIL ICON DIRECT (No Box) */}
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-black p-8 rounded-2xl shadow-xl shadow-gray-200 mb-12 flex-row items-center justify-between"
          >
             <View className="flex-1">
                <Text className="text-white text-[22px] font-black tracking-tight leading-7">Create New{"\n"}Document.</Text>
                <View className="bg-white/20 px-2 py-0.5 rounded-lg self-start mt-3">
                    <Text className="text-white text-[9px] font-bold uppercase tracking-[1px]">Quick Access</Text>
                </View>
             </View>
             {/* DIRECT ICON (No background box) */}
             <Feather name="edit-3" size={32} color="white" className="mr-2" />
          </TouchableOpacity>

          {/* 4. Recents Listing (Restored Boxed Icons) */}
          <View className="flex-row justify-between items-center mb-6 px-1">
             <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Recent Work</Text>
             <TouchableOpacity><Text className="text-xs font-bold text-black border-b border-gray-100 pb-0.5">View all</Text></TouchableOpacity>
          </View>
          
          <View>
             {docs.map((doc) => (
                <TouchableOpacity key={doc.id} className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm shadow-gray-50">
                   <View className={`w-12 h-12 ${doc.status === 'Draft' ? 'bg-gray-100' : 'bg-gray-50'} rounded-xl items-center justify-center`}>
                      <Feather name="file-text" size={18} color="black" />
                   </View>
                   <View className="ml-4 flex-1">
                      <Text className="text-base font-black text-black leading-5">{doc.title}</Text>
                      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{doc.team} • {doc.status}</Text>
                   </View>
                   <Feather name="chevron-right" size={16} color="#D1D5DB" />
                </TouchableOpacity>
             ))}
          </View>

          {/* 5. Team Hubs */}
          <View className="mt-10 mb-6 font-black uppercase">
             <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Workspace hubs</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
             {["Engineering", "Growth Hub", "Archives"].map(team => (
               <TouchableOpacity key={team} className="w-[140px] bg-white p-6 rounded-2xl border border-gray-100 mr-4 items-center shadow-sm shadow-gray-50">
                  <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mb-4">
                     <Feather name="layers" size={20} color="black" />
                  </View>
                  <Text className="text-center font-black text-black text-xs">{team}</Text>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Primary Action Button */}
      <TouchableOpacity className="absolute bottom-24 right-6 w-14 h-14 bg-black rounded-2xl items-center justify-center shadow-lg shadow-gray-400">
         <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
