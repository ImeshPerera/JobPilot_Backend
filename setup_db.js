const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const setupDatabase = async () => {
  let connection;
  try {
    console.log("Connecting to MySQL server to prepare database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("Creating database 'jobpilot' if it does not exist...");
    await connection.query("CREATE DATABASE IF NOT EXISTS jobpilot");
    await connection.query("USE jobpilot");

    console.log("Reading schema from database.txt...");
    const schemaPath = path.join(__dirname, "database.txt");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Split SQL by semicolon to execute tables sequentially
    const queries = schemaSql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    console.log("Creating tables...");
    for (const query of queries) {
      await connection.query(query);
    }
    console.log("Tables created successfully!");

    // Update .env file to use the new database
    const envPath = path.join(__dirname, ".env");
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Replace DB_DATABASE or DB_NAME or add them
    if (envContent.includes("DB_DATABASE=")) {
      envContent = envContent.replace(/DB_DATABASE=.*/, "DB_DATABASE=jobpilot");
    } else {
      envContent += "\nDB_DATABASE=jobpilot";
    }

    if (envContent.includes("DB_NAME=")) {
      envContent = envContent.replace(/DB_NAME=.*/, "DB_NAME=jobpilot");
    } else {
      envContent += "\nDB_NAME=jobpilot";
    }

    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env file with DB_NAME=jobpilot and DB_DATABASE=jobpilot");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();
