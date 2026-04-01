import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { XIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function ChatHeader() {
    const {selectedUser, setSelectedUser} = useChatStore();
    const { onlineUsers } = useAuthStore();
    const isOnline = onlineUsers.includes(String(selectedUser?._id));

    useEffect(() => { //on clicking esc key chat will be closed
        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                setSelectedUser(null);
            }
        }
        window.addEventListener("keydown", handleEscapeKey);
        return () => window.removeEventListener("keydown", handleEscapeKey);
    },[setSelectedUser]);

    return (
        <div className='flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[86px] px-6 flex-1'>
            <div className='flex items-center space-x-3'>
                <div>
                    <div className='w-14 h-14 sm:w-14 rounded-full overflow-hidden'>
                        <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className='w-full h-full object-cover'></img>
                    </div>
                </div>

                <div>
                    <h2 className='text-slate-200 text-xl sm:text-2xl font-semibold'>{selectedUser.fullName}</h2>
                    <p className={`text-base sm:text-lg ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>

            <button onClick={() => setSelectedUser(null)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    )
}

export default ChatHeader