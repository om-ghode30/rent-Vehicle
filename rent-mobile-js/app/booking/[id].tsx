import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";

import {
  getVehicleDetailsPublic,
  createBooking,
  assetUrl,
} from "../../src/api/api";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams();
  const vehicleId = Array.isArray(id) ? id[0] : id;

  const [data, setData] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [license, setLicense] = useState<any>(null);

  // ================= FETCH VEHICLE =================
  useEffect(() => {
    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const res = await getVehicleDetailsPublic(vehicleId);
      setData(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= IMAGE PICKER =================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLicense(result.assets[0]);
    }
  };

  // ================= BOOKING =================
  const handleBooking = async () => {
    if (!startDate || !endDate || !license) {
      alert("Fill all fields");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("vehicle_id", vehicleId);
      formData.append("start_datetime", startDate);
      formData.append("end_datetime", endDate);

      formData.append("license", {
        uri: license.uri,
        name: "license.jpg",
        type: "image/jpeg",
      } as any);

      const res = await createBooking(formData);

      alert("Booking Successful 🎉");
    } catch (err) {
      console.log(err);
      alert("Booking Failed ❌");
    }
  };

  if (!data) return <Text style={{ padding: 20 }}>Loading...</Text>;

  const { vehicle, owner, images } = data;

  // ================= UI =================
  return (
    <ScrollView style={{ flex: 1 }}>
      
      {/* ===== IMAGE CAROUSEL ===== */}
      <View>
        <Image
  source={{ uri: images[currentImage] }}
  style={{ width: "100%", height: 250 }}
  resizeMode="cover"
  onError={(e) => console.log("IMAGE ERROR:", e.nativeEvent)}
/>

        {/* Prev */}
        <TouchableOpacity
          onPress={() =>
            setCurrentImage((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
          style={{ position: "absolute", left: 10, top: "45%" }}
        >
          <Text style={{ fontSize: 24 }}>⬅️</Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          onPress={() =>
            setCurrentImage((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )
          }
          style={{ position: "absolute", right: 10, top: "45%" }}
        >
          <Text style={{ fontSize: 24 }}>➡️</Text>
        </TouchableOpacity>
      </View>

      {/* ===== THUMBNAILS ===== */}
      <ScrollView horizontal style={{ padding: 10 }}>
        {images.map((img: string, index: number) => (
          <TouchableOpacity key={index} onPress={() => setCurrentImage(index)}>
            <Image
              source={{ uri: assetUrl(img) }}
              style={{
                width: 80,
                height: 60,
                marginRight: 10,
                borderWidth: currentImage === index ? 2 : 0,
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ===== DETAILS ===== */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          {vehicle.brand} {vehicle.model_name}
        </Text>

        <Text style={{ marginTop: 5 }}>
          ₹ {vehicle.price_per_day} / day
        </Text>

        <Text style={{ marginTop: 10, fontWeight: "bold" }}>
          Owner: {owner.name}
        </Text>
        <Text>{owner.phone_number}</Text>
        <Text>{owner.address}</Text>
      </View>

      {/* ===== BOOKING FORM ===== */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontWeight: "bold" }}>Start Date</Text>
        <TextInput
          placeholder="YYYY-MM-DD HH:mm"
          value={startDate}
          onChangeText={setStartDate}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
          }}
        />

        <Text style={{ fontWeight: "bold" }}>End Date</Text>
        <TextInput
          placeholder="YYYY-MM-DD HH:mm"
          value={endDate}
          onChangeText={setEndDate}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
          }}
        />

        {/* License Upload */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            padding: 15,
            borderWidth: 1,
            borderStyle: "dashed",
            marginBottom: 15,
          }}
        >
          <Text>
            {license ? "License Selected ✅" : "Upload License"}
          </Text>
        </TouchableOpacity>

        <Button title="Book Now" onPress={handleBooking} />
      </View>
    </ScrollView>
  );
}