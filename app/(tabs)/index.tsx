import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSpots } from "../../src/store/spots";

export default function HomeScreen() {
  const { spots, isLoading } = useSpots();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fishcore</Text>
      <Text style={styles.subtitle}>Build it yourself core.</Text>

      <Pressable style={styles.button} onPress={() => router.push("/add-spot")}>
        <Text style={styles.buttonText}>Add Spot</Text>
      </Pressable>

      {isLoading ? (
        <Text style={styles.emptyText}>Loading spots...</Text>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No spots yet. Add your first one.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/spot/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>{item.notes || "No notes"}</Text>

              {item.lat != null && item.lng != null ? (
                <Text style={styles.coords}>
                  {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                </Text>
              ) : (
                <Text style={styles.noCoords}>No saved coordinates</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0b1220",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "white",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 4,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  cardText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 4,
  },
  coords: {
    color: "#60a5fa",
    fontSize: 13,
    marginTop: 6,
  },
  noCoords: {
    color: "#f59e0b",
    fontSize: 13,
    marginTop: 6,
  },
});
