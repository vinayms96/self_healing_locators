import { Locator, Page } from "@playwright/test";
import { callAnthropicAi } from "../llms/callAnthropicAi";
import { AiProvider } from "../config/providers";
import { callOpenRouterAi } from "../llms/callOpenRouterAi";
import 'dotenv/config';

const provider = process.env['DEFAULT_PROVIDER'];

// Building the prompt and calling the LLM models for new locator
export async function locatorHealer(page: Page, originalLocator: Locator, pageSource: string): Promise<Locator> {
    const prompt = `
        You are a QA lead automation engineer. A Playwright locator has broken or changed. Using the originalLocator as context and pageSource as the current HTML, find the correct updated locator.

        Match the originalLocator's method if possible, else default to CSS locator(). Supported formats:
        1. getByRole('button', { name: 'Sign in' }) | getByRole('link', { name: 'Home', exact: true })
        2. getByLabel('Password') | getByLabel('Email', { exact: true })
        3. getByPlaceholder('Search...') | getByPlaceholder('name@example.com', { exact: true })
        4. getByText('Submit') | getByText('Welcome, John', { exact: true }) | getByText(/regex/i)
        5. getByAltText('logo') | getByTitle('Close') | getByTestId('submit-btn')
        6. locator('.hero-wrapper a') | locator('xpath=//button') | locator('[data-testid="x"]')

        This is the original locator "${originalLocator.toString()}" that was not found on the page. Find the new updated locator
        for the same context from passed pageSource HTML: ${pageSource}

        IMPORTANT RULES:
        - FIRST try to repair the original locator: if a class name, attribute, or selector part looks like a typo or has changed, correct it using what you find in pageSource.
        - Only switch to a completely different locator strategy if the original structure cannot be found at all in pageSource.
        - Prefer CSS selectors with stable class names or unique attributes over text-based matching.
        - Use { exact: true } when matching by text, label, or name to avoid partial matches.

        Respond with ONLY JSON, no other text:
        {
            "locatorType": "getByRole",
            "locatorArgs": ["button", { "name": "Sign in" }]
        }
    `;

    let response;

    try {
        if (provider === AiProvider.OPENROUTER) response = await callOpenRouterAi(prompt);
        if (provider === AiProvider.ANTHROPIC) response = await callAnthropicAi(prompt);
    } catch (err) {
        throw new Error(`AI provider call failed [${provider}]: ${(err as Error).message}`);
    }

    if (!response) throw new Error(`AI returned empty response [provider: ${provider}]`);
    return locatorBuilder(page, response);
}

// Build the locator from the JSON returned by the AI response
async function locatorBuilder(page: Page, aiResponse: string): Promise<Locator> {
    console.log(aiResponse);
    const { locatorType, locatorArgs } = JSON.parse(aiResponse);
    const builtLocator = (page as any)[locatorType](...locatorArgs);

    console.log(builtLocator);
    return builtLocator;
}

const promptMyVersion = `
    You are a QA Lead Automation Engineer with 10+ years of experience.
    You need to identify the broken locator or locator not found whcih is "originalLocator" and using the "pageSource" passed to find new locator.
    Get the context from the test or from originalLocator and find the new changed locator from pageSource and pass the locator back to continue the test.

    Convert the locator found to use Playwright functions of finding the locators as below examples:
    """
        Find and return the locators they are being used or passed in originallocator.
        If originalLocator has any of the below methods used return locator in that format, else by default give the 'locator('')' way with CSS Selector way.

        GET BY ROLE:
        getByRole('button', { name: 'Sign in' })
        getByRole('heading', { name: 'Sign up' })
        getByRole('link', { name: 'Home' })
        getByRole('button', { name: 'Sign in', exact: true })
        getByRole('heading', { name: 'Sign up', exact: true })
        getByRole('link', { name: 'Home', exact: true })

        GET BY LABEL:
        getByLabel('Password')
        getByLabel('Password', { exact: true })

        GET BY PLACEHOLDER:
        getByPlaceholder('name@example.com')
        getByPlaceholder('Search...')
        getByPlaceholder('name@example.com', { exact: true })
        getByPlaceholder('Search...', { exact: true })

        GET BY TEXT:
        getByText('Welcome, John')
        getByText(/welcome, [A-Za-z]+$/i)
        getByText('Welcome, John', { exact: true })
        getByText('Submit', { exact: true })

        GET BY ALT TEXT:
        getByAltText('playwright logo')

        GET BY TITLE:
        getByTitle('Close dialog')

        GET BY TEST-ID:
        getByTestId('submit-btn')

        GET BY CSS OR XPATH:
        locator('css=button')
        locator('xpath=//button')
        locator('button')
        locator('//button')
        locator('.hero-wrapper')
        locator('[data-testid="submit"]')
    """

    IMPORTANT RULES:
    - FIRST try to repair the original locator: if a class name, attribute, or selector part looks like a typo or has changed, correct it using what you find in pageSource.
    - Only switch to a completely different locator strategy if the original structure cannot be found at all in pageSource.
    - Prefer CSS selectors with stable class names or unique attributes over text-based matching.
    - Use { exact: true } when matching by text, label, or name to avoid partial matches.

    Respond with ONLY JSON, no other text:
    {
        "locatorType": "getByRole",
        "locatorArgs": ["button", { "name": "Sign in" }]
    }
`
