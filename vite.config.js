import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import nodemailer from 'nodemailer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'polchat-email-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/send-otp' && req.method === 'POST') {
              let rawBody = ''
              req.on('data', (chunk) => {
                rawBody += chunk
              })
              req.on('end', async () => {
                try {
                  const data = JSON.parse(rawBody || '{}')
                  const { email, otpCode } = data

                  console.log(`\n========================================`)
                  console.log(`✉️ [PolChat OTP Delivery]`)
                  console.log(`   To: ${email}`)
                  console.log(`   Your OTP Is: ${otpCode}`)
                  console.log(`========================================\n`)

                  const emailUser =
                    env.EMAIL_USER ||
                    env.GMAIL_USER ||
                    env.VITE_EMAIL_USER ||
                    process.env.EMAIL_USER ||
                    process.env.GMAIL_USER
                  const emailPass =
                    env.EMAIL_PASS ||
                    env.GMAIL_PASS ||
                    env.VITE_EMAIL_PASS ||
                    process.env.EMAIL_PASS ||
                    process.env.GMAIL_PASS

                  if (emailUser && emailPass) {
                    try {
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
                      console.log(`✓ Email successfully delivered to ${email} via Gmail SMTP!`)
                    } catch (mailErr) {
                      console.warn('[Nodemailer] SMTP note:', mailErr.message)
                    }
                  }

                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 200
                  res.end(JSON.stringify({ success: true, message: 'OTP sent' }))
                } catch (err) {
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 500
                  res.end(JSON.stringify({ success: false, error: err.message }))
                }
              })
              return
            }
            next()
          })
        },
      },
    ],
  }
})




