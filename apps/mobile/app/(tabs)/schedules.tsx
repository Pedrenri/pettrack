import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert, StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";
import {
  type ScheduleItem, type Animal,
  dueStatus, dueSummary, scheduleFrequencyLabel, SCHEDULE_TYPE_CONFIG,
} from "@pettrack/core";
import { colors, radius, shadow, text, statusColors, scheduleTypeColors } from "@/lib/theme";
import React from "react";

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [animals, setAnimals] = useState<Record<string, Animal>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from("animal_schedules").select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes"),
      supabase.from("animals").select("id, name"),
    ]);
    setSchedules((s as ScheduleItem[]) ?? []);
    const map: Record<string, Animal> = {};
    ((a as Animal[]) ?? []).forEach((an) => (map[an.id] = an));
    setAnimals(map);
    setLoading(false);
  }

  async function markDone(item: ScheduleItem) {
    const date = new Date().toISOString().split("T")[0];
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", item.id);
    setSchedules((p) => p.map((s) => s.id === item.id ? { ...s, last_done: date } : s));
  }

  const sorted = [...schedules].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, ok: 3, done: 4 };
    return (order[dueStatus(a)] ?? 4) - (order[dueStatus(b)] ?? 4);
  });

  const needsAttention = sorted.filter(s => !["ok", "done"].includes(dueStatus(s))).length;

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color={colors.emerald[600]} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.heading}>Schedules</Text>
        {needsAttention > 0 && (
          <Text style={s.subheading}>{needsAttention} need attention</Text>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(s) => s.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📅</Text>
            <Text style={s.emptyText}>No schedules yet</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const status = dueStatus(item);
          const sc = statusColors[status];
          const cfg = SCHEDULE_TYPE_CONFIG[item.type];
          const tc = scheduleTypeColors[item.type] ?? scheduleTypeColors.custom;
          const animal = animals[item.animal_id];

          return (
            <View style={s.card}>
              {/* Left: status bar */}
              <View style={[s.statusBar, { backgroundColor: sc.dot }]} />

              <View style={s.cardInner}>
                {/* Top row: icon badge + name + done button */}
                <View style={s.row}>
                  <View style={[s.typeBadge, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                    <Text style={s.typeIcon}>{cfg?.icon ?? "📅"}</Text>
                    <Text style={[s.typeLabel, { color: tc.text }]}>{cfg?.label ?? item.type}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  {status !== "done" && (
                    <TouchableOpacity
                      style={s.doneBtn}
                      onPress={() =>
                        Alert.alert(
                          `Mark "${item.name}" done?`,
                          `This will record today (${new Date().toLocaleDateString("en-GB")}) as the completion date.`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "✓ Done", onPress: () => markDone(item) },
                          ],
                        )
                      }
                    >
                      <Text style={s.doneBtnText}>✓ Done</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Schedule name */}
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>

                {/* Meta */}
                <View style={s.row}>
                  <Text style={s.meta} numberOfLines={1}>
                    {animal?.name ?? "—"}{"  ·  "}{scheduleFrequencyLabel(item)}
                  </Text>
                </View>

                {/* Status chip */}
                <View style={[s.statusChip, { backgroundColor: sc.bg }]}>
                  <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                  <Text style={[s.statusText, { color: sc.text }]}>{dueSummary(item)}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] },
  header: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, flexDirection: "row", alignItems: "baseline", gap: 8 },
  heading:    { fontSize: text["2xl"], fontWeight: "700", color: colors.gray[900] },
  subheading: { fontSize: text.sm, color: colors.gray[400] },
  list:   { padding: 16 },
  empty:  { alignItems: "center", paddingTop: 64 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText:  { fontSize: text.sm, color: colors.gray[400] },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    flexDirection: "row",
    overflow: "hidden",
    ...shadow.sm,
  },
  statusBar:  { width: 4 },
  cardInner:  { flex: 1, padding: 14, gap: 6 },
  row:        { flexDirection: "row", alignItems: "center", gap: 8 },

  typeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  typeIcon:  { fontSize: 12 },
  typeLabel: { fontSize: text.xs, fontWeight: "600" },

  name: { fontSize: text.base, fontWeight: "600", color: colors.gray[900] },
  meta: { fontSize: text.sm, color: colors.gray[400], flex: 1 },

  statusChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: text.xs, fontWeight: "600" },

  doneBtn: {
    backgroundColor: colors.emerald[600],
    borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  doneBtnText: { color: colors.white, fontSize: text.sm, fontWeight: "700" },
});
