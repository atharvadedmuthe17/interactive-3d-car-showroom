const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔥 Yeh Template ab active hoga
    const htmlContent = `
      <div style="background-color: #050507; padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background: #0f0f12; border: 1px solid #1e1e24; border-radius: 30px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <h1 style="margin: 0; font-size: 35px; font-weight: 900; font-style: italic; letter-spacing: -2px; color: #ffffff; text-transform: uppercase;">
            ADYX<span style="color: #2563eb;">.</span>
          </h1>
          <div style="margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.05);"></div>
          <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 11px; color: #2563eb; font-weight: bold; margin-bottom: 10px;">Security Verification</p>
          <h2 style="margin: 0; font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.9);">Confirm Your Identity</h2>
          
          <div style="margin: 40px 0; padding: 25px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px dashed rgba(37,99,235,0.3);">
            <p style="margin: 0 0 15px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3);">Verification Code</p>
            <span style="font-size: 45px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 15px rgba(37,99,235,0.5);">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: rgba(255,255,255,0.4);">Valid for 5 minutes. Do not share this code.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ADYX CONCIERGE" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "ADYX Verification",
      html: htmlContent, 
    });

  } catch (error) {
    console.error("Email error:", error.message);
  }
};




const sendPaymentEmail = async (to, carName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="background:#050507;padding:50px;text-align:center;color:white;">
        <h1 style="font-style:italic;">ADYX<span style="color:#2563eb;">.</span></h1>
        <h2>Payment Successful</h2>
        <p>Your payment for <b>${carName}</b> has been received.</p>
        <p>Our team will contact you shortly.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ADYX CONCIERGE" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Payment Confirmation - ADYX",
      html: htmlContent,
    });

  } catch (error) {
    console.error("Payment Email Error:", error.message);
  }
};

module.exports = {
  sendEmail,
  sendPaymentEmail,
};