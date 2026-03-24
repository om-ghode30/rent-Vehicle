import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useData } from "../../src/context/DataContext";
import { useRouter } from "expo-router";

export default function Bookings() {
  const { fetchMyBookings, cancelBooking } = useData();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ================= LOAD BOOKINGS =================
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // ================= CANCEL =================
  const handleCancel = async (id: number) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const res = await cancelBooking(id);

              if (res.success) {
                Alert.alert("Success", "Booking cancelled");
                loadBookings();
              } else {
                Alert.alert("Error", res.message);
              }
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Cancel failed"
              );
            }
          },
        },
      ]
    );
  };

  // ================= FORMAT DATE =================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // ================= UI =================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No bookings found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>

      {bookings.map((booking) => (
        <View key={booking.id} style={styles.card}>
          
          {/* VEHICLE */}
          <Text style={styles.title}>
            {booking.brand} {booking.model_name}
          </Text>

          <Text style={styles.sub}>
            {booking.vehicle_number}
          </Text>

          {/* DATES */}
          <Text style={styles.label}>
            Start: {formatDate(booking.start_datetime)}
          </Text>

          <Text style={styles.label}>
            End: {formatDate(booking.end_datetime)}
          </Text>

          {/* PRICE */}
          <Text style={styles.price}>
            ₹ {booking.total_price}
          </Text>

          {/* STATUS */}
          <Text style={[
            styles.status,
            booking.status === "CANCELLED" && { color: "red" },
            booking.status === "COMPLETED" && { color: "green" },
          ]}>
            {booking.status}
          </Text>

          <TouchableOpacity
  style={styles.chatBtn}
  onPress={() =>router.push({
  pathname: "/chat/[id]",
  params: { id: booking.id },
})}
>
  <Text style={{ color: "#fff" }}>Chat</Text>
</TouchableOpacity>

          {/* CANCEL BUTTON */}
          {booking.status !== "CANCELLED" &&
            booking.status !== "COMPLETED" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(booking.id)}
              >
                <Text style={styles.cancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}

        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  sub: {
    color: "gray",
    marginBottom: 5,
  },

  label: {
    marginTop: 5,
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },

  status: {
    marginTop: 5,
    fontWeight: "bold",
  },

  chatBtn: {
  backgroundColor: "blue",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  alignItems: "center",
},

  cancelBtn: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});