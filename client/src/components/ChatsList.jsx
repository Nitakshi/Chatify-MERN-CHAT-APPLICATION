import { useEffect } from 'react';
import { useChatStore } from "../store/useChatStore";
import NoChatsFound from "./NoChatsFound";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from '../store/useAuthStore';

function ChatsList() {
    const {getMyChatPartners, chats, isUsersLoading, setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore();

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
                    className="bg-cyan-500/10 p-5 sm:p-6 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-colors shadow-sm"
                    onClick={() => setSelectedUser(chat)}
                >
                    <div className="flex items-center gap-4">
                        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                        <div className="size-14 rounded-full">
                            <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                        </div>
                        </div>

                        <div className="min-w-0">
                            <h4 className="text-slate-200 font-semibold text-lg sm:text-xl truncate">{chat.fullName}</h4>
                            <p className={`text-xs sm:text-sm mt-1 ${isOnline ? "text-emerald-400" : "text-slate-400"}`}>
                                {/* I want to add latest message */}
                        
                            </p>
                        </div>
                    </div>
                </div>
            )})}
        </>
    )
}

export default ChatsList