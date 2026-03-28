import {create} from "zustand";

export const useAuthStore = create((set) => ({
    isLoggedIn: false,

    login: () => {
        console.log("Logged in");
        set({isLoggedIn: true});
    }
}));