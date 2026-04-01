import { Router } from "express";
import { getAllContacts, getMessagesByUserId, sendMessages, getChatPartners, deleteMessage, deleteChat} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = Router();

router.use(arcjetProtection,protectRoute); 

router.get("/contacts",protectRoute, getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessages);
router.delete("/message/:messageId", deleteMessage);
router.delete("/chat/:userId", deleteChat);

export default router;