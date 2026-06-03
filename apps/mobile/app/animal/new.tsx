import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors, radius, shadow, text } from "@/lib/theme";

const GENDERS = ["male", "female", "unknown"];

export default function NewAnimalScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", species_name: "", breed: "", birthday: "", gender: "", notes: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert("Name is required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("animals").insert({
      user_id:      user.id,
      name:         form.name,
      species_name: form.species_name || null,
      breed:        form.breed || null,
      birthday:     form.birthday || null,
      gender:       form.gender || null,
      notes:        form.notes || null,
    });
    setSaving(false);
    if (error) { Alert.alert("Error", error.message); return; }
    router.back();
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.section}>
          <Text style={s.sectionTitle}>Identity</Text>

          <Field label="Name *">
            <TextInput style={s.input} value={form.name} onChangeText={v => set("name", v)}
              placeholder="e.g. Luna" placeholderTextColor={colors.gray[400]} autoFocus />
          </Field>

          <Field label="Species">
            <TextInput style={s.input} value={form.species_name} onChangeText={v => set("species_name", v)}
              placeholder="e.g. Leopard Gecko" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Breed / Morph">
            <TextInput style={s.input} value={form.breed} onChangeText={v => set("breed", v)}
              placeholder="e.g. Bell Albino" placeholderTextColor={colors.gray[400]} />
          </Field>

          <Field label="Sex">
            <View style={s.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity key={g} style={[s.genderBtn, form.gender === g && s.genderBtnActive]} onPress={() => set("gender", g)}>
                  <Text style={[s.genderText, form.gender === g && s.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Birth date">
            <TextInput style={s.input} value={form.birthday} onChangeText={v => set("birthday", v)}
              placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]} keyboardType="numbers-and-punctuation" />
          </Field>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <TextInput style={[s.input, { height: 100, textAlignVertical: "top" }]}
            value={form.notes} onChangeText={v => set("notes", v)}
            placeholder="Temperament, history, special care notes…"
            placeholderTextColor={colors.gray[400]} multiline />
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Add animal</Text>}
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
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  section: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray[100], padding: 16, gap: 14, ...shadow.sm },
  sectionTitle: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.6 },
  field:      { gap: 6 },
  fieldLabel: { fontSize: text.xs, fontWeight: "700", color: colors.gray[400], letterSpacing: 0.8, textTransform: "uppercase" },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: text.sm, color: colors.gray[900] },
  genderRow:        { flexDirection: "row", gap: 8 },
  genderBtn:        { flex: 1, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.gray[50], alignItems: "center" },
  genderBtnActive:  { borderColor: colors.emerald[600], backgroundColor: colors.emerald[50] },
  genderText:       { fontSize: text.sm, fontWeight: "500", color: colors.gray[500] },
  genderTextActive: { color: colors.emerald[700], fontWeight: "600" },
  actions:       { gap: 10, marginTop: 4 },
  saveBtn:       { backgroundColor: colors.emerald[600], borderRadius: radius.lg, paddingVertical: 16, alignItems: "center" },
  saveBtnText:   { color: "#fff", fontSize: text.base, fontWeight: "700" },
  cancelBtn:     { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray[200], paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: colors.gray[500], fontSize: text.base, fontWeight: "600" },
});
