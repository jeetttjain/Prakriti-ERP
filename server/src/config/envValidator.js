/**
 * Server Boot Environment Variable Validator.
 * Halts application boot with a clear error if critical environment variables are missing.
 * @module config/envValidator
 */
const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Required keys for baseline runtime
  const required = [
    "PORT",
    "MONGODB_URI",
    "JWT_SECRET",
  ];

  if (isProduction) {
    required.push("REFRESH_TOKEN_SECRET");
  }

  const missing = required.filter((key) => !process.env[key] && key !== "PORT");

  if (missing.length > 0) {
    console.error("❌ [CRITICAL FATAL ERROR] Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("Please configure environment variables before starting the server.");
    if (isProduction) {
      process.exit(1);
    }
  }

  console.log("✅ [Environment] All required environment variables validated successfully.");
};

module.exports = {
  validateEnvironment,
};
