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

    const { email, otpCode } = body || {}
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and otpCode are required' })
    }

    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.VITE_EMAIL_USER
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.VITE_EMAIL_PASS

    if (!emailUser || !emailPass) {
      console.warn('[Vercel Serverless] EMAIL_USER or EMAIL_PASS not set in environment variables')
      return res.status(200).json({ success: true, message: 'OTP processed (no SMTP credentials configured)' })
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

    await transporter.sendMail({
      from: `"PolChat Garden Resort" <${cleanUser}>`,
      to: email.trim(),
      subject: `Your OTP Is: ${otpCode}`,
      text: `Your OTP Is: ${otpCode}`,
    })

    return res.status(200).json({ success: true, message: 'OTP successfully sent to inbox' })
  } catch (err) {
    console.error('Vercel mailer exception:', err)
    return res.status(500).json({ error: err.message })
  }
}
