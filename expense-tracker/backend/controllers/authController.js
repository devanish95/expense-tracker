const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Please fill in all fields (name, email, and password)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          'An account with this email already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message:
        'Registration successful! Welcome aboard.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Server error during registration'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide both email and password'
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password'
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Server error during login'
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

const forgotPassword = async (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      'Please use the Reset Password page to change your password.'
  });
};

const resetPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide your email/user ID and new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters long'
      });
    }

    const value = identifier.trim();

    let user = null;

    if (mongoose.isValidObjectId(value)) {
      user = await User.findOne({
        _id: value
      });
    }

    if (!user) {
      user = await User.findOne({
        email: value.toLowerCase()
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account found with this email or user ID'
      });
    }

    user.password = password;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        'Password reset successfully. You can now log in.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to reset password at this time.'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
};