const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../data/key");


exports.verify = (req,res,next) => {
    jwt.verify(req.headers.token, SECRET_KEY, (err,decoded) => {
        if(err){
            return res.send("Invalid user");
        }
        req.user = decoded.email;
        next();
    })
}

exports.isRoomLinkValid = (req,res,next) => {
    if (!req.body.room_link) {
        return res.status(400).json({ message: 'Room link is required.' });
    }
    
    jwt.verify(req.body.room_link, SECRET_KEY, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ message: 'Token has expired.' });
            }
            return res.status(401).json({ message: 'Invalid token.' });
        }
        
        req.room_id = decoded;
        next();
    });
}