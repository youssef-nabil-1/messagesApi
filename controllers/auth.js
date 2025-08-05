const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then((hashed) => {
            const user = new User({ name, email, password: hashed });
            return user.save();
        })
        .then((user) => {
            res.status(201).json({ message: "User created", userId: user._id });
        })
        .catch((error) => {
            if (!error.statusCode) error.statusCode = 500;
            next(error);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email })
        .then((user) => {
            if (!user) {
                const err = new Error("Invalid Email");
                err.statusCode = 401;
                throw err;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((bool) => {
            if (!bool) {
                const err = new Error("Invalid Password");
                err.statusCode = 401;
                throw err;
            }
            const token = jwt.sign(
                { email: loadedUser.email, userId: loadedUser._id.toString() },
                "secrectectesfdasdjbd",
                {
                    expiresIn: "1h",
                }
            );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString(),
            });
        })
        .catch((error) => {
            if (!error.statusCode) error.statusCode = 500;
            next(error);
        });
};
