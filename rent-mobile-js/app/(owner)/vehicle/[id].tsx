import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getOwnerVehicleDetails, getOwnerVehicleImageUrl } from "../../../src/api/api";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await getOwnerVehicleDetails(Number(id));
      setData(res.data.data);
    };
    fetch();
  }, []);

  if (!data) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      {data.images.map((img: string, i: number) => (
        <Image
          key={i}
          source={{ uri: getOwnerVehicleImageUrl(id as any, `image${i+1}`) }}
          style={{ height: 200 }}
        />
      ))}
      <Text>{data.vehicle.brand}</Text>
    </ScrollView>
  );
}