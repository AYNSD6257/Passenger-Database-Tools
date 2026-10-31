# Privacy and safety decisions

## Current behavior
- This application is completely client-side and sends no passenger information to a server.
- It asks for departure, destination, passport-issuing country/citizenship, optional transit country, purpose, and special travel needs. It does not collect names, passport numbers, birthdates, booking records, documents, or analytics.
- Journey and checkbox selections live only in in-memory JavaScript state. They are forgotten when the page refreshes or closes.
- Clicking links to external resources leaves this site; those destinations control their own privacy practices.
- No third-party JS/CDNs, persistent cookies, localStorage, or API credentials are used.

## Product boundaries
- Checklist progress means **reviewed** only, not **approved** or **eligible to travel**.
- The app cannot provide verified visa or boarding decisions and must not claim to do so.
- The app is for civilian passenger guidance; it must not display nonpublic airport, airline, or agency procedures.
- If adding accounts or document uploads later, conduct a privacy and security review, define retention/deletion policy, avoid unnecessary PII, and implement access controls and encryption.

## Contributors
Use fictional sample records in code and tests. Never commit real boarding passes, PNRs, employee screenshots, passenger names, or API keys.

## Local policy search (2026-10-30)

The country and airline searches filter data bundled into the static JavaScript application. Search strings and selected carrier codes stay in browser memory only. External links are opened only when a visitor clicks them; each third-party website has its own privacy practices. No travel history, passport details, airline bookings or source-search queries are uploaded or stored by this application.
