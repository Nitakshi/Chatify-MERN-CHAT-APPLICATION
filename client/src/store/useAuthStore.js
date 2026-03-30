import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    updatingProfileImage: false,
    socket: null,
    onlineUsers: [],
    
    checkAuth: async () => {
        try{
            const res = await axiosInstance.get("/auth/check"); //called backend API
            set({authUser: res.data});
            get().connectSocket();
        }
        catch(error){
            console.error("Error in authCheck: ",error);
            set({authUser: null});
        }
        finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({isSigningUp: true});
        try{
            const res = await axiosInstance.post("/auth/signup",data);
            set({authUser: res.data});

            toast.success("Account created successfully!");
            get().connectSocket();
        }
        catch(error){
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        finally{
            set({isSigningUp: false});
        }
    },

    login: async (data) => {
        set({isLoggingIn: true});
        try{
            const res = await axiosInstance.post("/auth/login",data);
            set({authUser: res.data});
            toast.success("Logged in successfully");

            get().connectSocket();
        }
        catch(error){
            toast.error(error.response.data.message);
        }
        finally{
            set({isLoggingIn: false});
        }
    },

    logout: async () => {
        set({isLoggingOut: true});
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            useChatStore.getState().setSelectedUser(null); // Clear selected chat partner on logout
            toast.success("Logged out successfully");

            get().disconnectSocket();
        }
        catch(error){
            toast.error(error?.response?.data?.message || "Error logging out");
        }   
        finally{
            set({isLoggingOut: false});
        }
    },

    updateProfile: async (data) => {
        set({updatingProfileImage: true});
        try{
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: res.data});
            toast.success("Profile updated successfully");
        }
        catch(error){
            console.log("Error in update profile", error);
            toast.error(error.response.data.message);
        }
        finally{
            set({updatingProfileImage: false});
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();

        if (!authUser) return;

        // Reuse the existing socket instead of creating a new one each time
        if (socket) {
            if (socket.connected) return;
            socket.connect();
            return;
        }

        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
            withCredentials: true,
            autoConnect: false,
            transports: ["websocket"],
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        newSocket.on("disconnect", () => {
            set({ onlineUsers: [] });
        });

        set({ socket: newSocket });
        newSocket.connect();
    },

    disconnectSocket: () => {
        const { socket } = get();

        if (socket) {
            socket.off("getOnlineUsers");
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}));