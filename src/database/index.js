const mongoose = require("mongoose")
const config = require("../../config.js")

mongoose.connect(process.env.mongoUri)
    .then(() => console.log("[Info] [MongoDB] Connected to MongoDB"))
    .catch((err) => console.log(err))