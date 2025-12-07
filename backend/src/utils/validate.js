// backend/src/utils/validate.js
// Input validation utility functions

// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate strong password
// At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char, no repeated characters
export const validatePassword = (password) => {
    if (password.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check for repeated characters
    const chars = password.split('');
    const hasDuplicate = chars.some((char, index) => chars.indexOf(char) !== index);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && !hasDuplicate;
};

// Sanitize string input to prevent XSS
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';

    return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit length
};

// Validate integer ID
export const validateId = (id) => {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
};

// Validate todo title
export const validateTodoTitle = (title) => {
    if (typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length >= 1 && trimmed.length <= 200;
};

// Validate todo description
export const validateTodoDescription = (description) => {
    if (description === undefined || description === null) return true;
    if (typeof description !== 'string') return false;
    return description.length <= 1000;
};
