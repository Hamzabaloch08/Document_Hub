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
  const [wsVisibility, setWsVisibility] = useState<"private" | "public">(
    "private",
  );
  const [currentRole, setCurrentRole] = useState<"admin" | "editor" | "viewer">(
    "viewer",
  );
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

  const workspaceItems = useMemo(
    () =>
      displayWorkspaces.map((ws) => ({
        id: ws._id,
        name: ws.name,
        description: ws.description || "No description",
        visibility: ws.visibility || "private",
      })),
    [displayWorkspaces],
  );

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
        visibility: wsVisibility,
      }),
    );
    if (createWorkspace.fulfilled.match(result)) {
      setName("");
      setDescription("");
      setWsVisibility("private");
      setShowCreateBox(false);
    } else if (createWorkspace.rejected.match(result)) {
      Alert.alert(
        "Error",
        result.payload?.message ||
          "Failed to create workspace. Please try again.",
      );
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
      <View className="px-6 py-8 border-b border-gray-50 flex-row justify-between items-center">
        <View>
          <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[3px] mb-1">
            {isAdmin ? "Admin Root" : "My Hubs"}
          </Text>
          <Text className="text-4xl font-black tracking-tighter text-black">
            Spaces.
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View
            className={`px-4 py-1.5 rounded-full ${isAdmin ? "bg-black" : "bg-gray-100"}`}
          >
            <Text
              className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? "text-white" : "text-gray-500"}`}
            >
              {currentRole}
            </Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              className="w-12 h-12 bg-black rounded-2xl items-center justify-center"
              onPress={() => setShowCreateBox((prev) => !prev)}
            >
              <Feather
                name={showCreateBox ? "x" : "plus"}
                size={22}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-40">
          {/* ── Create form (admin only) ── */}
          {showCreateBox && isAdmin && (
            <View className="w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
              <Text className="text-[10px] font-black text-black uppercase tracking-widest mb-6">
                New Workspace
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Name your space"
                placeholderTextColor="#94A3B8"
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-black font-bold mb-3"
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-black font-bold mb-6"
                style={{ minHeight: 80 }}
              />
              <Text className="text-[10px] font-black text-black uppercase tracking-widest mb-3">
                Visibility
              </Text>
              <View className="flex-row gap-3 mb-6">
                {(["private", "public"] as const).map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setWsVisibility(v)}
                    className={`flex-1 py-3 rounded-2xl border items-center ${
                      wsVisibility === v
                        ? "bg-black border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase tracking-[1px] ${
                        wsVisibility === v ? "text-white" : "text-black"
                      }`}
                    >
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleCreateWorkspace}
                disabled={actionLoading}
                className={`rounded-2xl py-4 items-center ${actionLoading ? "bg-gray-200" : "bg-black"}`}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    Initialize Space
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Section label ── */}
          <Text className="text-[12px] font-black text-gray-300 uppercase tracking-[4px] mb-8 ml-1">
            {isAdmin
              ? `Index (${workspaceItems.length})`
              : `Assigned (${workspaceItems.length})`}
          </Text>

          {/* ── List ── */}
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
              <Text className="text-gray-400 mt-4 font-bold uppercase tracking-widest text-[10px]">
                Syncing...
              </Text>
            </View>
          ) : workspaceItems.length === 0 ? (
            <View className="bg-gray-50 border border-gray-100 rounded-[40px] p-12 items-center">
              <Feather name="layers" size={40} color="#D1D5DB" />
              <Text className="text-black text-xl font-black mt-6">
                No Spaces Found
              </Text>
              <Text className="text-gray-400 text-center mt-3 text-sm font-medium px-4">
                {isAdmin
                  ? "Initialize your first workspace using the plus icon."
                  : "You haven't been assigned to any workspaces yet."}
              </Text>
            </View>
          ) : (
            <View className="gap-6">
              {workspaceItems.map((workspace) => (
                <TouchableOpacity
                  key={workspace.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                    padding: 24,
                  }}
                  onPress={() =>
                    nav.push(`/(workspace)/detail?id=${workspace.id}`)
                  }
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="w-14 h-14 bg-gray-50 rounded-[20px] items-center justify-center">
                      <Feather name="folder" size={24} color="black" />
                    </View>
                    <View className="flex-row items-center gap-3">
                      <View className="bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full">
                        <Text className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          {workspace.visibility}
                        </Text>
                      </View>
                      {isAdmin && (
                        <TouchableOpacity
                          className="w-10 h-10 rounded-full bg-red-50 border border-red-100 items-center justify-center"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkspace(workspace.id, workspace.name);
                          }}
                          disabled={actionLoading}
                        >
                          <Feather name="trash-2" size={15} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Text
                    className="text-2xl font-black text-black tracking-tight"
                    numberOfLines={1}
                  >
                    {workspace.name}
                  </Text>
                  <Text
                    className="text-base text-gray-400 font-medium mt-2 leading-6"
                    numberOfLines={2}
                  >
                    {workspace.description}
                  </Text>

                  <View className="mt-8 pt-6 border-t border-gray-50 flex-row items-center justify-between">
                    <Text className="text-[10px] font-black text-black uppercase tracking-[2px]">
                      Enter Space
                    </Text>
                    <Feather name="arrow-right" size={18} color="black" />
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
