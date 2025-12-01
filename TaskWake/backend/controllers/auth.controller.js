const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'taskwave_secret_key', {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    emailService.sendSignupNotification(user, req.clientIp)
      .then(result => {
        if (result.error) {
          console.warn('Email notification failed:', result.error);
        } else if (result.simulated) {
          console.log('Email notification simulated for:', user.email);
        } else {
          console.log('Email notification sent successfully to user and admin');
        }
      })
      .catch(error => {
        console.warn('Unexpected error sending email notification:', error);
      });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    console.log('User logged in:', user.email);

    res.json({
      success: true,
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating profile' 
    });
  }
};