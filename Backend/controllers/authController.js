const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, kycStatus) => {
    return jwt.sign({ id, role, kycStatus }, process.env.JWT_SECRET, {
        expiresIn: '30m',
    });
};

exports.registerUser = async (req, res) => {
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

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request body:", req.body);


    // Quick validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password.trim()))) {
        const token = generateToken(user._id, user.role, user.kycStatus);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};


exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};