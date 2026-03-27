import "dotenv/config";

export const ENV = Object.freeze({ // Freeze the ENV object to prevent modifications at runtime
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    CLIENT_URL: process.env.CLIENT_URL,     
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,   
});

const requiredInProd = ["PORT", "MONGO_URI", "JWT_SECRET", "RESEND_API_KEY", "EMAIL_FROM", "EMAIL_FROM_NAME", "CLIENT_URL"];
if(ENV.NODE_ENV === "production") {
    const missingVars = requiredInProd.filter((key) => !ENV[key]);
    if(missingVars.length > 0) {
        console.error(`Error: Missing required environment variables in production: ${missingVars.join(", ")}`); // Log the missing variables for debugging
        process.exit(1); // Exit the application with an error code
    }   
}