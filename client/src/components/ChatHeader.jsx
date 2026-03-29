import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { XIcon } from 'lucide-react';

function ChatHeader() {
    const {selectedUser, setSelectedUser} = useChatStore();

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
        <div className='flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6 flex-1'>
            <div className='flex items-center space-x-3'>
                {/* TODO:  Socket io */}
                <div className='avatar online'>
                    <div className='w-12 rounded-full'>
                        <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName}></img>
                    </div>
                </div>

                <div>
                    <h2 className='text-slate-200 text-lg'>{selectedUser.fullName}</h2>
                    <p className='text-slate-400 text-sm'>Online</p>
                </div>
            </div>

            <button onClick={() => setSelectedUser(null)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    )
}

export default ChatHeader