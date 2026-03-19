import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import { useData } from "../../context/DataContext";
import { FaPaperPlane, FaUserCircle, FaInfoCircle, FaCheckDouble, FaShieldAlt } from "react-icons/fa";

export default function ChatRoom() {
  const { bookingId } = useParams();
  const { fetchChatMessages, sendChatMessage, role  } = useData(); 

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // ================= DEBUGGING (Check your console F12) =================
  useEffect(() => {
    console.log("Current Logged-in Role:", role );
  }, [role ]);

  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchChatMessages(bookingId);
      console.log("First Message Data:", data?.[0]); // Check sender_role here
      setMessages(data || []);
    };
    loadMessages();
  }, [bookingId]);

  // ================= SOCKET & SCROLL =================
  useEffect(() => {
    socket.emit("joinBooking", bookingId);
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.emit("leaveBooking", bookingId);
      socket.off("receiveMessage");
    };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendChatMessage({
      booking_id: bookingId,
      message: input,
    });
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <FaUserCircle className="text-2xl" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800 leading-tight">
              {role?.toUpperCase() === "USER" ? "Property Owner" : "Customer Client"}
            </h2>
            <p className="text-[11px] text-green-500 font-semibold uppercase tracking-wider">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
           <span className="hidden md:block text-[11px] font-mono bg-slate-100 px-2 py-1 rounded">ID: {bookingId}</span>
           <FaInfoCircle className="cursor-pointer hover:text-blue-500 transition-colors" />
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div 
        className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-4 custom-scrollbar relative bg-[#f0f2f5]"
        style={{ 
          backgroundImage: `radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.05) 0px, transparent 50%)`
        }}
      >
        {messages.map((msg, i) => {
  const isMe =
    msg.sender_role?.toLowerCase().trim() === role?.toLowerCase().trim();

  return (
    <div
      key={i}
      className={`flex w-full ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative px-4 py-2 shadow-md max-w-[85%] md:max-w-[65%] ${
          isMe
            ? "bg-blue-600 text-white rounded-[1.2rem] rounded-tr-none ml-10"
            : "bg-white text-slate-700 border rounded-[1.2rem] rounded-tl-none mr-10"
        }`}
      >
        <p className="text-[14px] leading-relaxed pr-8 font-medium">
          {msg.message}
        </p>

        <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
          <span className="text-[9px]">
            {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isMe && <FaCheckDouble className="text-[10px]" />}
        </div>
      </div>
    </div>
  );
})}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <footer className="px-6 py-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write your message..."
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all active:scale-95 shrink-0 ${
              input.trim() 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FaPaperPlane className="text-lg translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </footer>
    </div>
  );
}