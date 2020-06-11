const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

require("mongoose-type-email");
require("mongoose-type-url");
const app = express();
const cors = require('cors');

const user = require("./routes/User.routes");
const post = require("./routes/Posts.routes");
const friend = require("./routes/Friend.routes");
const comment = require("./routes/Comments.routes");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use("/uploads", express.static("uploads"))
app.use(bodyParser.json());
app.use(cors());
app.use("/user", user);
app.use("/posts", post);
app.use("/friend", friend);
app.use("/comments", comment);

// Database Connections 
mongoose.connect("mongodb+srv://pivnicem:Mitzap9080@social-network-api-rm9na.mongodb.net/test?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Database Connected'))
    .catch(err => console.log(err));;
    let date = new Date().toISOString();
    console.log(date);
const ImageSchema = new mongoose.Schema({
    imageName: {
        type: String,
        default: "none",
        required: true
    },
    imageData: {
        type: String,
        required: true
    }
})

let Image = mongoose.model('Image', ImageSchema);

//Get Current Day
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;
// 

app.listen(3001, function () {
    console.log("Server is running on port 3001");

})