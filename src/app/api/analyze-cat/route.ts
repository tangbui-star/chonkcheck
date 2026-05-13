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
            "You are a feline body condition scoring assistant. You provide cautious, non-medical wellness feedback based on cat photos.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this cat photo and information.

Cat name: ${catName || "Not provided"}
Age: ${age || "Not provided"}
Breed: ${breed || "Not provided"}
Weight: ${weight || "Not provided"}

Return ONLY valid JSON in this exact format:

{
  "bcs_score": number,
  "confidence": "low" | "medium" | "high",
  "summary": "short summary",
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