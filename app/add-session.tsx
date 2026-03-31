import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getMoonPhase } from "../src/lib/moon";
import { getTides } from "../src/lib/tides";
import { getWeather } from "../src/lib/weather";
import { addSession } from "../src/store/sessions";
import { useSpots } from "../src/store/spots";

export default function AddSessionScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const { spots } = useSpots();

  const spot = useMemo(() => {
    return spots.find((s) => s.id === spotId);
  }, [spots, spotId]);

  const [bait, setBait] = useState("");
  const [species, setSpecies] = useState("");
  const [count, setCount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const trimmedBait = bait.trim();
    const trimmedSpecies = species.trim();
    const trimmedNotes = notes.trim();
    const parsedCount = Number(count);

    if (!spotId || !spot) {
      Alert.alert("Error", "Missing spot.");
      return;
    }

    if (!trimmedSpecies) {
      Alert.alert("Missing species", "Enter the fish species.");
      return;
    }

    if (!count.trim() || Number.isNaN(parsedCount) || parsedCount < 0) {
      Alert.alert("Invalid count", "Enter a valid catch count.");
      return;
    }

    if (spot.lat == null || spot.lng == null) {
      Alert.alert(
        "Missing coordinates",
        "This spot needs saved coordinates before auto-capturing conditions.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const [weather, tides] = await Promise.all([
        getWeather(spot.lat, spot.lng),
        getTides(spot.lat, spot.lng),
      ]);

      const moon = getMoonPhase();

      let tideState = tides.tideTrend;

      if (tides.nextHigh?.time) {
        const highTime = new Date(tides.nextHigh.time).getTime();
        const now = Date.now();
        const diffHours = (highTime - now) / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours <= 2) {
          tideState = "Near high tide";
        }
      }

      if (tides.nextLow?.time) {
        const lowTime = new Date(tides.nextLow.time).getTime();
        const now = Date.now();
        const diffHours = (lowTime - now) / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours <= 2) {
          tideState = "Near low tide";
        }
      }

      await addSession({
        spotId,
        bait: trimmedBait,
        species: trimmedSpecies,
        count: parsedCount,
        notes: trimmedNotes,
        moonPhase: moon.phaseName,
        tideState,
        tideLevel: tides.currentHeight ?? null,
        waveHeight: tides.currentWaveHeight ?? null,
        windSpeed: weather.windSpeed ?? null,
        pressure: weather.pressure ?? null,
        temperature: weather.temperature ?? null,
      });

      router.back();
    } catch {
      Alert.alert("Error", "Could not save session with conditions.");
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
      <Text style={styles.title}>Add Session</Text>
      <Text style={styles.subtle}>Spot: {spot.name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Bait / Lure"
        placeholderTextColor="#94a3b8"
        value={bait}
        onChangeText={setBait}
      />

      <TextInput
        style={styles.input}
        placeholder="Species"
        placeholderTextColor="#94a3b8"
        value={species}
        onChangeText={setSpecies}
      />

      <TextInput
        style={styles.input}
        placeholder="Catch count"
        placeholderTextColor="#94a3b8"
        value={count}
        onChangeText={setCount}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Notes"
        placeholderTextColor="#94a3b8"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Text style={styles.helper}>
        Saving will auto-capture moon phase, tide state, tide level, wave
        height, wind, pressure, and temperature.
      </Text>

      <Pressable
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? "Capturing conditions..." : "Save Session"}
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
    marginBottom: 8,
  },
  subtle: {
    color: "#94a3b8",
    fontSize: 14,
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
  helper: {
    color: "#93c5fd",
    fontSize: 13,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
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
