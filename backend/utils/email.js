const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (to, otp) => {
  const mailOptions = {
    from: `Math Quiz`,
    to,
    subject: 'Reset Your Math Quiz Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9fafb; color: #111827; padding: 20px; }
          .container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 20px; color: #1f2937; }
          a {color: white;}
          .content { font-size: 16px; line-height: 1.5; }
          .otp { font-size: 28px; font-weight: bold; color: #2563eb; margin: 20px 0; text-align: center; }
          .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #6b7280; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Math Quiz</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password. Please use the OTP code below to continue:</p>
            <div class="otp">${otp}</div>
            <p>This code is valid for 2 minutes.</p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p style="text-align: center;">
              <a href="https://math-quiz-next.vercel.app/" class="button">Math Quiz</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Math Quiz by Mahmud. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };
