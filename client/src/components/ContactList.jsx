import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore"
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
    const {getAllContacts, allContacts, isUsersLoading, setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore();
    
    useEffect(() => {
        getAllContacts();
    },[getAllContacts]);

    if(isUsersLoading) return <UsersLoadingSkeleton/>;

  return (
    <>
        {allContacts.map((contact) => {
            const isOnline = onlineUsers.includes(String(contact._id));

            return (
            <div
                    key={contact._id}
                    className="bg-cyan-500/10 p-5 sm:p-6 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-colors shadow-sm"
                    onClick={() => setSelectedUser(contact)}
                >
                    <div className="flex items-center gap-4">
                        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                        <div className="size-14 rounded-full">
                            <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                        </div>
                        </div>

                        <div className="min-w-0">
                            <h4 className="text-slate-200 font-semibold text-lg sm:text-xl truncate">{contact.fullName}</h4>
                            <p className={`text-xs sm:text-sm mt-1 ${isOnline ? "text-emerald-400" : "text-slate-400"}`}>
                                {isOnline ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                </div>
        )})}
    </>
  )
}

export default ContactList