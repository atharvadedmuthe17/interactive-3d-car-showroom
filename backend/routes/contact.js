const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { fullName, model, location, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ADYX Website" <${process.env.EMAIL_USER}>`,
      to: "adyx@gmail.com",
      subject: "New ADYX Consultation Request",
      html: `
  <div style="background-color:#0a0c12;padding:40px;font-family:Arial,sans-serif;color:#ffffff;">
    
    <div style="max-width:600px;margin:0 auto;background:#11131a;border-radius:20px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
      
      <h1 style="font-size:28px;margin-bottom:10px;letter-spacing:2px;">
        ADYX CONSULTATION REQUEST
      </h1>

      <p style="color:#7f8ca3;font-size:14px;margin-bottom:30px;">
        A new acquisition inquiry has been submitted.
      </p>

      <div style="background:#0f1722;padding:25px;border-radius:15px;margin-bottom:25px;">
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Model:</strong> ${model}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br/> ${message}</p>
      </div>

      <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:#6c7a89;">
        ADYX Automotive Group<br/>
        Private Concierge Division<br/>
        This message was generated via the official ADYX website.
      </div>

    </div>

  </div>
`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;