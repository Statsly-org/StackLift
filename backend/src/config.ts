function validateEnv() {
  const errors: string[] = [];

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === "") {
    errors.push("DATABASE_URL is required but not set");
  } else if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...)");
  }

  const port = process.env.PORT || "3001";
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    errors.push(`PORT must be a valid port number (1-65535), got: ${port}`);
  }

  if (errors.length > 0) {
    console.error("Environment validation failed:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}

validateEnv();
