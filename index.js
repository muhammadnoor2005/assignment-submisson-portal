if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}


const express = require("express");
// const path = require("path");
const bodyParser = require("body-parser");
const auth = require("./routes/auth");
const methodOverride = require("method-override");
const mongoose = require("./models/connection");
const cors = require("cors");
const { verify } = require("./middlewares/auth");
const multer = require("multer");
const profile = require("./routes/profile");
const student = require("./routes/student");
const app = express();

const admin_portal = require("./routes/admin_portal");
const teacher = require("./routes/teacher");
const classroom = require("./routes/classroom");
const assignment = require("./routes/assignment");

const cron = require("node-cron");
const { deleteExpiredAssignments } = require("./models/assignment");


cron.schedule('0 * * * *', deleteExpiredAssignments);


app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(cors());

app.set("view engine","ejs");
app.set("views","views");

app.get("/",(req,res)=>{
    res.send("Hello world!");
});

app.use("/auth",auth);
app.use("/profile",verify,profile);
app.use("/student",student);
app.use("/admin_portal", admin_portal);
app.use("/teacher", teacher);
app.use("/classroom", classroom);
app.use("/assignment",assignment);

app.use("*",(req,res)=>{
    res.send("Route invalid");
});

app.listen(8000,() => { 
    console.log("Server started");
});
