
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Story, InitialStoryPart, StoryContinuationPart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `You are an interactive storyteller for a 2-year-old named Abood.
Your goal is to create short, engaging, and wholesome stories filled with gentle sounds, cute visuals, and simple language.

GUIDELINES:
- Story Length: Keep each part of the story very short.
- Structure: Follow a 3-part structure: Opening Scene with a Choice, an Adventure based on the choice, and a happy Ending.
- Interactivity: The story MUST present exactly two simple choices for the child.
- Language: Use very simple words and short sentences.
- Tone: Always be positive, safe, happy, and imaginative.
- Sound Effects: Include bracketed sound effects like [Birds chirping] or [soft whoosh].
- Emotional Cues: Describe emotions simply, e.g., "Abood giggled happily."
- Visuals: Use lots of colorful emojis to illustrate the story.
- Ending: Conclude with a joyful message and a simple, positive moral. E.g., "Yay! You helped the little star find its mommy! Helping friends is the best! 🎉"
- Do not ask for another story in the response. The app's UI will handle that.`;

const initialStorySchema = {
  type: Type.OBJECT,
  properties: {
    openingScene: {
      type: Type.STRING,
      description: "The beginning of the story. Introduce Abood and the setting. Use emojis. e.g., '🎵 Once upon a time, Abood the little bear 🐻 was in a sparkly forest ✨.'"
    },
    question: {
      type: Type.STRING,
      description: "A simple question asking the child to make a choice. e.g., 'What should he do?'"
    },
    options: {
      type: Type.ARRAY,
      description: "An array with exactly two short, simple choices, with emojis.",
      items: { type: Type.STRING },
      minItems: 2,
      maxItems: 2,
    }
  },
  required: ['openingScene', 'question', 'options']
};

const continuationSchema = {
    type: Type.OBJECT,
    properties: {
        adventure: {
            type: Type.STRING,
            description: "The next part of the story based on the user's choice. Describe the action with sounds and emotions. e.g., 'He followed the path! [twinkle twinkle] The path led to a river of yummy honey! 🍯'"
        },
        ending: {
            type: Type.STRING,
            description: "The happy conclusion of the story with a positive message. e.g., 'Yay! Abood had a full tummy and made new friends! Sharing is so much fun! 🎉'"
        }
    },
    required: ['adventure', 'ending']
};

export const generateInitialStory = async (setting: string): Promise<InitialStoryPart> => {
    const prompt = `Start a new story for Abood set in ${setting}.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: initialStorySchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const continueStory = async (storySoFar: Story, choice: string): Promise<StoryContinuationPart> => {
    const prompt = `The story so far:
    - Setting: ${storySoFar.setting}
    - Opening: ${storySoFar.opening}
    - Question: ${storySoFar.question}
    - Abood's choice: "${choice}"
    
    Now, continue the story with an adventure and a happy ending.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: continuationSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const generateSpeech = async (text: string): Promise<string> => {
    // Remove sound effect brackets for cleaner speech
    const cleanText = text.replace(/\[.*?\]/g, ' ');

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in a warm, gentle, and slightly cheerful voice for a toddler: ${cleanText}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
};
