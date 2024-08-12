const { findStudent } = require("./admin_portal");
const Assignemnt = require("./db/assignment");
const Classroom = require("./db/classroom");
const Students = require("./db/students");
const Teachers = require("./db/teachers");
const {SECRET_KEY} = require("../data/key");
const jwt = require("jsonwebtoken");

//find room by id
// const findRoomById = async (room_id) =>{
//     return new Promise((resolve,reject) => {
//         const room = Classroom.findOne({room_id});

//         if(!room){
//             reject("No classroom!");
//         }
//         resolve(room);  
//     }); 
// }

// create new class-room
// data contains:  name, teacher_id
// const createRoom = async(data) => {
//     try {
//         const date = new Date();
//         const roomID = date.getTime().toString();

//         // NIC of teacher and room name
//         const {teacher_id, name} = data;

//         data.room_id = roomID;

//         const teacher = await Teachers.findOne({NIC:teacher_id});
        
//         const roomData = {
//             room_id:roomID,
//             room_name:name
//         };

//         teacher.classrooms.push(roomData);
//         await teacher.save();

        
//         const writeData = new Classroom(data);
//         await writeData.save();

//         return roomID;
//     } catch (err) {
//         throw(err);
//     }
// }

// create new class-room
// data contains:  name, teacher_id, timings, course_name, batch
const createRoom = async(data) => {
    try {
        const date = new Date();
        const roomID = date.getTime().toString();

        const {teacher_id, name, timings, course_name, batch} = data;

        data.room_id = roomID;

        const teacher = await Teachers.findOne({NIC:teacher_id});
        
        const roomData = {
            room_id:roomID,
            room_name:name
        };

        teacher.classrooms.push(roomData);
        await teacher.save();

        
        const writeData = new Classroom(data);
        await writeData.save();

        return {
            roomID,//will be saved on fend locally
            message:"room created!"
        };
        
    } catch (err) {
        throw(err);
    }
}

//updated function ehat adds stduent auto when room is created
// data contains:  name, teacher_id, timings, course_name, batch
// const createRoom = async(data) => {
//     try {
//         const date = new Date();
//         const roomID = date.getTime().toString();

//         // NIC of teacher and room name
//         const {teacher_id, name, timings, course_name, batch} = data;

//         data.room_id = roomID;

//         const teacher = await Teachers.findOne({NIC:teacher_id});

//         //finding stdeunts ti add in classroom
//         const students = await Students.find({batch, 'courses.name':course_name, 'courses.timings':timings}).select("NIC").exec();

//         // making an array that only contains NIC
//         const studentIds = students.map(s => s.NIC);

//         data.student_ids = studentIds;
        
//         const roomData = {
//             room_id:roomID,
//             room_name:name
//         };

//         teacher.classrooms.push(roomData);
//         await teacher.save();

        
//         const writeData = new Classroom(data);
//         await writeData.save();

//         return roomID;
//     } catch (err) {
//         throw(err);
//     }
// }

//basic info of room
//data contains roomID
const getRoom = async(data) => {
    try {
        const {roomID} = data;
        const roomData = await Classroom.findOne({room_id:roomID});

        if(roomData){
            return roomData;
        } else{
            return "Not found!";
        }
    } catch (err) {
        throw(err);
    }
}


//student join classroom
//data includes student_id, room_id
const joinRoom = async(data) => {
    try {
        //student_id in NIC here
        const {student_id, room_id} = data;

        const student = await findStudent(student_id);
        const classroom = await Classroom.findOne({room_id});

        if(student && classroom){
            //validating that student not already exist in the room
            if(student.classrooms !== room_id){
                //saving room_id to student data
                await Students.updateOne({NIC:student_id},{$push:{classrooms:room_id}});

                //saving student id to room
                await Classroom.updateOne({room_id}, {$push:{student_ids:student_id}});
            
                // adding student to classroom student's array
                // classroom.student_ids.push(student_id);
                // classroom.save();

                return("Room joined!");
            } else{
                return "Can't rejoin the same classroom!";
            }
            
        }else{
            return ("Invalid stduent or room!");
        }

    } catch (err) {
        throw(err);
    }
}



//when student leave rooms
//data contains student_id(nic), room_id
const leaveRoom = async(data) => {
    try {
        const {student_id, room_id} = data;

        
        //deleting room from student record
        await Students.updateMany({classroom:room_id},{ $pull: { classrooms: { room_id } } });

        //deleting all assignemnt in classroom of the student
        await Assignemnt.updateMany({room_id}, {$pull:{
            completedBy:student_id,
            toBeCompletedBy:student_id,
            pinned:student_id
        }});
    } catch (err) {
        throw(err);
    }
}

//returns all the students
// data contains: room_id
const getRoomStudents = async(data) => {
    try {
        const {room_id} = data;        
        
        //selecting only 3 fields
        // const students = await Students.find({classroom_id:room_id}).select("first_name last_name email ").exec();
        const students = await Students.find({classrooms:room_id});
        return students;

    } catch (err) {
        throw(err);
    }
};

//edits the name of classroom
// data contains: updatedName, room_id
const editRoomName = async(data) => {
    try {
        const { room_id, updatedName } = data;
        const room = await Classroom.findOne({room_id});

        if(room){
            const resp = await Classroom.updateOne({room_id}, {$set:{name:updatedName}});

            if(resp.acknowledged){
                return "Update successfull!";
            }  else{
                return "Error while updating name!";
            } 
        } else{
            return "Room not found";
        }
    } catch (err) {
        throw(err);
    }
}

//get all rooms of specific teacher
// data contians:teacher_id, 
const getTeacherRooms = async (data) => {
    try {
        const {teacher_id} = data;
        
        const rooms = await Classroom.find({teacher_id});
        return rooms;
    } catch (err) {
        throw(err);
    }
}


//delete clasroom
// data contains: teacher_id, room_id
const deleteRoom = async (data) => {
    try {
        const {room_id, teacher_id} = data;
        await Classroom.deleteOne({room_id});

        //deleting the room from teacher record
        await Teachers.updateOne({NIC:teacher_id}, { $pull: { classrooms: { room_id } } });

        //deleting room from student record
        await Students.updateMany({classroom:room_id},{ $pull: { classrooms: { room_id } } });

        //deleting all assignemnt in classroom
        await Assignemnt.deleteMany({room_id});

        return "room deleted!";
    } catch (err) {
        throw(err);
    }
}

//remove student from class
// data contains: room_id, NIC of std
const removeStudent = async(data) => {
    try {
        const { NIC, room_id } = data;

        // removing from classroom
        await Classroom.updateOne({room_id}, {$pull:{students_id:room_id}});

        // udpating student record
        await Students.updateOne({classrooms:room_id}, {$pull:{classrooms:room_id}});

        //removing the assignments
        await Assignemnt.updateMany({room_id}, {$pull:{
            toBeCompletedBy:NIC,
            completedBy:NIC
        }});

        return "Student removed!";
    } catch (err) {
        throw(err);
    }
}

//get all the assignments of a specific room
// data contains room_id
const getRoomAssignments = async(data) => {
    try {
        const {room_id} = data;
        const assignemnts = await Assignemnt.find({room_id});

        if(assignemnts){
            return assignemnts;
        } else{
            return [];
        }
    } catch (err) {
        throw(err);
    }
}

// data contains: teacher_id, room_id
const generateJoinLink = async(data) => {
    try {        
        const joinLink = jwt.sign(data ,SECRET_KEY,{expiresIn:"12h"});
        return {joinLink};
    } catch (err) {
        throw(err);
    }
}

module.exports = {createRoom, joinRoom, getRoomStudents, editRoomName, deleteRoom, removeStudent, getRoom, getTeacherRooms, leaveRoom, getRoomAssignments, generateJoinLink};