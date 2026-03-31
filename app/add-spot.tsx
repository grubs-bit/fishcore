import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addSpot } from "../src/store/spots";

export default function AddSpotScreen() {
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();

  const [name, setName] = useState("");
  const [type, setType] = useState<"beach" | "jetty" | "rocks" | "estuary">(
    "beach",
  );
  const [notes, setNotes] = useState("");

  const lat = params.lat ? Number(params.lat) : null;
  const lng = params.lng ? Number(params.lng) : null;

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing name", "Enter a spot name.");
      return;
    }

    addSpot({
      name: name.trim(),
      type,
      notes: notes.trim(),
      lat,
      lng,
    });

    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Spot</Text>

      <TextInput
        style={styles.input}
        placeholder="Spot name"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Spot Type</Text>

      <View style={styles.typeRow}>
        {["beach", "jetty", "rocks", "estuary"].map((t) => (
          <Pressable
            key={t}
            style={[styles.typeButton, type === t && styles.typeSelected]}
            onPress={() => setType(t as any)}
          >
            <Text style={styles.typeText}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.mapButton}
        onPress={() =>
          router.push({
            pathname: "/map-picker",
            params: lat && lng ? { lat: String(lat), lng: String(lng) } : {},
          })
        }
      >
        <Text style={styles.buttonText}>
          {lat && lng ? "Change Location" : "Pick Location on Map"}
        </Text>
      </Pressable>

      {lat && lng && (
        <Text style={styles.coords}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      )}

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Notes"
        placeholderTextColor="#94a3b8"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Spot</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    color: "#94a3b8",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeSelected: {
    backgroundColor: "#2563eb",
  },
  typeText: {
    color: "white",
    textTransform: "capitalize",
  },
  mapButton: {
    backgroundColor: "#374151",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  coords: {
    color: "#60a5fa",
    marginBottom: 12,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
