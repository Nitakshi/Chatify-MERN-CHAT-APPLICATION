import {useRef, useState} from 'react'
import useKeyboardSound from '../hooks/useKeyboardSound'
import { useChatStore } from '../store/useChatStore';
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const {playRandomKeyStrokeSound} = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const {sendMessage, isSoundEnabled} = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;
    if(isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview("");
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith("image/")){
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="w-full p-4 bg-slate-900/50 border-t border-slate-700/50">
      {imagePreview && (
        <div className="mb-3 flex items-center px-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border-2 border-cyan-500/50 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md hover:bg-rose-600 transition-colors"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-cyan-500/50 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-lg"
            placeholder="Type your message..."
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`hover:text-cyan-400 transition-colors ${
              imagePreview ? "text-cyan-500" : "text-slate-400"
            }`}
          >
            <ImageIcon className="w-6 h-6" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="h-12 w-12 flex items-center justify-center bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:bg-slate-800 shadow-lg shadow-cyan-900/20"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput