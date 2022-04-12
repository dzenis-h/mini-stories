const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const ensureAuthenticated = require("../middleware/auth").ensureAuthenticated;

router.get("/", (req, res) => {
  res.render("index/welcome");
});

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("index/dashboard", {
      name: req.user.firstName,
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/about", (req, res) => {
  res.render("index/about");
});

module.exports = router;
