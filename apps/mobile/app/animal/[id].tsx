import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { supabase } from "@/lib/supabase";
import { calcAge, type Animal, type LogEntry, LOG_TYPE_CONFIG } from "@pettrack/core";

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
        .select("id, name, species_name, birthday, sex, weight, last_fed, last_shed, last_handled, notes, animal_photos(url)")
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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.animalEmoji}>🦎</Text>
          <Text style={styles.animalName}>{animal.name}</Text>
          {animal.species_name && <Text style={styles.species}>{animal.species_name}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {animal.birthday && <Stat label="Age" value={calcAge(animal.birthday)} />}
          {animal.sex && <Stat label="Sex" value={animal.sex} />}
          {animal.weight && <Stat label="Weight" value={`${animal.weight}g`} />}
          {animal.last_fed && <Stat label="Last fed" value={animal.last_fed.split("-").reverse().join("/")} />}
        </View>

        {/* Log */}
        <Text style={styles.sectionTitle}>Recent log</Text>
        {logs.length === 0 ? (
          <Text style={styles.empty}>No log entries yet</Text>
        ) : (
          logs.map((entry) => {
            const cfg = LOG_TYPE_CONFIG[entry.type] ?? LOG_TYPE_CONFIG.custom;
            return (
              <View key={entry.id} style={styles.logCard}>
                <Text style={styles.logIcon}>{cfg.icon}</Text>
                <View style={styles.logBody}>
                  <Text style={styles.logType}>{cfg.label}</Text>
                  {entry.title && <Text style={styles.logTitle}>{entry.title}</Text>}
                  {entry.notes && <Text style={styles.logNotes}>{entry.notes}</Text>}
                  <Text style={styles.logDate}>{entry.logged_at.split("-").reverse().join("/")}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, gap: 12 },
  header: { alignItems: "center", paddingVertical: 16 },
  animalEmoji: { fontSize: 48 },
  animalName: { fontSize: 24, fontWeight: "700", color: "#111827", marginTop: 8 },
  species: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
  },
  stat: { width: "46%" },
  statLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 },
  empty: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },
  logCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#fff", borderRadius: 14, padding: 12,
  },
  logIcon: { fontSize: 20 },
  logBody: { flex: 1 },
  logType: { fontSize: 12, fontWeight: "600", color: "#10b981" },
  logTitle: { fontSize: 14, fontWeight: "500", color: "#111827", marginTop: 1 },
  logNotes: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  logDate: { fontSize: 11, color: "#9ca3af", marginTop: 3 },
});
