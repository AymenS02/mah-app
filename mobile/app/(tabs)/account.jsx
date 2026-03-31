import { View, Text } from "react-native";

export default function Account() {
  return (
    <View>
      <View className="flex flex-col items-center justify-center h-screen">
        <Text className="text-4xl font-bold mb-4">Account</Text>
        <Text className="text-lg text-gray-200">This is the account page.</Text>
      </View>
    </View>
  );
}