import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Message from "./Message";
import axios from "axios";
import useLoginAuth from "@/users/credentials/stores/useLoginAuth";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Retrieve guest ID from Zustand store
  const { user } = useLoginAuth();
  const guestId = user?._id || user?.id || user?.guest_id; // Handle different property names
  console.log("Guest ID:", guestId); // Debugging log

  useEffect(() => {
    if (!guestId) {
      console.error("Guest ID is missing.");
      return;
    }

    console.log("API URL:", `${import.meta.env.VITE_API_BASE_URL}/hotel-chats/${guestId}`); // Debugging log

    // Fetch messages between the guest and the system
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hotel-chats/${guestId}`);
        console.log("API Response:", response.data); // Debugging log
        if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setMessages([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]); // Fallback to an empty array
      }
    };

    fetchMessages();
  }, [guestId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/hotel-chats`, {
        _id: guestId, // Use the actual guest ID
        chat_message: newMessage,
        sender_type: "guest",
      });

      console.log("Message sent successfully:", response.data);
      setMessages((prev) => [...prev, response.data.chat]); // Append the new message to the list
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with System</h2>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <Message
            key={index}
            sender={msg.sender || "Unknown"}
            content={msg.chat_message || ""}
            time={msg.chat_message_date || ""}
            isSelf={msg.sender_type === "guest"}
          />
        ))}
      </div>
      {/* Chat Input */}
      <div className="p-4 border-t flex items-center space-x-2">
        <Input
          placeholder="Type your message..."
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default ChatWindow;