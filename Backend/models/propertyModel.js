const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // This creates a link to the User model
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    documentHashes: {
        type: [String], // An array of strings
        required: true
    },
    status: {
        type: String,
        enum: ['pending_verification', 'verified', 'listed_for_sale', 'sold'],
        default: 'pending_verification'
    },
    transactionHash: {
        type: String,
    }
    
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;