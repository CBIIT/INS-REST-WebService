const express = require("express");
const resourceControllers = require("../Controllers/resource.controllers");
const router = express.Router();

router.post("/search", resourceControllers.search);
router.post("/filters", resourceControllers.getFilters);

module.exports = router;