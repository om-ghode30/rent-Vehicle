import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useData } from "../../src/context/DataContext";
import { assetUrl } from "../../src/api/api";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams();
  const vehicleId = Array.isArray(id) ? id[0] : id;

  const { getVehicleDetails, createBooking } = useData();

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [driverName, setDriverName] = useState("");

  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [license, setLicense] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
const [endDate, setEndDate] = useState<Date | null>(null);

const [showStartPicker, setShowStartPicker] = useState(false);
const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (vehicleId) loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await getVehicleDetails(vehicleId);
      setVehicleData(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load vehicle");
    } finally {
      setLoading(false);
    }
  };

  // ================= LICENSE PICK =================
  const pickLicense = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!res.canceled) {
      setLicense(res.assets[0]);
    }
  };

  // ================= BOOKING =================
  const handleBooking = async () => {
if (!startDate || !endDate || !license || !driverName) {
  Alert.alert("Error", "Fill all fields + upload license");
  return;
}
if (startDate && endDate && endDate <= startDate) {
  Alert.alert("Error", "End date must be after start date");
  return;
}

    try {
      setBookingLoading(true);

      const formData = new FormData();

      formData.append("vehicle_id", String(vehicleId));
formData.append("start_datetime", startDate.toISOString());
formData.append("end_datetime", endDate.toISOString());
formData.append("driver_name", driverName);
formData.append("license", {
  uri: license.uri,
  name: license.fileName || "license.jpg",
  type: license.mimeType || "image/jpeg",
} as any);

      const res = await createBooking(formData);

      if (res.success) {
        Alert.alert("Success", "Booking Confirmed!");
      } else {
        Alert.alert("Error", res.message || "Booking failed");
      }
    } catch (err: any) {
  console.log("BOOKING ERROR:", err?.response?.data || err.message);

  Alert.alert(
    "Error",
    err?.response?.data?.message || "Booking failed"
  );
} finally {
      setBookingLoading(false);
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!vehicleData) {
    return (
      <View style={styles.center}>
        <Text>Vehicle not found</Text>
      </View>
    );
  }

  const { vehicle, owner, images = [] } = vehicleData;

  return (
    <ScrollView style={styles.container}>
      
      {/* MAIN IMAGE */}
      {images.length > 0 && (
        <Image
          source={{ uri: assetUrl(images[currentImage]) }}
          style={styles.mainImage}
        />
      )}

      {/* THUMBNAILS */}
      <ScrollView horizontal style={{ marginTop: 10 }}>
        {images.map((img: string, index: number) => (
          <TouchableOpacity key={index} onPress={() => setCurrentImage(index)}>
            <Image
              source={{ uri: assetUrl(img) }}
              style={[
                styles.thumbnail,
                currentImage === index && styles.activeThumb,
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* DETAILS CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {vehicle.brand} {vehicle.model_name}
        </Text>

        <Text style={styles.price}>₹ {vehicle.price_per_day} / day</Text>

        {/* OWNER */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <Text>{owner.name}</Text>
          <Text>{owner.phone_number}</Text>
        </View>

       {/* START DATE */}
<TouchableOpacity
  style={styles.input}
  onPress={() => setShowStartPicker(true)}
>
  <Text>
    {startDate
      ? startDate.toLocaleString()
      : "Select Start Date"}
  </Text>
</TouchableOpacity>

{/* END DATE */}
<TouchableOpacity
  style={styles.input}
  onPress={() => setShowEndPicker(true)}
>
  <Text>
    {endDate
      ? endDate.toLocaleString()
      : "Select End Date"}
  </Text>
</TouchableOpacity>

{showStartPicker && (
  <DateTimePicker
    value={startDate || new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowStartPicker(false);
     if (!selectedDate) return; 
      if (selectedDate) setStartDate(selectedDate);
    }}
  />
)}

{showEndPicker && (
  <DateTimePicker
    value={endDate || new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowEndPicker(false);
      if (!selectedDate) return; 
      if (selectedDate) setEndDate(selectedDate);
    }}
  />
)}

<TextInput
  placeholder="Enter Driver Name"
  value={driverName}
  onChangeText={setDriverName}
  style={styles.input}
/>
        {/* LICENSE */}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickLicense}>
          <Text>
            {license ? "License Selected ✅" : "Upload Driving License"}
          </Text>
        </TouchableOpacity>

        {/* BOOK BUTTON */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={handleBooking}
          disabled={bookingLoading}
        >
          <Text style={styles.bookText}>
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },

  mainImage: { width: "100%", height: 250, borderRadius: 12 },

  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },

  activeThumb: {
    borderWidth: 2,
    borderColor: "blue",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },

  title: { fontSize: 22, fontWeight: "bold" },

  price: { fontSize: 18, color: "blue", marginTop: 5 },

  sectionTitle: { fontWeight: "bold", marginTop: 10 },

  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },

  uploadBtn: {
    padding: 12,
    backgroundColor: "#eee",
    marginTop: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  bookBtn: {
    backgroundColor: "blue",
    padding: 15,
    marginTop: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  bookText: { color: "#fff", fontWeight: "bold" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});