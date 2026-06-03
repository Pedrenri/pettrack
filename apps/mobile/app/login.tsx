import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors, radius, text } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("Invalid email or password");
  }

  return (
    <LinearGradient
      colors={[colors.gray[900], colors.emerald[950], colors.gray[900]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.inner}>
          {/* Back */}
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.headerBlock}>
            <Text style={s.logoEmoji}>🦎</Text>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Text style={[s.label, { marginTop: 14 }]}>PASSWORD</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.gray[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {!!error && <Text style={s.error}>{error}</Text>}

            <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign in</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/signup")} style={s.switchRow}>
              <Text style={s.switchText}>Don't have an account? </Text>
              <Text style={s.switchLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1 },
  inner: { flex: 1, padding: 28, paddingTop: 60, justifyContent: "center", gap: 24 },

  back:     { position: "absolute", top: 16, left: 28 },
  backText: { color: "rgba(255,255,255,0.6)", fontSize: text.sm },

  headerBlock: { alignItems: "center", gap: 12 },
  logoEmoji:   { fontSize: 56 },
  title:       { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle:    { fontSize: text.base, color: "rgba(255,255,255,0.5)", textAlign: "center" },

  card:  { backgroundColor: colors.white, borderRadius: 24, padding: 24 },
  label: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: text.sm, color: colors.gray[900] },
  error: { fontSize: text.xs, color: colors.red[500], textAlign: "center", marginTop: 6 },

  btn:         { backgroundColor: colors.emerald[600], borderRadius: radius.lg, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: "#fff", fontSize: text.base, fontWeight: "700" },

  switchRow:  { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  switchText: { fontSize: text.sm, color: colors.gray[400] },
  switchLink: { fontSize: text.sm, color: colors.emerald[600], fontWeight: "600" },
});
