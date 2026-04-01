import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const notificationSound = new Audio("/sounds/notification.mp3");

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) == true,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled});
    },

    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/messages/contacts");
            set({allContacts: res.data});
        }
        catch(error){
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        finally{
            set({isUsersLoading: false});
        }
    },

    getMyChatPartners: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/messages/chats");
            set({chats: res.data});
        }
        catch(error){
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        finally{
            set({isUsersLoading: false});
        }
    },

    getMessagesByUserId: async (userId) => {
        set({isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        }
        catch(error){
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        finally{
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages, chats} = get();
        const {authUser} = useAuthStore.getState();

        if (!selectedUser?._id) {
            toast.error("Select a user to send a message");
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            senderId: authUser?._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        }
        //immediately update the ui by adding the message
        set((state) => ({messages: [...state.messages, optimisticMessage]}));

        // Update chats list with optimistic latest message
        set((state) => ({
            chats: state.chats.map((chat) =>
                chat._id === selectedUser._id
                    ? { ...chat, latestMessage: optimisticMessage }
                    : chat
            ),
        }));

        try{
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            // Replace temp message with real data from server
            set((state) => {
                const idx = state.messages.findIndex((m) => m._id === tempId);
                if(idx === -1) return {messages: [...state.messages, res.data]};
                const next = state.messages.slice();
                next[idx] = res.data;
                return {messages: next};
            })
            
            // Update chats list with real latest message
            set((state) => ({
                chats: state.chats.map((chat) =>
                    chat._id === selectedUser._id
                        ? { ...chat, latestMessage: res.data }
                        : chat
                ),
            }));
        }
        catch(error){
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== tempId),
            }))
            // Revert optimistic update on error
            set((state) => ({
                chats: state.chats.map((chat) =>
                    chat._id === selectedUser._id
                        ? { ...chat, latestMessage: chats.find(c => c._id === selectedUser._id)?.latestMessage }
                        : chat
                ),
            }));
            toast.error(error.response?.data?.message || "Message failed to send");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        const handleNewMessage = (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            set({ messages: [...currentMessages, newMessage] });

            // Update chats list with latest received message
            set((state) => ({
                chats: state.chats.map((chat) =>
                    chat._id === selectedUser._id
                        ? { ...chat, latestMessage: newMessage }
                        : chat
                ),
            }));

            if (isSoundEnabled) {
                const notificationSound = new Audio("/sounds/notification.mp3");

                notificationSound.currentTime = 0; // reset to start
                notificationSound.play().catch((e) => console.log("Audio play failed:", e));
            }
        };

        const handleMessageDeleted = ({ messageId }) => {
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId),
            }));
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);

        // Store handlers for cleanup
        if (!socket._chatHandlers) {
            socket._chatHandlers = {};
        }
        socket._chatHandlers.handleNewMessage = handleNewMessage;
        socket._chatHandlers.handleMessageDeleted = handleMessageDeleted;
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket._chatHandlers) {
            socket.off("newMessage", socket._chatHandlers.handleNewMessage);
            socket.off("messageDeleted", socket._chatHandlers.handleMessageDeleted);
            delete socket._chatHandlers.handleNewMessage;
            delete socket._chatHandlers.handleMessageDeleted;
        }
    },

    subscribeToAllMessages: () => {
        const socket = useAuthStore.getState().socket;
        const {authUser} = useAuthStore.getState();

        const handleGlobalNewMessage = (newMessage) => {
            // Determine which user to update in chats list
            // If I'm the sender, update the receiver's chat
            // If I'm the receiver, update the sender's chat
            const chatUserId = newMessage.senderId === authUser._id ? newMessage.receiverId : newMessage.senderId;

            set((state) => ({
                chats: state.chats.map((chat) =>
                    chat._id === chatUserId
                        ? { ...chat, latestMessage: newMessage }
                        : chat
                ),
            }));
        };

        const handleGlobalMessageDeleted = ({ messageId }) => {
            // Update chats list - remove message reference if it was the latest
            set((state) => ({
                chats: state.chats.map((chat) => {
                    if (chat.latestMessage?._id === messageId) {
                        return { ...chat, latestMessage: null };
                    }
                    return chat;
                }),
            }));
        };

        const handleChatDeleted = ({ userId }) => {
            set((state) => {
                const updatedChats = state.chats.filter((chat) => chat._id !== userId);
                // If the deleted chat was selected, auto-select the first remaining chat
                let newSelectedUser = state.selectedUser?._id === userId ? (updatedChats.length > 0 ? updatedChats[0] : null) : state.selectedUser;
                
                return {
                    chats: updatedChats,
                    selectedUser: newSelectedUser,
                };
            });
        };

        socket.on("newMessage", handleGlobalNewMessage);
        socket.on("messageDeleted", handleGlobalMessageDeleted);
        socket.on("chatDeleted", handleChatDeleted);

        // Store handlers for cleanup
        if (!socket._sidebarHandlers) {
            socket._sidebarHandlers = {};
        }
        socket._sidebarHandlers.handleGlobalNewMessage = handleGlobalNewMessage;
        socket._sidebarHandlers.handleGlobalMessageDeleted = handleGlobalMessageDeleted;
        socket._sidebarHandlers.handleChatDeleted = handleChatDeleted;
    },

    unsubscribeFromAllMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket._sidebarHandlers) {
            socket.off("newMessage", socket._sidebarHandlers.handleGlobalNewMessage);
            socket.off("messageDeleted", socket._sidebarHandlers.handleGlobalMessageDeleted);
            socket.off("chatDeleted", socket._sidebarHandlers.handleChatDeleted);
            delete socket._sidebarHandlers.handleGlobalNewMessage;
            delete socket._sidebarHandlers.handleGlobalMessageDeleted;
            delete socket._sidebarHandlers.handleChatDeleted;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/messages/message/${messageId}`);
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId),
            }));
            toast.success("Message deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete message");
        }
    },

    deleteChat: async (userId) => {
        try {
            const {chats, selectedUser} = get();
            await axiosInstance.delete(`/messages/chat/${userId}`);
            
            // Filter out the deleted chat
            const updatedChats = chats.filter((chat) => chat._id !== userId);
            
            // If the deleted chat was selected, auto-select the first remaining chat
            let newSelectedUser = selectedUser?._id === userId ? (updatedChats.length > 0 ? updatedChats[0] : null) : selectedUser;
            
            set({
                chats: updatedChats,
                selectedUser: newSelectedUser,
            });
            toast.success("Chat deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete chat");
        }
    },
}));