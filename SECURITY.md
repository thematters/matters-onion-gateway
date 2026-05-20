# Security Policy

## Scope

This project is intended to reduce reader exposure when accessing Matters through Tor. It does not provide anonymity from Matters for authenticated users.

## Reporting

Open a private report or contact the maintainer before public disclosure when an issue may expose:

- Credentials
- Access tokens
- Session secrets
- Onion service keys
- Reader activity
- Private content

## Secret Policy

Never commit:

- Real `.env` files
- AWS credentials
- Cloudflare tokens
- Matters credentials
- Matters access tokens
- Onion private keys
- SSH private keys

Use `.env.example` only for placeholders.
