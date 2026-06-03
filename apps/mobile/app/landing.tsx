import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { colors, radius, text } from "@/lib/theme";

const FLOATERS = ["🐍", "🦎", "🐊", "🦕", "🐢"];

function Floater({ emoji, delay }: { emoji: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -8, duration: 1400 + delay * 150, useNativeDriver: true, delay }),
        Animated.timing(anim, { toValue: 0,  duration: 1400 + delay * 150, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: 22, transform: [{ translateY: anim }] }}>
      {emoji}
    </Animated.Text>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[
        colors.gray[900],
        colors.emerald[950],
        colors.gray[900],
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={s.root}>
        

        {/* Content */}
        <View style={s.inner}>
          {/* Logo */}
          <View style={s.logoBlock}>
            <Text style={s.logoEmoji}>🦎</Text>

            <Text style={s.logoText}>PetTrack</Text>

            <Text style={s.tagline}>
              The all-in-one care tracker for geckos, snakes, monitors,
              chameleons, and every exotic species you keep.
            </Text>

            <View style={s.floatersRow}>
              {FLOATERS.map((emoji, i) => (
                <Floater key={i} emoji={emoji} delay={i * 500} />
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => router.push("/signup")}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryText}>Get started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <Text style={s.btnSecondaryText}>Sign in</Text>
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.divider} />
              <Text style={s.dividerText}>or continue with</Text>
              <View style={s.divider} />
            </View>

            <TouchableOpacity
              style={s.btnGoogle}
              activeOpacity={0.85}
              disabled
            >
              <Text style={s.googleIcon}>G</Text>

              <Text style={s.btnGoogleText}>Google</Text>

              <View style={s.comingSoon}>
                <Text style={s.comingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  blob1: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.emerald[600],
    opacity: 0.08,
  },

  blob2: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#14b8a6",
    opacity: 0.06,
  },

  inner: {
    flex: 1,
    justifyContent: "space-between",
    padding: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },

  logoBlock: {
    alignItems: "center",
    gap: 12,
  },

  floatersRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },

  logoEmoji: {
    fontSize: 56,
  },

  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: text.base,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 4,
  },

  actions: {
    gap: 12,
  },

  btnPrimary: {
    backgroundColor: colors.emerald[600],
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },

  btnPrimaryText: {
    color: "#fff",
    fontSize: text.base,
    fontWeight: "700",
  },

  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingVertical: 16,
    alignItems: "center",
  },

  btnSecondaryText: {
    color: "#fff",
    fontSize: text.base,
    fontWeight: "600",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  dividerText: {
    fontSize: text.xs,
    color: "rgba(255,255,255,0.35)",
  },

  btnGoogle: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.6,
  },

  googleIcon: {
    fontSize: text.base,
    fontWeight: "800",
    color: "#fff",
  },

  btnGoogleText: {
    fontSize: text.base,
    fontWeight: "600",
    color: "#fff",
  },

  comingSoon: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },

  comingSoonText: {
    fontSize: text.xs,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
});