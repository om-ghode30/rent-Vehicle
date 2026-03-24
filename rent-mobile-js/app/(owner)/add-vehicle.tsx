import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addVehicleDetails } from "../../src/api/api";

export default function AddVehicle() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [number, setNumber] = useState("");

  const [images, setImages] = useState<any[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("brand", brand);
      formData.append("model_name", model);
      formData.append("price_per_day", price);
      formData.append("vehicle_number", number);

      // 🔥 REQUIRED FILES
      images.forEach((img, index) => {
        formData.append("images", {
          uri: img.uri,
          name: `image${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      // ❗ You MUST also send rc, insurance, puc, noc
      // (same way as images)

      await addVehicleDetails(formData);

      Alert.alert("Success", "Vehicle added!");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed");
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Brand</Text>
      <TextInput value={brand} onChangeText={setBrand} />

      <Text>Model</Text>
      <TextInput value={model} onChangeText={setModel} />

      <Text>Price</Text>
      <TextInput value={price} onChangeText={setPrice} />

      <Text>Vehicle Number</Text>
      <TextInput value={number} onChangeText={setNumber} />

      <Button title="Pick Images" onPress={pickImages} />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}