import { env } from './config/env';

async function testGeminiGenerate() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Gemini API test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }
  const apiKey = env.GEMINI_API_KEY;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'You are OnboardOS Copilot. Return structured JSON with keys "answer" and "recommendedAction" explaining why AWS IAM access requires manager approval for a junior developer.',
                },
              ],
            },
          ],
        }),
      }
    );
    const data: any = await res.json();
    console.log('📡 Gemini 3.6 Flash full response:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}

testGeminiGenerate();
