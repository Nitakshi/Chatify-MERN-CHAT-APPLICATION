import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore"
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactList() {
    const {getAllContacts, allContacts, isUsersLoading, setSelectedUser} = useChatStore();
    
    useEffect(() => {
        getAllContacts();
    },[getAllContacts]);

    if(isUsersLoading) return <UsersLoadingSkeleton/>;

  return (
    <>
        {allContacts.map((contact) => (
            <div
                    key={contact._id}
                    className="bg-cyan-500/10 p-5 sm:p-6 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-colors shadow-sm"
                    onClick={() => setSelectedUser(contact)}
                >
                    <div className="flex items-center gap-4">
                        {/* FIX THIS ONLINE STATUS AND MAKE IT WORK WITH SOCKET */}
                        <div className={`avatar online`}>
                        <div className="size-14 rounded-full">
                            <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                        </div>
                        </div>
                        <h4 className="text-slate-200 font-semibold text-lg sm:text-xl truncate">{contact.fullName}</h4>
                    </div>
                </div>
        ))}
    </>
  )
}

export default ContactList