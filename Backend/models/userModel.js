import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true, 
        minlength: [2, 'Name must be at least 2 characters long'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'], 
        trim: true, 
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number'] 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long'] 
    },
    aadhaarDocumentPath: { 
        type: String, 
        trim: true 
    },
    role: {
        type: String,
        enum: {
            values: ['Owner', 'Buyer', 'Verifier'],
            message: '{VALUE} is not a valid role'
        },
        required: [true, 'Role is required']
    },
    kycStatus: {
        type: String,
        enum: {
            values: ['pending', 'verified', 'review_pending', 'still-pending', 'rejected','pending_claim'],
            message: '{VALUE} is not a valid KYC status'
        },
        default: 'pending'
    },
    walletAddress: { 
        type: String, 
        unique: true, 
        sparse: true, 
        trim: true,
        match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address'] 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for faster queries on email and walletAddress
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });

// Pre-save hook for password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to match password
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

export default User;
