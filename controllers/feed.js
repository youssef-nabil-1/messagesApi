const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const io = require("../socket");

exports.getPosts = (req, res, next) => {
    Post.find()
        .populate("creator")
        .sort({ createdAt: -1 })
        .then((posts) => {
            res.status(200).json({
                message: "Fetched posts successfully",
                posts,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        // console.log("NO FILLEEEEEEEEEEE");
        const error = new Error("No image provided");
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const image = req.file;

    const post = new Post({
        title,
        content,
        creator: req.userId,
        imageUrl: image.path.replace("\\", "/"),
    });
    post.save()
        .then((result) => {
            return result.populate("creator");
        })
        .then((populatedRes) => {
            io.getIO().emit("posts", { action: "create", post: populatedRes });
            return User.findById(req.userId);
        })
        .then((user) => {
            user.posts.push(post);
            return user.save();
        })
        .then((result) => {
            res.status(201).json({
                message: "Post created successfully!",
                post,
                creator: { _id: result._id, name: result.name },
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const err = new Error("Could not find the post");
                err.statusCode = 404;
                throw err;
            }
            res.status(200).json({ message: "Post fetched.", post });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const image = req.file;

    Post.findById(postId)
        .then((post) => {
            if (post.creator.toString() !== req.userId) {
                const error = new Error("Unautherized");
                error.statusCode = 403;
                throw error;
            }
            if (!post) {
                const err = new Error("Could not find the post");
                err.statusCode = 404;
                throw err;
            }
            let imageUrl = post.imageUrl;
            if (image) {
                clearImage(imageUrl);
                imageUrl = image.path.replace("\\", "/");
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then((post) => {
            return post.populate("creator");
        })
        .then((post) => {
            io.getIO().emit("posts", { action: "update", post: post });
            res.status(200).json({
                message: "post updated successfully!",
                post,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error("Could not find post");
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error("Unautherized");
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then((result) => {
            io.getIO().emit("posts", { action: "delete", post: result._id });
            return User.findById(req.userId);
        })
        .then((user) => {
            user.posts.pull(postId);
            return user.save();
        })
        .then((result) => {
            res.status(200).json({ message: "post deleted" });
        })
        .catch((error) => {
            if (!error.statusCode) error.statusCode = 500;
            next(error);
        });
};

const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, (err) => console.log(err));
};
