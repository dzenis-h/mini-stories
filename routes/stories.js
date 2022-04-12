const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const { ensureAuthenticated } = require("../middleware/auth");

// Stories Index
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Show Single Story
// Show Single Story
router.get("/show/:id", async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  })
    .populate("user")
    .populate("comments.commentUser");
  if (story.status == "public") {
    res.render("stories/show", {
      story,
    });
  } else {
    if (req.user) {
      if (req.user.id == story.user._id) {
        res.render("stories/show", {
          story,
        });
      } else {
        res.redirect("/stories");
      }
    } else {
      res.redirect("/stories");
    }
  }
});

// List stories from a user
router.get("/user/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// Logged in users stories
router.get("/my", ensureAuthenticated, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id })
      .populate("user")
      .lean();
    res.render("stories/index", {
      stories,
    });
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

// Add Story Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

// Edit Story Form
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// Create Story
router.post("/", ensureAuthenticated, async (req, res) => {
  const { allowComments, title, body, status } = req.body;
  try {
    const newStory = {
      title,
      body,
      status,
      allowComments: allowComments ? true : false,
      user: req.user.id,
    };

    const story = await Story.create(newStory);
    res.redirect(`/stories/show/${story.id}`);
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

// Update story
router.put("/:id", ensureAuthenticated, async (req, res) => {
  const { allowComments, title, body, status } = req.body;

  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    // New values
    const updatedStory = {
      title,
      body,
      status,
      allowComments: allowComments ? true : false,
    };

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate(
        { _id: req.params.id },
        updatedStory,
        {
          new: true,
          runValidators: true,
        }
      );
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.log(error);
    return res.render("error/500");
  }
});

// Delete Story
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// Add Comment
router.post("/comment/:id", ensureAuthenticated, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });

    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id,
    };

    // Add to comment at the start
    story.comments.unshift(newComment);

    await story.save();
    res.redirect(`/stories/show/${story.id}`);
  } catch (error) {
    console.log(error);
    return res.render("error/500");
  }
});

module.exports = router;
