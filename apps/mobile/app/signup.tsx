import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors, radius, text } from "@/lib/theme";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    if (!email || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  return (
    <LinearGradient
      colors={[colors.gray[900], colors.emerald[950], colors.gray[900]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={s.root}>
        {done ? (
          <View style={s.doneWrapper}>
            <View style={s.card}>
              <Text style={s.doneEmoji}>📬</Text>
              <Text style={s.doneTitle}>Check your email</Text>
              <Text style={s.doneBody}>
                We sent a confirmation link to{"\n"}
                <Text style={s.doneEmail}>{email}</Text>
              </Text>
              <TouchableOpacity style={s.btn} onPress={() => router.replace("/login")}>
                <Text style={s.btnText}>Go to sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
              <TouchableOpacity style={s.back} onPress={() => router.back()}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>

              <View style={s.headerBlock}>
                <Text style={s.logoEmoji}>🦎</Text>
                <Text style={s.title}>Create account</Text>
                <Text style={s.subtitle}>
                  Start tracking your geckos, snakes,{"\n"}and every exotic species you keep.
                </Text>
              </View>

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
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.gray[400]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <Text style={[s.label, { marginTop: 14 }]}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={s.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray[400]}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                />

                {!!error && <Text style={s.error}>{error}</Text>}

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create account</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/login")} style={s.switchRow}>
                  <Text style={s.switchText}>Already have an account? </Text>
                  <Text style={s.switchLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  inner:       { padding: 28, paddingTop: 60, gap: 24, flexGrow: 1, justifyContent: "center" },
  doneWrapper: { flex: 1, justifyContent: "center", padding: 28 },

  back:     { position: "absolute", top: 16, left: 28 },
  backText: { color: "rgba(255,255,255,0.6)", fontSize: text.sm },

  headerBlock: { alignItems: "center", gap: 12 },
  logoEmoji:   { fontSize: 56 },
  title:       { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle:    { fontSize: text.base, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 24 },

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

  doneEmoji: { fontSize: 48, textAlign: "center", marginBottom: 12 },
  doneTitle: { fontSize: text.xl, fontWeight: "700", color: colors.gray[900], textAlign: "center" },
  doneBody:  { fontSize: text.sm, color: colors.gray[400], textAlign: "center", marginTop: 8, lineHeight: 22 },
  doneEmail: { fontWeight: "600", color: colors.gray[700] },
});
