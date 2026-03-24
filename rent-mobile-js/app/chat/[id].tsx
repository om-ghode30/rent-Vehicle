import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { socket } from "../../src/socket/socket";
import { useRef } from "react";


const BASE_URL =
  "https://55f5-2409-40c2-100d-5b-6409-ce33-fd08-9cca.ngrok-free.app";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const flatListRef = useRef<any>(null);

  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH OLD MESSAGES =================
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.log("CHAT FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SOCKET SETUP =================
useEffect(() => {
  if (!bookingId || !user?.token) return;

  fetchMessages();

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("joinBooking", bookingId);

socket.on("receiveMessage", (msg: any) => {
  setMessages((prev) => {
    const exists = prev.some(
      (m) =>
        m.message === msg.message &&
        m.sender_role === msg.sender_role
    );

    if (exists) return prev; // ❌ skip duplicate

    return [...prev, msg];
  });
});

  return () => {
    socket.emit("leaveBooking", bookingId);
    socket.off("receiveMessage");
  };
}, [bookingId, user?.token]);

  // ================= SEND MESSAGE =================
const sendMessage = async () => {
  if (!text.trim()) return;

  const tempMsg = {
    id: Date.now(),
    message: text,
    sender_role: user?.role,
  };

  // ✅ show instantly
  setMessages((prev) => [...prev, tempMsg]);

  try {
    await fetch(`${BASE_URL}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        booking_id: bookingId,
        message: text,
      }),
    });

  } catch (err) {
    console.log("SEND ERROR:", err);
  }

  setText("");
};

  // ================= UI =================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* MESSAGES */}
<FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(item, index) =>
    item?.id?.toString() || index.toString()
  }
  contentContainerStyle={{ padding: 10 }}
  onContentSizeChange={() =>
    flatListRef.current?.scrollToEnd({ animated: true })
  }
  renderItem={({ item }) => {
  const isMe =
    item.sender_role?.toLowerCase() === user?.role?.toLowerCase();

  return (
    <View
      style={[
        styles.msgContainer,
        isMe ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      <View
        style={[
          styles.msgBubble,
          isMe ? styles.myMsg : styles.otherMsg,
        ]}
      >
        <Text
          style={[
            styles.msgText,
            isMe && { color: "#fff" },
          ]}
        >
          {item.message}
        </Text>
      </View>
    </View>
  );
}}
      />

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  msgContainer: {
    flexDirection: "row",
    marginVertical: 5,
    paddingHorizontal: 10,
  },

  leftAlign: {
    justifyContent: "flex-start",
  },

  rightAlign: {
    justifyContent: "flex-end",
  },

  msgBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: "75%",
  },

  myMsg: {
    backgroundColor: "#007AFF",
    borderTopRightRadius: 0,
  },

  otherMsg: {
    backgroundColor: "#eee",
    borderTopLeftRadius: 0,
  },

  msgText: {
    fontSize: 14,
    color: "#000",
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },

  sendBtn: {
    backgroundColor: "blue",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});