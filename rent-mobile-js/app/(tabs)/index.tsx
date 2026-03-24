import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { getApprovedVehicles, assetUrl } from "../../src/api/api";

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(5000);

  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ================= FETCH =================
  const fetchVehicles = async () => {
    try {
      const res = await getApprovedVehicles();
      const data = res.data?.data || [];

      setVehicles(data);
      setFilteredVehicles(data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  useEffect(() => {
    const filtered = vehicles.filter((v) => {
      const matchSearch =
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model_name.toLowerCase().includes(search.toLowerCase());

      const matchPrice = v.price_per_day <= priceRange;

      return matchSearch && matchPrice;
    });

    setFilteredVehicles(filtered);
  }, [search, priceRange, vehicles]);

  // ================= UI =================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 🔍 SEARCH BAR */}
      <TextInput
        placeholder="Search brand or model..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* 💰 PRICE FILTER */}
      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>
          Budget: ₹0 - ₹{priceRange}
        </Text>

        {/* SIMPLE BUTTON FILTER (mobile-friendly) */}
        <View style={styles.priceButtons}>
          {[500, 1000, 2000, 5000].map((price) => (
            <TouchableOpacity
              key={price}
              onPress={() => setPriceRange(price)}
              style={[
                styles.priceBtn,
                priceRange === price && styles.activePriceBtn,
              ]}
            >
              <Text
                style={[
                  styles.priceBtnText,
                  priceRange === price && { color: "#fff" },
                ]}
              >
                {price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ================= LIST ================= */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) =>
          (item.id || item._id || item.vehicle_id)?.toString()
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No vehicles found
          </Text>
        }
        renderItem={({ item }) => {
          const vehicleId =
            item.id || item._id || item.vehicle_id;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!vehicleId) return;
                router.push(`/vehicle/${vehicleId}`);
              }}
              style={styles.card}
            >
              {/* IMAGE */}
              <Image
                source={{ uri: assetUrl(item.image_url) }}
                style={styles.image}
              />

              {/* BADGE */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Verified</Text>
              </View>

              {/* INFO */}
              <View style={styles.content}>
                <Text style={styles.title}>
                  {item.brand}{" "}
                  <Text style={{ color: "#007AFF" }}>
                    {item.model_name}
                  </Text>
                </Text>

                <Text style={styles.vehicleNumber}>
                  {item.vehicle_number}
                </Text>

                <Text style={styles.owner}>
                  Owner: {item.owner_name}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>
                    ₹{item.price_per_day}
                    <Text style={styles.perDay}> /day</Text>
                  </Text>

                  <Text style={styles.bookBtn}>
                    Book →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  priceBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  priceLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "bold",
  },

  priceButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  priceBtn: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },

  activePriceBtn: {
    backgroundColor: "#007AFF",
  },

  priceBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 180,
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#007AFF",
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  vehicleNumber: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  owner: {
    fontSize: 12,
    color: "#444",
    marginTop: 5,
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },

  perDay: {
    fontSize: 12,
    color: "#666",
  },

  bookBtn: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007AFF",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});