import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, ActivityIndicator,
  SafeAreaView, Image, StyleSheet, TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { supabase } from "@/lib/supabase";
import { calcAge, type Animal, type LogEntry, LOG_TYPE_CONFIG } from "@pettrack/core";
import { colors, radius, shadow, text, logTypeColors } from "@/lib/theme";
import React from "react";

export default function AnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("animals")
        .select("id, name, species_name, breed, morph, birthday, sex, weight, last_fed, last_shed, last_handled, notes, animal_photos(url)")
        .eq("id", id)
        .single(),
      supabase
        .from("animal_log")
        .select("id, logged_at, type, title, value, unit, notes")
        .eq("animal_id", id)
        .order("logged_at", { ascending: false })
        .limit(20),
    ]).then(([{ data: a }, { data: l }]) => {
      if (a) {
        setAnimal(a as Animal);
        navigation.setOptions({ title: (a as Animal).name });
      }
      setLogs((l as LogEntry[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading || !animal) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color={colors.emerald[600]} size="large" />
      </SafeAreaView>
    );
  }

  const photo = animal.animal_photos?.[0]?.url;

  const stats = [
    animal.birthday   && { label: "Age",       value: calcAge(animal.birthday) },
    animal.sex        && { label: "Sex",        value: animal.sex },
    animal.weight     && { label: "Weight",     value: `${animal.weight}g` },
    animal.morph      && { label: "Morph",      value: animal.morph },
    animal.last_fed   && { label: "Last fed",   value: animal.last_fed.split("-").reverse().join("/") },
    animal.last_shed  && { label: "Last shed",  value: animal.last_shed.split("-").reverse().join("/") },
    animal.last_handled && { label: "Last handled", value: animal.last_handled.split("-").reverse().join("/") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={s.hero}>
          {photo
            ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <Text style={s.heroEmoji}>🦎</Text>
          }
        </View>

        <View style={s.content}>
          {/* Name / species */}
          <View style={s.nameBlock}>
            <Text style={s.animalName}>{animal.name}</Text>
            {animal.species_name && (
              <Text style={s.animalSpecies}>
                {animal.species_name}{animal.breed ? ` · ${animal.breed}` : ""}
              </Text>
            )}
          </View>

          {/* Stats */}
          {stats.length > 0 && (
            <View style={s.card}>
              <View style={s.statsGrid}>
                {stats.map(({ label, value }) => (
                  <View key={label} style={s.stat}>
                    <Text style={s.statLabel}>{label}</Text>
                    <Text style={s.statValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {!!animal.notes && (
            <View style={s.card}>
              <Text style={s.sectionTitle}>Notes</Text>
              <Text style={s.notesText}>{animal.notes}</Text>
            </View>
          )}

          {/* Log */}
          <Text style={s.sectionTitle}>Recent log</Text>
          {logs.length === 0 ? (
            <Text style={s.emptyText}>No log entries yet</Text>
          ) : (
            logs.map((entry) => {
              const cfg = LOG_TYPE_CONFIG[entry.type] ?? LOG_TYPE_CONFIG.custom;
              const lc = logTypeColors[entry.type] ?? logTypeColors.custom;
              return (
                <View key={entry.id} style={[s.card, s.logCard]}>
                  <Text style={s.logIcon}>{cfg.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={s.logTop}>
                      <View style={[s.logTypeBadge, { backgroundColor: lc.bg }]}>
                        <Text style={[s.logTypeText, { color: lc.text }]}>{cfg.label}</Text>
                      </View>
                      <Text style={s.logDate}>{entry.logged_at.split("-").reverse().join("/")}</Text>
                    </View>
                    {!!entry.title && <Text style={s.logTitle}>{entry.title}</Text>}
                    {entry.value != null && (
                      <Text style={s.logValue}>{entry.value}{entry.unit ? ` ${entry.unit}` : ""}</Text>
                    )}
                    {!!entry.notes && <Text style={s.logNotes}>{entry.notes}</Text>}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] },

  hero:      { height: 240, backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroEmoji: { fontSize: 72 },

  content:   { padding: 16, gap: 12 },
  nameBlock: { gap: 2 },
  animalName:    { fontSize: text["2xl"], fontWeight: "700", color: colors.gray[900] },
  animalSpecies: { fontSize: text.sm, color: colors.gray[400] },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 14,
    ...shadow.sm,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat:      { width: "46%" },
  statLabel: { fontSize: text.xs, color: colors.gray[400], marginBottom: 2 },
  statValue: { fontSize: text.sm, fontWeight: "600", color: colors.gray[900] },

  sectionTitle: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.6 },
  notesText:    { fontSize: text.sm, color: colors.gray[600], marginTop: 6, lineHeight: 20 },
  emptyText:    { fontSize: text.sm, color: colors.gray[400], textAlign: "center", paddingVertical: 16 },

  logCard:    { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  logIcon:    { fontSize: 22, marginTop: 2 },
  logTop:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  logTypeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  logTypeText:  { fontSize: text.xs, fontWeight: "600" },
  logDate:    { fontSize: text.xs, color: colors.gray[400], marginLeft: "auto" },
  logTitle:   { fontSize: text.sm, fontWeight: "500", color: colors.gray[900] },
  logValue:   { fontSize: text.sm, color: colors.gray[600] },
  logNotes:   { fontSize: text.xs, color: colors.gray[500], marginTop: 2 },
});
