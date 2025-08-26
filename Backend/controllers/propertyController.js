const Property = require('../models/propertyModel');

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private/Seller
exports.createProperty = async (req, res) => {
    const { title, description, location, price, documentHashes } = req.body;

    if (!title || !description || !location || !price || !documentHashes) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const property = new Property({
            title,
            description,
            location,
            price,
            documentHashes,
            owner: req.user.id // The owner is the logged-in user
        });

        const createdProperty = await property.save();
        res.status(201).json(createdProperty);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating property.' });
    }
};

// Add this to /controllers/propertyController.js

// @desc    Verify a property
// @route   PUT /api/properties/verify/:id
// @access  Private/Verifier
// Add this to /controllers/propertyController.js

// @desc    List a verified property for sale
// @route   PUT /api/properties/list/:id
// @access  Private/Seller
// In /controllers/propertyController.js
exports.listPropertyForSale = async (req, res) => {
    try {
        console.log('--- Listing Property for Sale ---');
        console.log('1. Finding property with ID:', req.params.id);
        const property = await Property.findById(req.params.id);

        if (!property) {
            console.log('Error: Property not found.');
            return res.status(404).json({ message: 'Property not found' });
        }
        console.log('2. Property found:', property.title);

        console.log('3. Checking ownership...');
        if (property.owner.toString() !== req.user.id) {
            console.log('Error: Ownership check failed.');
            return res.status(403).json({ message: 'User not authorized to list this property' });
        }
        console.log('4. Ownership confirmed.');

        console.log('5. Checking property status...');
        if (property.status !== 'verified') {
            console.log('Error: Property is not in verified state.');
            return res.status(400).json({ message: 'Only verified properties can be listed for sale.' });
        }
        console.log('6. Status is verified. Updating to listed_for_sale...');

        property.status = 'listed_for_sale';
        const updatedProperty = await property.save();
        
        console.log('7. Property saved successfully.');
        res.json(updatedProperty);

    } catch (error) {
        // This block is likely not being reached.
        console.error('!!! UNEXPECTED CRASH:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Add this to /controllers/propertyController.js

// @desc    Get all properties listed for sale
// @route   GET /api/properties/marketplace
// @access  Private
exports.getMarketplaceProperties = async (req, res) => {
    try {
        const properties = await Property.find({ status: 'listed_for_sale' })
            .populate('owner', 'name email'); // Fetches owner's name and email

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (property) {
            property.status = 'verified';
            const updatedProperty = await property.save();
            res.json(updatedProperty);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while verifying property.' });
    }
};