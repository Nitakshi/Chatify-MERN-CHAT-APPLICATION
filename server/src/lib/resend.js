import {Resend} from "resend";
import "dotenv/config";

//resend client is used to send emails using the Resend service, which provides a simple API for sending transactional emails.
export const resendClient = new Resend(process.env.RESEND_API_CLIENT); //create a new instance of the Resend client using the API key from environment variables

export const sender = { // define the sender's email and name using environment variables
    email: process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME
}