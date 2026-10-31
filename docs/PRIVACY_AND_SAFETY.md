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

## Ordered connection selections

Connection countries and optional airport codes are processed in memory in the current tab. They are not sent to SojournNexus servers or analytics. Airline and airport links are third-party websites opened at the traveler's initiative. There is no claim that a listed itinerary or connection is possible or lawful.


## Globe, flight-editor, and schedule scope

The visual explorer fetches only a local bundled public-domain land outline, without remote scripts, map tiles, tracking, or external APIs. Airport selections and flight-segment fields are kept in memory until refresh. The preview stores no traveler identity or document scans. The system does not claim that selected flights operate, that a connection is feasible, or that a government has granted permission to transit/enter. Displayed planet sizes/orbit speeds are decorative, not a scientific simulation. All time-zone readouts rely on the browser's IANA time zone database.


## Worldwide airport search privacy

Worldwide airport search fetches static public airport files from the SojournNexus GitHub Pages site only after the user chooses to load them. Searches are filtered in browser memory, without sending search terms or passenger itinerary fields to an external query service. Following an OurAirports link is optional and opens an external website. Dataset records are airport/facility metadata, not traveler information.
