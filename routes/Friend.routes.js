const express = require("express");
const Post = require("../Schemas/Posts");
const User = require("../Schemas/UserInfo");
const router = express.Router();

// LOAD FRIEND DETAILS ///////////////////////////////
router
    .route("/friendDetails")
    .get((req, res) => {

        let friend_details = {
            id: "",
            name: "",
            user_closed: "",
            profile_pic: "",
            num_posts: "",
            num_likes: "",
            signup_date: "",
            friend_requests: []
        }

        const friend_id = req.query.friendId;
        User.find({
            _id: friend_id
        }, (err, docs) => {
            if (docs) {
                let friend = docs[0];
                friend_details = {
                    id: friend._id,
                    name: friend.first_name + " " + friend.last_name,
                    user_closed: friend.user_closed,
                    profile_pic: friend.profile_pic,
                    num_posts: friend.num_posts,
                    num_likes: friend.num_likes,
                    friend_requests: friend.friend_requests
                }
            } else {
                res.send(err);
            }
        })

        setTimeout(() => {
            res.json(friend_details)
        }, 1500)

    })

// REMOVE FRIEND ////////////////////////
router
    .route("/removeFriend")
    .post((req, res) => {

        const user_id = req.body.id;
        const friend_id = req.body.friend_id;
        User.findOneAndUpdate({
            _id: user_id
        }, {
            $pullAll: {
                friend_array: [friend_id]
            }
        }, (err, docs) => {
            if (docs) {
                User.findOneAndUpdate({
                    _id: friend_id
                }, {
                    $pullAll: {
                        friend_array: [user_id]
                    }
                }, (err, docs) => {
                    if (docs) {
                        res.send("Successfully Deleted!")
                    } else {
                        res.send("There was an error!")
                    }
                })

            }
        })
    })

router
    .route("/addFriend")
    .post((req, res) => {

        const user_details = req.body.User;
        const friend_id = req.body.friend_id;

        User.findOneAndUpdate({
            _id: friend_id
        }, {
            $push: {
                friend_requests: user_details
            }
        }, (err, docs) => {
            if (docs) {
                res.send("Success!")
            } else {
                res.send("There was an error in sending the friend request!")
            }
        })
    })

// Accept friend Request //////////////////////
router
    .route("/acceptFriend")
    .get((req, res) => {
        const user_id = req.query.id;
        const friend_id = req.query.friend_id;
        User.find({
            _id: user_id
        }, (err, docs) => {
            if (docs && docs[0].friend_requests.length > 0) {
                for (let i = 0; i < docs[0].friend_requests.length; i++) {
                    if (docs[0].friend_requests[i].id === friend_id) {
                        docs[0].friend_array.push(docs[0].friend_requests[i].id);
                        docs[0].friend_requests.splice(i, 1);
                        docs[0].save();
                        User.findOneAndUpdate({
                            _id: friend_id
                        }, {
                            $push: {
                                friend_array: [user_id]
                            }
                        }, (err, docs) => {
                            if (docs) {
                                res.send("Success!");
                            }
                        })
                    }
                }
            }
        })
    })

// DEClINE FRIEND REQUEST /////////////////
router
    .route("/declineFriend")
    .get((req, res) => {
        const user_id = req.query.id;
        const friend_id = req.query.friend_id;
        User.find({
            _id: user_id
        }, (err, docs) => {
            if (docs && docs[0].friend_requests.length > 0) {
                for (let i = 0; i < docs[0].friend_requests.length; i++) {
                    if (docs[0].friend_requests[i].id === friend_id) {
                        docs[0].friend_requests.splice(i, 1);
                        docs[0].save();
                        res.send("Success!")
                    }
                }
            }
        })
    })

module.exports = router;