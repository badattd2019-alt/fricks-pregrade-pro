import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { frontImage, backImage, cardName } = await req.json();

    if (!frontImage && !backImage) {
      return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 });
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert sports and TCG card grader with deep knowledge of PSA grading standards and current market prices.
Analyze the provided card photo(s) and return ONLY a valid JSON object (no markdown, no code fences) matching this exact format:
{
  "title": "Exact Card Name, Set Year, Card # and Variant",
  "grade": "PSA Grade (e.g. GEM-MT 10, MINT 9, NM-MT 8)",
  "rawVal": "$xx.xx",
  "gradedVal": "$xx.xx",
  "centering": {
    "score": "10.0",
    "measurements": "L/R: 2.5-2.5 (50/50) | T/B: 2.5-2.0 (56/44)",
    "ratio": "50/50 to 56/44 ratio",
    "rubric": "PSA Standard: GEM-MT 10 (Within 55/45 to 60/40 limit)"
  },
  "corners": {
    "score": "9.5",
    "note": "Sharp corners, minor micro-whitening"
  },
  "edges": {
    "score": "9.5",
    "note": "Clean borders, no chipping"
  },
  "surface": {
    "score": "10.0",
    "note": "High gloss, zero print lines"
  },
  "recommendation": "STRONG SUBMISSION CANDIDATE (Est. +$xxx Value Gain)"
}
Evaluate centering against real PSA criteria: 55/45-60/40 front is PSA 10; 60/40-65/35 is PSA 9; 65/35-70/30 is PSA 8. Provide realistic current market values.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: cardName ? `Card name hint: ${cardName}. Please inspect and grade this card:` : 'Please inspect, identify, and grade this card:'
          },
          ...(frontImage ? [{ type: 'image_url', image_url: { url: frontImage, detail: 'high' } }] : []),
          ...(backImage ? [{ type: 'image_url', image_url: { url: backImage, detail: 'high' } }] : [])
        ]
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 800,
      temperature: 0.2,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanContent);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json({ error: 'Failed to analyze card image.' }, { status: 500 });
  }
}
