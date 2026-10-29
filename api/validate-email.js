export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST,OPTIONS'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    let body = req.body

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid request.',
        })
      }
    }

    const email = String(body?.email || '')
      .trim()
      .toLowerCase()

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        valid: false,
        status: 'invalid',
        error:
          'Please enter a valid email address.',
      })
    }

    const apiKey =
      process.env.ZEROBOUNCE_API_KEY

    if (!apiKey) {
      console.error(
        'ZEROBOUNCE_API_KEY is not configured.'
      )

      return res.status(500).json({
        success: false,
        error:
          'Email validation service is not configured.',
      })
    }

    const url =
      'https://api.zerobounce.net/v2/validate' +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&email=${encodeURIComponent(email)}`

    const response = await fetch(url)

    if (!response.ok) {
      console.error(
        'ZeroBounce request failed:',
        response.status
      )

      return res.status(502).json({
        success: false,
        error:
          'Email validation service could not complete the request.',
      })
    }

    const validation = await response.json()

    const status = String(
      validation?.status || ''
    )
      .trim()
      .toLowerCase()

    const subStatus = String(
      validation?.sub_status || ''
    )
      .trim()
      .toLowerCase()

    // STRICT:
    // only ZeroBounce "valid" is allowed.
    const valid = status === 'valid'

    return res.status(200).json({
      success: true,
      valid,
      status,
      subStatus,
      didYouMean:
        validation?.did_you_mean || '',
    })
  } catch (error) {
    console.error(
      'ZeroBounce validation error:',
      error
    )

    return res.status(500).json({
      success: false,
      error:
        'Email validation could not be completed.',
    })
  }
}