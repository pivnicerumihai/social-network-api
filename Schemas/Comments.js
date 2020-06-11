const mongoose = require("mongoose");

let CommentsSchema = new mongoose.Schema({
    id:Number,
    body:String,
    user_id:String,
    deleted:Boolean,
    likes:Number,
    date_added:Number
})

module.exports = mongoose.model("Comment",CommentsSchema);