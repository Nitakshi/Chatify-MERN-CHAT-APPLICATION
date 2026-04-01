import { useEffect, useState } from 'react';
import { useChatStore } from "../store/useChatStore";
import NoChatsFound from "./NoChatsFound";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from '../store/useAuthStore';
import { Trash2Icon } from 'lucide-react';

function ChatsList() {
    const {getMyChatPartners, chats, isUsersLoading, setSelectedUser, deleteChat} = useChatStore();
    const {onlineUsers} = useAuthStore();
    const [hoveredChatId, setHoveredChatId] = useState(null);

    useEffect(() => {
        getMyChatPartners();
    },[getMyChatPartners]);

    if(isUsersLoading) return <UsersLoadingSkeleton/>;
    if(chats.length === 0) return <NoChatsFound/>;

    return (
        <>
            {chats.map((chat) => {
                const isOnline = onlineUsers.includes(String(chat._id));

                return (
                <div
                    key={chat._id}
                    className="bg-cyan-500/10 p-5 sm:p-6 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-colors shadow-sm group relative"
                    onClick={() => setSelectedUser(chat)}
                    onMouseEnter={() => setHoveredChatId(chat._id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                >
                    <div className="flex items-center gap-4">
                        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                        <div className="size-14 rounded-full">
                            <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                        </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="text-slate-200 font-semibold text-lg sm:text-xl truncate">{chat.fullName}</h4>
                            <p className={`text-xs sm:text-sm mt-1 truncate ${isOnline ? "text-emerald-400" : chat.latestMessage ? "text-slate-400" : "text-slate-500"}`}>
                                {chat.latestMessage ? (
                                    chat.latestMessage.text || (chat.latestMessage.image ? "📷 Image" : "No message")
                                ) : (
                                    "No conversation yet"
                                )}
                            </p>
                        </div>

                        {hoveredChatId === chat._id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat._id);
                                }}
                                className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg shadow-md transition-colors flex-shrink-0"
                                title="Delete chat"
                            >
                                <Trash2Icon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            )})}
        </>
    )
}

export default ChatsList