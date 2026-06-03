import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { calcAge } from "@pettrack/core";
import { colors, radius, shadow, text } from "@/lib/theme";

type Form = {
  name: string;
  species_name: string;
  breed: string;
  species_name_latin: string;
  birthday: string;
  chip_id: string;
  gender: string;
  notes: string;
};

const GENDERS = ["male", "female", "unknown"];

export default function EditAnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    name: "", species_name: "", breed: "", species_name_latin: "",
    birthday: "", chip_id: "", gender: "", notes: "",
  });

  useEffect(() => {
    supabase.from("animals")
      .select("name, species_name, breed, species_name_latin, birthday, chip_id, gender, notes")
      .eq("id", id).single()
      .then(({ data }) => {
        if (data) setForm({
          name:               data.name ?? "",
          species_name:       data.species_name ?? "",
          breed:              data.breed ?? "",
          species_name_latin: (data as any).species_name_latin ?? "",
          birthday:           data.birthday ?? "",
          chip_id:            (data as any).chip_id ?? "",
          gender:             (data as any).gender ?? "",
          notes:              data.notes ?? "",
        });
        setLoading(false);
      });
  }, [id]);

  function set(key: keyof Form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert("Name is required"); return; }
    setSaving(true);
    await supabase.from("animals").update({
      name:               form.name,
      species_name:       form.species_name || null,
      breed:              form.breed || null,
      species_name_latin: form.species_name_latin || null,
      birthday:           form.birthday || null,
      chip_id:            form.chip_id || null,
      gender:             form.gender || null,
      notes:              form.notes || null,
    }).eq("id", id);
    setSaving(false);
    router.back();
  }

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color={colors.emerald[600]} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Identity ─────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Identity</Text>

          <Field label="Name *">
            <TextInput style={s.input} value={form.name} onChangeText={v => set("name", v)}
              placeholder="e.g. Luna" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Species">
            <TextInput style={s.input} value={form.species_name} onChangeText={v => set("species_name", v)}
              placeholder="e.g. Leopard Gecko" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Breed / Morph">
            <TextInput style={s.input} value={form.breed} onChangeText={v => set("breed", v)}
              placeholder="e.g. Bell Albino" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Scientific name">
            <TextInput style={[s.input, { fontStyle: "italic" }]} value={form.species_name_latin}
              onChangeText={v => set("species_name_latin", v)}
              placeholder="e.g. Eublepharis macularius" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Sex">
            <View style={s.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.genderBtn, form.gender === g && s.genderBtnActive]}
                  onPress={() => set("gender", g)}
                >
                  <Text style={[s.genderText, form.gender === g && s.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>
        </View>

        {/* ── Details ──────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Details</Text>

          <Field label={`Birth date${form.birthday ? `  ·  ${calcAge(form.birthday)}` : ""}`}>
            <TextInput style={s.input} value={form.birthday} onChangeText={v => set("birthday", v)}
              placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]}
              keyboardType="numbers-and-punctuation" />
          </Field>

          <Field label="Microchip ID">
            <TextInput style={s.input} value={form.chip_id} onChangeText={v => set("chip_id", v)}
              placeholder="40028922" placeholderTextColor={colors.gray[400]} />
          </Field>
        </View>

        {/* ── Notes ────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <TextInput
            style={[s.input, { height: 100, textAlignVertical: "top" }]}
            value={form.notes} onChangeText={v => set("notes", v)}
            placeholder="Temperament, history, special care notes…"
            placeholderTextColor={colors.gray[400]}
            multiline
          />
        </View>

        {/* ── Actions ──────────────────────────────────── */}
        <View style={s.actions}>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Save changes</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  section: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 16,
    gap: 14,
    ...shadow.sm,
  },
  sectionTitle: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.6 },

  field:      { gap: 6 },
  fieldLabel: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], letterSpacing: 0.8, textTransform: "uppercase" },
  input: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: text.sm,
    color: colors.gray[900],
  },

  genderRow:       { flexDirection: "row", gap: 8 },
  genderBtn:       { flex: 1, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.gray[50], alignItems: "center" },
  genderBtnActive: { borderColor: colors.emerald[600], backgroundColor: colors.emerald[50] },
  genderText:      { fontSize: text.sm, fontWeight: "500", color: colors.gray[500] },
  genderTextActive:{ color: colors.emerald[700], fontWeight: "600" },

  actions:   { gap: 10, marginTop: 4 },
  saveBtn:   { backgroundColor: colors.emerald[600], borderRadius: radius.lg, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: text.base, fontWeight: "700" },
  cancelBtn:   { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray[200], paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: colors.gray[500], fontSize: text.base, fontWeight: "600" },
});
