// mobile/app/(tabs)/account.jsx – Profile, login prompt, logout
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

function HoursRow({ item }) {
  const date = new Date(item.date).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <View style={styles.hoursRow}>
      <View style={styles.hoursIcon}>
        <Text style={styles.hoursIconText}>{item.hours}h</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.hoursDesc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.hoursMeta}>{date}</Text>
      </View>
      {item.verified && (
        <Ionicons name="checkmark-circle" size={18} color="#059669" />
      )}
    </View>
  );
}

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hours, setHours] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const [hrs, regs] = await Promise.all([
        api.get("/api/volunteer-hours"),
        api.get("/api/registrations"),
      ]);
      setHours(hrs.slice(0, 5)); // show latest 5
      setRegistrations(regs.slice(0, 5));
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    })();
  }, [fetchProfile]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        <View style={styles.guestBox}>
          <View style={styles.guestIcon}>
            <Ionicons name="person-outline" size={40} color="#9ca3af" />
          </View>
          <Text style={styles.guestTitle}>Sign in to your account</Text>
          <Text style={styles.guestSub}>
            Create an account or sign in to register for events and track volunteer hours.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/login")}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push("/register")}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);
  const verifiedHours = hours.filter((h) => h.verified).reduce((sum, h) => sum + h.hours, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        {user.role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#003837" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003837" />
          }
        >
          {/* Profile card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          {/* Hours summary */}
          <Text style={styles.sectionTitle}>Volunteer Hours</Text>
          <View style={styles.hoursStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalHours.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#d1fae5" }]}>
              <Text style={[styles.statNum, { color: "#059669" }]}>{verifiedHours.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#fef3c7" }]}>
              <Text style={[styles.statNum, { color: "#d97706" }]}>
                {(totalHours - verifiedHours).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {hours.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>Recent Entries</Text>
              {hours.map((item) => (
                <HoursRow key={item._id} item={item} />
              ))}
            </>
          )}

          {/* Registered events */}
          {registrations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Registered Events</Text>
              {registrations.map((reg) => (
                <View key={reg._id} style={styles.regCard}>
                  <Ionicons name="calendar-outline" size={16} color="#003837" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.regTitle}>{reg.eventId?.title || "Event"}</Text>
                    {reg.eventId?.date && (
                      <Text style={styles.regMeta}>
                        {new Date(reg.eventId.date).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Sign out */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  adminBadge: {
    backgroundColor: "#FFD000",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700", color: "#003837" },
  scrollContent: { padding: 16, paddingBottom: 120 },
  guestBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  guestIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
  guestSub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#003837",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  loginBtnText: { color: "#FFD000", fontWeight: "700", fontSize: 16 },
  registerBtn: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#003837",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  registerBtnText: { color: "#003837", fontWeight: "700", fontSize: 16 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#003837",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFD000", fontSize: 20, fontWeight: "800" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  profileEmail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 10, marginTop: 4 },
  subSectionTitle: { fontSize: 14, fontWeight: "600", color: "#6b7280", marginBottom: 8, marginTop: 10 },
  hoursStats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: "#003837" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  hoursIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  hoursIconText: { fontSize: 13, fontWeight: "800", color: "#003837" },
  hoursDesc: { fontSize: 14, fontWeight: "600", color: "#111827" },
  hoursMeta: { fontSize: 12, color: "#9ca3af", marginTop: 1 },
  regCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  regTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  regMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    backgroundColor: "#fff",
  },
  logoutText: { color: "#dc2626", fontWeight: "700", fontSize: 15 },
});