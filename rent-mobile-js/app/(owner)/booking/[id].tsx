import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getOwnerBookingDetails,
  getLicenseUrl,
  getAadharUrl,
} from "../../../src/api/api";

export default function BookingDetails() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getOwnerBookingDetails(Number(id)).then(res =>
      setData(res.data.data)
    );
  }, []);

  if (!data) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>User: {data.user_name}</Text>

      <Image source={{ uri: getLicenseUrl(id as any) }} style={{ height: 200 }} />
      <Image source={{ uri: getAadharUrl(id as any) }} style={{ height: 200 }} />
    </View>
  );
}