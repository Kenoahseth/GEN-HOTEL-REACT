import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import axios from "axios";

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch chats for the guest
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/hotel/hotel-chats`);
        if (Array.isArray(response.data)) {
          setChats(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setChats([]);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
        setChats([]);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-1/4 border-r h-screen p-4">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      <Input
        placeholder="Search"
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-4">
        {filteredChats.map((chat, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => onSelectChat(chat)}
          >
            <Avatar>
              <AvatarImage src={`https://i.pravatar.cc/150?img=${index + 1}`} />
              <AvatarFallback>{chat.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{chat.name}</p>
              <p className="text-sm text-gray-500 truncate">{chat.message}</p>
            </div>
            <span className="text-xs text-gray-400">{chat.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;