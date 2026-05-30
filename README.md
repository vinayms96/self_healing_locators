# Self-Healing Locators

Playwright test framework that automatically repairs broken locators using AI. When a locator fails to find an element in the DOM, an LLM analyzes the current page HTML and returns a corrected locator — keeping tests green despite UI changes.

## How It Works

```
Test runs locator
       |
       v
  Found in DOM? ──yes──> use it
       |
      no
       |
       v
  Extract HTML block from page
       |
       v
  Send to LLM (Anthropic / OpenRouter)
       |
       v
  LLM returns corrected locator as JSON
       |
       v
  Build Playwright Locator and continue test
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
│   ├── config/
│   │   ├── models.ts          # LLM model constants (Anthropic + OpenRouter)
│   │   └── providers.ts       # AiProvider enum
│   ├── handlers/
│   │   ├── locatorSelector.ts # Orchestrates DOM check → AI fallback
│   │   └── locator-heal.ts    # Builds prompt, calls LLM, parses response
│   └── llms/
│       ├── callAnthropicAi.ts # Anthropic SDK call
│       └── callOpenRouterAi.ts# OpenRouter SDK call
├── pages/                     # Page Object Model
│   ├── homepage.page.ts
│   ├── videos.page.ts
│   └── video_player.page.ts
├── tests/
│   └── video-title.spec.ts    # Tests with and without self-healing
├── playwright.config.ts
└── .env                       # API keys and provider config (not committed)
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
2. If not found, extracts innerHTML of the scope block and sends to LLM
3. LLM responds with JSON `{ locatorType, locatorArgs }` — built into a live Playwright `Locator`

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

## CI

GitHub Actions runs on push to `main`/`master`. Playwright report uploaded as artifact (30-day retention).

Secrets required: `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` + `DEFAULT_PROVIDER`.
