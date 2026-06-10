const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, address, agreeToTerms, newsletter } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      } else {
        // Delete pending unverified user to start fresh
        await User.deleteOne({ email });
      }
    }

    // Create user object
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      agreeToTerms,
      newsletter,
      isEmailVerified: false,
      EmailVer: 0
    });

    // Generate secure 6-digit random number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.emailOtpHash = hashedOtp;
    user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();

    await user.save();

    // Send email with Nodemailer
    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'Registration pending email verification. OTP sent to your email.',
      email: user.email,
      pendingVerification: true
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password +isEmailVerified +emailOtpLastSentAt');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Auto-trigger a new OTP if it has expired or cooldown has passed
      let resendMessage = '';
      const cooldownPeriod = 60 * 1000;
      const lastSent = user.emailOtpLastSentAt ? new Date(user.emailOtpLastSentAt).getTime() : 0;
      
      if (Date.now() - lastSent >= cooldownPeriod) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        user.emailOtpHash = await bcrypt.hash(otp, salt);
        user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = new Date();
        await user.save();
        await sendOtpEmail(email, otp);
        resendMessage = ' A new verification code has been sent to your email.';
      } else {
        const secondsLeft = Math.ceil((cooldownPeriod - (Date.now() - lastSent)) / 1000);
        resendMessage = ` Please wait ${secondsLeft} seconds before requesting another code.`;
      }

      return res.status(403).json({
        success: false,
        error: `Please verify your email address before signing in.${resendMessage}`,
        email: user.email,
        pendingVerification: true
      });
    }

    // Create token
    const token = generateToken(user._id);

    // Set cookie only if noCookie is not requested (keeps admin console logins isolated from customer cookies)
    const noCookie = req.query.noCookie === 'true' || req.headers['x-no-cookie'] === 'true';
    if (!noCookie) {
      const isProduction = process.env.NODE_ENV !== 'development';
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        PhoneVer: user.PhoneVer,
        EmailVer: user.EmailVer,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        status: user.status,
        vendorApplication: user.vendorApplication
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV !== 'development';
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0)
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
           _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage,
            PhoneVer: user.PhoneVer,
            EmailVer: user.EmailVer,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            status: user.status,
            vendorApplication: user.vendorApplication
        }
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      // Do not allow email and phone updates for uniqueness and security
      // user.email = req.body.email || user.email;
      // user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      if (req.body.profileImage !== undefined) {
        user.profileImage = req.body.profileImage;
      }
      
      // If user is updating their password
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          profileImage: updatedUser.profileImage,
          PhoneVer: updatedUser.PhoneVer,
          EmailVer: updatedUser.EmailVer,
          isEmailVerified: updatedUser.isEmailVerified,
          role: updatedUser.role,
          status: updatedUser.status,
          vendorApplication: updatedUser.vendorApplication
        }
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send OTP to email or phone number
// @route   POST /api/auth/send-otp
// @access  Private
const sendOTP = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || (type !== 'email' && type !== 'phone')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid verification type (email or phone)' });
    }

    const user = await User.findById(req.user._id).select('+emailOtp +emailOtpExpires +phoneOtp +phoneOtpExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate a secure 6-digit random number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    if (type === 'email') {
      user.emailOtp = otp;
      user.emailOtpExpires = expires;
    } else {
      user.phoneOtp = otp;
      user.phoneOtpExpires = expires;
    }

    await user.save();

    // Log the OTP clearly to the server console
    console.log('\n========================================');
    console.log(`[OTP VERIFICATION SYSTEM]`);
    console.log(`User: ${user.firstName} ${user.lastName} (ID: ${user._id})`);
    console.log(`Target: ${type === 'email' ? user.email : user.phone}`);
    console.log(`Generated OTP: ${otp}`);
    console.log(`Expires: ${expires.toLocaleTimeString()}`);
    console.log('========================================\n');

    // Return the OTP in response for development convenience
    res.status(200).json({
      success: true,
      message: `OTP sent to ${type === 'email' ? 'email' : 'phone'} successfully.`,
      otp, // Included in response for seamless UI simulation & testing
      target: type === 'email' ? user.email : user.phone
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP for email or phone number
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOTP = async (req, res) => {
  try {
    const { type, otp } = req.body;
    if (!type || (type !== 'email' && type !== 'phone')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid verification type (email or phone)' });
    }
    if (!otp) {
      return res.status(400).json({ success: false, error: 'Please enter the OTP' });
    }

    const user = await User.findById(req.user._id).select('+emailOtp +emailOtpExpires +phoneOtp +phoneOtpExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let isMatch = false;
    let isExpired = false;

    if (type === 'email') {
      isMatch = user.emailOtp === otp;
      isExpired = user.emailOtpExpires ? new Date() > user.emailOtpExpires : true;
    } else {
      isMatch = user.phoneOtp === otp;
      isExpired = user.phoneOtpExpires ? new Date() > user.phoneOtpExpires : true;
    }

    if (!isMatch || isExpired) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Success! Update verification fields and clear OTP fields
    if (type === 'email') {
      user.EmailVer = 1;
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
    } else {
      user.PhoneVer = 1;
      user.phoneOtp = undefined;
      user.phoneOtpExpires = undefined;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully.`,
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
        PhoneVer: updatedUser.PhoneVer,
        EmailVer: updatedUser.EmailVer
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send / Resend OTP to email using Nodemailer
// @route   POST /api/auth/send-email-otp
// @access  Public/Private
const sendEmailOTP = async (req, res) => {
  try {
    let email = req.body.email;
    
    // If not in body, try to get from logged in user if available
    if (!email && req.user) {
      email = req.user.email;
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with this email' });
    }

    // Check resend cooldown
    if (user.emailOtpLastSentAt) {
      const timeDiff = Date.now() - new Date(user.emailOtpLastSentAt).getTime();
      if (timeDiff < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - timeDiff) / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${secondsLeft} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate secure 6-digit random number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.emailOtpHash = hashedOtp;
    user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();

    await user.save();

    // Send email with Nodemailer
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP for email
// @route   POST /api/auth/verify-email-otp
// @access  Public/Private
const verifyEmailOTP = async (req, res) => {
  try {
    let email = req.body.email;
    const { otp } = req.body;

    // If not in body, try to get from logged in user if available
    if (!email && req.user) {
      email = req.user.email;
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }
    if (!otp) {
      return res.status(400).json({ success: false, error: 'Please enter the OTP' });
    }

    const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Limit attempts: preferably max 5 attempts
    if (user.emailOtpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum OTP attempts exceeded. Please request a new verification code.'
      });
    }

    // Increment attempts
    user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
    await user.save();

    // Check expiry
    const isExpired = user.emailOtpExpiresAt ? new Date() > new Date(user.emailOtpExpiresAt) : true;
    if (isExpired) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new verification code.' });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(otp, user.emailOtpHash);
    if (!isMatch) {
      const remaining = 5 - user.emailOtpAttempts;
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${remaining > 0 ? `Attempts remaining: ${remaining}` : 'Maximum attempts exceeded. Please request a new code.'}`
      });
    }

    // Success! Update verification fields and clear OTP fields
    user.isEmailVerified = true;
    user.EmailVer = 1;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    user.emailOtpAttempts = 0;

    const updatedUser = await user.save();

    // Generate JWT & set cookie to allow immediate login on success
    const token = generateToken(updatedUser._id);
    const isProduction = process.env.NODE_ENV !== 'development';
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully and logged in.',
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
        PhoneVer: updatedUser.PhoneVer,
        EmailVer: updatedUser.EmailVer,
        isEmailVerified: updatedUser.isEmailVerified,
        role: updatedUser.role,
        status: updatedUser.status,
        vendorApplication: updatedUser.vendorApplication
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit Vendor Application request
// @route   POST /api/auth/become-vendor
// @access  Private
const becomeVendor = async (req, res) => {
  try {
    const { companyName, storeCategory, supportPhone, supportEmail, description } = req.body;

    if (!companyName || !storeCategory || !supportPhone || !supportEmail) {
      return res.status(400).json({ success: false, error: 'Please enter all important onboarding details' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    user.vendorApplication = {
      isApplied: true,
      companyName,
      storeCategory,
      supportPhone,
      supportEmail,
      description: description || '',
      appliedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding merchant application submitted successfully under verification review queue!',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  sendOTP,
  verifyOTP,
  sendEmailOTP,
  verifyEmailOTP,
  becomeVendor
};
