# Operations

## Runtime Target

Default runtime:

- One AWS EC2 instance
- Tor daemon
- Node app
- Optional Caddy or Nginx bound to localhost
- Optional local Kubo gateway

## Minimal Instance

Start with:

- `t4g.nano` or `t4g.micro`
- Ubuntu LTS or Debian
- 8 to 20 GB EBS
- SSH restricted to maintainer IP where possible
- No public HTTP ingress

## Service Layout

```text
/opt/matters-onion-gateway
  app
  current
  releases

/etc/matters-onion-gateway
  env

/var/lib/tor/matters-onion-gateway
  hostname
  hs_ed25519_public_key
  hs_ed25519_secret_key
```

The Tor hidden service key must never be copied into the repository.

## Deployment Checklist

- Provision EC2
- Install Node.js
- Install Tor
- Create app user
- Deploy app build
- Create environment file
- Install systemd unit
- Configure Tor hidden service
- Restart Tor
- Read generated onion hostname
- Test with Tor Browser
- Publish onion address on clearnet landing page

## Health Checks

`/healthz` returns JSON describing app and upstream status:

```json
{ "ok": true, "checks": { "graphql": { "ok": true, "latencyMs": 120 } } }
```

- It returns HTTP 200 when the upstream GraphQL endpoint is reachable, and 503
  when the upstream probe fails, so monitors can alert on a degraded gateway.
- The probe is a trivial `{ __typename }` query and its result is cached for a
  few seconds, so frequent or hostile polling cannot turn into upstream load.
- It does not depend on any user account and returns no secrets.

## Backups

Back up only:

- Onion service key
- App config template
- Optional non-sensitive cache metadata

Do not back up:

- Session store
- Access tokens
- Request logs with user activity

## Rotation

Rotate:

- Session secret when compromise is suspected
- AWS credentials if any are used
- Cloudflare tokens if any are used

Rotating the onion private key changes the onion address. Treat it as a deliberate recovery event.

## Incident Response

If sensitive configuration leakage is suspected:

- Stop app
- Rotate affected secrets
- Review logs for accidental sensitive fields
- Patch redaction
- Restart app

If onion private key leaks:

- Stop service
- Generate new onion service
- Publish new onion address
- Mark old address as compromised on clearnet landing page

## Cost Controls

- Avoid full-site crawling
- Avoid permanent IPFS pinning in MVP
- Set proxy response size limits
- Set image cache TTL
- Use short upstream timeouts
- Keep only minimal logs
