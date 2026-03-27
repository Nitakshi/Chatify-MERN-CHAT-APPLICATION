import { Router } from "express";
import {signup, login, logout, updateProfile, checkAuth} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup)
router.post('/login', login)
router.post('/logout',logout) //logout has to be post method because it modifies the server state by clearing the authentication cookie. Using POST for logout is a common practice to ensure that the action is intentional and not triggered by web crawlers or accidental clicks, which can happen with GET requests.

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check",protectRoute,checkAuth); //This route is used to check if the user is authenticated and to retrieve their profile information. The protectRoute middleware ensures that only authenticated users can access this route, and if they are authenticated, the checkAuth controller will return their user information in the response.
export default router;