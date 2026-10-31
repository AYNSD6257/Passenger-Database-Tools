# Project plan: TravelReady

## Problem
Travelers often do not know which steps to review before flying. A useful application should organize verified links and reminders without pretending to make legal immigration or airline acceptance decisions.

## Intended users
- Passengers planning air travel
- Airport customer-service agents explaining where to verify rules (informational use only)
- Travelers with accessibility or special handling needs

## MVP (implemented)
- Choose international or U.S. domestic trip
- Enable additional checklists for minors, assistance, animals, and medications
- Interactive local-only progress and printable review sheet
- Primary links to IATA, U.S. Department of State, TSA, and CBP
- Accessible mobile-first site and core unit tests

## Next milestones
1. **Source registry:** Add destination-country ministry / embassy directory with reviewed URL, owner, timestamp, language, and scope. Never infer eligibility from a raw web search.
2. **Airline policy catalog:** Manually reviewed pages for baggage, check-in cutoffs, assistance, pets, and unaccompanied minors. Label differences by operating carrier, fare, route, and airport.
3. **Quality workflow:** Set a review cadence, warn on stale links, track approvals and change logs, and allow users to report broken references.
4. **Internationalization:** Add accessible Urdu, Hindi, Spanish and other language translations while linking to official original-language requirements.
5. **Future itinerary experience:** Collect only necessary fields, explain purpose, provide consent, avoid storing passport data. Build jurisdiction-specific rules only with permitted, licensed, maintained authoritative sources and human review.
6. **Optional airport guides:** Airport-specific terminals, accessibility desks, security process, and contact numbers, with date-stamped sources.

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
