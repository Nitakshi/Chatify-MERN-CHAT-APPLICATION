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
    isDeletingAccount: false,
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

    deleteAccount: async () => {
        set({isDeletingAccount: true});
        try{
            await axiosInstance.delete("/auth/delete-account");
            set({authUser: null});
            useChatStore.getState().setSelectedUser(null);
            get().disconnectSocket();
            toast.success("Account deleted successfully");
        }
        catch(error){
            toast.error(error?.response?.data?.message || "Error deleting account");
        }
        finally{
            set({isDeletingAccount: false});
        }
    },

    connectSocket: () => {
        const { authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
        });
        
        socket.connect();

        set({socket});

        socket.on("connect", () => {
            console.log("Socket connected", socket.id);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        //listen for online users event
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds});
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },
}));