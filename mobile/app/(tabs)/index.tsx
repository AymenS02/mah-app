// mobile/app/(tabs)/index.jsx – Announcements
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../utils/api";

function AnnouncementCard({ item }) {
  const date = new Date(item.createdAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <View style={[styles.card, item.pinned && styles.pinnedCard]}>
      {item.pinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={12} color="#003837" />
          <Text style={styles.pinnedText}>Pinned</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{item.author}</Text>
        <Text style={styles.cardMeta}>{date}</Text>
      </View>
    </View>
  );
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await api.get("/api/announcements");
      setAnnouncements(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAnnouncements();
      setLoading(false);
    })();
  }, [fetchAnnouncements]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      {/* Page header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>MAH</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>Muslim Association of Hamilton</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#003837" />
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAnnouncements}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003837" />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="megaphone-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No announcements yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#003837",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFD000",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#003837", fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#78dcca" },
  list: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pinnedCard: { borderLeftWidth: 4, borderLeftColor: "#FFD000" },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  pinnedText: { fontSize: 12, fontWeight: "700", color: "#003837" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 6 },
  cardContent: { fontSize: 14, color: "#374151", lineHeight: 20 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardMeta: { fontSize: 12, color: "#9ca3af" },
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
});