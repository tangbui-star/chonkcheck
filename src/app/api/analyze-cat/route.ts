import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File | null;
    const petName = formData.get("catName") as string;
    const age = formData.get("age") as string;
    const breed = formData.get("breed") as string;
    const weight = formData.get("weight") as string;

    if (!image) {
      return Response.json({ error: "No image uploaded." }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly pet body condition scoring assistant. You provide cautious, non-medical wellness feedback with playful chonk-themed personality.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this pet photo and information.

Name: ${petName || "Not provided"}
Age: ${age || "Not provided"}
Breed: ${breed || "Not provided"}
Weight: ${weight || "Not provided"}

Return ONLY valid JSON:

{
  "species": "cat" | "dog" | "other" | "unclear",
  "likely_breed": "best guess or unknown",
  "bcs_score": number,
  "score_label": "Lean" | "Ideal" | "Chonky" | "Oh Lawd",
  "confidence": "low" | "medium" | "high",
  "summary": "short summary with a funny cute chonk-related phrase",
  "joke": "short cute joke for every pet scan",
  "observations": [
    "observation 1"
  ],
  "recommendations": [
    "recommendation 1"
  ],
  "share_text": "fun meme-like sentence about the pet's chonk level suitable for social sharing"
}

Rules:
- BCS must be 1-9
- 1-3 = Lean
- 4-5 = Ideal
- 6-7 = Chonky
- 8-9 = Oh Lawd
- The summary must always include a cute or funny chonk-related reference
- joke must always be included
- If species is cat, joke should be a cute cat/chonk joke
- If species is not cat, joke should kindly mention the pet is not a cat
- share_text should be funny, cute, meme-like, and internet-shareable
- include chonk/chonker terminology when appropriate
- If photo is poor, mention uncertainty inside observations, not in a separate section
- Be cautious and non-medical
- Do not include markdown
- Do not include extra commentary
`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    return Response.json(
      { error: "Analysis failed. Check terminal for details." },
      { status: 500 }
    );
  }
}