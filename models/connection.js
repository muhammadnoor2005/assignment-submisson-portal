const mongoose = require("mongoose");

mongoose.connect(process.env.CONNECTION_STR)
.then(res => console.log("DB connected")).catch(err => console.log(err));

module.exports = mongoose; 