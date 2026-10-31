# Project plan: SojournNexus

## Problem
Travelers often do not know which steps to review before flying. A useful application should organize verified links and reminders without pretending to make legal immigration or airline acceptance decisions.

## Intended users
- Passengers planning air travel
- Airport customer-service agents explaining where to verify rules (informational use only)
- Travelers with accessibility or special handling needs

## MVP (implemented)
- Choose departure/destination countries, passport-issuing country, up to five ordered transit countries (with optional listed airport), and travel purpose; infer international vs. domestic checklist from itinerary
- Enable additional checklists for minors, assistance, animals, and medications
- Interactive local-only progress and printable review sheet
- Primary links to IATA, TSA and CBP; searchable directory of 9 national government resources and 13 regional EU/Schengen references
- Searchable airline baggage directory (10 carriers), selected pets/service animal pages, and airline-specific baggage prompts
- Accessible mobile-first site and core unit tests

## Next milestones
1. **Source registry — expanded initial catalog:** Extend country-specific immigration-authority coverage, and add reviewed link ownership, timestamp, language, and scope. Current national and regional links are labeled separately; never infer eligibility from a search.
2. **Airline policy catalog — initial link directory delivered:** Add more carriers and separately reviewed official pages for check-in cutoffs, assistance, pets, and unaccompanied minors. Never hard-code unverified allowances.
3. **Quality workflow:** Set a review cadence, warn on stale links, track approvals and change logs, and allow users to report broken references.
4. **Internationalization:** Add accessible Urdu, Hindi, Spanish and other language translations while linking to official original-language requirements.
5. **Expanded itinerary experience:** Multiple ordered transits and selected-airport map links are implemented; future work should add residence permits, travel date, and other necessary fields without storing passport data. Build jurisdiction-specific rules only with permitted, licensed, maintained authoritative sources and human review.
6. **Airport directory — initial release:** Eleven official airport map links are searchable. Future work can add checked accessibility resources and more airports; no hard-coded terminal/gate predictions.

## Avoid
- Unverified rules or invented visa/passport decisions
- Predicting admission or promising an airline will accept a traveler
- Storing passport scans, birth dates, visa documents, or passenger records in a public repo
- Use of airline logos or implication of endorsement without permission
- Exposing privileged employee-only guidance or airport security procedures

## Suggested roles
Project owner/product: user. Content editor: verify official travel sources. Developer: maintain UI and tests. Reviewer: validate safety-critical changes before publishing.

## Success measures
- Accessible UX; works on desktop/mobile
- All outbound links are valid and labeled
- Every destination-specific statement points to an authoritative source and last-reviewed date
- No unsupported approval/denial decisions
- No user identity data collected in default mode


## Orbital Journey Explorer — initial visual release

Implemented: canvas-based rotating globe, decorative star field/Sun/Moon, curated major-airport markers, map routes based on user input, local clocks, up to six flight segments, operating airlines, traveler-supplied local planned times and departure/return date, printable summary, and existing official-resource link integration. Data is local and does not establish flight connectivity. Next milestones: authorized live route data, broader airport dataset, stronger timezone-aware itinerary checks, accessibility review, and licensed/verified document-rule integrations.


## Full worldwide airport import

The first complete OurAirports snapshot preserves all airport records and original columns in the source CSV, and provides optimized search and globe-density indices for the browser. World airport search loads on demand and offers filters for scheduled-service, open, closed, heliport, medium, large, and small facilities. Unknown airport time zones and unofficial scheduled-route claims are intentionally omitted. Next: licensed actual flight-schedule data, verified timezone enrichment, source QA, and zoom-specific marker clustering.
