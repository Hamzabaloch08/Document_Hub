import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem("tokenGenerate");

        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        // Token exists — go to the main tabs
        // The tab layout handles role-based tab visibility
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Splash bootstrap error:", error);
        router.replace("/(auth)/login");
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          backgroundColor: "#000",
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>D</Text>
      </View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "900",
          color: "#000",
          letterSpacing: -1,
          marginBottom: 6,
        }}
      >
        DocuHub.
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#CBD5E1",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        Knowledge Hub
      </Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
