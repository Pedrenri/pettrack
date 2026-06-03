import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import React from "react";

const AUTH_SCREENS = ["landing", "login", "signup"];

function Guard() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = AUTH_SCREENS.includes(segments[0] as string);
    if (!session && !inAuth) router.replace("/landing");
    if (session && inAuth) router.replace("/(tabs)");
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] }}>
        <ActivityIndicator color={colors.emerald[600]} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="animal/[id]" options={{ headerShown: true, title: "", headerBackTitle: "Back" }} />
      <Stack.Screen name="animal/edit/[id]" options={{ headerShown: true, title: "Edit animal", headerBackTitle: "Back" }} />
      <Stack.Screen name="animal/new" options={{ headerShown: true, title: "New animal", headerBackTitle: "Back" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Guard />
    </AuthProvider>
  );
}
