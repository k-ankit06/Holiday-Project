const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration incomplete. Email notifications will be simulated.');
      this.emailConfigured = false;
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      this.from = `"TaskWave" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
      this.adminEmail = process.env.EMAIL_USER;
      this.emailConfigured = true;
    }
  }

  async sendSignupNotification(user, ipAddress) {
    try {
      if (!this.emailConfigured) {
        console.log('Email not configured. Simulating signup notification for:', user.email);
        return { success: true, simulated: true };
      }

      const mailOptions = {
        from: this.from,
        to: user.email,
        subject: 'Welcome to TaskWave!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to TaskWave!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${user.name}!</h2>
              <p>Welcome to TaskWave, your personal productivity companion!</p>
              <p>Your account has been successfully created. You can now start organizing your tasks, setting reminders, and boosting your productivity.</p>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Account Details:</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
              </div>
              <p>Start managing your tasks efficiently today!</p>
              <a href="http://localhost:5173" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to TaskWave</a>
              <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="margin: 0;">&copy; 2025 TaskWave. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Signup notification sent to user: %s', info.messageId);
      
      const adminMailOptions = {
        ...mailOptions,
        to: this.adminEmail,
        subject: `New User Registration: ${user.name} (${user.email})`
      };
      
      const adminInfo = await this.transporter.sendMail(adminMailOptions);
      console.log('Signup notification copy sent to admin: %s', adminInfo.messageId);
      
      return { success: true, messageId: info.messageId, adminMessageId: adminInfo.messageId };
    } catch (error) {
      console.error('Error sending signup notification:', error.message);
      return { success: true, simulated: true, error: error.message };
    }
  }

  async sendLoginNotification(user, ipAddress) {
    try {
      if (!this.emailConfigured) {
        console.log('Email not configured. Simulating login notification for:', user.email);
        return { success: true, simulated: true };
      }

      const mailOptions = {
        from: this.from,
        to: user.email,
        subject: 'New Login to Your TaskWave Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Security Alert</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${user.name}!</h2>
              <p>We noticed a new login to your TaskWave account.</p>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Login Details:</h3>
                <p><strong>Account:</strong> ${user.email}</p>
                <p><strong>Login Time:</strong> ${new Date(user.lastLogin).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
              </div>
              <p>If this was you, you can safely ignore this email.</p>
              <p>If you don't recognize this activity, please <a href="#" style="color: #667eea;">change your password</a> immediately.</p>
              <p style="color: #666; font-size: 14px;">This email was sent automatically for security purposes.</p>
            </div>
            <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="margin: 0;">&copy; 2025 TaskWave. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Login notification sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending login notification:', error.message);
      return { success: true, simulated: true, error: error.message };
    }
  }
}

module.exports = new EmailService();