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

export async function sendVerificationEmail(url: string, user: { email: string; name?: string }) {
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
          <h1>Potvrdenie registracie</h1>
          <p>Ahoj ${user.name || 'používateľ'},</p>
          <p>Prave ste sa zaregistrovali do ' ' stlacenim tlacidla potvrdite registraciu</p>
          <p><a href="${url}" class="button">Potvrdit</a></p>
          <p>Alebo skopírujte tento odkaz do prehliadača:</p>
          <p>${url}</p>
          <p>Ak ste sa nikde neregistrovali, ignorujte tento email.</p>
        </div>
      </body>
      </html>
    `

    // Definujeme email správu
    const mailOptions = {
      from: 'zilka.tomas421@gmail.com',
      to: user.email,
      subject: 'Potvrdenie registracie',
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
