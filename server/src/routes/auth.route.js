import { Router } from "express";
import {signup, login, logout, updateProfile, checkAuth} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = Router();
//TODO: Uncomment 
// router.use(arcjetProtection); // Apply Arcjet protection to all routes in this router. 

router.post("/signup",signup);
router.post('/login',arcjetProtection, login);
router.post('/logout',logout); //logout has to be post method because it modifies the server state by clearing the authentication cookie. Using POST for logout is a common practice to ensure that the action is intentional and not triggered by web crawlers or accidental clicks, which can happen with GET requests.

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check",protectRoute,checkAuth); //This route is used to check if the user is authenticated and to retrieve their profile information. 
//TODO: Search User, Get User by ID, Get All Users, Delete User.
export default router;
