export const AUTH_MESSAGES = {
  LOGIN_FAILED: 'Authentication failed. Please try again.',
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'No account found with this email.',
  WRONG_PASSWORD: 'Incorrect password.',
  POPUP_CLOSED: 'Sign-in popup was closed.',
};

export const FORM_MESSAGES = {
    SUBMIT_SUCCESS: 'Form submitted successfully',
    SUBMIT_ERROR: 'Error submitting form',
    VALIDATION_ERROR: 'Please check your input',
};

export const API_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
};

export default {
    AUTH_MESSAGES,
    FORM_MESSAGES,
    API_MESSAGES,
};
