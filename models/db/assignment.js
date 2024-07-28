const mongoose = require("mongoose");

const assignemntSchema = new mongoose.Schema({
    id:String,

    title:String,
    description:String,
    dueDate:Number,
    scheduledUploadTime:Number,

    // helpful when we delete a classroom so to delete all its assignemnts also
    room_id:String,

    teacher_id:String,
    classroom_id:String,

    // assignedTo:[String],

    status:{
        type:String,
        enum:['pending', 'expired', 'scheduled']
    },

    completedBy:[{
        student_id:String,
        submittedAt:Number, //time
        comments:String,
        file:{
            fileURL:String,
            public_id:String
        },
        githubUrl:String
    }],

    //ids of students whose assignments are pinned in classroom by teacher
    pinned:[String],

    //store student ids
    toBeCompletedBy:[String],

    // //store scheduled assignmnet ids
    // scheduledAssignments:[String]

});

const Assignemnt = mongoose.model("Assignment", assignemntSchema);
module.exports = Assignemnt;