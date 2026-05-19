const nodemailer = require('nodemailer');

const sendOtpEmail = async (toEmail, otp) => {
  // If SMTP email or pass is not defined, we fallback to logging in development mode
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS || process.env.SMTP_EMAIL.includes('yourgmail')) {
    console.log('\n=========================================');
    console.log(`[SIMULATED EMAIL] To: ${toEmail}`);
    console.log(`[SIMULATED EMAIL] Subject: Your White Ocean Verification Code`);
    console.log(`[SIMULATED EMAIL] OTP Code: ${otp}`);
    console.log('=========================================\n');

    // Write to a temporary log file inside the workspace for easy testing access
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '..', 'simulated_emails.log');
      const logContent = `[${new Date().toISOString()}] To: ${toEmail} | OTP: ${otp}\n`;
      fs.appendFileSync(logPath, logContent);
    } catch (e) {
      console.error('Failed to write to simulated_emails.log:', e);
    }

    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"White Ocean" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: 'Your White Ocean Verification Code',
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #00aeef; text-align: center;">White Ocean</h2>
          <p style="font-size: 16px; color: #475569;">Hello,</p>
          <p style="font-size: 16px; color: #475569;">Your White Ocean verification code is:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #94a3b8;">This code will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent successfully to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
