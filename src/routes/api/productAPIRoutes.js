const express = require("express");
const router = express.Router();
const productAPIController = require("../../controllers/api/productAPIController");

router.get("/", productAPIController.list);
router.get("/:id", productAPIController.detail);

module.exports = router;
