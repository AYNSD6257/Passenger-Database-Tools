# Passenger-Database-Tools

**SojournNexus** — *Connecting Every Journey* — is the first web application in this repository, building toward a passenger travel-documentation and information platform.

A mobile-friendly, **independent educational prototype** helping airline passengers review travel preparations for U.S. domestic and international flights. No accounts, back end, paid services, or API keys are required.

> **Safety notice:** This tool never determines whether someone can board, enter, exit, or transit a country. Requirements change and depend on passenger nationality, document type, route, status, purpose of travel, and airline. Always verify with the airline, IATA Travel Centre, and relevant government authorities. It is **not affiliated** with an airline, airport, government, or IATA.

## Included now

- Interactive domestic-U.S. vs. international travel preparation checklists
- Extra prompts for travel with minors, accessibility needs, pets, and medication
- Review-progress tracker, reset, and print-friendly view
- Links to official travel-information sources
- Responsive layout and accessible semantic form controls
- No analytics, cookies, account registration, personal-document upload, or persistent storage
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

See [Project plan](docs/PROJECT_PLAN.md), [Official sources](docs/SOURCES.md), and [Safety and privacy policy](docs/PRIVACY_AND_SAFETY.md). Priority additions are an airline-policy reference catalog, destination-government links, localized language support, structured content review dates, and optional authorized rule-data integrations. Do not copy airline systems or scrape licensed Timatic data.

## Developer notes

- Entry point: `index.html`
- Styling: `styles.css`
- Browser interaction: `app.js`
- Checklist data + logic: `src/checklist.mjs`
- Tests: `tests/checklist.test.mjs`
- GitHub Actions CI: `.github/workflows/ci.yml`

## Licensing

**No license is granted yet.** Choose a license before accepting external contributions or reuse. Add a `LICENSE` file when you have made that decision.
