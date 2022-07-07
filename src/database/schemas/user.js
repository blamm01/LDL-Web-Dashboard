const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    userId: String,
    accessToken: String,
    refreshToken: String,
    expires_in: Number,
    secretAccessKey: String,
    lastUpdated: {
        type: Number,
        required: true,
        default: Date.now(),
    },
    user: {
        id: String,
        tag: String,
        username: String,
        discriminator: String,
        avatar: String,
    },
    accessible_guilds: Array,
})

module.exports = mongoose.model("discord_users", schema)