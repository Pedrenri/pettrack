import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useAuth } from "@/lib/auth";
import { colors, radius, shadow, text } from "@/lib/theme";

export default function AccountScreen() {
  const { session, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.heading}>Account</Text>
      </View>

      <View style={s.content}>
        {/* User info */}
        <View style={s.card}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {session?.user.email?.[0].toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={s.info}>
            <Text style={s.email}>{session?.user.email}</Text>
            <Text style={s.since}>
              Member since {new Date(session?.user.created_at ?? "").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.gray[50] },
  header:  { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  heading: { fontSize: text["2xl"], fontWeight: "700", color: colors.gray[900] },
  content: { padding: 16, gap: 12 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadow.sm,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.emerald[600],
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: text.xl, fontWeight: "700", color: "#fff" },
  info:       { flex: 1 },
  email:      { fontSize: text.sm, fontWeight: "600", color: colors.gray[900] },
  since:      { fontSize: text.xs, color: colors.gray[400], marginTop: 2 },

  signOutBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.red[500] + "40",
    padding: 16,
    alignItems: "center",
    ...shadow.sm,
  },
  signOutText: { fontSize: text.base, fontWeight: "600", color: colors.red[500] },
});
