const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Check if user already exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
    });

    const user = await User.findById(userId);

    res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.user_state === "Deactive") {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude password from the profile response
    const { password, ...profile } = user;
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { first_name, last_name, bio, skills, user_image } = req.body;
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (user_image !== undefined) updateData.user_image = user_image;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    await User.update(req.user.id, updateData);
    const updatedUser = await User.findById(req.user.id);
    const { password, ...profile } = updatedUser;

    res.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
