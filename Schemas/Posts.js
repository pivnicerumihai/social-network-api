const mongoose = require("mongoose");

let PostsSchema = new mongoose.Schema({
    id: String,
    body: String,
    added_to: Array,
    deleted: Boolean,
    likes: Number,
    comments:Array,
    date_added:Number
})

module.exports = mongoose.model("Post", PostsSchema);