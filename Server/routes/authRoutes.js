const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, updateProfile, sendOTP, verifyOTP, sendEmailOTP, verifyEmailOTP, becomeVendor } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/become-vendor', protect, becomeVendor);
router.post('/send-otp', protect, sendOTP);
router.post('/verify-otp', protect, verifyOTP);
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);

module.exports = router;
