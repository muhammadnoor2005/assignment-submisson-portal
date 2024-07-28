const Assignemnt = require("./db/assignment");
const Students = require("./db/students");
const cloudinary = require("cloudinary").v2;

// data contains:  classroom_id, title, description, dueDate, teacher_id(NIC), status, scheduledUploadTime(if any)
const createAssignment = async(data) => {
    try {
        const {classroom_id, scheduledUploadTime, status} = data;

        // creating is for assignment
        const date = new Date();
        const id = date.getTime().toString();
        
        //setting assignment id
        data.classroom_id = id;

        if(status == 'scheduled'){
            // await Teachers.updateOne({'classrooms.room_id': classroom_id}, { $push: { assignments: id } });
            const writeData = new Assignemnt(data);
            await writeData.save();
            return "Assignment created!";

        } else{
             //finding all the students ids of the classroom in which assignment is posted
            const studentsOfRoom = await Students.find({classroom_id}).select("NIC").exec();

            //pushing the assignment id in each of student in classroom
            // await Students.updateMany({classroom_id}, { $push: { pending_assignments: id } });

            //pushing assignment in teacher's data also
            // await Teachers.updateOne({'rooms.room_id': classroom_id}, { $push: { assignments: id } });

            //pushing assignent id in classroom data also
            // await Classroom.updateOne({room_id:classroom_id}, {$push: {pending_assignments_id: id}});

            data.toBeCompletedBy = studentsOfRoom.map(student => student.NIC);
            // data.assignedTo = studentsOfRoom.map(student => student.NIC);

            const writeData = new Assignemnt(data);
            await writeData.save();

            return "Assignment uploaded!";
        }
       
    } catch (err) {
        throw(err);
    }
}

// data contains: assignment_id, title, description, dueDate, scheduledUploadTime(if any)
const editAssignment = async(data) => {
    try {
        const {assignment_id, scheduledUploadTime} = data;

        const assignment = await Assignemnt.findOne({id:assignment_id});

        if(assignment){
            const resp = await Assignemnt.updateOne({id:assignment_id}, {data});

            if(resp.acknowledged){
                return "Updated!";
            } else{
                throw new Error("Error while updating!");
            }
        } else{
            return "Assignment not found!";
        }
    } catch (err) {
        throw(err);
    }
};

// data contains:assignment_id
const deleteAssignment = async(data) => {
    try {
        const {assignment_id} = data;
        

        //deleting files of assignment from cloudinary
        const oldAssignments = await Assignemnt.find({ createdAt: { $lt: cutoffTime } });

        for (const assignment of oldAssignments) {
            for (const submission of assignment.completedBy) {
                if (submission.filePath) {
                    const publicId = submission.filePath.split('/').pop().split('.')[0]; // Adjust based on your Cloudinary URL structure
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            await assignment.remove();
        };

        //deleting the assignment from db
        await Assignemnt.deleteOne({id:assignment_id});

        //removing assignment id from submiteed_assignemnt of stduents
        // await Students.updateMany({submitted_assignments: assignment_id}, { $pull: { submitted_assignments: assignment_id } });

        //removing assignment id from pending_assignemnt of stduents
        // await Students.updateMany({pending_assignments: assignment_id}, { $pull: { pending_assignments: assignment_id } });

        //removing assignment id from pending_assignemnt of classroom
        // await Classroom.updateOne({pending_assignments_id: assignment_id}, { $pull: { pending_assignments_id: assignment_id } });

        // //removing assignment id from expired_assignemnt of classroom
        // await Classroom.updateOne({expired_assignments_id: assignment_id}, { $pull: { expired_assignments_id: assignment_id } });

        // //removing assignment id from teacher of assignment
        // await Teachers.updateOne({assignments: assignment_id}, {$pull:{assignments:assignment_id}});
    } catch (err) {
        throw(err);
    }
}

// when the schudle time is reached then this func will be called from api
// data contains: assignment_id, classroom_id
const scheduledAssignment = async(data) => {
    try {
        const {assignment_id, classroom_id} = data;
        const assignment = await Assignemnt.findOne({id:assignment_id});

        if(assignment){
             //finding all the students ids of the classroom in which assignment is posted
             const studentsOfRoom = await Students.find({classroom_id}).select("NIC").exec();

             //pushing the assignment id in each of student in classroom
            //  await Students.updateMany({classroom_id}, { $push: { pending_assignments: assignment_id } });
 
             //pushing assignment in teacher's data also
            //  await Teachers.updateOne({'rooms.room_id': classroom_id}, { $push: { assignments: assignment_id } });
 
             //pushing assignent id in classroom data also
            //  await Classroom.updateOne({room_id:classroom_id}, {$push: {pending_assignments_id: assignment_id}});

             //ids students of room
            const toBeCompletedBy = studentsOfRoom.map(student => student.NIC);
             //pulling it out from scheduled assignment section
             await Assignemnt.updateOne({id:assignment_id}, { 
                $set:{
                    status:'pending', 
                    toBeCompletedBy,
                    scheduledUploadTime:null
                },
              });

            // data.assignedTo = studentsOfRoom.map(student => student.NIC);
            // data.toBeCompletedBy = studentsOfRoom.map(student => student.NIC);
        } else{
            return "Assignemnt not found!";
        }

    } catch (err) {
        throw(err);
    }
};


// DELETE student's ASIGNEMNTS  and files that are uploaded 36 hours ago
const deleteExpiredAssignments = async() => {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 36 * 60 * 60 * 1000);

    try {
        const oldAssignments = await Assignemnt.find({'completedBy.submittedAt':{$lt:cutoffTime}});

        const completedByExtract = oldAssignments.map(assignment => {
            return {
                completedBy: assignment.completedBy.filter(submission => submission.submittedAt < cutoffTime)
            };
            });

        //   removing files from cloudinary
        for(let i=0; i < completedByExtract.length; i++){
            if(completedByExtract[i].file){
                await cloudinary.uploader.destroy(completedByExtract[i].file.public_id, {
                    resource_type: "raw"
                });
            };
        }

        //removing assignments from db
        await Assignemnt.updateMany(
            { 'completedBy.submittedAt': { $lt: cutoffTime } },
            { $pull: { completedBy: { submittedAt: { $lt: cutoffTime } } } }
        );
    } catch (err) {
        throw(err);
    }
}


module.exports = {createAssignment, editAssignment, deleteAssignment, scheduledAssignment, deleteExpiredAssignments};