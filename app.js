const express = require("express");
const config = require("./Config");
const logger = require("./Components/logger");
const mysql = require("./Components/mysql");
const elasticsearch = require("./Components/elasticsearch");

const app = express();
require("./Config/express")(app);

const startServer = async () => {
  try {
    // Test Elasticsearch connection
    const elasticsearchConnected = await elasticsearch.testConnection();
    if (elasticsearchConnected) {
      logger.info("Elasticsearch connected!");
    } else {
      logger.info("Failed to connect to Elasticsearch.");
    }

    // Test MySQL connection
    if (mysql !== null) {
      const mysqlConnected = await mysql.query("SELECT 1 AS c1");
      if (mysqlConnected[0].c1) {
        logger.info("Relational DB connected!");
      } else {
        logger.info("Failed to connect to Relational Database.");
      }
    }

    // Start server
    app.listen(config.port, () => {
      logger.info("Server listening on %d, in %s mode", config.port, config.env);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.info("Gracefully shutting down :)");
  if (mysql && typeof mysql.close === "function") {
    mysql.close();
  }
  process.exit();
});
