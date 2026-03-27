import { Router } from "express";
import {signup, login, logout, updateProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup)
router.post('/login', login)
router.post('/logout',logout) //logout has to be post method because it modifies the server state by clearing the authentication cookie. Using POST for logout is a common practice to ensure that the action is intentional and not triggered by web crawlers or accidental clicks, which can happen with GET requests.

router.put("/update-profile", protectRoute, updateProfile);
export default router;