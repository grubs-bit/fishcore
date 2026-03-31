import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

export default function MapPickerScreen() {
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
  }>();

  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    params.lat && params.lng
      ? {
          latitude: Number(params.lat),
          longitude: Number(params.lng),
        }
      : null,
  );

  function handlePress(e: MapPressEvent) {
    setMarker(e.nativeEvent.coordinate);
  }

  function handleConfirm() {
    if (!marker) return;

    router.replace({
      pathname: "/add-spot",
      params: {
        lat: marker.latitude.toString(),
        lng: marker.longitude.toString(),
      },
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: marker?.latitude ?? 15.4909, // Goa default
          longitude: marker?.longitude ?? 73.8278,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      <Pressable style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>
          {marker ? "Confirm Location" : "Tap map to select"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
