import {useState, useRef} from 'react';
import {LogOutIcon, VolumeOffIcon, Volume2Icon} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
    const {logout, updateProfile, authUser} = useAuthStore();
    const {isSoundEnabled, toggleSound} = useChatStore();
    const [selectedImg, setSelectedImg] = useState(null);

    const fileInputRef = useRef(); //useRef() is used to reference the hidden file input element, allowing us to trigger it programmatically when the user clicks on the avatar.

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
        <div className='p-6 border-b border-slate-700/50'>
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
                    {/* LOGOUT BUTTON */}
                    <button className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={logout}>
                        <LogOutIcon className='size-7'></LogOutIcon>
                    </button>

                    {/* SOUND TOGGLE BUTTON */}
                    <button
                        className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={() => {
                            //play click sound before toggling
                            mouseClickSound.currentTime = 0; //reset to start
                            mouseClickSound.play().catch((error) => console.log("Audio play failed: ", error))
                            toggleSound();
                        }}>
                           {isSoundEnabled ? (<Volume2Icon className='size-7'/>) : (<VolumeOffIcon className='size-7'/>)}
                    </button>

                </div>
            </div> 
            
        </div>
    )
}

export default ProfileHeader    