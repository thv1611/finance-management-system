# Deploy Notes

## Recommended Setup

### Backend

Deploy the Node/Express backend to a service such as:

- Render
- Railway
- Cyclic
- VPS / PM2 / Nginx

Required environment variables:

- `DATABASE_URL`
- `APP_BASE_URL`
- all mail variables
- JWT secrets
- Google OAuth variables
- AI provider variables if AI chat should be enabled

### Frontend

Deploy the Vite frontend to:

- Vercel
- Netlify
- Render Static Site

Required environment variable:

- `VITE_API_BASE_URL=https://your-backend-domain/api`
- `VITE_GOOGLE_CLIENT_ID=your-google-client-id`

## Important Checklist

- Update `APP_BASE_URL` to the public backend URL
- Update `VITE_API_BASE_URL` to the public API URL
- Make sure CORS allows the frontend domain
- Test Google login redirect/client ID in production
- Test email OTP flow with real mail credentials
- Rotate all leaked or shared secrets before publishing

## AI SQL Agent

If `AI_SQL_AGENT_ENABLED=true`, a separate service must also be running at:

```text
AI_SQL_SERVICE_URL
```

If you do not plan to deploy that service, set:

```text
AI_SQL_AGENT_ENABLED=false
```

## Pre-Deploy Final Checks

- `Frontend`: `npm run build`
- `Frontend`: `npm run lint`
- `Backend`: start server successfully
- smoke test auth, transactions, budgets, reports, AI chat, export CSV
