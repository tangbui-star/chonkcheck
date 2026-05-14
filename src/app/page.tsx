"use client";

import { useState } from "react";

type AnalysisResult = {
  species?: "cat" | "dog" | "other" | "unclear";
  likely_breed?: string;
  bcs_score?: number;
  score_label?: "Lean" | "Ideal" | "Chonky" | "Oh Lawd";
  confidence?: "low" | "medium" | "high";
  summary?: string;
  joke?: string;
  photo_quality_notes?: string[];
  observations?: string[];
  recommendations?: string[];
  share_text?: string;
  error?: string;
};

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [catName, setCatName] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  }

  async function analyzeCat() {
    if (!selectedImage) {
      setResult({ error: "Please upload a pet photo first." });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("catName", catName);
    formData.append("age", age);
    formData.append("breed", breed);
    formData.append("weight", weight);

    try {
      const response = await fetch("/api/analyze-cat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setResult({ error: data.error });
        return;
      }

      const parsedResult = JSON.parse(data.result);
      setResult(parsedResult);
    } catch {
      setResult({
        error: "Something went wrong while analyzing the pet.",
      });
    } finally {
      setLoading(false);
    }
  }

  function getScoreWidth(score?: number) {
    if (!score) return "0%";
    return `${Math.min(Math.max(score, 1), 9) * 11.11}%`;
  }

  function copyShareText() {
    if (!result?.share_text) return;
    navigator.clipboard.writeText(result.share_text);
  }

  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <img
            src="/logo.png"
            alt="ChonkCheck logo"
            className="mx-auto mb-6 w-full max-w-sm"
          />

          <p className="mt-4 text-center text-lg text-gray-600">
            AI-powered pet body condition scoring and wellness tracking.
          </p>

          <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-900">
            <p className="font-bold">Wellness estimate only</p>
            <p className="mt-1">
              ChonkCheck provides AI-generated body condition estimates and is
              not veterinary advice. For health concerns, sudden weight changes,
              appetite changes, or mobility issues, consult a veterinarian.
            </p>
          </div>

          <label className="mt-8 block cursor-pointer rounded-2xl border-2 border-dashed border-orange-300 bg-orange-100 p-6 text-center">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Uploaded pet preview"
                className="mx-auto max-h-96 rounded-xl object-contain"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Click here to upload your pet photo
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  JPG or PNG. Standing side/top-down photos work best.
                </p>
              </div>
            )}
          </label>

          <div className="mt-8 grid gap-4">
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="rounded-xl border border-gray-300 p-4"
              placeholder="Pet Name"
            />

            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-xl border border-gray-300 p-4"
              placeholder="Age"
            />

            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="rounded-xl border border-gray-300 p-4"
              placeholder="Breed, if known"
            />

            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="rounded-xl border border-gray-300 p-4"
              placeholder="Weight"
            />
          </div>

          <button
            onClick={analyzeCat}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-orange-500 p-4 text-lg font-bold text-white hover:bg-orange-600 disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze My Pet"}
          </button>

          <div className="mt-8 rounded-2xl bg-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Analysis Result
            </h2>

            {!result && (
              <p className="mt-3 text-gray-600">
                Your pet&apos;s body condition analysis will appear here.
              </p>
            )}

            {result?.error && (
              <p className="mt-3 text-red-500">{result.error}</p>
            )}

            {result?.bcs_score && (
              <div className="mt-4 space-y-4">
                {result.joke && (
                  <div className="rounded-xl bg-orange-100 p-5 text-orange-900 shadow">
                    <h3 className="font-bold">Plot twist!</h3>
                    <p className="mt-2">{result.joke}</p>
                  </div>
                )}

                <div className="rounded-2xl bg-white p-6 text-center shadow">
                  <p className="text-sm font-medium text-gray-500">
                    Chonk Score
                  </p>

                  <p className="mt-2 text-6xl font-extrabold text-orange-500">
                    {result.bcs_score}/9
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {result.score_label}
                  </p>

                  <div className="mt-5 h-4 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: getScoreWidth(result.bcs_score) }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Lean</span>
                    <span>Ideal</span>
                    <span>Chonky</span>
                    <span>Oh Lawd</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-5 shadow">
                    <p className="text-sm font-medium text-gray-500">
                      Species
                    </p>
                    <p className="mt-2 text-2xl font-bold capitalize text-gray-900">
                      {result.species}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-5 shadow">
                    <p className="text-sm font-medium text-gray-500">
                      Likely Breed
                    </p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {result.likely_breed || "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-5 shadow">
                    <p className="text-sm font-medium text-gray-500">
                      Confidence
                    </p>
                    <p className="mt-2 text-2xl font-bold capitalize text-gray-900">
                      {result.confidence}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow">
                  <h3 className="font-bold text-gray-900">Summary</h3>
                  <p className="mt-2 text-gray-700">{result.summary}</p>
                </div>

                {result.photo_quality_notes &&
                  result.photo_quality_notes.length > 0 && (
                    <div className="rounded-xl bg-yellow-50 p-5 text-yellow-900 shadow">
                      <h3 className="font-bold">Photo Quality Notes</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {result.photo_quality_notes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="rounded-xl bg-white p-5 shadow">
                  <h3 className="font-bold text-gray-900">Observations</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                    {result.observations?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-white p-5 shadow">
                  <h3 className="font-bold text-gray-900">Recommendations</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                    {result.recommendations?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {result.share_text && (
                  <div className="rounded-2xl bg-orange-500 p-6 text-white shadow">
                    <h3 className="text-xl font-bold">Shareable Result</h3>
                    <p className="mt-2 text-lg">{result.share_text}</p>

                    <button
                      onClick={copyShareText}
                      className="mt-4 rounded-xl bg-white px-4 py-3 font-bold text-orange-600 hover:bg-orange-50"
                    >
                      Copy Share Text
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}