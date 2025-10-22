const express = require("express");
const path = require("path");
const fs = require("fs");

const imageRouter = express.Router();

imageRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Construct path to the image
  const imagePath = path.join(process.cwd(), "pictures", `${id}.jpeg`);

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).send(`Image not found: ${imagePath}`);
  }

  // Set correct content type (PNG in this case)
  res.set("Content-Type", "image/png");
  res.sendFile(imagePath);
});

module.exports = imageRouter;