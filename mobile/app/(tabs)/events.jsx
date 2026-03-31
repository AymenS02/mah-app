// mobile/app/(tabs)/events.jsx – Events list with registration
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function EventCard({ item, onRegister, registeredIds }) {
  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  const isRegistered = registeredIds.has(item._id);

  return (
    <View style={styles.card}>
      {item.isVolunteerOpportunity && (
        <View style={styles.volunteerBadge}>
          <Ionicons name="hand-left-outline" size={12} color="#059669" />
          <Text style={styles.volunteerBadgeText}>Volunteer Opportunity</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>{dateStr} · {timeStr}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>
      {item.volunteerSlots > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{item.volunteerSlots} volunteer slots</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.registerBtn, isRegistered && styles.registeredBtn]}
        onPress={() => onRegister(item)}
        disabled={isRegistered}
      >
        <Ionicons
          name={isRegistered ? "checkmark-circle" : "add-circle-outline"}
          size={16}
          color={isRegistered ? "#059669" : "#fff"}
        />
        <Text style={[styles.registerBtnText, isRegistered && styles.registeredBtnText]}>
          {isRegistered ? "Registered" : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Events() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const eventsData = await api.get("/api/events");
      setEvents(eventsData);
      setError("");
      if (user) {
        const regs = await api.get("/api/registrations");
        setRegisteredIds(new Set(regs.map((r) => r.eventId?._id || r.eventId)));
      }
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  async function handleRegister(event) {
    if (!user) {
      router.push("/login");
      return;
    }
    setSelectedEvent(event);
  }

  async function confirmRegister() {
    try {
      await api.post("/api/registrations", { eventId: selectedEvent._id });
      setRegisteredIds((prev) => new Set([...prev, selectedEvent._id]));
      setSelectedEvent(null);
      Alert.alert("Registered! 🎉", `You are now registered for "${selectedEvent.title}".`);
    } catch (err) {
      setSelectedEvent(null);
      Alert.alert("Error", err.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>Upcoming MAH events</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#003837" />
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <EventCard item={item} onRegister={handleRegister} registeredIds={registeredIds} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003837" />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No upcoming events.</Text>
            </View>
          }
        />
      )}

      {/* Registration confirmation modal */}
      <Modal visible={!!selectedEvent} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Registration</Text>
            <Text style={styles.modalBody}>
              Register for{" "}
              <Text style={{ fontWeight: "700" }}>{selectedEvent?.title}</Text>?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setSelectedEvent(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmRegister}>
                <Text style={styles.modalConfirmText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: "#003837",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSubtitle: { fontSize: 13, color: "#78dcca", marginTop: 2 },
  list: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  volunteerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
    backgroundColor: "#d1fae5",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  volunteerBadgeText: { fontSize: 11, fontWeight: "700", color: "#059669" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 6 },
  cardDesc: { fontSize: 14, color: "#6b7280", lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { fontSize: 13, color: "#6b7280" },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#003837",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  registerBtnText: { color: "#FFD000", fontWeight: "700", fontSize: 14 },
  registeredBtn: { backgroundColor: "#d1fae5" },
  registeredBtnText: { color: "#059669" },
  centerBox: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, color: "#9ca3af", marginTop: 12, textAlign: "center" },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#003837",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#FFD000", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#003837", marginBottom: 8 },
  modalBody: { fontSize: 15, color: "#374151", marginBottom: 20, lineHeight: 22 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  modalCancelText: { color: "#374151", fontWeight: "600" },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#003837",
    alignItems: "center",
  },
  modalConfirmText: { color: "#FFD000", fontWeight: "700" },
});