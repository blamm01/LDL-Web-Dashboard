const mongoose = require("mongoose")
const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: "l!"
    },
    badword: {
        type: Boolean,
        default: false
    },
    disinvitelink: {
        type: Boolean,
        default: false
    },
    capsword: {
        type: Boolean,
        default: false
    },
    bwword: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model("guild-caidats", schema)