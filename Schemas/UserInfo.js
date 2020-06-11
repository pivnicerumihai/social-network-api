const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    signup_date: "",
    profile_pic: "",
    num_posts: 0,
    num_likes: 0,
    liked:[],
    user_closed:"",
    friend_array:[],
    friend_requests: [],
    theme:"",
    customThemes:[],

})

module.exports = mongoose.model("User", UserSchema);