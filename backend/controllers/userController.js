const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, 'mykey', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Create user with provided role (stored as userType)
    const user = await User.create({ name, email, password, userType: role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: generateToken(user._id),
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage,
        token: generateToken(user._id),
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      mobile: user.mobile || '',
      address: user.address || '',
      bio: user.bio || '',
      profileImage: user.profileImage || ''
    });
  } catch (err) {
    console.error('Get user profile error:', err.message);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.address = req.body.address || user.address;
    user.bio = req.body.bio || user.bio;

    // Handle password update if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle profile image if uploaded
    if (req.file) {
      // Delete previous profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Save new image path relative to server root
      const imagePath = `/uploads/profiles/${req.file.filename}`;
      user.profileImage = imagePath;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      mobile: updatedUser.mobile || '',
      address: updatedUser.address || '',
      bio: updatedUser.bio || '',
      profileImage: updatedUser.profileImage || '',
      token: generateToken(updatedUser._id),
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Update user profile error:', err.message);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};