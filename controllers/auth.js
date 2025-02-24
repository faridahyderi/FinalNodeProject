const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  if (req.method === 'POST') {

  const { email, password } = req.body;
  console.log("Received login data:", { email, password });
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const token = user.createJWT();
  console.log("Generated Token:", token);

  res.status(StatusCodes.OK).json({ user: { name: user.name , role: user.role  }, token }); // Return JSON only on POST
}
}


module.exports = {
  register,
  login,
 
};
