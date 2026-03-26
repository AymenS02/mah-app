import {
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useState } from "react";
import Button from "./components/Button";

export default function Index() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createEvent = () => {
    if (!title || !description) {
      Alert.alert("Error", "Please enter both title and description");
      return;
    }

    fetch("http://192.168.2.56:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert("Success", `Event "${data.title}" created!`);
        setTitle("");
        setDescription("");
      })
      .catch(err => Alert.alert("Error", "Failed to create event"));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center bg-white p-4">
          <Text className="text-black text-2xl font-bold mb-6">
            Create a New Event
          </Text>

          <TextInput
            placeholder="Event Title"
            value={title}
            onChangeText={setTitle}
            className="w-full border border-gray-300 p-3 rounded mb-4"
          />

          <TextInput
            placeholder="Event Description"
            value={description}
            onChangeText={setDescription}
            className="w-full border border-gray-300 p-3 rounded mb-6"
            multiline
          />

          <Button title="Create Event" onPress={createEvent} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}