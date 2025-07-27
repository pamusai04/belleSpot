const validator = require('validator');

const validateServiceProviderInput = (data) => {
    const requiredFields = ['firstName', 'lastName', 'gender', 'emailId', 'password', 'role', 'location'];

    const hasAllFields = requiredFields.every(field => Object.hasOwn(data, field));
    if (!hasAllFields) {
        throw new Error("Some required fields are missing");
    }

    // Validate first name
    if (typeof data.firstName !== 'string' || data.firstName.trim().length < 3 || data.firstName.trim().length > 20) {
        throw new Error("First name must be 3-20 characters long");
    }

    // Validate last name
    if (typeof data.lastName !== 'string' || data.lastName.trim().length < 3 || data.lastName.trim().length > 20) {
        throw new Error("Last name must be 3-20 characters long");
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(data.gender)) {
        throw new Error("Gender must be male, female, or other");
    }

    // Validate email
    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid email format");
    }

    // Validate password
    if (!validator.isStrongPassword(data.password)) {
        throw new Error("Password is not strong enough (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)");
    }

    // Validate role
    if (data.role !== 'serviceProvider') {
        throw new Error("Role must be 'serviceProvider'");
    }

    // Validate location
    if (typeof data.location !== 'object' || data.location.type !== 'Point' || !Array.isArray(data.location.coordinates) || data.location.coordinates.length !== 2) {
        throw new Error("Invalid location format. Must include type: 'Point' and coordinates: [lng, lat]");
    }

    const [lng, lat] = data.location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error("Coordinates must be numbers [longitude, latitude]");
    }
    
};

module.exports = validateServiceProviderInput;
