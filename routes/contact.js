import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Test email configuration (bez stvarnog slanja za sada)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test@jovicadvisory.com',
    pass: 'test'
  }
});

// Kontakt forma endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validacija
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Ime, email i poruka su obavezni'
      });
    }

    // Simulacija čuvanja u bazi (za sada samo console.log)
    console.log('📧 Nova kontakt poruka:');
    console.log('Ime:', name);
    console.log('Email:', email);
    console.log('Telefon:', phone || 'Nije uneseno');
    console.log('Poruka:', message);
    console.log('Datum:', new Date().toISOString());
    console.log('---');

    // Simulacija slanja emaila (komentirano za sada)
    const mailOptions = {
      from: email,
      to: 'info@jovicadvisory.com',
      subject: `Nova poruka sa sajta - ${name}`,
      html: `
        <h3>Nova kontakt poruka</h3>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || 'Nije uneseno'}</p>
        <p><strong>Poruka:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Poruka poslana: ${new Date().toLocaleString()}</p>
      `
    };

    console.log('📨 Email opcije pripremljene (simulacija):');
    console.log(mailOptions);

    // U produkciji bi ovdje stvarno slali email
    // await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Poruka je uspješno poslana! Kontaktirat ćemo vas uskoro.',
      data: {
        name,
        email,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Greška pri slanju poruke:', error);
    res.status(500).json({
      success: false,
      message: 'Došlo je do greške pri slanju poruke. Pokušajte ponovo.'
    });
  }
});

// Get all messages (za admin panel kasnije)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Contact messages endpoint',
    note: 'Ovdje će se kasnije vraćati sve poruke iz baze'
  });
});

export default router;