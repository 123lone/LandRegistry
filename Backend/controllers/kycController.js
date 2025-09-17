const User = require('../models/userModel');

// In /controllers/kycController.js
exports.uploadAadhaar = async (req, res) => {
    console.log('--- KYC Upload Process Started ---');
    
    // 1. Check if Multer processed the file
    console.log('File object from Multer:', req.file);
    if (!req.file) {
        console.log('Error: req.file is undefined. Upload failed.');
        return res.status(400).json({ message: 'No file uploaded or multer failed.' });
    }

    try {
        const user = await User.findById(req.user.id);
        console.log('User found in DB:', user.email);

        if (user) {
            // 2. Assign the status and path
            user.kycStatus = 'review_pending';
            user.aadhaarDocumentPath = req.file.path;
            console.log('Attempting to save with path:', user.aadhaarDocumentPath);
            console.log('User object before save:', user);

            const updatedUser = await user.save();
            
            // 3. Check the result after saving
            console.log('User object after save:', updatedUser);
            console.log('--- KYC Upload Process Succeeded ---');
            
            res.json({
                message: 'KYC document uploaded. Awaiting verification.',
                user: updatedUser,
            });
        } else {
            console.log('Error: User not found in database.');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        // 4. Catch any errors during the save process
        console.error('!!! ERROR during KYC upload process:', error);
        res.status(400).json({ 
            message: 'Error saving to database.',
            error: error.message 
        });
    }
};