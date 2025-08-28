// Simple Express server to receive contact form and send email via nodemailer
// Usage: set environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_ADDRESS

const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '50kb' }));

// basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use(limiter);

// serve static frontend
app.use(express.static(__dirname));

// POST /send
app.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).send('Missing fields');
    // basic email pattern
    const emailOK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!emailOK) return res.status(400).send('Invalid email');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.FROM_ADDRESS || process.env.SMTP_USER,
      to: process.env.TO_ADDRESS || 'margueray.marius@gmail.com',
      subject: `[Portfolio] ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\n\n${message}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent', info.messageId);
    res.status(200).send('OK');
  } catch (err) {
    console.error('send error', err);
    res.status(500).send('Error sending');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on', PORT));
