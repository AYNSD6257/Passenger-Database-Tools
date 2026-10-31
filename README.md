# Passenger-Database-Tools

**SojournNexus** — *Connecting Every Journey* — is the first web application in this repository, building toward a passenger travel-documentation and information platform.

A mobile-friendly, **independent educational prototype** helping airline passengers review travel preparations for U.S. domestic and international flights. No accounts, back end, paid services, or API keys are required.

> **Safety notice:** This tool never determines whether someone can board, enter, exit, or transit a country. Requirements change and depend on passenger nationality, document type, route, status, purpose of travel, and airline. Always verify with the airline, IATA Travel Centre, and relevant government authorities. It is **not affiliated** with an airline, airport, government, or IATA.

## Included now

- Personalized Journey Builder: departure country, destination, passport-issuing country, optional single transit country, and trip purpose
- Automatically distinguished international, U.S. domestic, and other domestic preparation checklists
- Extra prompts for travel with minors, accessibility needs, pets, and medication
- Review-progress tracker, reset, and print-friendly view
- Searchable official country-resource directory: national links for 9 destinations and labeled EU/Schengen regional guidance for 13 more countries
- Searchable airline policy directory with 10 carriers and official links for baggage, and selected pets/service-animal policies
- Optional operating-airline selection connects the itinerary baggage reminder to that airline's source
- Links to official travel-information sources
- Responsive layout and accessible semantic form controls
- No analytics, cookies, account registration, personal-document upload, or persistent storage. Journey selections exist only in the current tab
- Automated tests using Node.js (no third-party npm packages)

## Run locally

1. Download this project and extract the ZIP.
2. Open `index.html` in a modern browser using a local web server. Since JavaScript uses ES modules, do **not** just double-click the file in browsers that block module loading from `file://`.
3. In the project folder, run:

   ```bash
   python -m http.server 8000
   ```

4. Visit `http://localhost:8000`.
5. Run `npm test` if Node.js 20+ is installed.

## Create a GitHub repository and publish

The project is maintained at <https://github.com/AYNSD6257/Passenger-Database-Tools>. To work on it locally, clone the repository:

   ```bash
   git clone https://github.com/AYNSD6257/Passenger-Database-Tools.git
   cd Passenger-Database-Tools
   python -m http.server 8000
   ```

For a public repo, you can enable GitHub Pages under **Settings → Pages → Deploy from a branch → main / (root)**. Pages may take a little time to become live.

Changes should be reviewed and tested before the portal is used by real passengers.

## Scope and future roadmap

See [Project plan](docs/PROJECT_PLAN.md), [Official sources](docs/SOURCES.md), and [Safety and privacy policy](docs/PRIVACY_AND_SAFETY.md). Priority additions are an expanded reviewed country-source catalog, airline-policy references, localized language support, structured content review dates, and optional authorized rule-data integrations. Do not copy airline systems or scrape licensed Timatic data.

## Developer notes

- Entry point: `index.html`
- Styling: `styles.css`
- Browser interaction: `app.js`
- Checklist data + logic: `src/checklist.mjs`
- Itinerary builder, country list and route-aware logic: `src/journey.mjs`
- Curated country and airline link catalogs with review metadata: `src/catalog.mjs`
- Tests: `tests/*.test.mjs`
- GitHub Actions CI: `.github/workflows/ci.yml`

## Licensing

**No license is granted yet.** Choose a license before accepting external contributions or reuse. Add a `LICENSE` file when you have made that decision.

## Journey Builder limitations

The country selector is a starter list, not a complete list of countries or legal nationalities. The optional transit selector supports one country; travelers with multiple foreign connections must check each additional stop. Choosing a passport-issuing country does **not** capture residence permits, multiple nationalities, document type, travel date, previous visas, or airline-specific rules. No selected combination produces a visa decision or boarding authorization. The directory contains 9 country-specific government resources and 13 countries mapped to a single EU/Schengen regional overview; the regional overview is not national immigration guidance. Other destinations show limited coverage. Airline policy links are informational only and omit fares, allowances, and prices. Checklist completion is a review tracker, never evidence that a passenger meets entry requirements.

## Airline & country reference catalogs

Country source coverage and airline links were editorially checked on **2026-10-30**, not continuously refreshed. See `src/catalog.mjs` and `docs/SOURCES.md` for provenance. Searches filter the local curated list; they do not search the live internet or airline reservation data. Airline baggage rules depend on operating carrier, fare type, ticket issuance date, cabin, route, loyalty status and special equipment. Missing catalog links must not be interpreted as no restriction, no visa, or no fee.
