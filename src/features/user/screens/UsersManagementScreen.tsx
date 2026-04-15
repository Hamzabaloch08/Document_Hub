import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { assignUserRole, fetchAllUsers, User } from "../redux/usersThunks";

export default function UsersManagementScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users,
  );

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleOpenRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    setRoleModalVisible(true);
  };

  const handleChangeRole = (newRole: string) => {
    if (selectedUserForRole) {
      dispatch(assignUserRole({ email: selectedUserForRole.email, newRole }))
        .unwrap()
        .then(() => {
          setRoleModalVisible(false);
          setSelectedUserForRole(null);
        })
        .catch((err) => alert("Failed to change role: " + err));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-8 py-8 border-b border-gray-100 bg-white">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-gray-300">
              Controls
            </Text>
            <Text className="text-[28px] font-black tracking-tighter text-black">
              Users.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[10px] font-black uppercase tracking-[3px] mb-6 ml-1 text-gray-400">
          All Users
        </Text>

        {loading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : error ? (
          <View className="mt-10 items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100">
            <Text className="text-red-500 font-bold text-center">{error}</Text>
          </View>
        ) : (
          <View className="mb-20 gap-3">
            {users.length === 0 ? (
              <Text className="text-gray-400 font-bold text-center mt-5">
                No users found.
              </Text>
            ) : (
              users.map((user: any) => (
                <View
                  key={user._id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 flex-row items-center justify-between shadow-sm shadow-gray-50"
                >
                  <View className="flex-1 pr-4">
                    <Text
                      className="text-lg font-black text-black mb-1"
                      numberOfLines={1}
                    >
                      {user.username || "Unknown User"}
                    </Text>
                    <Text
                      className="text-[12px] font-bold text-gray-400"
                      numberOfLines={1}
                    >
                      {user.email || "No email"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleOpenRoleModal(user)}
                    className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"
                  >
                    <Text className="text-black text-[10px] font-black uppercase tracking-[1px] mr-2">
                      {user.role || "User"}
                    </Text>
                    <Feather name="edit-2" size={12} color="black" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={roleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-6">
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            <Text className="text-xl font-black text-black mb-2">
              Change Role
            </Text>
            <Text className="text-sm font-bold text-gray-500 mb-6">
              Update role for{" "}
              <Text className="text-black">{selectedUserForRole?.email}</Text>
            </Text>

            <View className="gap-3">
              {["admin", "editor", "viewer"].map((role) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => handleChangeRole(role)}
                  className={`flex-row items-center justify-between p-4 rounded-xl border ${selectedUserForRole?.role === role ? "border-black bg-black" : "border-gray-100 bg-gray-50"}`}
                >
                  <Text
                    className={`text-[12px] font-black uppercase tracking-[1px] ${selectedUserForRole?.role === role ? "text-white" : "text-black"}`}
                  >
                    {role}
                  </Text>
                  {selectedUserForRole?.role === role && (
                    <Feather name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setRoleModalVisible(false)}
              className="mt-6 h-14 rounded-xl items-center justify-center border border-gray-200"
            >
              <Text className="text-black font-black uppercase tracking-[1px] text-[12px]">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
