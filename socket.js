const { Server } = require("socket.io");

let io;

module.exports = {
    init: (server, opts) => {
        io = new Server(server, opts);
        // console.log(opts);
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("IO CONNECTION NOT AVAILABLE");
        }
        return io;
    },
};
