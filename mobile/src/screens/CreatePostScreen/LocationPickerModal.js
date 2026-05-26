import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const DEFAULT_REGION = {
  latitude: -33.9249,
  longitude: 18.4241,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function LocationPickerModal({ visible, onConfirm, onClose }) {
  const { colors, semantic } = useTheme();
  const mapRef = useRef(null);
  const regionRef = useRef(DEFAULT_REGION);

  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Acquire current location when modal opens
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    (async () => {
      setLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        // Instant: use the OS-cached position if available
        const last = await Location.getLastKnownPositionAsync({});
        if (last && !cancelled) {
          const next = {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          regionRef.current = next;
          setLocating(false);
          geocodeCenter(next.latitude, next.longitude);
          return;
        }

        // Fallback: network-based fix (WiFi/cell, ~1s vs GPS ~10s+)
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        if (!cancelled) {
          const next = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          regionRef.current = next;
          geocodeCenter(next.latitude, next.longitude);
        }
      } catch {
        // fall back to default region
      } finally {
        if (!cancelled) setLocating(false);
      }
    })();

    return () => { cancelled = true; };
  }, [visible]);

  const geocodeCenter = async (latitude, longitude) => {
    setGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const r = results?.[0];
      if (r) {
        const parts = [r.name, r.street, r.city ?? r.subregion, r.region]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i);
        setAddress(parts.join(", ") || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      } else {
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleRegionChange = () => {
    setDragging(true);
    setAddress("");
  };

  const handleRegionChangeComplete = (newRegion) => {
    regionRef.current = newRegion;
    setDragging(false);
    geocodeCenter(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: regionRef.current.latitude,
      longitude: regionRef.current.longitude,
      addressText: address,
    });
    handleClose();
  };

  const handleClose = () => {
    setAddress("");
    setDragging(false);
    onClose();
  };

  const canConfirm = !locating && !geocoding && !dragging;

  const footerLabel = dragging
    ? "Move the map to adjust…"
    : geocoding
    ? "Getting address…"
    : address || "Finding address…";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: semantic.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Pick a location
          </Text>
          <Pressable
            onPress={handleConfirm}
            disabled={!canConfirm}
            style={[
              styles.doneBtn,
              { backgroundColor: canConfirm ? colors.primary : colors.border },
            ]}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>

        {/* Map + fixed crosshair pin */}
        <View style={styles.mapWrap}>
          {locating ? (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Getting your location…
              </Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={regionRef.current}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton
              />

              {/* Fixed centre pin — stays still while map moves underneath */}
              <View pointerEvents="none" style={styles.pinContainer}>
                <Ionicons
                  name="location"
                  size={42}
                  color={colors.primary}
                  style={[
                    styles.pinIcon,
                    dragging && styles.pinIconLifted,
                  ]}
                />
                {/* Shadow dot below pin */}
                <View
                  style={[
                    styles.pinShadow,
                    { backgroundColor: colors.primary, opacity: dragging ? 0.15 : 0.25 },
                  ]}
                />
              </View>
            </>
          )}
        </View>

        {/* Address footer */}
        <View
          style={[
            styles.addressBar,
            {
              backgroundColor: semantic.cardBackground,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={colors.primary}
          />
          <Text
            style={[styles.addressLabel, { color: dragging ? colors.textMuted : colors.text }]}
            numberOfLines={2}
          >
            {footerLabel}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    ...Platform.select({
      android: { paddingTop: spacing.lg },
    }),
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  doneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  doneBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  mapWrap: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Absolutely centred over the map
  pinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pinIcon: {
    // The Ionicons location icon has its point at the bottom-centre.
    // Shift it up by half its height so the tip sits on the exact centre pixel.
    marginBottom: 42,
  },
  pinIconLifted: {
    transform: [{ translateY: -6 }],
  },
  pinShadow: {
    position: "absolute",
    // sits just below the centre point
    top: "50%",
    width: 10,
    height: 6,
    borderRadius: 5,
    marginTop: -3,
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 0.5,
    minHeight: 64,
  },
  addressLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
