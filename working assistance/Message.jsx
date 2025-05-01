import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Message = ({ sender = "Unknown", content = "", time = "", isSelf = false }) => {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-4`}>
      {!isSelf && (
        <Avatar className="mr-2">
          <AvatarImage src={`https://i.pravatar.cc/150?img=${sender.charCodeAt?.(0) || 1}`} />
          <AvatarFallback>{sender[0] || "U"}</AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-xs p-3 rounded-lg ${isSelf ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
        {!isSelf && <p className="text-sm font-medium">{sender}</p>}
        <p>{content}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Message;