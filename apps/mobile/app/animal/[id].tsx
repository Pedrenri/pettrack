import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, ActivityIndicator,
  SafeAreaView, Image, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import {
  calcAge, type Animal, type LogEntry, type ScheduleItem,
  LOG_TYPE_CONFIG, LOG_TYPES, type LogType,
  dueStatus, dueSummary, scheduleFrequencyLabel, SCHEDULE_TYPE_CONFIG,
} from "@pettrack/core";
import { colors, radius, shadow, text, statusColors, scheduleTypeColors, logTypeColors } from "@/lib/theme";
import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type FullAnimal = Animal & {
  species_name_latin?: string | null;
  chip_id?: string | null;
  gender?: string | null;
  breed?: string | null;
  morph?: string | null;
};

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [animal, setAnimal] = useState<FullAnimal | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Log add modal
  const [logModal, setLogModal] = useState(false);
  const [logType, setLogType] = useState<LogType>("feeding");
  const [logForm, setLogForm] = useState({ title: "", value: "", notes: "" });
  const [logSaving, setLogSaving] = useState(false);

  const load = useCallback(async () => {
    const [{ data: a }, { data: l }, { data: s }] = await Promise.all([
      supabase.from("animals")
        .select("id, name, species_name, species_name_latin, breed, morph, chip_id, birthday, gender, sex, weight, last_fed, last_shed, last_handled, notes, animal_photos(url)")
        .eq("id", id).single(),
      supabase.from("animal_log")
        .select("id, logged_at, type, title, value, unit, notes")
        .eq("animal_id", id).order("logged_at", { ascending: false }).limit(20),
      supabase.from("animal_schedules")
        .select("id, animal_id, name, type, interval_days, weekdays, due_date, due_time, last_done, notes")
        .eq("animal_id", id),
    ]);
    if (a) {
      setAnimal(a as FullAnimal);
      navigation.setOptions({ title: (a as FullAnimal).name });
    }
    setLogs((l as LogEntry[]) ?? []);
    setSchedules((s as ScheduleItem[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function markScheduleDone(item: ScheduleItem) {
    const date = new Date().toISOString().split("T")[0];
    await supabase.from("animal_schedules").update({ last_done: date }).eq("id", item.id);
    setSchedules(p => p.map(s => s.id === item.id ? { ...s, last_done: date } : s));
  }

  async function saveLog() {
    setLogSaving(true);
    await supabase.from("animal_log").insert({
      animal_id: id,
      logged_at: new Date().toISOString().split("T")[0],
      type: logType,
      title: logForm.title || null,
      value: logForm.value ? parseFloat(logForm.value) : null,
      notes: logForm.notes || null,
    });
    const updates: Record<string, string> = {};
    if (logType === "feeding")  updates.last_fed     = new Date().toISOString().split("T")[0];
    if (logType === "shed")     updates.last_shed    = new Date().toISOString().split("T")[0];
    if (logType === "handling") updates.last_handled = new Date().toISOString().split("T")[0];
    if (Object.keys(updates).length) await supabase.from("animals").update(updates).eq("id", id);
    setLogForm({ title: "", value: "", notes: "" });
    setLogModal(false);
    setLogSaving(false);
    load();
  }

  if (loading || !animal) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color={colors.emerald[600]} size="large" />
      </SafeAreaView>
    );
  }

  const photo = animal.animal_photos?.[0]?.url;
  const allPhotos = animal.animal_photos ?? [];

  const stats = [
    animal.birthday            && { label: "Age",        value: calcAge(animal.birthday) },
    (animal.gender || animal.sex) && { label: "Sex",     value: animal.gender || animal.sex! },
    animal.weight              && { label: "Weight",     value: `${animal.weight}g` },
    animal.morph               && { label: "Morph",      value: animal.morph },
    animal.breed               && { label: "Breed",      value: animal.breed },
    animal.species_name_latin  && { label: "Scientific", value: animal.species_name_latin },
    animal.chip_id             && { label: "Chip ID",    value: animal.chip_id },
    animal.last_fed            && { label: "Last fed",   value: animal.last_fed.split("-").reverse().join("/") },
    animal.last_shed           && { label: "Last shed",  value: animal.last_shed.split("-").reverse().join("/") },
    animal.last_handled        && { label: "Last handled", value: animal.last_handled.split("-").reverse().join("/") },
  ].filter(Boolean) as { label: string; value: string }[];

  const sortedSchedules = [...schedules].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, soon: 2, ok: 3, done: 4 };
    return (order[dueStatus(a)] ?? 4) - (order[dueStatus(b)] ?? 4);
  });

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero photo */}
        {allPhotos.length > 1 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={s.heroScroll}>
            {allPhotos.map((p, i) => (
              <View key={i} style={s.heroSlide}>
                <Image source={{ uri: p.url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={s.hero}>
            {photo
              ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : <Text style={s.heroEmoji}>🦎</Text>
            }
          </View>
        )}

        <View style={s.content}>

          {/* Name + edit button */}
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.animalName}>{animal.name}</Text>
              {animal.species_name && (
                <Text style={s.animalSpecies}>
                  {animal.species_name}{animal.breed ? ` · ${animal.breed}` : ""}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => router.push(`/animal/edit/${id}`)}
            >
              <Text style={s.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          {stats.length > 0 && (
            <View style={s.card}>
              <View style={s.statsGrid}>
                {stats.map(({ label, value }) => (
                  <View key={label} style={s.stat}>
                    <Text style={s.statLabel}>{label}</Text>
                    <Text style={s.statValue} numberOfLines={1}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Schedules */}
          {sortedSchedules.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Schedules</Text>
              <View style={{ gap: 8 }}>
                {sortedSchedules.map(item => {
                  const status = dueStatus(item);
                  const sc = statusColors[status];
                  const cfg = SCHEDULE_TYPE_CONFIG[item.type];
                  const tc = scheduleTypeColors[item.type] ?? scheduleTypeColors.custom;
                  return (
                    <View key={item.id} style={[s.card, { flexDirection: "row", padding: 0, overflow: "hidden" }]}>
                      <View style={[s.scheduleBar, { backgroundColor: sc.dot }]} />
                      <View style={{ flex: 1, padding: 12, gap: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <View style={[s.typeBadge, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                            <Text style={{ fontSize: 11 }}>{cfg?.icon}</Text>
                            <Text style={[s.typeBadgeText, { color: tc.text }]}>{cfg?.label}</Text>
                          </View>
                          <View style={{ flex: 1 }} />
                          {status !== "done" && (
                            <TouchableOpacity
                              style={s.doneBtn}
                              onPress={() => Alert.alert(`Mark "${item.name}" done?`, "", [
                                { text: "Cancel", style: "cancel" },
                                { text: "✓ Done", onPress: () => markScheduleDone(item) },
                              ])}
                            >
                              <Text style={s.doneBtnText}>✓ Done</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={s.scheduleName}>{item.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={s.scheduleMeta}>{scheduleFrequencyLabel(item)}</Text>
                          <View style={[s.statusChip, { backgroundColor: sc.bg }]}>
                            <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                            <Text style={[s.statusText, { color: sc.text }]}>{dueSummary(item)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Log */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={s.sectionTitle}>Log</Text>
            <TouchableOpacity style={s.addLogBtn} onPress={() => setLogModal(true)}>
              <Text style={s.addLogBtnText}>+ Add entry</Text>
            </TouchableOpacity>
          </View>

          {logs.length === 0 ? (
            <Text style={s.emptyText}>No log entries yet</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {logs.map(entry => {
                const cfg = LOG_TYPE_CONFIG[entry.type] ?? LOG_TYPE_CONFIG.custom;
                const lc = logTypeColors[entry.type] ?? logTypeColors.custom;
                return (
                  <View key={entry.id} style={[s.card, { flexDirection: "row", gap: 12 }]}>
                    <Text style={{ fontSize: 22, marginTop: 2 }}>{cfg.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <View style={[s.logTypeBadge, { backgroundColor: lc.bg }]}>
                          <Text style={[s.logTypeText, { color: lc.text }]}>{cfg.label}</Text>
                        </View>
                        <Text style={s.logDate}>{entry.logged_at.split("-").reverse().join("/")}</Text>
                      </View>
                      {!!entry.title && <Text style={s.logTitle}>{entry.title}</Text>}
                      {entry.value != null && <Text style={s.logValue}>{entry.value}{entry.unit ? ` ${entry.unit}` : ""}</Text>}
                      {!!entry.notes && <Text style={s.logNotes}>{entry.notes}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Notes */}
          {!!animal.notes && (
            <>
              <Text style={s.sectionTitle}>Notes</Text>
              <View style={s.card}>
                <Text style={s.notesText}>{animal.notes}</Text>
              </View>
            </>
          )}

          {/* Delete */}
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => Alert.alert("Delete animal", `Are you sure you want to delete ${animal.name}? This cannot be undone.`, [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: async () => {
                await supabase.from("animals").delete().eq("id", id);
                router.replace("/(tabs)");
              }},
            ])}
          >
            <Text style={s.deleteBtnText}>Delete animal</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Add log modal */}
      <Modal visible={logModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLogModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setLogModal(false)}>
              <Text style={s.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>Add log entry</Text>
            <TouchableOpacity onPress={saveLog} disabled={logSaving}>
              <Text style={[s.modalSave, logSaving && { opacity: 0.4 }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.modalBody}>
            {/* Type pills */}
            <Text style={s.modalLabel}>TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                {LOG_TYPES.map(t => {
                  const cfg = LOG_TYPE_CONFIG[t];
                  const active = logType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[s.typePill, active && s.typePillActive]}
                      onPress={() => setLogType(t)}
                    >
                      <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
                      <Text style={[s.typePillText, active && s.typePillTextActive]}>{cfg.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Feeding */}
            {logType === "feeding" && (
              <>
                <Text style={s.modalLabel}>FOOD ITEM</Text>
                <TextInput style={s.modalInput} placeholder="e.g. Dubia roaches" placeholderTextColor={colors.gray[400]}
                  value={logForm.title} onChangeText={v => setLogForm(f => ({ ...f, title: v }))} />
                <Text style={[s.modalLabel, { marginTop: 12 }]}>QTY</Text>
                <TextInput style={s.modalInput} placeholder="5" placeholderTextColor={colors.gray[400]}
                  keyboardType="numeric" value={logForm.value} onChangeText={v => setLogForm(f => ({ ...f, value: v }))} />
              </>
            )}
            {logType === "weight" && (
              <>
                <Text style={s.modalLabel}>WEIGHT (g)</Text>
                <TextInput style={s.modalInput} placeholder="45" placeholderTextColor={colors.gray[400]}
                  keyboardType="numeric" value={logForm.value} onChangeText={v => setLogForm(f => ({ ...f, value: v }))} />
              </>
            )}
            {logType === "medical" && (
              <>
                <Text style={s.modalLabel}>DESCRIPTION</Text>
                <TextInput style={s.modalInput} placeholder="e.g. Vet check — City Exotic Vets" placeholderTextColor={colors.gray[400]}
                  value={logForm.title} onChangeText={v => setLogForm(f => ({ ...f, title: v }))} />
              </>
            )}
            {logType === "custom" && (
              <>
                <Text style={s.modalLabel}>TITLE</Text>
                <TextInput style={s.modalInput} placeholder="What happened?" placeholderTextColor={colors.gray[400]}
                  value={logForm.title} onChangeText={v => setLogForm(f => ({ ...f, title: v }))} />
              </>
            )}

            <Text style={[s.modalLabel, { marginTop: 12 }]}>NOTES</Text>
            <TextInput style={[s.modalInput, { height: 80, textAlignVertical: "top" }]}
              placeholder="Optional notes…" placeholderTextColor={colors.gray[400]}
              multiline value={logForm.notes} onChangeText={v => setLogForm(f => ({ ...f, notes: v }))} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] },

  hero:      { height: 260, backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroEmoji: { fontSize: 72 },
  heroScroll: { height: 260 },
  heroSlide: { width: 400, height: 260, backgroundColor: colors.gray[100] },

  content: { padding: 16, gap: 12 },

  nameRow:     { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  animalName:  { fontSize: text["2xl"], fontWeight: "700", color: colors.gray[900] },
  animalSpecies: { fontSize: text.sm, color: colors.gray[400], marginTop: 2 },

  editBtn:     { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 7, ...shadow.sm },
  editBtnText: { fontSize: text.sm, fontWeight: "600", color: colors.gray[700] },

  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray[100], padding: 14, ...shadow.sm },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat:      { width: "46%" },
  statLabel: { fontSize: text.xs, color: colors.gray[400], marginBottom: 2 },
  statValue: { fontSize: text.sm, fontWeight: "600", color: colors.gray[900] },

  sectionTitle: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 },
  notesText:    { fontSize: text.sm, color: colors.gray[600], lineHeight: 20 },
  emptyText:    { fontSize: text.sm, color: colors.gray[400], textAlign: "center", paddingVertical: 12 },

  scheduleBar: { width: 4 },
  typeBadge:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
  typeBadgeText: { fontSize: text.xs, fontWeight: "600" },
  scheduleName: { fontSize: text.sm, fontWeight: "600", color: colors.gray[900] },
  scheduleMeta: { fontSize: text.xs, color: colors.gray[400] },
  statusChip:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  statusDot:    { width: 5, height: 5, borderRadius: 3 },
  statusText:   { fontSize: text.xs, fontWeight: "600" },
  doneBtn:      { backgroundColor: colors.emerald[600], borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  doneBtnText:  { color: colors.white, fontSize: text.xs, fontWeight: "700" },

  addLogBtn:     { backgroundColor: colors.emerald[600], borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 6 },
  addLogBtnText: { color: colors.white, fontSize: text.xs, fontWeight: "700" },

  logTypeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  logTypeText:  { fontSize: text.xs, fontWeight: "600" },
  logDate:      { fontSize: text.xs, color: colors.gray[400], marginLeft: "auto" },
  logTitle:     { fontSize: text.sm, fontWeight: "500", color: colors.gray[900] },
  logValue:     { fontSize: text.sm, color: colors.gray[600] },
  logNotes:     { fontSize: text.xs, color: colors.gray[500], marginTop: 2 },

  deleteBtn:     { borderWidth: 1, borderColor: colors.red[500] + "40", borderRadius: radius.lg, padding: 16, alignItems: "center", marginTop: 8 },
  deleteBtnText: { fontSize: text.base, fontWeight: "600", color: colors.red[500] },

  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  modalCancel: { fontSize: text.base, color: colors.gray[500] },
  modalTitle:  { fontSize: text.base, fontWeight: "700", color: colors.gray[900] },
  modalSave:   { fontSize: text.base, fontWeight: "700", color: colors.emerald[600] },
  modalBody:   { padding: 20, gap: 4 },
  modalLabel:  { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  modalInput:  { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: text.sm, color: colors.gray[900] },

  typePill:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.white },
  typePillActive: { borderColor: colors.emerald[600], backgroundColor: colors.emerald[50] },
  typePillText:   { fontSize: text.sm, color: colors.gray[500], fontWeight: "500" },
  typePillTextActive: { color: colors.emerald[700], fontWeight: "600" },
});
