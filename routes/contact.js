import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email configuration za Outlook
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'vanja_jovic@outlook.com',
    pass: process.env.OUTLOOK_PASSWORD // Dodat ćemo ovo u environment variables
  },
  tls: {
    ciphers: 'SSLv3'
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

    console.log('📧 Nova kontakt poruka:');
    console.log('Ime:', name);
    console.log('Email:', email);
    console.log('Telefon:', phone || 'Nije uneseno');
    console.log('Poruka:', message);

    // Email opcije
    const mailOptions = {
      from: 'vanja_jovic@outlook.com',
      to: 'vanja_jovic@outlook.com',
      replyTo: email,
      subject: `Nova poruka sa sajta Jović Advisory - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">Nova kontakt poruka</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Ime:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone || 'Nije uneseno'}</p>
            <p><strong>Poruka:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #0078d4; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Poruka poslana sa sajta Jović Advisory: ${new Date().toLocaleString('bs-BA')}
          </p>
        </div>
      `
    };

    // Pokušaj poslati email
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email uspješno poslan');
    } catch (emailError) {
      console.error('❌ Greška pri slanju emaila:', emailError);
      // Nastavljamo bez emaila, ali logujemo u konzolu
    }

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

// Health check za kontakt rutu
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Contact API radi',
    timestamp: new Date().toISOString()
  });
});

export default router;