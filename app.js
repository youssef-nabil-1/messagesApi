const express = require("express");
const bodyPasrser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const feedRouter = require("./routes/feed");
const authRouter = require("./routes/auth");
const socket = require("./socket");

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") +
                "-" +
                file.originalname
        );
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    }
    cb(null, false);
};

app.use(bodyPasrser.json()); // application/json
app.use(multer({ storage, fileFilter }).single("image"));

// allow accessing images folder
app.use("/images", express.static(path.join(__dirname, "images")));

//allow other domains to use my APIs
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, DELETE, PATCH, PUT"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use(authRouter);
app.use("/feed", feedRouter);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message: message });
});

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.1g7geq0.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then((result) => {
        console.log("CONNECTED");
        const httpServer = app.listen(process.env.PORT || 8080);
        const io = socket.init(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                transports: ["websocket", "polling"],
                credentials: true,
            },
            allowEIO3: true,
        });
        io.on("connection", (socket) => {
            // console.log("client connected");
        });
    })
    .catch((err) => console.log(err));
