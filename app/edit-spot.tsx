import * as Location from "expo-location";
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
import { updateSpot, useSpots, type SpotType } from "../src/store/spots";

const spotTypes: SpotType[] = ["beach", "jetty", "rocks", "estuary"];

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spots } = useSpots();

  const spot = spots.find((s) => s.id === id);

  const [name, setName] = useState(spot?.name ?? "");
  const [notes, setNotes] = useState(spot?.notes ?? "");
  const [type, setType] = useState<SpotType>(spot?.type ?? "jetty");
  const [lat, setLat] = useState<number | null>(spot?.lat ?? null);
  const [lng, setLng] = useState<number | null>(spot?.lng ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  async function getLocation() {
    try {
      setIsLocating(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    } catch {
      Alert.alert("Error", "Could not get location.");
    } finally {
      setIsLocating(false);
    }
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedNotes = notes.trim();

    if (!id || !spot) {
      Alert.alert("Error", "Spot not found.");
      return;
    }

    if (!trimmedName) {
      Alert.alert("Missing name", "Give the spot a name first.");
      return;
    }

    try {
      setIsSaving(true);

      await updateSpot(id, {
        name: trimmedName,
        notes: trimmedNotes,
        type,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
      });

      router.back();
    } catch {
      Alert.alert("Error", "Could not update spot.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!spot) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spot not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Spot</Text>

      <TextInput
        style={styles.input}
        placeholder="Spot name"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Notes"
        placeholderTextColor="#94a3b8"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Text style={styles.label}>Spot Type</Text>
      <View style={styles.typeRow}>
        {spotTypes.map((spotType) => (
          <Pressable
            key={spotType}
            style={[
              styles.typeChip,
              type === spotType && styles.typeChipActive,
            ]}
            onPress={() => setType(spotType)}
          >
            <Text
              style={[
                styles.typeChipText,
                type === spotType && styles.typeChipTextActive,
              ]}
            >
              {spotType}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.locButton} onPress={getLocation}>
        <Text style={styles.buttonText}>
          {isLocating ? "Getting location..." : "Update Current Location"}
        </Text>
      </Pressable>

      {lat != null && lng != null && (
        <Text style={styles.coords}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      )}

      <Pressable
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Text>
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
    marginBottom: 16,
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
  label: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  typeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#1f2937",
  },
  typeChipActive: {
    backgroundColor: "#2563eb",
  },
  typeChipText: {
    color: "#cbd5e1",
    textTransform: "capitalize",
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: "white",
  },
  locButton: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  coords: {
    color: "#60a5fa",
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
