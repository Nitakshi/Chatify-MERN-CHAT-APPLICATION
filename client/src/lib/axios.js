import axios from "axios";

export const axiosInstance = axios.create({ 
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api", // Use relative URL in production
    withCredentials: true, // Include cookies in requests
})

//axios is a promise-based HTTP client for the browser and node.js. 
// It provides an easy-to-use API for making HTTP requests and handling responses. 
// This instance can be used throughout the application to make API calls to the backend server.