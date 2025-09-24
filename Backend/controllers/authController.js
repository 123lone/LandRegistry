import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role, kycStatus) => {
    return jwt.sign({ id, role, kycStatus }, process.env.JWT_SECRET, {
        expiresIn: '30m',
    });
};

export const registerUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    if (role === 'Verifier') {
        return res.status(400).json({ message: 'Cannot register as a Verifier.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, phone, password, role });
    if (user) {
        res.status(201).json({ message: 'User registered successfully. Please log in.' });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};


export const updateUserWallet = async (req, res) => {
    console.log('req.user:', req.user);
  try {
    console.log('--- PATCH /api/users/wallet ---');
    console.log('Body:', req.body);
    console.log('User from token middleware:', req.user);

    // Validate authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in request.'
      });
    }

    const { walletAddress } = req.body;
    walletAddress=walletAddress.toLowerCase();

    // Validate wallet format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'A valid wallet address is required.'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if wallet is already used by another account
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'This wallet address is already in use by another account.'
      });
    }

    // Save wallet to DB
    user.walletAddress = walletAddress;
    const updatedUser = await user.save();

    console.log('[SUCCESS] Wallet saved for user:', updatedUser._id);

    return res.status(200).json({
      success: true,
      message: 'Wallet address saved successfully.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        kycStatus: updatedUser.kycStatus,
        walletAddress: updatedUser.walletAddress
      }
    });
  } catch (error) {
    console.error('[CRITICAL ERROR in updateUserWallet]:', error);

    // Always return JSON on error
    return res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request body:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password.trim()))) {
    const token = generateToken(user._id, user.role, user.kycStatus);

    // Optional: still set cookie if you want
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    // Send user + token in JSON
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      walletAddress: user.walletAddress,
      token, // <--- frontend can store this
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};


export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
// Login or register via wallet
export const loginWithWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Validate wallet format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ message: "Valid wallet address required" });
    }

    // Find user with case-insensitive match
    const user = await User.findOne({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, "i") }
    }).select(
      '_id name email role kycStatus walletAddress propertiesOwned totalValue createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: "Wallet not registered" });
    }

    console.log("Found user for wallet login:", {
      id: user._id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role, user.kycStatus);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    // Respond with comprehensive user info
    const responseData = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email || null,
      role: user.role,
      kycStatus: user.kycStatus,
      walletAddress: user.walletAddress, // return as stored
      propertiesOwned: user.propertiesOwned || 0,
      totalValue: user.totalValue || 0,
      token,
    };

    console.log("Sending response data:", responseData);
    res.json(responseData);

  } catch (error) {
    console.error("Wallet login error:", error);
    res.status(500).json({ message: "Server error during wallet login" });
  }
};
export const getUserByWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Convert input to lowercase
    const normalizedWallet = walletAddress.toLowerCase();

    // Query by lowercase wallet
    const user = await User.findOne({
      walletAddress: normalizedWallet
    }).select('name email phone walletAddress createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by wallet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
