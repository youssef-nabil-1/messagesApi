const express = require("express");
const { check } = require("express-validator");
const feedController = require("../controllers/feed");
const router = express.Router();
const { isAuth } = require("../middlewares/is-auth");

router.get("/posts", isAuth, feedController.getPosts);
router.post(
    "/post",
    isAuth,
    [
        check("title").trim().isLength({ min: 5 }),
        check("content").trim().isLength({ min: 5 }),
    ],
    feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);
router.put(
    "/post/:postId",
    isAuth,
    [
        check("title").trim().isLength({ min: 5 }),
        check("content").trim().isLength({ min: 5 }),
    ],
    feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
