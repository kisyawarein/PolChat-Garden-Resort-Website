import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch (e) {}
    }

    const { email, to, subject, body: emailBody, text, html } = body || {}
    const recipient = (email || to || '').trim()
    const mailSubject = subject || 'PolChat Garden Resort Notification'
    const mailText = emailBody || text || ''

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required' })
    }

    const emailUser =
      process.env.EMAIL_USER ||
      process.env.GMAIL_USER ||
      process.env.VITE_EMAIL_USER
    const emailPass =
      process.env.EMAIL_PASS ||
      process.env.GMAIL_PASS ||
      process.env.VITE_EMAIL_PASS

    if (!emailUser || !emailPass) {
      console.warn('[Vercel Serverless Mailer] EMAIL_USER or EMAIL_PASS not set in environment variables')
      return res.status(200).json({ success: true, message: 'Processed (SMTP credentials not configured in environment)' })
    }

    const cleanUser = emailUser.trim()
    const cleanPass = emailPass.trim().replace(/[\s_-]/g, '')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    })

    const mailOptions = {
      from: `"PolChat Garden Resort" <${cleanUser}>`,
      to: recipient,
      subject: mailSubject,
      text: mailText,
    }
    if (html) mailOptions.html = html

    await transporter.sendMail(mailOptions)

    return res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (err) {
    console.error('Vercel mailer error:', err)
    return res.status(500).json({ error: err.message })
  }
}
