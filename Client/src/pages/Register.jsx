import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    agreeToTerms: false,
    newsletter: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state && location.state.email && location.state.pendingVerification) {
      setRegisteredEmail(location.state.email);
      setStep(3);
    }
  }, [location.state]);
  
  const { register, isLoading } = useAuthStore();
  const { sendEmailOTP, verifyEmailOTP } = useAuthStore();

  // Email Verification States
  const [otpCode, setOtpCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setVerificationError('Please enter a valid 6-digit verification code.');
      return;
    }

    setVerificationLoading(true);
    setVerificationError('');

    const result = await verifyEmailOTP(registeredEmail || formData.email, otpCode);
    setVerificationLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setVerificationError(result.error || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setVerificationLoading(true);
    setVerificationError('');
    
    const result = await sendEmailOTP(registeredEmail || formData.email);
    setVerificationLoading(false);
    
    if (result.success) {
      setResendCooldown(60); // 60 seconds cooldown
    } else {
      setVerificationError(result.error || 'Failed to resend verification code. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a valid address';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    if (step === 2) {
      if (!validateStep2()) return;
      
      const result = await register(formData);
      
      if (result.success) {
        if (result.pendingVerification) {
          setRegisteredEmail(result.email || formData.email);
          setStep(3);
        } else {
          navigate('/');
        }
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
      return;
    }

    if (step === 3) {
      await handleVerifyOTP();
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-page">
      <div className="container">
        <motion.div 
          className="auth-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left Side - Form */}
          <div className="auth-form-container">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <img src="/src/assets/whiteocean.png" alt="WhiteOcean" />
                <span>White<span className="text-primary">Ocean</span></span>
              </Link>
              <h1>Create Account</h1>
              <p className="auth-subtitle">
                {step === 1 ? 'Enter your account information' : 'Set up your delivery details'}
              </p>
              
              {/* Progress Indicator */}
              <div className="progress-indicator">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <span>Account Info</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <span>Delivery</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-message">
                  {errors.general}
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="form-step"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <div className="input-wrapper">
                        <User size={20} className="input-icon" />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className={`form-input ${errors.firstName ? 'error' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <div className="input-wrapper">
                        <User size={20} className="input-icon" />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className={`form-input ${errors.lastName ? 'error' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={20} className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={20} className="input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <Lock size={20} className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className={`strength-fill strength-${passwordStrength}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`strength-text strength-${passwordStrength}`}>
                          {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={20} className="input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Delivery Information */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="form-step"
                >

                  <div className="form-group">
                    <label htmlFor="address">Delivery Address</label>
                    <div className="input-wrapper">
                      <MapPin size={20} className="input-icon" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your full address"
                        className={`form-input ${errors.address ? 'error' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.address && <span className="error-text">{errors.address}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span className="checkmark"></span>
                      I agree to the <Link to="/terms" className="link">Terms of Service</Link> and <Link to="/privacy" className="link">Privacy Policy</Link>
                    </label>
                    {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span className="checkmark"></span>
                      Send me promotional offers and updates
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Email OTP Verification */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="form-step"
                >
                  <p className="otp-info-text" style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    We have sent a secure 6-digit verification code to your email:
                    <strong style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                      {registeredEmail || formData.email}
                    </strong>
                  </p>

                  <div className="form-group">
                    <label htmlFor="otp" style={{ color: '#94a3b8' }}>Verification Code</label>
                    <div className="input-wrapper" style={{ marginTop: '0.5rem' }}>
                      <Check size={20} className="input-icon" />
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          setVerificationError('');
                        }}
                        placeholder="Enter 6-digit OTP"
                        className={`form-input ${verificationError ? 'error' : ''}`}
                        style={{
                          letterSpacing: otpCode ? '0.25em' : 'normal',
                          textAlign: otpCode ? 'center' : 'left',
                          fontSize: otpCode ? '1.25rem' : '1rem',
                          fontWeight: otpCode ? 'bold' : 'normal',
                          color: '#fff',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        disabled={verificationLoading}
                      />
                    </div>
                    {verificationError && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>{verificationError}</span>}
                  </div>

                  <div className="otp-resend-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                    <p style={{ margin: 0 }}>Didn't receive the email? Check your spam folder or resend the code.</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0 || verificationLoading}
                      className="resend-btn"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: resendCooldown > 0 ? '#64748b' : 'var(--color-primary)',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                        padding: 0,
                        textDecoration: resendCooldown > 0 ? 'none' : 'underline'
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Verification Code'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Form Actions */}
              <div className="form-actions" style={{ marginTop: '2rem' }}>
                {step === 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handlePrevStep}
                    disabled={isLoading}
                    className="prev-btn"
                  >
                    Previous
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="lg"
                  className="auth-submit-btn"
                  disabled={isLoading || verificationLoading || (step === 3 && otpCode.length !== 6)}
                  style={{ width: step === 3 ? '100%' : 'auto' }}
                >
                  {isLoading || verificationLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      {step === 1 && <>Next Step <ArrowRight size={20} /></>}
                      {step === 2 && <>Create Account <ArrowRight size={20} /></>}
                      {step === 3 && <>Verify Email Address <Check size={20} /></>}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="auth-visual">
            <div className="visual-content">
              <motion.div
                className="floating-card"
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="card-icon">🎯</div>
                <h3>Personalized Experience</h3>
                <p>Get recommendations based on your preferences</p>
              </motion.div>
              
              <motion.div
                className="floating-card"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="card-icon">🔒</div>
                <h3>Secure & Private</h3>
                <p>Your data is protected with advanced security</p>
              </motion.div>
              
              <motion.div
                className="floating-card"
                animate={{ y: [0, -25, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              >
                <div className="card-icon">🎁</div>
                <h3>Exclusive Benefits</h3>
                <p>Access member-only deals and rewards</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
