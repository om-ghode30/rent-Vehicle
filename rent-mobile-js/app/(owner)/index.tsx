import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { getMyVehicles, getOwnerVehicleImageUrl } from "../../src/api/api";
import { router } from "expo-router";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  const fetchVehicles = async () => {
    const res = await getMyVehicles();
    setVehicles(res.data.data);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <FlatList
      data={vehicles}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>router.push(`/vehicle/${item.id}`)}
        >
          <View style={{ margin: 10 }}>
            <Image
              source={{
                uri: getOwnerVehicleImageUrl(item.id, "image1"),
              }}
              style={{ height: 150 }}
            />
            <Text>{item.brand} {item.model_name}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}