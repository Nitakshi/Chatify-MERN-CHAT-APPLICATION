import { resendClient, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplates.js"

// send welcome email to user after successful registration
export const sendWelcomeEmail = async (name,email, clientURL) => {
    const {data, error} = await resendClient.emails.send({ //use resend client to send email
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Chatify!",
        html: createWelcomeEmailTemplate(name, clientURL),
    });

    if(error){
        console.error("Error sending welcome email: ",error);
        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully", data);
}