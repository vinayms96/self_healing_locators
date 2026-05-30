import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';
import { anthropic } from '../config/models';

const client = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

export async function callAnthropicAi(prompt: string) {

    const message = await client.messages.create({
        "max_tokens": 1024,
        "messages": [
            {
                "content": prompt,
                "role": "user"
            }
        ],
        "model": anthropic.models.HAIKU_4_5
    });

    const error = (message as any).error;
    if (error) throw new Error(`[${error.code}] ${error.message} — ${error.metadata?.raw ?? ''}`);

    const content = message.content[0];

    if(content.type === 'text') {
        return content.text;
    }
}

// callAnthropicAi('Heyy There!!');
