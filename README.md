# ShieldGuard — AEM Headless React App

A React + Vite application that consumes AEM Content Fragments through a persisted GraphQL query and renders them dynamically.

## Architecture

```
AEM Author → Content Fragments → AEM Publish
                                      |
                          Persisted GraphQL Query
                                      |
                              React (fetch API)
                                      |
                              React State (useState)
                                      |
                         ContentFragmentList → ContentFragmentCard[]
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | 9 or later |

---

## Installation

```bash
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_AEM_GRAPHQL_URL` | Full URL to the AEM persisted GraphQL endpoint |
| `VITE_AEM_AUTH_USER` | AEM username (only needed for Author instances) |
| `VITE_AEM_AUTH_PASS` | AEM password (only needed for Author instances) |

Example `.env`:

```
VITE_AEM_GRAPHQL_URL=https://publish-p221102-e2272119.adobeaemcloud.com/graphql/execute.json/shieldguard/personal-umbrella
VITE_AEM_AUTH_USER=
VITE_AEM_AUTH_PASS=
```

> **Never commit `.env` to source control.** It is already listed in `.gitignore`.

---

## Running the Application

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## How the Application Communicates with AEM

1. On mount, `Home.jsx` calls `fetchContentFragments()` from `src/api/aemApi.js`.
2. `aemApi.js` sends a `GET` request to `VITE_AEM_GRAPHQL_URL` with optional Basic Auth headers.
3. The raw `data` object from the GraphQL JSON response is returned.
4. `extractItems(data)` scans the `data` object for the first key whose value contains an `items` array — this handles any persisted query name automatically.
5. The items array is stored in React state and passed to `ContentFragmentList`.
6. `ContentFragmentList` maps over every item and renders a `ContentFragmentCard` for each one.

---

## Expected GraphQL Response Structure

The app handles any structure of the form:

```json
{
  "data": {
    "<anyListKey>": {
      "items": [
        { "title": "...", "description": "...", ... },
        { "title": "...", "description": "...", ... }
      ]
    }
  }
}
```

`extractItems()` in `aemApi.js` dynamically finds the `items` array regardless of the list key name.

---

## Content Fragment Field Mapping

`ContentFragmentCard.jsx` resolves fields in priority order:

| Slot | Fields checked (first match wins) |
|------|-----------------------------------|
| Title | `title`, `heading`, `name`, `question` |
| Body | `description`, `body`, `text`, `content`, `summary`, `answer`, `details` |
| Image | `image._path`, `featuredImage._path`, `thumbnail._path` |
| Link | `link`, `url`, `ctaUrl`, `externalUrl`, `href` |
| Badge | `category`, `type`, `tag`, `label`, `badge` |

Any fields not matched by the above are rendered generically in a key/value list at the bottom of the card — no data is silently dropped.

To customise the mapping, edit the `KNOWN_*` constant arrays at the top of `src/components/ContentFragmentCard.jsx`.

---

## CORS Configuration

Because the React app calls AEM directly from the browser, AEM must allow cross-origin requests from the React dev origin (`http://localhost:5173`).

### Required AEM OSGi Configuration

Create or update the **Adobe Granite Cross-Origin Resource Sharing Policy** OSGi config on AEM Publish:

```
PID: com.adobe.granite.cors.impl.CORSPolicyImpl
```

| Property | Value |
|----------|-------|
| `alloworigin` | `http://localhost:5173` (add your production domain too) |
| `allowedpaths` | `/graphql/execute.json/.*` |
| `supportedmethods` | `GET`, `HEAD`, `OPTIONS` |
| `supportedheaders` | `Origin`, `Accept`, `Authorization`, `Content-Type` |
| `maxage` | `3600` |

> Do **not** use `mode: 'no-cors'` in fetch — it prevents reading the response body.

For AEM as a Cloud Service, configure CORS via the `ui.config` OSGi config folder in your Cloud Manager pipeline.

---

## Authentication

The persisted query endpoint on **AEM Publish** is typically publicly accessible without authentication.

The endpoint used in this project points to an **AEM Author** instance, which requires Basic Auth. Set `VITE_AEM_AUTH_USER` and `VITE_AEM_AUTH_PASS` in `.env`.

> For production, use AEM Publish (not Author) and remove the auth variables.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401 Unauthorized` | Author instance requires auth | Set `VITE_AEM_AUTH_USER` / `VITE_AEM_AUTH_PASS` |
| `CORS error` in browser | AEM CORS policy not configured | See CORS section above |
| `VITE_AEM_GRAPHQL_URL is not set` | Missing `.env` file | Copy `.env.example` to `.env` |
| Cards show only generic fields | CF model fields don't match known names | Update `KNOWN_*` arrays in `ContentFragmentCard.jsx` |
| Empty grid | `items` array is empty in AEM | Check the persisted query in AEM GraphiQL |

---

## Project Structure

```
src/
├── api/
│   └── aemApi.js              # fetch + response parsing
├── components/
│   ├── ContentFragmentCard.jsx # renders one CF
│   ├── ContentFragmentList.jsx # maps over all CFs
│   ├── ErrorMessage.jsx
│   └── Loading.jsx
├── pages/
│   └── Home.jsx               # data fetching + state
├── App.jsx
├── main.jsx
└── index.css
.env
.env.example
```
