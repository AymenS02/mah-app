// mobile/app/(tabs)/volunteering.jsx – Volunteer opportunities + log hours
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function OpportunityCard({ item, onSignUp, registeredIds }) {
  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const isRegistered = registeredIds.has(item._id);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>{dateStr}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>
      {item.volunteerSlots > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{item.volunteerSlots} slots available</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.signUpBtn, isRegistered && styles.signedUpBtn]}
        onPress={() => onSignUp(item)}
        disabled={isRegistered}
      >
        <Ionicons
          name={isRegistered ? "checkmark-circle" : "hand-left-outline"}
          size={16}
          color={isRegistered ? "#059669" : "#fff"}
        />
        <Text style={[styles.signUpBtnText, isRegistered && styles.signedUpBtnText]}>
          {isRegistered ? "Signed Up" : "Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HoursCard({ item }) {
  const date = new Date(item.date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <View style={styles.hoursCard}>
      <View style={styles.hoursLeft}>
        <Text style={styles.hoursNum}>{item.hours}h</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.hoursDesc}>{item.description}</Text>
        <Text style={styles.hoursMeta}>{date}</Text>
      </View>
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
    </View>
  );
}

export default function Volunteering() {
  const { user } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState([]);
  const [hours, setHours] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities"); // "opportunities" | "hours"
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [signUpItem, setSignUpItem] = useState(null);
  const [logForm, setLogForm] = useState({ description: "", hours: "", date: "" });
  const [logLoading, setLogLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const events = await api.get("/api/events");
      setOpportunities(events.filter((e) => e.isVolunteerOpportunity));
      setError("");
      if (user) {
        const [regs, hrs] = await Promise.all([
          api.get("/api/registrations"),
          api.get("/api/volunteer-hours"),
        ]);
        setRegisteredIds(new Set(regs.map((r) => r.eventId?._id || r.eventId)));
        setHours(hrs);
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

  function handleSignUp(item) {
    if (!user) {
      router.push("/login");
      return;
    }
    setSignUpItem(item);
  }

  async function confirmSignUp() {
    try {
      await api.post("/api/registrations", { eventId: signUpItem._id });
      setRegisteredIds((prev) => new Set([...prev, signUpItem._id]));
      setSignUpItem(null);
      Alert.alert("Signed up! 🎉", `You're signed up for "${signUpItem.title}".`);
    } catch (err) {
      setSignUpItem(null);
      Alert.alert("Error", err.message);
    }
  }

  async function handleLogHours() {
    if (!user) {
      router.push("/login");
      return;
    }
    setLogForm({ description: "", hours: "", date: new Date().toISOString().slice(0, 10) });
    setLogModalVisible(true);
  }

  async function submitHours() {
    const { description, hours: h, date } = logForm;
    if (!description.trim() || !h || !date) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    const parsedHours = parseFloat(h);
    if (isNaN(parsedHours) || parsedHours < 0.5 || parsedHours > 24) {
      Alert.alert("Error", "Hours must be between 0.5 and 24.");
      return;
    }
    setLogLoading(true);
    try {
      await api.post("/api/volunteer-hours", {
        description: description.trim(),
        hours: parsedHours,
        date,
      });
      await fetchData();
      setLogModalVisible(false);
      Alert.alert("Logged! ✅", "Your volunteer hours have been submitted for verification.");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLogLoading(false);
    }
  }

  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);
  const verifiedHours = hours.filter((h) => h.verified).reduce((sum, h) => sum + h.hours, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteering</Text>
        {user && activeTab === "hours" && (
          <TouchableOpacity style={styles.logBtn} onPress={handleLogHours}>
            <Ionicons name="add" size={20} color="#003837" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "opportunities" && styles.tabBtnActive]}
          onPress={() => setActiveTab("opportunities")}
        >
          <Text style={[styles.tabBtnText, activeTab === "opportunities" && styles.tabBtnTextActive]}>
            Opportunities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "hours" && styles.tabBtnActive]}
          onPress={() => setActiveTab("hours")}
        >
          <Text style={[styles.tabBtnText, activeTab === "hours" && styles.tabBtnTextActive]}>
            My Hours
          </Text>
        </TouchableOpacity>
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
      ) : activeTab === "opportunities" ? (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OpportunityCard item={item} onSignUp={handleSignUp} registeredIds={registeredIds} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003837" />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="hand-left-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No volunteer opportunities right now.</Text>
            </View>
          }
        />
      ) : (
        /* My Hours tab */
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003837" />
          }
        >
          {!user ? (
            <View style={styles.centerBox}>
              <Ionicons name="lock-closed-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Sign in to view and log volunteer hours.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => router.push("/login")}>
                <Text style={styles.retryText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNum}>{totalHours.toFixed(1)}</Text>
                  <Text style={styles.summaryLabel}>Total Hours</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: "#d1fae5" }]}>
                  <Text style={[styles.summaryNum, { color: "#059669" }]}>{verifiedHours.toFixed(1)}</Text>
                  <Text style={styles.summaryLabel}>Verified</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logHoursBtn} onPress={handleLogHours}>
                <Ionicons name="add-circle-outline" size={18} color="#FFD000" />
                <Text style={styles.logHoursBtnText}>Log New Hours</Text>
              </TouchableOpacity>

              {hours.length === 0 ? (
                <View style={styles.centerBox}>
                  <Ionicons name="time-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>No hours logged yet.</Text>
                </View>
              ) : (
                hours.map((item) => <HoursCard key={item._id} item={item} />)
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Sign-up confirmation modal */}
      <Modal visible={!!signUpItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sign Up to Volunteer</Text>
            <Text style={styles.modalBody}>
              Sign up for{" "}
              <Text style={{ fontWeight: "700" }}>{signUpItem?.title}</Text>?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setSignUpItem(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmSignUp}>
                <Text style={styles.modalConfirmText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Log hours modal */}
      <Modal visible={logModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Log Volunteer Hours</Text>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="What did you do?"
                placeholderTextColor="#9ca3af"
                value={logForm.description}
                onChangeText={(v) => setLogForm((f) => ({ ...f, description: v }))}
              />
              <Text style={styles.inputLabel}>Hours (0.5 – 24)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2.5"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={logForm.hours}
                onChangeText={(v) => setLogForm((f) => ({ ...f, hours: v }))}
              />
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2025-04-15"
                placeholderTextColor="#9ca3af"
                value={logForm.date}
                onChangeText={(v) => setLogForm((f) => ({ ...f, date: v }))}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setLogModalVisible(false)}
                  disabled={logLoading}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirm, logLoading && { opacity: 0.6 }]}
                  onPress={submitHours}
                  disabled={logLoading}
                >
                  {logLoading ? (
                    <ActivityIndicator color="#FFD000" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: "#003837",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  logBtn: {
    backgroundColor: "#FFD000",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: "#003837" },
  tabBtnText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  tabBtnTextActive: { color: "#003837" },
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
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 6 },
  cardDesc: { fontSize: 14, color: "#6b7280", lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { fontSize: 13, color: "#6b7280" },
  signUpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  signUpBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  signedUpBtn: { backgroundColor: "#d1fae5" },
  signedUpBtnText: { color: "#059669" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryNum: { fontSize: 28, fontWeight: "800", color: "#003837" },
  summaryLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  logHoursBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#003837",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  logHoursBtnText: { color: "#FFD000", fontWeight: "700", fontSize: 15 },
  hoursCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  hoursLeft: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  hoursNum: { fontSize: 16, fontWeight: "800", color: "#003837" },
  hoursDesc: { fontSize: 14, fontWeight: "600", color: "#111827" },
  hoursMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { fontSize: 11, color: "#059669", fontWeight: "700" },
  centerBox: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
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
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
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