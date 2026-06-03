import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Image, SafeAreaView, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { Animal } from "@pettrack/core";
import { calcAge } from "@pettrack/core";
import { colors, radius, shadow, text } from "@/lib/theme";
import React from "react";

export default function AnimalsScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("animals")
      .select("id, name, species_name, breed, birthday, last_fed, animal_photos(url)")
      .order("name")
      .then(({ data }) => {
        setAnimals((data as Animal[]) ?? []);
        setLoading(false);
      });
  }, []);

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
        <Text style={s.heading}>My Animals</Text>
      </View>
      <FlatList
        data={animals}
        keyExtractor={(a) => a.id}
        numColumns={2}
        contentContainerStyle={s.list}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🦎</Text>
            <Text style={s.emptyText}>No animals yet</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const photo = item.animal_photos?.[0]?.url;
          const meta = [
            item.species_name,
            item.birthday && calcAge(item.birthday),
          ].filter(Boolean).join(" · ");

          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/animal/${item.id}`)}
              activeOpacity={0.85}
            >
              <View style={s.photoBox}>
                {photo
                  ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : <Text style={s.photoEmoji}>🦎</Text>
                }
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                {!!meta && <Text style={s.cardMeta} numberOfLines={1}>{meta}</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.gray[50] },
  center:     { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[50] },
  header:     { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  heading:    { fontSize: text["2xl"], fontWeight: "700", color: colors.gray[900] },
  list:       { padding: 12 },
  empty:      { alignItems: "center", paddingTop: 64 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText:  { fontSize: text.sm, color: colors.gray[400] },

  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
    overflow: "hidden",
    ...shadow.sm,
  },
  photoBox: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoEmoji: { fontSize: 40 },
  cardBody:   { paddingHorizontal: 12, paddingVertical: 10 },
  cardName:   { fontSize: text.base, fontWeight: "600", color: colors.gray[900] },
  cardMeta:   { fontSize: text.xs, color: colors.gray[400], marginTop: 2 },
});
