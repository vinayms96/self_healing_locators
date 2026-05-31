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
| Target app | [icc-cricket.com](https://www.icc-cricket.com) |
| CI | GitHub Actions |

## Project Structure

```
self_healing_locators/
├── ai-space/
│   ├── caching/
│   │   ├── cache-locator.ts    # Builds cache entry from Locator + AI response
│   │   └── cache-read-write.ts # Read/write/find operations on the cache JSON
│   ├── config/
│   │   ├── models.ts           # LLM model constants (Anthropic + OpenRouter)
│   │   └── providers.ts        # AiProvider enum
│   ├── fixtures/
│   │   └── cached-locators.json# Persistent cache of healed locators
│   ├── handlers/
│   │   ├── build-locator.ts    # Builds Playwright Locator from AI or cache entry
│   │   ├── heal-locator.ts     # Builds prompt, calls LLM, triggers cache write
│   │   └── locator-selector.ts # Orchestrates DOM check → cache → AI fallback
│   └── llms/
│       ├── callAnthropicAi.ts  # Anthropic SDK call
│       └── callOpenRouterAi.ts # OpenRouter SDK call
├── pages/                      # Page Object Model
│   ├── homepage.page.ts
│   ├── videos.page.ts
│   └── video-player.page.ts
├── tests/
│   └── video-title.spec.ts     # Tests with and without self-healing
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
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
```

## Run Tests

```bash
npx playwright test                          # all tests (headless)
npx playwright test --headed                 # with browser visible
npx playwright test tests/video-title.spec.ts
npx playwright show-report                   # open HTML report
```

## Usage

Wrap any locator with `LocatorSelector.findLocator()`. Pass an optional CSS scope to narrow the HTML sent to the LLM (reduces tokens).

```typescript
const locatorSelector = new LocatorSelector(page);

// Without self-healing
await homepage.video_menu.click();

// With self-healing — falls back to AI if locator breaks
await (await locatorSelector.findLocator(homepage.video_menu, 'body nav')).click();
```

`findLocator` logic:
1. Tries the original locator with a 5s timeout
2. If not found, checks `cached-locators.json` for a previously healed locator
3. If no cache hit, extracts innerHTML of the scope block and sends to LLM
4. LLM responds with JSON `{ locatorType, locatorArgs }` — written to cache, then built into a live Playwright `Locator`

## AI Providers

Switch provider via `DEFAULT_PROVIDER` in `.env`.

**Anthropic models** (from `ai-space/config/models.ts`):

| Constant | Model ID |
|---|---|
| `SONNET_4_6` | claude-sonnet-4-6 |
| `HAIKU_4_5` | claude-haiku-4-5-20251001 |
| `OPUS_4_5` | claude-opus-4-5-20251101 |

**OpenRouter free models:**

| Constant | Model ID |
|---|---|
| `DEEPSEEK_V4_FLASH` | deepseek/deepseek-v4-flash |
| `OPENAI_GPT_OSS_120B` | openai/gpt-oss-120b:free |
| `GOOGLE_GEMMA4_31B` | google/gemma-4-31b-it:free |

## Caching

Healed locators are stored in `ai-space/fixtures/cached-locators.json`. Each entry:

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
    path: ai-space/fixtures/cached-locators.json
    key: locator-cache-${{ runner.os }}-${{ github.run_id }}
    restore-keys: |
      locator-cache-${{ runner.os }}-

- name: Run tests
  run: npx playwright test

- name: Save locator cache
  uses: actions/cache@v4
  with:
    path: ai-space/fixtures/cached-locators.json
    key: locator-cache-${{ runner.os }}-${{ github.run_id }}
```

Cache duration: 7 days since last access (GitHub default).

## CI

GitHub Actions runs on push to `main`/`master`. Playwright report uploaded as artifact (30-day retention).

Secrets required: `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` + `DEFAULT_PROVIDER`.
