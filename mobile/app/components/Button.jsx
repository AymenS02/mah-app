import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text } from "react-native";

export default function Button({ title, onPress }) {
  return (
    <Pressable onPress={onPress} className="mt-4">
      <LinearGradient
        colors={["#FFD000", "#FFB200"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ padding: 12, borderRadius: 12 }}
      >
        <Text className="text-black font-semibold text-center">{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
