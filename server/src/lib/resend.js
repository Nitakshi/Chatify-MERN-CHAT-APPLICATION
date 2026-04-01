import {Resend} from "resend";
import { ENV } from "./env.js";

//resend client is used to send emails using the Resend service, which provides a simple API for sending transactional emails.
export const resendClient = new Resend(ENV.RESEND_API_KEY); //create a new instance of the Resend client using the API key from environment variables

export const sender = { // define the sender's email and name using environment variables
    email: ENV.EMAIL_FROM,
    name: ENV.EMAIL_FROM_NAME || "Chatify Team", 
}