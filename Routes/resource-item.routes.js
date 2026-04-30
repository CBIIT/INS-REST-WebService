const express = require("express");
const resourceControllers = require("../Controllers/resource.controllers");
const router = express.Router();

router.get("/:uuid", resourceControllers.getById);

module.exports = router;