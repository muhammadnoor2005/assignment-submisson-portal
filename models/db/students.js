const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    first_name:String,
    last_name: String,

    NIC: String,
    batch:Number,
    roll_number:String,

    //number,city,gender,last_qualication,dob,
    phone_number:String,
    city:String,
    gender:String,
    last_qulification:String,
    date_of_birth:String,

    email:String,
    password:String,

    // img:{
    //     imgURL:String,
    //     public_id:String
    // },

    // teacher_id:String,

    classrooms:[String],
    courses:[{
        name:String,// Web and mobile
        timings:String //format:4:00PM-6:00PM
    }]

})

const Students = mongoose.model("Students", studentSchema);
module.exports = Students;