import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  Tag, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Store,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import './BecomeVendor.css';

const BecomeVendor = () => {
  const { user, becomeVendor, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    storeCategory: '',
    supportPhone: user?.phone || '',
    supportEmail: user?.email || '',
    description: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Beverages',
    'Snacks & Brand Foods',
    'Bakery & Bread',
    'Meat & Seafood',
    'Spices & Grains',
    'Organic & Wellness'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.storeCategory) {
      newErrors.storeCategory = 'Please choose a store category';
    }
    if (!formData.supportPhone.trim()) {
      newErrors.supportPhone = 'Support contact number is required';
    } else if (formData.supportPhone.length < 10) {
      newErrors.supportPhone = 'Please enter a valid phone number';
    }
    if (!formData.supportEmail.trim()) {
      newErrors.supportEmail = 'Support email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Support email is invalid';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please write a brief store description';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the seller terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Call state-store becomeVendor
    const res = await becomeVendor({
      companyName: formData.companyName,
      storeCategory: formData.storeCategory,
      supportPhone: formData.supportPhone,
      supportEmail: formData.supportEmail,
      description: formData.description
    });

    if (res.success) {
      setSuccessMsg('Your application has been submitted successfully under verification review queue!');
      // Scroll to top to see success state
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrors({ general: res.error || 'Failed to submit onboarding request.' });
    }
  };

  // 1. If already a vendor, redirect or show redirect button
  if (user?.role === 'vendor') {
    return (
      <div className="become-vendor-page text-center py-20">
        <div className="container">
          <motion.div 
            className="success-onboard-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="badge-icon success-pulse">
              <ShieldCheck size={48} />
            </div>
            <h2>You are a Certified Merchant!</h2>
            <p>Your seller profile is active. You can now list catalog items, track orders, and configure delivery rules directly inside your command deck.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/vendor/dashboard" className="btn btn-primary btn-lg">
                Enter Vendor Dashboard <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. If application is currently pending review
  if (user?.vendorApplication?.isApplied) {
    const app = user.vendorApplication;
    return (
      <div className="become-vendor-page py-16">
        <div className="container">
          <motion.div 
            className="pending-onboard-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pending-header text-center">
              <div className="badge-icon pending-pulse">
                <Clock size={40} />
              </div>
              <h2>Application Under Review</h2>
              <p className="pending-sub">Your merchant application for <strong>{app.companyName || 'your store'}</strong> has been registered successfully!</p>
            </div>

            <div className="application-details-block">
              <h3>Onboarding Specification</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Segment Category:</span>
                  <span className="detail-value">{app.storeCategory}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Support Email:</span>
                  <span className="detail-value">{app.supportEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Support Contact:</span>
                  <span className="detail-value">{app.supportPhone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Applied Date:</span>
                  <span className="detail-value">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}</span>
                </div>
              </div>
              {app.description && (
                <div className="description-detail mt-4">
                  <span className="detail-label">Merchant Statement:</span>
                  <p className="description-p">{app.description}</p>
                </div>
              )}
            </div>

            {/* Visual Timeline */}
            <div className="onboard-timeline">
              <h3 className="timeline-title text-center">Onboarding Track Progression</h3>
              <div className="timeline-steps">
                <div className="timeline-step completed">
                  <div className="step-num">
                    <CheckCircle size={18} />
                  </div>
                  <div className="step-info">
                    <h4>Submit Application</h4>
                    <p>Details registered inside verification queue</p>
                  </div>
                </div>

                <div className="timeline-step active">
                  <div className="step-num">
                    <Clock size={16} />
                  </div>
                  <div className="step-info">
                    <h4>Verification Audit</h4>
                    <p>System administrators will review compliance & documents</p>
                  </div>
                </div>

                <div className="timeline-step">
                  <div className="step-num">3</div>
                  <div className="step-info">
                    <h4>Console Promotion</h4>
                    <p>Get role upgrade & access merchant command deck</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pending-footer text-center mt-10">
              <p>Applications are typically reviewed within 12-24 hours. Once verified, your navbar layout will automatically switch to **Vendor Dashboard**.</p>
              <Link to="/products" className="btn btn-secondary mt-4">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 3. Application Form
  return (
    <div className="become-vendor-page py-12">
      <div className="container">
        <div className="become-vendor-grid">
          
          {/* Left Side: Dynamic Benefits Info */}
          <motion.div 
            className="become-vendor-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="info-badge">
              <ShieldCheck size={16} className="text-primary mr-2" />
              <span>Certified Seller Hub</span>
            </div>
            
            <h1>Start Selling on <span className="text-gradient">WhiteOcean</span></h1>
            <p className="subtitle">
              Expand your business horizons by selling directly to our verified, high-volume customer network. Setup your storefront instantly and gain high-end distribution pipelines.
            </p>

            <div className="features-list mt-8">
              <div className="feature-card-compact">
                <div className="feature-icon">🚀</div>
                <div>
                  <h4>Zero Listing Fees</h4>
                  <p>Publish catalog entries, update inventory, and configure delivery charges without any upfront fee.</p>
                </div>
              </div>

              <div className="feature-card-compact">
                <div className="feature-icon">📊</div>
                <div>
                  <h4>Real-time Merchant Console</h4>
                  <p>Get in-depth analytics regarding revenue generation, pending shipments, inventory triggers, and customer ratings.</p>
                </div>
              </div>

              <div className="feature-card-compact">
                <div className="feature-icon">🔒</div>
                <div>
                  <h4>Direct & Secure Payments</h4>
                  <p>Receive weekly direct settlements directly to your bank account with complete payment transparency.</p>
                </div>
              </div>
            </div>

            <div className="help-box mt-10">
              <Store size={22} className="text-primary" />
              <div>
                <h5>Need Compliance Help?</h5>
                <p>Have questions about register documents, GST, or delivery commissions? Contact us at merchant-care@whiteocean.com</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Onboarding Registration Form */}
          <motion.div 
            className="become-vendor-form-container"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Merchant Registry Application</h2>
            <p className="form-subtitle">Please input all company credentials below. All submissions are vetted carefully.</p>
            
            {errors.general && (
              <div className="error-banner mb-6">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="become-vendor-form">
              
              {/* Company Name */}
              <div className="form-group">
                <label htmlFor="companyName">Company Brand Name</label>
                <div className="input-wrapper">
                  <Building size={20} className="input-icon" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Royal Fresh Harvest Ltd"
                    className={`form-input ${errors.companyName ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
              </div>

              {/* Store Category */}
              <div className="form-group">
                <label htmlFor="storeCategory">Primary Store Segment Category</label>
                <div className="input-wrapper">
                  <Tag size={20} className="input-icon" />
                  <select
                    id="storeCategory"
                    name="storeCategory"
                    value={formData.storeCategory}
                    onChange={handleChange}
                    className={`form-input select-input ${errors.storeCategory ? 'error' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">Choose Store Category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {errors.storeCategory && <span className="error-text">{errors.storeCategory}</span>}
              </div>

              {/* Support Contact Grid */}
              <div className="form-grid">
                
                {/* Support Email */}
                <div className="form-group">
                  <label htmlFor="supportEmail">Merchant Support Email</label>
                  <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="supportEmail"
                      name="supportEmail"
                      value={formData.supportEmail}
                      onChange={handleChange}
                      placeholder="e.g. seller@brand.com"
                      className={`form-input ${errors.supportEmail ? 'error' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.supportEmail && <span className="error-text">{errors.supportEmail}</span>}
                </div>

                {/* Support Phone */}
                <div className="form-group">
                  <label htmlFor="supportPhone">Merchant Support Phone</label>
                  <div className="input-wrapper">
                    <Phone size={20} className="input-icon" />
                    <input
                      type="text"
                      id="supportPhone"
                      name="supportPhone"
                      value={formData.supportPhone}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      className={`form-input ${errors.supportPhone ? 'error' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.supportPhone && <span className="error-text">{errors.supportPhone}</span>}
                </div>

              </div>

              {/* Brand Statement / Description */}
              <div className="form-group">
                <label htmlFor="description">Store Description & Brand Heritage</label>
                <div className="input-wrapper text-area-wrapper">
                  <FileText size={20} className="input-icon text-area-icon" />
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly state your sourcing ethics, brand heritage, shipping practices or product catalog specialties..."
                    className={`form-input textarea-input ${errors.description ? 'error' : ''}`}
                    disabled={isLoading}
                  ></textarea>
                </div>
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              {/* Seller Terms Agreement */}
              <div className="form-group checkbox-group">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">
                    I agree to the <Link to="/terms" target="_blank" className="terms-link">WhiteOcean Seller Agreement</Link> and pledge compliance with food security guidelines.
                  </span>
                </label>
                {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="btn-primary w-full mt-6 onboarding-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    Submit Merchant Application <ChevronRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default BecomeVendor;
