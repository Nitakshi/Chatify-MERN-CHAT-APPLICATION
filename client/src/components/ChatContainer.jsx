import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {messages,getMessagesByUserId, selectedUser,isMessagesLoading} = useChatStore();
  const {authUser} = useAuthStore();

  useEffect(() => {
    if(selectedUser?._id) getMessagesByUserId(selectedUser._id);
  },[selectedUser?._id, getMessagesByUserId]);

  return (
    <>
     <ChatHeader/>
      
     {/* MESSAGES */}
     <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 overflow-y-auto py-6 sm:py-8"> 
        {messages.length > 0  && !isMessagesLoading? (
          <div className="max-w-[min(100vw-12rem,60rem)] mx-auto space-y-6">
            {messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(msg => (
              <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                <div className={`chat-bubble relative ${msg.senderId === authUser._id ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-200"}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover"></img>
                  )}
                  {msg.text && <p className="mt-2 text-base sm:text-lg md:text-xl leading-relaxed">{msg.text}</p>}
                  <p className="text-[10px] sm:text-xs md:text-sm mt-1 opacity-75 flex items-center gap-1">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? (<MessagesLoadingSkeleton/>) : (<NoChatHistoryPlaceholder name={selectedUser.fullName}/>)
        }
     </div>

     <MessageInput/>
    </>
  )
}

export default ChatContainer