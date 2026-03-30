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
        const {selectedUser, messages} = get();
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
        }
        catch(error){
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== tempId),
            }))
            toast.error(error.response?.data?.message || "Message failed to send");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();

        const socket = useAuthStore.getState().socket;
        if(!socket) return;

        socket.off("newMessage"); //to prevent multiple listeners

        socket.on("newMessage", (newMessage) => {
            const isMessageFromSelectedUser = newMessage.senderId === selectedUser?._id;
            if(isMessageFromSelectedUser) set({messages: [...currentMessages, newMessage]});

            if(isSoundEnabled){
                notificationSound.currentTime = 0;
                notificationSound.play().catch((e) => console.log("Audio play failed: ",e));
            }
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
}));