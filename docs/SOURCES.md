# Authoritative sources and verification

These links are starting points, not a full database of legal requirements. Site content may change.

| Coverage | Official source | URL |
|---|---|---|
| Passport / visa / health guidance aggregator | IATA Travel Centre | https://www.iata.org/en/services/compliance/timatic/travel-documentation |
| U.S. citizen international travel preparation | U.S. Department of State | https://travel.state.gov/en/international-travel/planning/checklist.html |
| U.S. airport screening and packing | TSA | https://www.tsa.gov/travel |
| U.S. checkpoint identification | TSA | https://www.tsa.gov/travel/security-screening/identification |
| U.S. restricted carry-on items | TSA | https://www.tsa.gov/travel/security-screening/whatcanibring/all |
| U.S. entry and customs | CBP | https://www.cbp.gov/travel |
| U.S. ESTA program information | USAGov | https://www.usa.gov/visa-waiver-esta |
| U.S. visitor admission records | CBP | https://i94.cbp.dhs.gov/I94/ |
| U.S. travel purpose / visa starting point | U.S. Department of State Visa Wizard | https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wizard.html |
| UK visa/ETA guidance | UK Government | https://www.gov.uk/check-uk-visa |
| Canadian visa/eTA guidance | Government of Canada | https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/check-visa-eta.html |
| Australian entry and visa guidance | Australian Department of Home Affairs | https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia |

## Editorial rules

1. Destination-specific legal rules should link to the **destination country's government/embassy** and any relevant transit country's government, not just one generalized site.
2. A passenger's citizenship and immigration status matter; do not generalize based only on travel destination.
3. Airline baggage, document checks, timing, and special-service rules need the **operating carrier's** official website.
4. Avoid hard-coded fees, duration thresholds, visa exemptions, or security requirements unless verified and date-stamped; show a review date and expiry/refresh policy.
5. Do not claim that completing a checklist is a travel authorization or substitute for check-in staff, immigration, airport security, or government authorities.
6. If integrating third-party travel requirement data, review copyright and licensing terms and obtain required permission.

## Curated country-link coverage (as of 2026-10-30)

The Journey Builder links directly to government entry guidance only for the United States, United Kingdom, Canada, and Australia. All other listed countries deliberately show a government-source coverage warning. The list is **not** a travel requirements database, and its review date does not guarantee any immigration rule is current. Verify all legal requirements directly with relevant authorities close to departure.

## Expanded country and airline link directory — 2026-10-30

`src/catalog.mjs` is the maintained canonical source for URL and coverage metadata. National entry-information resources are cataloged for **US, GB, CA, AU, IN, SG, NZ, AE, JP**. Government starting points were cross-checked through official pages. An **EU/Schengen regional overview** is offered for **FR, DE, NL, ES, IT, CH, SE, NO, DK, FI, PT, LU, BE**; it is clearly flagged as **not a replacement** for the country's national immigration authority. Other countries have no asserted official-resource coverage. The India link covers e-Visa only, and Japan uses a U.S.-based embassy guide. This source-review date is not a declaration of current entry rules.

The airline policy directory currently covers **American, Delta, United, British Airways, Virgin Atlantic, Emirates, Lufthansa, Air Canada, Qatar Airways, Alaska Airlines** with official baggage-policy links. Pet and service-animal policy links are cataloged only where checked. The U.S. General Services Administration also maintains links to airline baggage, pet and service-animal policies: https://www.gsa.gov/travel/airfare-rates-city-pair-program/airline-information . No airline allowance, fee, dimension, deadline, or approval is stored or calculated in this app.

### Editorial verification requirements

- Treat a successful link check as evidence only that the reference page exists, **not** that rules are current, complete or applicable to a passenger.
- Keep the verified date accurate; recheck sources periodically, especially before release for passenger use.
- For regional links, always direct travelers to the **specific national immigration / embassy source** before reliance.
- Always confirm codeshare and interline baggage rules with the relevant operating airline(s) and ticket conditions.


## Airport operator map directory (2026-10-30 URL checks)

The initial airport references in `src/airports.mjs` point to operator-controlled maps, not automated airport-operation or connection data:

| Code | Airport | Official map URL |
| --- | --- | --- |
| IAD | Washington Dulles | https://www.flydulles.com/travel-information/airport-and-terminal-maps |
| JFK | New York JFK | https://www.jfkairport.com/explore-jfk/airport-map |
| ATL | Atlanta | https://www.atl.com/maps/ |
| LHR | Heathrow | https://www.heathrow.com/at-the-airport/airport-maps |
| FRA | Frankfurt | https://www.frankfurt-airport.com/en/at-the-airport/orientation/airport-map.html |
| AMS | Schiphol | https://www.schiphol.nl/en/airport-maps/ |
| DXB | Dubai | https://dubaiairports.ae/express-maps |
| YYZ | Toronto Pearson | https://www.torontopearson.com/en/while-you-are-here/terminal-maps |
| SIN | Singapore Changi | https://www.changiairport.com/in/en/at-changi/map.html |
| HND | Tokyo Haneda | https://www.tokyo-haneda.com/en/floor/floor-guide.html |
| SYD | Sydney | https://www.sydneyairport.com/airport-guide/departing/domestic/maps |

Airport links and code-to-country associations are informational only. Check the operating carrier and airport for actual flight terminals, transfer requirements, security and immigration, baggage recheck, and minimum connect times. Do not assume that connecting airside is permitted at every airport.
