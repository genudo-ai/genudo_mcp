# Security Policy

## Supported Versions

The latest published version of `genudo-mcp-client` on npm receives security updates.

## Reporting a Vulnerability

**Please do not open public GitHub issues for security problems.**

Report vulnerabilities privately via either:

- GitHub [private vulnerability reporting](https://github.com/genudo-ai/genudo_mcp/security/advisories/new), or
- Email **help@genudo.ai**

Please include reproduction steps and impact. We aim to acknowledge reports
within 3 business days.

## Handling API keys

- Your `GENUDO_API_KEY` is a secret. Never commit it to version control or paste
  it into shared logs, screenshots, or issues.
- The client transmits the key only to your configured Genudo endpoint over HTTPS,
  in the `Authorization: Bearer` request header.
- If a key may have been exposed, rotate it immediately in **Settings → API Keys**.
- Keep `GENUDO_ALLOW_INSECURE_SSL` unset (or `false`) outside of local development —
  enabling it disables TLS certificate verification.
