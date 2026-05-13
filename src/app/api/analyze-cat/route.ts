import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File | null;
    const catName = formData.get("catName") as string;
    const age = formData.get("age") as string;
    const breed = formData.get("breed") as string;
    const weight = formData.get("weight") as string;

    if (!image) {
      return Response.json(
        { error: "No image uploaded." },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly pet body condition scoring assistant. You analyze pet photos and give cautious, non-medical wellness feedback.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this pet photo and information.

Provided name: ${catName || "Not provided"}
Provided age: ${age || "Not provided"}
Provided breed: ${breed || "Not provided"}
Provided weight: ${weight || "Not provided"}

First determine whether the animal appears to be:
- cat
- dog
- other animal
- unclear

If it is a dog or other non-cat animal:
- Still provide a body condition estimate
- Guess the likely breed or breed mix if possible
- Include a playful joke about how this is ChonkCheck and the pet is not a cat
- Keep the joke kind and short

Return ONLY valid JSON in this exact format:

{
  "species": "cat" | "dog" | "other" | "unclear",
  "likely_breed": "best guess or unknown",
  "bcs_score": number,
  "confidence": "low" | "medium" | "high",
  "summary": "short summary",
  "joke": "short joke if not a cat, otherwise empty string",
  "observations": [
    "observation 1",
    "observation 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ]
}

Rules:
- Body condition score must be between 1 and 9
- For cats, use feline body condition scoring logic
- For dogs, use canine body condition scoring logic
- For other animals, be extra cautious and lower confidence
- If the image is unclear, set species to "unclear" and confidence to "low"
- Be cautious and non-medical
- Mention uncertainty if the image quality is poor
- Recommendations should be gentle and practical
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
      {
        error: "Analysis failed. Check terminal for details.",
      },
      { status: 500 }
    );
  }
}