export default async function handler(req, res) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    '*'
  )

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
      valid: false,
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
          valid: false,
          status: 'invalid',
          error:
            'Email is invalid. Please try a different email.',
        })
      }
    }

    const email = String(
      body?.email || ''
    )
      .trim()
      .toLowerCase()

    // ==========================================
    // 1. BASIC EMAIL FORMAT CHECK
    // ==========================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

    if (
      !email ||
      !emailPattern.test(email)
    ) {
      return res.status(200).json({
        success: true,
        valid: false,
        status: 'invalid',
        subStatus:
          'failed_syntax_check',
        error:
          'Email is invalid. Please try a different email.',
      })
    }

    // ==========================================
    // 2. GET SERVER-SIDE ZEROBOUNCE KEY
    // ==========================================

    const apiKey =
      process.env.ZEROBOUNCE_API_KEY

    if (!apiKey) {
      console.error(
        'ZEROBOUNCE_API_KEY is not configured.'
      )

      return res.status(500).json({
        success: false,
        valid: false,
        error:
          'Email verification is temporarily unavailable. Please try again.',
      })
    }

    // ==========================================
    // 3. CALL ZEROBOUNCE
    // ==========================================

    const zeroBounceUrl =
      'https://api.zerobounce.net/v2/validate' +
      `?api_key=${encodeURIComponent(
        apiKey
      )}` +
      `&email=${encodeURIComponent(
        email
      )}` +
      '&ip_address='

    const response =
      await fetch(zeroBounceUrl)

    if (!response.ok) {
      console.error(
        'ZeroBounce HTTP error:',
        response.status
      )

      return res.status(502).json({
        success: false,
        valid: false,
        error:
          'Email verification is temporarily unavailable. Please try again.',
      })
    }

    const validation =
      await response.json()

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

    const didYouMean = String(
      validation?.did_you_mean || ''
    ).trim()

    // Safe server-side diagnostic.
    // Do NOT log the API key.
    console.log(
      'ZEROBOUNCE RESULT:',
      {
        status,
        subStatus,
        didYouMean,
      }
    )

    // ==========================================
    // 4. STRICT WORKING EMAIL CHECK
    // ==========================================
    //
    // Only an address ZeroBounce returns
    // as "valid" may continue to the OTP step.
    //
    // Existing PolChat account checking is
    // intentionally NOT performed here.
    // That stays inside AuthModal/DataService.
    // ==========================================

    if (status !== 'valid') {
      return res.status(200).json({
        success: true,
        valid: false,
        status,
        subStatus,
        didYouMean,

        error: didYouMean
          ? `Email is invalid. Please try a different email. Did you mean ${didYouMean}?`
          : 'Email is invalid. Please try a different email.',
      })
    }

    // ==========================================
    // 5. VERIFIED WORKING EMAIL
    // ==========================================

    return res.status(200).json({
      success: true,
      valid: true,
      status,
      subStatus,
      didYouMean,
    })
  } catch (error) {
    console.error(
      'ZeroBounce validation error:',
      error
    )

    return res.status(500).json({
      success: false,
      valid: false,
      error:
        'Email verification is temporarily unavailable. Please try again.',
    })
  }
}
