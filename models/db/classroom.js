const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    room_id:String,

    //name will be course name
    name:String,
    teacher_id:String,

    timings:String,
    course_name:String,
    batch:String,

    student_ids:[String],

    // assignments:{
    //     pinned:[String], // ids of assignments pinned by teacher
    //     pending:[String], //assignemnts whose due date is remaining
    //     expired:[String], //assignemnts whose due dates completed
    //     schduled:[String] //scheduled assignments
    // }
});


const Classroom = mongoose.model("Classroom", classroomSchema);
module.exports = Classroom;