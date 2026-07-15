# BH Cleaning SF — Form Update

This package keeps the current website design and updates only the estimate form.

## New
- Customer phone and email
- Address and city
- Home size in sqft
- Bedrooms and bathrooms
- Cleaning type and frequency
- Preferred date and notes
- Vercel Serverless Function at `/api/send-email`
- Resend email delivery
- Success and error messages

The Vercel environment variable `RESEND_API_KEY` must already exist.
