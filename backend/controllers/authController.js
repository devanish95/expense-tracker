const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
      password,
      authProvider: 'password'
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
    console.error(
      'Registration error:',
      error
    );

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

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          'This account does not have a password. Please use Google login or Email OTP.'
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

    const token =
      generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Server error during login'
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          'Google credential is required'
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID
      });

    const payload =
      ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email
    ) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid Google account information'
      });
    }

    const googleId =
      payload.sub;

    const email =
      payload.email
        .toLowerCase()
        .trim();

    const name =
      (
        payload.name ||
        email.split('@')[0]
      ).trim();

    let user =
      await User.findOne({
        googleId
      });

    if (!user) {
      user =
        await User.findOne({
          email
        });

      if (user) {
        user.googleId =
          googleId;

        user.isVerified =
          true;

        user.authProvider =
          'google';

        await user.save();
      } else {
        user =
          await User.create({
            name,
            email,
            googleId,
            authProvider:
              'google',
            isVerified: true
          });
      }
    } else {
      user.isVerified =
        true;

      await user.save();
    }

    const token =
      generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(
      'Google login error:',
      error
    );

    return res.status(401).json({
      success: false,
      message:
        'Google authentication failed'
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide your email address'
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account found with this email address'
      });
    }

    const otp =
      crypto.randomInt(
        100000,
        1000000
      ).toString();

    const otpHash =
      crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    await OTP.deleteMany({
      email: normalizedEmail
    });

    await OTP.create({
      email: normalizedEmail,
      otpHash,
      expiresAt:
        new Date(
          Date.now() + 5 * 60 * 1000
        ),
      attempts: 0
    });

    await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject:
        'Your Expense Tracker Login OTP',
      text:
        `Your Expense Tracker login OTP is ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Expense Tracker</h2>
          <p>Your login OTP is:</p>
          <h1 style="letter-spacing: 8px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this OTP, you can ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message:
        'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error(
      'Send OTP error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to send OTP at this time'
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide your email and OTP'
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const otpRecord =
      await OTP.findOne({
        email: normalizedEmail
      });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          'OTP not found or expired. Please request a new OTP.'
      });
    }

    if (
      otpRecord.expiresAt <
      new Date()
    ) {
      await OTP.deleteOne({
        _id: otpRecord._id
      });

      return res.status(400).json({
        success: false,
        message:
          'OTP has expired. Please request a new OTP.'
      });
    }

    if (
      otpRecord.attempts >= 5
    ) {
      await OTP.deleteOne({
        _id: otpRecord._id
      });

      return res.status(429).json({
        success: false,
        message:
          'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    const otpHash =
      crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex');

    if (
      otpHash !==
      otpRecord.otpHash
    ) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(401).json({
        success: false,
        message:
          'Invalid OTP'
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail
      });

    if (!user) {
      await OTP.deleteOne({
        _id: otpRecord._id
      });

      return res.status(404).json({
        success: false,
        message:
          'No account found with this email address'
      });
    }

    user.isVerified =
      true;

    await user.save();

    await OTP.deleteOne({
      _id: otpRecord._id
    });

    const token =
      generateToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        'OTP login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(
      'Verify OTP error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to verify OTP at this time'
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
    const {
      identifier,
      password
    } = req.body;

    if (
      !identifier ||
      !password
    ) {
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

    const value =
      identifier.trim();

    let user = null;

    if (
      mongoose.isValidObjectId(value)
    ) {
      user =
        await User.findOne({
          _id: value
        });
    }

    if (!user) {
      user =
        await User.findOne({
          email:
            value.toLowerCase()
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account found with this email or user ID'
      });
    }

    user.password =
      password;

    user.authProvider =
      'password';

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        'Password reset successfully. You can now log in.'
    });
  } catch (error) {
    console.error(
      'Reset password error:',
      error
    );

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
  googleLogin,
  sendOtp,
  verifyOtp,
  getMe,
  forgotPassword,
  resetPassword
};