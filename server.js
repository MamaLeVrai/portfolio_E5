// Simple Express server to receive contact form and send email via nodemailer
// Usage: set environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_ADDRESS

const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const https = require('https');

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
    const { name, email, subject, message, captchaToken } = req.body || {};
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || !trimmedEmail || !trimmedMessage) return res.status(400).send('Missing fields');
    if (trimmedName.length > 120 || trimmedSubject.length > 120 || trimmedMessage.length > 2000) {
      return res.status(400).send('Payload too long');
    }
    // basic email pattern
    const emailOK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail);
    if (!emailOK) return res.status(400).send('Invalid email');

    if (!process.env.RECAPTCHA_SECRET) {
      console.error('Missing RECAPTCHA_SECRET environment variable');
      return res.status(500).send('Captcha not configured');
    }

    const captchaValid = await verifyRecaptcha(captchaToken, req.ip);
    if (!captchaValid) return res.status(400).send('Captcha validation failed');

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
      subject: `[Portfolio] ${trimmedSubject ? trimmedSubject.slice(0, 120) : 'Sans sujet'}`,
      text: `Nom: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`
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

function verifyRecaptcha(token, remoteIp) {
  return new Promise((resolve, reject) => {
    if (!token) return resolve(false);
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: token
    });
    if (remoteIp) params.append('remoteip', remoteIp);

    const data = params.toString();
    const request = https.request({
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }, response => {
      let body = '';
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(Boolean(parsed.success));
        } catch (err) {
          reject(err);
        }
      });
    });

    request.on('error', reject);
    request.write(data);
    request.end();
  }).catch(err => {
    console.error('reCAPTCHA verification error', err);
    return false;
  });
}
