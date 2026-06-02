import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import {
  type ScheduleItem, type Animal,
  dueStatus, dueSummary, scheduleFrequencyLabel, isAppointment,
} from "@pettrack/core";

const STATUS_COLOR: Record<string, string> = {
  overdue: "#ef4444",
  today:   "#f59e0b",
  soon:    "#eab308",
  ok:      "#10b981",
  done:    "#9ca3af",
};

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [animals, setAnimals] = useState<Record<string, Animal>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("animal_schedules")
        .select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes"),
      supabase
        .from("animals")
        .select("id, name, animal_photos(url)"),
    ]).then(([{ data: s }, { data: a }]) => {
      setSchedules((s as ScheduleItem[]) ?? []);
      const map: Record<string, Animal> = {};
      (a as Animal[] ?? []).forEach((animal) => (map[animal.id] = animal));
      setAnimals(map);
      setLoading(false);
    });
  }, []);

  async function markDone(item: ScheduleItem) {
    const date = new Date().toISOString().split("T")[0];
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", item.id);
    setSchedules((p) => p.map((s) => (s.id === item.id ? { ...s, last_done: date } : s)));
  }

  const sorted = [...schedules].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, ok: 3, done: 4 };
    return (order[dueStatus(a)] ?? 4) - (order[dueStatus(b)] ?? 4);
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Schedules</Text>
      <FlatList
        data={sorted}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const status = dueStatus(item);
          const animal = animals[item.animal_id];
          return (
            <View style={styles.card}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {animal?.name} · {scheduleFrequencyLabel(item)}
                </Text>
                <Text style={[styles.status, { color: STATUS_COLOR[status] }]}>
                  {dueSummary(item)}
                </Text>
              </View>
              {status !== "done" && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() =>
                    Alert.alert(
                      `Mark "${item.name}" done?`,
                      `Date: ${new Date().toLocaleDateString("en-GB")}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Done", onPress: () => markDone(item) },
                      ],
                    )
                  }
                >
                  <Text style={styles.doneBtnText}>✓</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 22, fontWeight: "700", color: "#111827", padding: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 1 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  doneBtn: {
    backgroundColor: "#10b981", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
