import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
    clearWorkspaceError,
    clearWorkspaceSuccess,
} from "../redux/workspaceSlice";
import {
    createWorkspace,
    deleteWorkspace,
    fetchUserWorkspaces,
} from "../redux/workspaceThunks";

export default function WorkspacesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();

  const { workspaces, loading, actionLoading, error, successMessage } =
    useSelector((state: RootState) => state.workspace);

  const [showCreateBox, setShowCreateBox] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentRole, setCurrentRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // ── Hydrate role & userId ─────────────────────────────────────────────────
  useEffect(() => {
    const hydrateUser = async () => {
      const rawUser = await AsyncStorage.getItem("user");
      if (!rawUser) {
        dispatch(fetchUserWorkspaces());
        return;
      }
      const parsedUser = JSON.parse(rawUser);
      const role = (parsedUser?.role || "viewer").toLowerCase();
      setCurrentUserId(parsedUser?._id || "");
      if (role === "admin" || role === "editor" || role === "viewer") {
        setCurrentRole(role as any);
      }
      dispatch(fetchUserWorkspaces());
    };
    hydrateUser();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert("Workspace Error", error, [
        { text: "OK", onPress: () => dispatch(clearWorkspaceError()) },
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert("Success", successMessage, [
        { text: "OK", onPress: () => dispatch(clearWorkspaceSuccess()) },
      ]);
    }
  }, [successMessage, dispatch]);

  // ── Filter workspaces by role ─────────────────────────────────────────────
  // Admin: sees ALL workspaces
  // Editor: sees only workspaces they are a member of
  // Viewer: no workspace tab (hidden by tab layout)
  const displayWorkspaces = useMemo(() => {
    if (currentRole === "admin") return workspaces;
    // For editor: the backend /api/workspace already returns only assigned workspaces
    return workspaces;
  }, [workspaces, currentRole]);

  const workspaceItems = useMemo(() =>
    displayWorkspaces.map((ws) => ({
      id: ws._id,
      name: ws.name,
      description: ws.description || "No description",
      visibility: ws.visibility || "private",
    })),
  [displayWorkspaces]);

  const isAdmin = currentRole === "admin";
  const isEditor = currentRole === "editor";

  // ── Create workspace ──────────────────────────────────────────────────────
  const handleCreateWorkspace = async () => {
    if (!isAdmin) {
      Alert.alert("Permission", "Only admins can create workspaces.");
      return;
    }
    const workspaceName = name.trim();
    if (!workspaceName) {
      Alert.alert("Validation", "Workspace name is required.");
      return;
    }
    const result = await dispatch(
      createWorkspace({
        name: workspaceName,
        description: description.trim() || undefined,
        visibility: "private",
      }),
    );
    if (createWorkspace.fulfilled.match(result)) {
      setName("");
      setDescription("");
      setShowCreateBox(false);
    }
  };

  // ── Delete workspace ──────────────────────────────────────────────────────
  const handleDeleteWorkspace = (id: string, wsName: string) => {
    if (!isAdmin) {
      Alert.alert("Permission", "Only admins can delete workspaces.");
      return;
    }
    Alert.alert(
      "Delete Workspace",
      `Delete "${wsName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteWorkspace(id)),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Header ── */}
      <View className="px-6 py-6 border-b border-gray-50 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[2px]">
            {isAdmin ? "Admin" : "My Hubs"}
          </Text>
          <Text className="text-[26px] font-black tracking-tighter text-black">
            Workspaces.
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          {/* Role badge */}
          <View className={`px-3 py-1 rounded-full ${isAdmin ? "bg-black" : "bg-gray-100"}`}>
            <Text className={`text-[9px] font-black uppercase tracking-[1px] ${isAdmin ? "text-white" : "text-gray-500"}`}>
              {currentRole}
            </Text>
          </View>
          {/* Admin: create button */}
          {isAdmin && (
            <TouchableOpacity
              className="w-10 h-10 bg-black rounded-xl items-center justify-center"
              onPress={() => setShowCreateBox((prev) => !prev)}
            >
              <Feather name={showCreateBox ? "x" : "plus"} size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">

          {/* ── Create form (admin only) ── */}
          {showCreateBox && isAdmin && (
            <View className="w-full bg-gray-50 p-5 rounded-3xl border border-gray-200 mb-6">
              <Text className="text-xs font-black text-gray-500 uppercase tracking-[1.5px] mb-4">
                Create New Workspace
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Workspace name *"
                placeholderTextColor="#94A3B8"
                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black font-bold mb-3"
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black font-bold mb-4"
                style={{ minHeight: 70 }}
              />
              <TouchableOpacity
                onPress={handleCreateWorkspace}
                disabled={actionLoading}
                className={`rounded-2xl py-3.5 items-center ${actionLoading ? "bg-gray-300" : "bg-black"}`}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black uppercase tracking-[1.5px] text-xs">
                    Create Workspace
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Section label ── */}
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-5 ml-1">
            {isAdmin ? `All Workspaces (${workspaceItems.length})` : `Assigned to Me (${workspaceItems.length})`}
          </Text>

          {/* ── List ── */}
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="text-gray-500 mt-3">Loading workspaces...</Text>
            </View>
          ) : workspaceItems.length === 0 ? (
            <View className="bg-gray-50 border border-gray-100 rounded-3xl p-8 items-center">
              <Feather name="briefcase" size={32} color="#D1D5DB" />
              <Text className="text-black text-lg font-black mt-4">
                {isAdmin ? "No Workspaces Yet" : "Not Assigned Yet"}
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                {isAdmin
                  ? "Tap + to create your first workspace."
                  : "Ask an admin to add you to a workspace."}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {workspaceItems.map((workspace) => (
                <TouchableOpacity
                  key={workspace.id}
                  className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-gray-50"
                  onPress={() => nav.push(`/(workspace)/detail?id=${workspace.id}`)}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center">
                      <Feather name="briefcase" size={22} color="black" />
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                        <Text className="text-[9px] font-black uppercase tracking-[1px] text-gray-500">
                          {workspace.visibility}
                        </Text>
                      </View>
                      {isAdmin && (
                        <TouchableOpacity
                          className="w-8 h-8 rounded-full bg-red-50 border border-red-100 items-center justify-center"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkspace(workspace.id, workspace.name);
                          }}
                          disabled={actionLoading}
                        >
                          <Feather name="trash-2" size={13} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Text className="text-xl font-black text-black">
                    {workspace.name}
                  </Text>
                  <Text className="text-sm text-gray-400 font-medium mt-1" numberOfLines={2}>
                    {workspace.description}
                  </Text>

                  <View className="mt-4 flex-row items-center justify-between">
                    <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[1px]">
                      Tap to open
                    </Text>
                    <Feather name="arrow-right" size={16} color="#D1D5DB" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
