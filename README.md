# MathBot — Mathematics Expert AI

A React-based mathematics chatbot powered by Mistral AI Agent, deployable on Netlify.

## Architecture

- **Frontend**: React (port 3000 locally)
- **Backend**: Netlify Serverless Function (`netlify/functions/mistral-proxy.js`) — proxies requests to Mistral AI securely
- **No separate Node.js server needed in production**

## Local Development

### Prerequisites
- Node.js 18+
- Netlify CLI: `npm install -g netlify-cli`
- A Mistral AI API key

### Setup

```bash
npm install

# Set your Mistral API key
cp .env.example .env
# Edit .env and set MISTRAL_API_KEY=your_key_here

# Run with Netlify Dev (handles functions + React on port 3000)
npm run dev
```

The app runs at http://localhost:3000

### Running React only (no functions)
```bash
npm start   # React on port 3000
```

## Netlify Deployment

1. Push this folder to a GitHub repo
2. Go to https://app.netlify.com → Add new site → Import from Git
3. Select your repo
4. Build settings are auto-detected from netlify.toml
5. Go to Site Configuration → Environment Variables and add:
   - MISTRAL_API_KEY = your Mistral API key
6. Deploy!

## Environment Variables

| Variable | Description |
|----------|-------------|
| MISTRAL_API_KEY | Your Mistral AI API key (required) |
