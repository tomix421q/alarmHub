import nodemailer from 'nodemailer'

// Konfigurácia SMTP transportu
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, 
  secure: true, // true pre port 465, false pre ostatné porty
  auth: {
    user: 'zilka.tomas421@gmail.com',
    pass: 'zfpy ofmd gddy rdim',
  },
})

export async function sendResetPasswordEmail(url: string, user: { email: string; name?: string }) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset hesla</h1>
          <p>Ahoj ${user.name || 'používateľ'},</p>
          <p>Požiadali ste o reset hesla. Kliknite na tlačidlo nižšie pre nastavenie nového hesla:</p>
          <p><a href="${url}" class="button">Resetovať heslo</a></p>
          <p>Alebo skopírujte tento odkaz do prehliadača:</p>
          <p>${url}</p>
          <p>Ak ste o reset hesla nežiadali, ignorujte tento email.</p>
        </div>
      </body>
      </html>
    `

    // Definujeme email správu
    const mailOptions = {
      from: 'zilka.tomas421@gmail.com', 
      to: user.email,
      subject: 'Reset hesla',
      html: html,
    }

    // Odoslanie emailu
    const info = await transporter.sendMail(mailOptions)
    return info
  } catch (error) {
    console.error('Chyba pri odosielaní emailu:', error)
    throw error
  }
}

// Funkcia na test SMTP pripojenia
export async function verifyConnection() {
  try {
    await transporter.verify()
    console.log('SMTP server je pripravený na odosielanie emailov')
    return true
  } catch (error) {
    console.error('Chyba pri pripájaní k SMTP serveru:', error)
    return false
  }
}
