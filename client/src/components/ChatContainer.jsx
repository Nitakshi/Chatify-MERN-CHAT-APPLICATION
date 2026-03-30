import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";


function ChatContainer() {
  const { messages, getMessagesByUserId, selectedUser, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages} = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  

  // 1. Always work with a sorted version of messages
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  useEffect(() => { //fetch messages when selected user changes
    if (selectedUser?._id) getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessagesByUserId]);

  useEffect(() => { //scroll to bottom whenever messages change
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedMessages]);

  const formatDateHeader = (dateString) => { //to show date separators in chat
    const date = new Date(dateString); 
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1); // Set yesterday's date by subtracting one day from today's date
    // If messageDate == today's date -> "Today"
    // If messageDate == yesterday's date -> "Yesterday"
    // Otherwise -> "March 30, 2026"

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 overflow-y-auto py-6 sm:py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : sortedMessages.length > 0 ? (
          <div className="max-w-[min(100vw-12rem,60rem)] mx-auto space-y-6">
            {sortedMessages.map((msg, index) => {
              // FIX: Compare with the PREVIOUS message in the SORTED array
              const currentDate = new Date(msg.createdAt).toDateString();
              const previousDate = index > 0 
                ? new Date(sortedMessages[index - 1].createdAt).toDateString() 
                : null;
              
              const showDateSeparator = currentDate !== previousDate;

              return (
                <div key={msg._id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-8">
                      <span className="bg-slate-800/80 text-slate-400 text-2sm font-medium px-3 py-1 rounded-full border border-slate-700/50">
                        {formatDateHeader(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                    <div className={`chat-bubble relative ${
                      msg.senderId === authUser._id ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-200"
                    }`}>
                      {msg.image && (
                        <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                      )}
                      {msg.text && (
                        <p className="mt-2 text-base sm:text-lg md:text-xl leading-relaxed">
                          {msg.text}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs md:text-sm mt-1 opacity-75 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", { 
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;