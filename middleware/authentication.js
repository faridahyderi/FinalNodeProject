const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {UnauthenticatedError} = require('../errors')

const auth = async (req,res,next) =>{
 
//check header
const authHeader = req.headers.authorization
console.log("Auth Header:", authHeader);

if(!authHeader || !authHeader.startsWith('Bearer '))
{
throw new UnauthenticatedError('Authentication Invalid')
}

const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT Payload:", payload); // Debugging: Log decoded JWT payload

    // Fetch user from DB to get the role
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthenticatedError('Authentication Invalid');
    }

    // Attach user details (including role) to request
    req.user = { userId: user._id, name: user.name, role: user.role };
    console.log("User Authenticated:", req.user);
    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    throw new UnauthenticatedError('Authentication Invalid');
  }
};

// Middleware to check if the user is an admin
const adminOnly = (req, res, next) => {
  console.log("Checking Admin Access:", req.user); //  Debugging
  if (req.user.role !== 'admin') {
    console.error("Access Denied: Not an Admin");
    return res.status(403).json({ message: 'You are not authorized to access this resource' });
  }
  console.log("Access Granted: Admin User");
  next();
};

module.exports = { auth, adminOnly };