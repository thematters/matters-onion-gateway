# Clearnet Landing Page

The onion gateway itself runs only as a Tor hidden service. To help readers find
the `.onion` address, publish a small static clearnet landing page that advertises
it. The landing page does not proxy content, require accounts, or run JavaScript.

## Template

`deploy/landing/index.html` is a self-contained page. Before publishing:

- Replace every `__ONION_ADDRESS__` with the real `xxxxx.onion` hostname.

It can be served by any static host (e.g. Cloudflare Pages). This is the only
appropriate Cloudflare role: a non-sensitive clearnet landing page. Cloudflare
must not sit in front of the onion service itself.

## Onion-Location

The landing page declares `<meta http-equiv="onion-location" ...>`, and the
gateway app also sends an `Onion-Location` HTTP header on clearnet responses when
`ONION_HOSTNAME` is set. Tor Browser uses either to offer a one-click switch to
the onion site. The header is suppressed when a request already arrives over the
onion hostname, so it only ever nudges clearnet visitors toward the onion.

## Compromise recovery

If the onion private key is ever rotated (a deliberate recovery event), update the
landing page with the new address and mark the old one as compromised.
