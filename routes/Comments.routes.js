const express = require("express");
const Comment = require("../Schemas/Comments");
const Post = require("../Schemas/Posts");
const router = express.Router();

// Post Comment //////

router
.route("/postComment")

.post((req,res)=>{
const post_id = req.body.post_id;
const comment = req.body.newComment;
Post.findOneAndUpdate({_id:post_id},{$push:{comments:comment}},(err,docs)=>{
    if(docs){
        res.send("Success!")
    }
})
})

router
.route("/deleteComment")
.post((req,res)=>{
     Post.findOneAndUpdate({_id:req.body.post_id},{$pull:{comments:{id:req.body.comment_id}}},(err,docs)=>{
        if(docs){
           res.send("Comment Successfully Deleted!")
        }

    })


})

router 
.route("/updateComment")
.post((req,res)=>{
    const comment_body = req.body.commentBody;
    const comment_id = req.body.comment_id;
  Post.updateOne({"comments.id":comment_id},{$set:{"comments.$.body":comment_body}},(err,docs)=>{
      if(docs){
          res.send("Successfully Edited!")
      }
    })

 
})
module.exports = router;