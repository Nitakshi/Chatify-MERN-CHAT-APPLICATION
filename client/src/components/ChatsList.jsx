import { useEffect } from 'react';
import { useChatStore } from "../store/useChatStore";
import NoChatsFound from "./NoChatsFound";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ChatsList() {
    const {getMyChatPartners, chats, isUsersLoading, setSelectedUser} = useChatStore();

    useEffect(() => {
        getMyChatPartners();
    },[getMyChatPartners]);

    if(isUsersLoading) return <UsersLoadingSkeleton/>;
    if(chats.length === 0) return <NoChatsFound/>;

    return (
        <>
            {chats.map((chat) => (
                <div
                    key={chat._id}
                    className="bg-cyan-500/10 p-5 sm:p-6 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-colors shadow-sm"
                    onClick={() => setSelectedUser(chat)}
                >
                    <div className="flex items-center gap-4">
                        {/* FIX THIS ONLINE STATUS AND MAKE IT WORK WITH SOCKET */}
                        <div className={`avatar online`}>
                        <div className="size-14 rounded-full">
                            <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                        </div>
                        </div>
                        <h4 className="text-slate-200 font-semibold text-lg sm:text-xl truncate">{chat.fullName}</h4>
                    </div>
                </div>
            ))}
        </>
    )
}

export default ChatsList