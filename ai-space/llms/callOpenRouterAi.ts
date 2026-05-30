import { OpenRouter } from '@openrouter/sdk';
import 'dotenv/config';
import { openRouter } from '../config/models';

const client = new OpenRouter({
    apiKey: process.env['OPENROUTER_API_KEY'],
    httpReferer: '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    appTitle: 'SelfHealingLocators', // Optional. Site title for rankings on openrouter.ai.
});

export async function callOpenRouterAi(prompt: string) {
    const message = await client.chat.send({
        chatRequest: {
            model: openRouter.models[process.env['DEFAULT_MODEL'] as keyof typeof openRouter.models],
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }
    });

    const error = (message as any).error;
    if (error) throw new Error(`[${error.code}] ${error.message} — ${error.metadata?.raw ?? ''}`);

    return message.choices[0].message.content;
}

// callOpenRouterAi('Heyy there!!');
