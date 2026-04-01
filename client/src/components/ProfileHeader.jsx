import {useState, useRef, useEffect} from 'react';
import {VolumeOffIcon, Volume2Icon, MoreVertical, LogOut, Trash2} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
    const {logout, updateProfile, authUser, deleteAccount, isDeletingAccount} = useAuthStore();
    const {isSoundEnabled, toggleSound} = useChatStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const {onlineUsers} = useAuthStore();
    const menuRef = useRef();

    const fileInputRef = useRef();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]); //useRef() is used to reference the hidden file input element, allowing us to trigger it programmatically when the user clicks on the avatar.

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader(); //FileReader is a built-in JavaScript API that allows us to read the contents of files.
        reader.readAsDataURL(file); //readAsDataURL reads the file and encodes it as a base64 string, which can be used as a source for an image element. 

        reader.onloadend = async () => { //onloadend is an event handler that gets called when the file reading operation is complete.
            const base64Image = reader.result; 
            setSelectedImg(base64Image);
            await updateProfile({profilePic: base64Image});
        }
    }

    return (
        <div className='p-6 border-b border-slate-700/50 max-h-[86px]'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>

                    {/* AVATAR (daisy UI) */}
                    <div className='avatar online'>
                        <button className='size-14 rounded-full overflow-hidden relative group'
                            onClick={() =>  fileInputRef.current.click()}>
                            <img src={selectedImg || authUser.profilePic || './avatar.png'}
                                alt="User image"
                                className='size-full object-cover'
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-xs">Change</span>
                            </div>
                        </button>
                        <input type='file' accept='image/*' ref={fileInputRef} onChange={handleImageUpload} className='hidden'/>
                    </div>

                    {/* USERNAME & ONLINE TEXT */}
                    <div>
                        <h3 className='text-slate-200 font-semibold text-xl sm:text-2xl max-w-[220px] truncate'>{authUser.fullName}</h3>
                        <p className='text-slate-400 text-sm sm:text-base'>Online</p>
                    </div>
                </div>

                {/* BUTTONS */}
                <div className='flex gap-4 items-center'>
                    {/* SOUND TOGGLE BUTTON */}
                    <button
                        className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={() => {
                            //play click sound before toggling
                            mouseClickSound.currentTime = 0; //reset to start
                            mouseClickSound.play().catch((error) => console.log("Audio play failed: ", error))
                            toggleSound();
                        }}>
                           {isSoundEnabled ? (<Volume2Icon className='size-6'/>) : (<VolumeOffIcon className='size-6'/>)}
                    </button>

                    {/* MENU BUTTON */}
                    <div className='relative' ref={menuRef}>
                        <button 
                            className='text-slate-400 hover:text-slate-200 transition-colors py-2'
                            onClick={() => setShowMenu(!showMenu)}
                            title="Options">
                            <MoreVertical className='size-6'></MoreVertical>
                        </button>

                        {/* DROPDOWN MENU */}
                        {showMenu && (
                            <div className='absolute right-0 mt-2 w-40 bg-slate-700 rounded-lg shadow-lg border border-slate-600 z-40'>
                                {/* LOGOUT OPTION */}
                                <button
                                    className='w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors border-b border-slate-600'
                                    onClick={async () => {
                                        setShowMenu(false);
                                        await logout();
                                    }}>
                                    <LogOut className='size-5'/>
                                    Logout
                                </button>

                                {/* DELETE ACCOUNT OPTION */}
                                <button
                                    className='w-full px-4 py-3 text-left text-red-400 hover:bg-slate-600 flex items-center gap-3 transition-colors'
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowDeleteConfirm(true);
                                    }}>
                                    <Trash2 className='size-5'/>
                                    Delete Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div> 
            
            {/* DELETE ACCOUNT CONFIRMATION MODAL */}
            {showDeleteConfirm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-slate-800 rounded-lg p-6 max-w-sm mx-4 border border-slate-700'>
                        <h2 className='text-xl font-bold text-slate-100 mb-2'>Delete Account?</h2>
                        <p className='text-slate-400 mb-4'>
                            This action cannot be undone. Your account and all messages will be permanently deleted from our database.
                        </p>
                        <div className='flex gap-3 justify-end'>
                            <button
                                className='px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors'
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeletingAccount}>
                                Cancel
                            </button>
                            <button
                                className='px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50'
                                onClick={async () => {
                                    await deleteAccount();
                                    setShowDeleteConfirm(false);
                                }}
                                disabled={isDeletingAccount}>
                                {isDeletingAccount ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileHeader    