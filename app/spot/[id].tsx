import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getFishingInsight } from "../../src/lib/fishingEngine";
import { getTackleRecommendation } from "../../src/lib/tackle";
import {
  formatTideTime,
  getTides,
  type TideSummary,
} from "../../src/lib/tides";
import { getWeather, type WeatherData } from "../../src/lib/weather";
import {
  deleteSessionsForSpot,
  formatSessionTime,
  getSessionInsights,
  useSessions,
} from "../../src/store/sessions";
import { deleteSpot, useSpots } from "../../src/store/spots";

function getScoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#facc15";
  return "#ef4444";
}

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spots } = useSpots();
  const { sessions } = useSessions();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tides, setTides] = useState<TideSummary | null>(null);

  const spot = spots.find((s) => s.id === id);

  const spotSessions = useMemo(
    () => sessions.filter((s) => s.spotId === id),
    [sessions, id],
  );

  const insight = useMemo(() => {
    if (!spot) return null;
    return getFishingInsight(weather, tides, spot.type);
  }, [weather, tides, spot]);

  const tackle = useMemo(() => {
    if (!spot) return null;
    return getTackleRecommendation(
      spot.type,
      tides?.currentWaveHeight ?? null,
      weather?.windSpeed ?? null,
    );
  }, [spot, tides, weather]);

  const personalInsights = useMemo(() => {
    return getSessionInsights(spotSessions);
  }, [spotSessions]);

  useEffect(() => {
    if (!spot?.lat || !spot?.lng) return;

    getWeather(spot.lat, spot.lng)
      .then(setWeather)
      .catch(() => {});
    getTides(spot.lat, spot.lng)
      .then(setTides)
      .catch(() => {});
  }, [spot]);

  async function handleDelete() {
    if (!spot) return;

    Alert.alert("Delete Spot", `Delete "${spot.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSessionsForSpot(spot.id);
          await deleteSpot(spot.id);
          router.replace("/");
        },
      },
    ]);
  }

  if (!spot) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Spot not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={spotSessions}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.subtle}>{spot.notes || "No notes"}</Text>

          <Text style={styles.type}>{spot.type.toUpperCase()}</Text>

          {spot.lat && spot.lng && (
            <Text style={styles.coords}>
              {spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}
            </Text>
          )}

          <View style={styles.row}>
            <Pressable style={styles.btnSecondary}>
              <Text style={styles.btnText}>Edit</Text>
            </Pressable>

            <Pressable style={styles.btnDanger} onPress={handleDelete}>
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.push(`/add-session?spotId=${spot.id}`)}
          >
            <Text style={styles.btnText}>Add Session</Text>
          </Pressable>

          {/* CONDITIONS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌊 Conditions</Text>

            {insight ? (
              <>
                <Text
                  style={[
                    styles.score,
                    { color: getScoreColor(insight.score) },
                  ]}
                >
                  {insight.rating} • {insight.score}/100
                </Text>

                <View style={styles.divider} />

                <Text style={styles.text}>🌙 Moon: {insight.moonPhase}</Text>

                {insight.reasons.map((r, i) => (
                  <Text key={i} style={styles.subtle}>
                    • {r}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.subtle}>Fetching conditions...</Text>
            )}
          </View>

          {/* PERSONAL INSIGHTS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧠 Insights</Text>

            {personalInsights.totalSessions === 0 ? (
              <Text style={styles.subtle}>No data yet. Log sessions.</Text>
            ) : (
              <>
                <Text style={styles.text}>
                  Sessions: {personalInsights.totalSessions}
                </Text>
                <Text style={styles.text}>
                  Catches: {personalInsights.totalCatches}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.text}>
                  🎣 Best bait: {personalInsights.bestBait ?? "-"}
                </Text>
                <Text style={styles.text}>
                  🐟 Top species: {personalInsights.topSpecies ?? "-"}
                </Text>
                <Text style={styles.text}>
                  🌊 Tide: {personalInsights.bestTideState ?? "-"}
                </Text>
                <Text style={styles.text}>
                  🌙 Moon: {personalInsights.bestMoonPhase ?? "-"}
                </Text>
              </>
            )}
          </View>

          {/* TACKLE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎣 Tackle</Text>

            {tackle ? (
              <>
                <Text style={styles.text}>Bait: {tackle.baitType}</Text>
                <Text style={styles.text}>
                  Sinker: {tackle.sinkerRangeGrams}
                </Text>
                <Text style={styles.text}>Waves: {tackle.waveForce}</Text>
              </>
            ) : (
              <Text style={styles.subtle}>Calculating...</Text>
            )}
          </View>

          {/* WEATHER */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌤 Weather</Text>

            {weather ? (
              <>
                <Text style={styles.text}>
                  🌡 {weather.temperature ?? "-"}°C
                </Text>
                <Text style={styles.text}>
                  💨 {weather.windSpeed ?? "-"} km/h
                </Text>
                <Text style={styles.text}>⬇ {weather.pressure ?? "-"} hPa</Text>
              </>
            ) : (
              <Text style={styles.subtle}>Fetching...</Text>
            )}
          </View>

          {/* TIDES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌊 Tides</Text>

            {tides ? (
              <>
                <Text style={styles.text}>
                  Level: {tides.currentHeight?.toFixed(2) ?? "-"} m
                </Text>
                <Text style={styles.text}>
                  Waves: {tides.currentWaveHeight?.toFixed(2) ?? "-"} m
                </Text>

                <View style={styles.divider} />

                <Text style={styles.text}>
                  High:{" "}
                  {tides.nextHigh ? formatTideTime(tides.nextHigh.time) : "-"}
                </Text>

                <Text style={styles.text}>
                  Low:{" "}
                  {tides.nextLow ? formatTideTime(tides.nextLow.time) : "-"}
                </Text>
              </>
            ) : (
              <Text style={styles.subtle}>Fetching...</Text>
            )}
          </View>

          <Text style={styles.section}>Sessions</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.session}>
          <Text style={styles.sessionTitle}>
            {item.species} • {item.count}
          </Text>

          <Text style={styles.subtle}>{formatSessionTime(item.createdAt)}</Text>

          {item.bait ? <Text style={styles.text}>🎣 {item.bait}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 16 },

  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtle: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 4,
  },

  text: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 4,
  },

  type: {
    color: "#93c5fd",
    marginBottom: 6,
  },

  coords: {
    color: "#60a5fa",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  btnPrimary: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  btnSecondary: {
    flex: 1,
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  btnDanger: {
    flex: 1,
    backgroundColor: "#b91c1c",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 8,
  },

  score: {
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },

  session: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  sessionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
  },
});
