# Passenger-Database-Tools

**SojournNexus** — *Connecting Every Journey* — is the first web application in this repository, building toward a passenger travel-documentation and information platform.

A mobile-friendly, **independent educational prototype** helping airline passengers review travel preparations for U.S. domestic and international flights. No accounts, back end, paid services, or API keys are required.

> **Safety notice:** This tool never determines whether someone can board, enter, exit, or transit a country. Requirements change and depend on passenger nationality, document type, route, status, purpose of travel, and airline. Always verify with the airline, IATA Travel Centre, and relevant government authorities. It is **not affiliated** with an airline, airport, government, or IATA.

## Included now

- Personalized Journey Builder: departure country, destination, passport-issuing country, optional single transit country, and trip purpose
- Automatically distinguished international, U.S. domestic, and other domestic preparation checklists
- Extra prompts for travel with minors, accessibility needs, pets, and medication
- Review-progress tracker, reset, and print-friendly view
- Curated official destination and transit links for the U.S., U.K., Canada, and Australia; explicit coverage warnings elsewhere
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
- Itinerary builder, limited country registry, and official resource links: `src/journey.mjs`
- Tests: `tests/checklist.test.mjs`
- GitHub Actions CI: `.github/workflows/ci.yml`

## Licensing

**No license is granted yet.** Choose a license before accepting external contributions or reuse. Add a `LICENSE` file when you have made that decision.

## Journey Builder limitations

The country selector is a starter list, not a complete list of countries or legal nationalities. The optional transit selector supports one country; travelers with multiple foreign connections must check each additional stop. Choosing a passport-issuing country does **not** capture residence permits, multiple nationalities, document type, travel date, previous visas, or airline-specific rules. No selected combination produces a visa decision or boarding authorization. Official government links are curated only for the U.S., U.K., Canada, and Australia at this stage; for others the app explicitly warns about limited coverage. Checklist completion is a review tracker, never evidence that a passenger meets entry requirements.
