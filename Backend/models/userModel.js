const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    aadhaarDocumentPath: { type: String, },
    role: {
        type: String,
        enum: ['Seller', 'Buyer', 'Verifier'],
        required: true,
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified','review_pending','still-pending', 'rejected'],
        default: 'pending',
    },
    walletAddress: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// ✅ Only ONE pre-save hook
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ✅ Only ONE matchPassword method
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log('--- Password Comparison ---');
    console.log('Password from Postman:', enteredPassword);
    console.log('Hashed Password from DB:', this.password);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Passwords Match:', isMatch);
    console.log('-------------------------');
    return isMatch;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
