const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, next) => {
    const header = req.get("Authorization");
    let decodedToken;
    if (!header) {
    }
    const token = header.split(" ")[1];
    try {
        decodedToken = jwt.verify(token, "secrectectesfdasdjbd");
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const err = new Error("Unauthorized");
        err.statusCode = 401;
        throw err;
    }

    req.userId = decodedToken.userId;
    next();
};
