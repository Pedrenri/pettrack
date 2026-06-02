import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { Animal } from "@pettrack/core";
import { calcAge } from "@pettrack/core";

export default function AnimalsScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("animals")
      .select("id, name, species_name, birthday, last_fed, animal_photos(url)")
      .order("name")
      .then(({ data }) => {
        setAnimals((data as Animal[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My Animals</Text>
      <FlatList
        data={animals}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/animal/${item.id}`)}
          >
            <Text style={styles.emoji}>🦎</Text>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {[item.species_name, item.birthday && calcAge(item.birthday)]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              {item.last_fed && (
                <Text style={styles.sub}>
                  Last fed {item.last_fed.split("-").reverse().join("/")}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
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
  emoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 1 },
  sub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});
