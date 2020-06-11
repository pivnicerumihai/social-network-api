const express = require("express");
const Post = require("../Schemas/Posts");
const User = require("../Schemas/UserInfo");
const router = express.Router();


// Friends list on POST TO homepage button ///////////////////////////////////
router
    .route("/getFriendsListToPost")
    .get((req, res) => {
        console.log("Searching");
        const id = req.query.id;
        const search = req.query.searchString.replace(/\s+/g, '_');
        let friendsObject = {
            name: [],
            profile_pic: [],
            user_id: [],
            error: []
        };

        User.find({
            _id: id
        }, (err, docs) => {
            if (docs) {
                let friendsList = [...docs[0].friend_array];


                friendsList.forEach((el) => User.find({
                    _id: el,
                    "username": {
                        "$regex": search
                    }
                }, (err, docs) => {
                    if (docs.length) {
                        friendsObject.name.push(docs[0].first_name + " " + docs[0].last_name);
                        friendsObject.profile_pic.push(docs[0].profile_pic);
                        friendsObject.user_id.push(docs[0]._id)
                    } else {
                        friendsObject.error.push(err);
                    }
                }))
            }
        })

        setTimeout(() => {
            res.json(friendsObject);
        }, 1500)
    })

// CREATE A NEW POST ///////////////////////////////////////////////////////////////////////////
router
    .route("/createNewPost")
    .post((req, res) => {

        const id = req.body.id;
        const post = new Post(req.body);
        try {
            post.save().then(() =>{
                User.findOneAndUpdate({
                    _id: id
                }, {
                    $inc: {
                        num_posts: 1
                    }
                },(err,docs)=>{
                    if(docs){
                        res.send("Success!")
                    }
                });
            })
            

        } catch {
            res.send("There was an error saving your post")
        }
    });

// GET POSTS /////////////////////////////////////////////////////////////////
router
    .route("/getPosts")
    .get((req, res) => {
        const id = req.query.id;
        let posts_object = [];
        Post.find({
            $or: [{
                id: id,
                deleted: false
            }, {
                added_to: id,
                deleted: false
            }]
        }, (err, docs) => {
            if (docs) {

                docs.map((post, post_number) => {
                    User.findOne({
                        _id: post.id
                    }, (err, docs) => {
                 posts_object.push({
                            added_to: [],
                            comments: [],
                            _id: post._id,
                            added_by: {
                                id: docs._id,
                                profile_pic: docs.profile_pic,
                                name: docs.first_name + " " + docs.last_name
                            },
                            body: post.body,
                            deleted: post.deleted,
                            likes: post.likes,
                            date_added: post.date_added
                        });
                       
                        if (post.added_to.length > 0) {
                            post.added_to.map((id, i) => {
                                User.find({
                                    _id: id
                                }, (err, docs) => {
                                    const users = docs;
                                    users.map((user, i) => {
                                        posts_object[post_number].added_to.push({
                                            id: user._id,
                                            profile_pic: user.profile_pic,
                                            username: user.first_name + " " + user.last_name
                                        })
                                    })
                                })
                            })
                        }
                    }).then(()=> post.comments.map((el,i)=>{
                        User.findOne({_id:el.user_id},(err,docs)=>{
                            let comments_object = {
                            ...el,
                            name:"",
                            profile_pic:""};
                            comments_object.name = docs.first_name + " " + docs.last_name;
                            comments_object.profile_pic = docs.profile_pic;
                            posts_object[post_number].comments.push(comments_object);
                        })
                    }))

                })


            } else {
                console.log("error");
            }
        })
        setTimeout(() => res.send(posts_object.reverse()), 1000);
    })
// DELETE POSTS ///////////////////////////////////////
router
    .route("/deletePost")
    .get((req, res) => {

        const postId = req.query.postId;
        const userId = req.query.userId;

        Post.findOneAndUpdate({
            _id: postId
        }, {
            deleted: true
        }, (err, docs) => {
            if (docs) {
                User.findOneAndUpdate({
                    _id: userId
                }, {
                    $inc: {
                        num_posts: -1
                    }
                }, (err, docs) => {
                    res.send("Post deleted!")
                })
            } else {
                res.send("Error")
            }
        })
    })
// EDIT POST ///////////////////////////////////
router
    .route("/editPost")
    .post((req, res) => {
        const post_id = req.body.post_id;
        const post_content = req.body.post_content;
        Post.findOneAndUpdate({
            _id: post_id
        }, {
            $set: {
                "body": post_content
            }
        }, (err, docs) => {
            if (docs) {
                res.send("Edited!");
            }
        })
    })
module.exports = router;