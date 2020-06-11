const express = require("express");
const User = require("../Schemas/UserInfo");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const multer = require("multer");

// Image Upload Settings ///////////////////////////
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filname: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Files must of .jpeg or .png types only"), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


/////////////////////////////////////////////////////

router //Create New User
    .route("/createUser")
    .post((req, res) => {
        console.log(req.body)
        const {
            first_name,
            last_name,
            reg_password,
            reg_email
        } = req.body;
// Check if email exists in db
        User.find({
            email: reg_email
        }, (err, docs) => {
            if (docs.length) {
                res.json("Email already in use");
            } else {
                bcrypt.hash(reg_password, saltRounds, (err, hash) => {
                    const user = new User({
                        first_name: first_name,
                        last_name: last_name,
                        email: reg_email,
                        username: first_name.toLowerCase() + "_" + last_name.toLowerCase(),
                        password: hash,
                        profile_pic: "https://i.ibb.co/n17TDjh/head-carrot.png",
                        num_posts: 0,
                        num_likes: 0,
                        friend_array: [],
                        friend_requests: [],
                        liked:[],
                        user_closed: "no",
                        theme:"Classic",
                        customThemes:[]
                    })
                    user.save().then(() => res.json("User registered"), (err) => res.json(err));
                })
            }
        })


    });
    // Sign In User //
router 
    .route("/signIn")
    .post((req, res) => {
        try {
            User.find({
                email: req.body.email,
            }, (err, docs) => {
                if (docs.length) {
                    bcrypt.compare(req.body.password, docs[0].password, (err, result) => {

                        if (result == true) {
                            res.send(docs[0]);
                        } else {
                            res.send("Email or password are incorrect!")
                        }
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }
    })

// Upload Profile Picture ///////
router
.route("/uploadNewProfilePic")
.post(upload.single("profilePicture"),(req,res)=>{
    const id = req.body.id;
    const file_path = req.file.path;

    User.findOneAndUpdate({_id:id},
        {
            profile_pic: "http://localhost:3001/" + file_path
        },(err,docs)=>{
            if(docs){
                res.send("Image Upload Success!");
            }
            else{
                console.log("Error");
            }
        })
})

// Update User 
router
.route("/updateUserDetails")
.get((req, res) => {
    userId = req.query.userId
    User.find({
        _id: userId
    }, (err, docs) => {
        if (docs.length) {
            res.send(docs[0])
        }
    })
})

// GET LIST OF ALL FRIENDS
router
.route("/getAllFriends")
.get((req,res)=>{
    const id = req.query.id;
    let friends_object = {
        name: [],
        profile_pic: [],
        user_id: [],
    };
    User.find({_id:id},(err,docs)=>{
        if(docs){
            let friends_list = docs[0].friend_array;
            friends_list.forEach((el,i)=> 
            User.find({_id:el},(err,docs)=>{
                if(docs){
                    friends_object.name.push(docs[0].first_name + " " + docs[0].last_name);
                    friends_object.profile_pic.push(docs[0].profile_pic);
                    friends_object.user_id.push(docs[0]._id)
                }
                else if (err){
                    res.json(err);
                }
            })
             ) }
    })
    setTimeout(()=>{
      res.json(friends_object);
    },2000)
})
router
.route("/searchPeople")

.get((req, res) => {
    const search = req.query.searchString.replace(/\s+/g, '_');
    let personObject = {
        name: [],
        profile_pic: [],
        user_id: [],
        error: []
    };
    if (search.length > 0){
        User.find({
            "username": {
                "$regex": search
            }
        }, (err, docs) => {
            if (docs.length > 0) {
                docs.forEach((el, i) => {
                    personObject.name.push(docs[i].first_name + " " + docs[i].last_name);
                    personObject.profile_pic.push(docs[i].profile_pic);
                    personObject.user_id.push(docs[i]._id);
                })
            } else {
                personObject.error.push(err);
            }
        })
    setTimeout(() => {
        res.json(personObject);
    }, 1000)}
})

router 
.route("/editUserDetails")
.post((req,res)=>{
    const {first_name,last_name,email,new_password,current_password,id} = req.body;
    User.find({_id:id},(err,docs)=>{
        if (docs.length) {
            bcrypt.compare(current_password, docs[0].password, (err, result) => {

                if (result == true) {
                    if(new_password){ 
                        bcrypt.hash(new_password, saltRounds, (err, hash) => {
                        User.updateOne({_id:id},{$set:{"first_name": first_name,"last_name" :last_name, "email":email,"password":hash}},(err,docs)=>{
                            if(docs){
                                res.send("Updated!")
                            }
                        })
                    })
                   
                    }
                    else{
                        User.updateOne({_id:id},{$set:{"first_name": first_name,"last_name" :last_name, "email":email,}},(err,docs)=>{
                           if(docs){
                            res.send("Updated!");
                        }})
                    }
                } else {
                    res.send("Password is Incorrect!")
                }
            })
        }
    })
})

// Update Theme//
router
.route("/updateTheme")
.post((req,res)=>{

    const theme = req.body.theme;
    const user_id = req.body.user_id;
    User.findOneAndUpdate({_id:user_id},{$set:{"theme": theme}},(err,docs)=>{
        if(docs){
            res.send("Theme Updated!")
        }
        else{
            res.send(err);
        }
    })
})

router
.route("/updateCustomTheme")
.post((req,res)=>{
    const user_id = req.body.user_id;
    const theme = req.body.newTheme;
    const theme_name = req.body.themeName;
    
    const new_theme= {
        name:theme_name,
        properties:{
            primary_color:theme[0],
            secondary_color:theme[1],
            third_color:theme[2],
            shadow:theme[3],
            hover_color:theme[4]
        }
    }
    User.findOneAndUpdate({_id:user_id}, {$push:{customThemes: new_theme}},(err,docs)=>{
        if(docs){
            res.send("Theme Saved")
        }
    })
})

router
.route("/deleteCustomTheme")
.post((req,res)=>{
    const user_id = req.body.user_id;
    const theme = req.body.theme;
   User.findOneAndUpdate({_id: user_id}, {$pull:{customThemes:{name: theme}}},(err,docs)=>{
    if(docs){ 
    res.send("Theme Deleted");
   }})
})

router
.route("/like")
.post((req,res)=>{
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;
    User.findOneAndUpdate({_id:user_id},{$push:{liked:friend_id}},(err,docs)=>{
      if(docs){
          User.findOneAndUpdate({_id:friend_id},{$inc:{num_likes:1}},(err,docs)=>{
              if(docs){
                  res.send("Success!")
              }
          })
      }
    })

})

router
.route("/dislike")
.post((req,res)=>{
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;
    User.findOneAndUpdate({_id:user_id}, {$pull:{liked:friend_id}}, (err,docs)=>{
        if(docs){
            User.findByIdAndUpdate({_id:friend_id},{$inc:{num_likes: -1}}, (err,docs)=>{
                if(docs){
                    res.send("Success!");
                }
            })
        }
    })
})
module.exports = router;