# Self-Healing Locators

Playwright test framework that automatically repairs broken locators using AI. When a locator fails to find an element in the DOM, an LLM analyzes the current page HTML and returns a corrected locator — keeping tests green despite UI changes.

## How It Works

```
┌─────────────────────────┐
│     Test runs locator   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐        ┌─────────────────┐
│     Found in DOM?       │──yes──▶│   Use locator   │
└────────────┬────────────┘        └─────────────────┘
             │ no
             ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│    Found in cache?      │──yes──▶│  Build from cache & use  │
└────────────┬────────────┘        └──────────────────────────┘
             │ no
             ▼
┌─────────────────────────┐
│  Extract HTML from page │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Send to LLM            │
│  (Anthropic/OpenRouter) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  LLM returns            │
│  { locatorType, args }  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Save to cache          │
│  cached-locators.json   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Build Playwright       │
│  Locator & continue     │
└─────────────────────────┘
```

## Stack

| Layer | Tech |
|---|---|
| Test framework | Playwright 1.60, TypeScript |
| AI providers | Anthropic SDK, OpenRouter SDK |
| Target app | [saucedemo.com](https://www.saucedemo.com) |
| CI | GitHub Actions |

## Project Structure

```
self_healing_locators/
├── ai-space/
│   ├── caching/
│   │   ├── cache-locator.ts    # Builds cache entry from Locator + AI response
│   │   ├── cache-read-write.ts # Read/write/find operations on the cache JSON
│   │   └── conversion.ts       # Toon encode/decode helpers for cache serialization
│   ├── config/
│   │   ├── models.ts           # LLM model constants (Anthropic + OpenRouter)
│   │   └── providers.ts        # AiProvider enum
│   ├── handlers/
│   │   ├── build-locator.ts    # Builds Playwright Locator from AI or cache entry
│   │   ├── heal-locator.ts     # Builds prompt, calls LLM, triggers cache write
│   │   └── locator-selector.ts # Orchestrates DOM check → cache → AI fallback
│   └── llms/
│       ├── callAnthropicAi.ts  # Anthropic SDK call
│       └── callOpenRouterAi.ts # OpenRouter SDK call
├── data/
│   └── user_data.ts            # Test user accounts and payment info constants
├── fixtures/
│   ├── cached-locators.json    # Persistent cache of healed locators
│   └── login-page.ts           # Custom fixture: auto-login before / logout after each test
├── pages/                      # Page Object Model
│   ├── login.page.ts           # Login page interactions
│   └── listing.page.ts         # Inventory listing page interactions
├── tests/
│   ├── login.spec.ts           # Login and logout tests
│   └── listing.spec.ts         # Inventory listing, sorting, and pricing tests
├── utils/
│   └── credentials.ts          # Reads SAUCE_DEMO_PASSWORD env var, looks up username by type
├── playwright.config.ts
└── .env                        # API keys and provider config (not committed)
```

## Setup

```bash
npm install
npx playwright install
```

Create `.env`:

```env
DEFAULT_PROVIDER=ANTHROPIC        # or OPENROUTER
DEFAULT_MODEL=SONNET_4_6          # model constant key from ai-space/config/models.ts
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
SAUCE_DEMO_PASSWORD=secret_sauce  # saucedemo test password
```

## Run Tests

```bash
npx playwright test                          # all tests (headless)
npx playwright test --headed                 # with browser visible
npx playwright test tests/login.spec.ts      # login tests only
npx playwright test tests/listing.spec.ts    # inventory listing tests only
npx playwright show-report                   # open HTML report
```

## Usage

Wrap any locator with `LocatorSelector.findLocator()`. Pass an optional CSS scope to narrow the HTML sent to the LLM (reduces tokens).

```typescript
const locatorSelector = new LocatorSelector(page);

// Without self-healing
await loginPage.username.fill('standard_user');

// With self-healing — falls back to AI if locator breaks
await (await locatorSelector.findLocator(loginPage.username, '#login_button_container')).fill('standard_user');
```

`findLocator` logic:
1. Tries the original locator with a 5s timeout
2. If not found, checks `cached-locators.json` for a previously healed locator
3. If no cache hit, extracts innerHTML of the scope block and sends to LLM
4. LLM responds with JSON `{ locatorType, locatorArgs }` — written to cache, then built into a live Playwright `Locator`

## Test Fixtures & Credentials

Tests that require an authenticated session import from `fixtures/login-page.ts` instead of `@playwright/test`:

```typescript
import { test, expect } from '../fixtures/login-page';

test('my test', async ({ loginPage, page }) => {
    // user is already logged in — starts on /inventory.html
    // logout happens automatically after the test
});
```

The fixture navigates to `/`, logs in using `standard_user` credentials, asserts the redirect to `/inventory.html`, then logs out after the test completes.

User accounts are defined in `data/user_data.ts`. Retrieve credentials via `utils/credentials.ts`:

```typescript
import { getUserCredentials } from '../utils/credentials';

const creds = getUserCredentials('standard_user');
// creds.username → 'standard_user'
// creds.password → process.env.SAUCE_DEMO_PASSWORD
```

Available user types: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`.

## AI Providers

Switch provider via `DEFAULT_PROVIDER` in `.env`.

**Anthropic models** (from `ai-space/config/models.ts`):

| Constant | Model ID |
|---|---|
| `OPUS_4_7` | claude-opus-4-7 |
| `OPUS_4_6` | claude-opus-4-6 |
| `OPUS_4_5` | claude-opus-4-5-20251101 |
| `SONNET_4_6` | claude-sonnet-4-6 |
| `HAIKU_4_5` | claude-haiku-4-5-20251001 |

**OpenRouter free models:**

| Constant | Model ID |
|---|---|
| `DEEPSEEK_V4_FLASH` | deepseek/deepseek-v4-flash |
| `OPENAI_GPT_OSS_120B` | openai/gpt-oss-120b:free |
| `GOOGLE_GEMMA4_31B` | google/gemma-4-31b-it:free |

## Caching

Healed locators are stored in `fixtures/cached-locators.json`. Each entry:

```json
{
  "originalLocator": ".hero-rapper .swiper-wrapper a",
  "alternateLocatorType": "locator",
  "alternateLocatorArgs": [".hero-wrapper .swiper-wrapper a"],
  "cachedTime": "2026-05-31T09:29:49.518Z"
}
```

- On match, the cache is updated (upsert by `originalLocator`)
- Skips the LLM call entirely on subsequent runs — faster and cheaper

### Cache in CI/CD

Add to your GitHub Actions workflow to persist the cache across runs:

```yaml
- name: Restore locator cache
  uses: actions/cache@v4
  with:
    path: fixtures/cached-locators.json
    key: locator-cache-${{ runner.os }}-${{ github.run_id }}
    restore-keys: |
      locator-cache-${{ runner.os }}-

- name: Run tests
  run: npx playwright test

- name: Save locator cache
  uses: actions/cache@v4
  with:
    path: fixtures/cached-locators.json
    key: locator-cache-${{ runner.os }}-${{ github.run_id }}
```

Cache duration: 7 days since last access (GitHub default).

## CI

GitHub Actions runs on push to `main`/`master`. Uses the `qa` environment, Node.js 24, 60-minute timeout. Playwright report uploaded as artifact (30-day retention).

Config differences between local and CI:

| Setting | Local | CI |
|---|---|---|
| Workers | unlimited (parallel) | 1 (serial) |
| Retries | 0 | 2 |
| `fullyParallel` | false | false |
| Video | on | on |
| Screenshot | on | on |
| Trace | on first retry | on first retry |

**GitHub Secrets** (sensitive values):

| Secret | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic SDK auth |
| `OPENROUTER_API_KEY` | OpenRouter SDK auth |
| `SAUCE_DEMO_PASSWORD` | SauceDemo test password |

**GitHub Vars** (non-sensitive config, set under environment `qa`):

| Var | Purpose |
|---|---|
| `DEFAULT_PROVIDER` | `ANTHROPIC` or `OPENROUTER` |
| `DEFAULT_MODEL` | Model constant key (e.g. `SONNET_4_6`) |
