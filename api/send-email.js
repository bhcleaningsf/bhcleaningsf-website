
const RECIPIENT = 'bhcleaning.sf@gmail.com';

function clean(value, max = 300) {
  return String(value ?? '').trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value, 3000)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const body = req.body || {};
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 60);
  const email = clean(body.email, 180);
  const city = clean(body.city, 120);
  const service = clean(body.service, 160);

  if (!name || !phone || !email || !city || !service) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const fields = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email],
    ['Service Address', clean(body.address, 240) || 'Not provided'],
    ['City', city],
    ['Home Size', body.sqft ? `${clean(body.sqft, 20)} sqft` : 'Not provided'],
    ['Bedrooms', clean(body.bedrooms, 20) || 'Not provided'],
    ['Bathrooms', clean(body.bathrooms, 20) || 'Not provided'],
    ['Cleaning Type', service],
    ['Frequency', clean(body.frequency, 80) || 'Not provided'],
    ['Preferred Date', clean(body.preferredDate, 40) || 'Not provided'],
    ['Additional Details', clean(body.details, 3000) || 'None']
  ];

  const rows = fields.map(([label, value]) => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid #e8e8e8;font-weight:700;color:#071b45;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e8e8e8;color:#263349;white-space:pre-wrap">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033">
      <div style="background:#071b45;color:white;padding:22px 26px;border-radius:14px 14px 0 0">
        <h1 style="margin:0;font-size:24px">New Cleaning Estimate Request</h1>
        <p style="margin:7px 0 0;color:#e2c36f">BH Cleaning SF Website</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e8e8e8">${rows}</table>
      <p style="font-size:13px;color:#697386;margin-top:16px">Reply directly to this email to contact ${escapeHtml(name)} at ${escapeHtml(email)}.</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BH Cleaning SF Website <onboarding@resend.dev>',
        to: [RECIPIENT],
        reply_to: email,
        subject: `New Estimate Request — ${service} — ${name}`,
        html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend error:', result);
      return res.status(502).json({ error: 'Email provider rejected the request.' });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Email function error:', error);
    return res.status(500).json({ error: 'Unable to send the email.' });
  }
};
