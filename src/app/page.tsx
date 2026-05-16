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
  const [copied, setCopied] = useState(false);

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
        error: "Something went wrong while analyzing the chonk.",
      });
    } finally {
      setLoading(false);
    }
  }

  function getScoreWidth(score?: number) {
    if (!score) return "0%";
    return `${Math.min(Math.max(score, 1), 9) * 11.11}%`;
  }

  function shouldShowBreedCard() {
    if (!result?.likely_breed) return false;

    const breedText = result.likely_breed.toLowerCase().trim();

    return (
      breedText !== "unknown" &&
      breedText !== "best guess or unknown" &&
      breedText !== "not provided" &&
      breedText !== "unclear"
    );
  }

  async function copyShareText() {
    if (!result?.share_text) return;

    try {
      await navigator.clipboard.writeText(result.share_text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = result.share_text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "rounded-xl border border-gray-300 p-4 text-gray-900 placeholder:text-gray-500";

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
                  Click here to upload your chonk photo
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  JPG or PNG. Standing side/top-down photos work best.
                </p>
              </div>
            )}
          </label>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-600">
              Optional details — add these for a better estimate
            </p>

            <div className="grid gap-4">
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className={inputClass}
                placeholder="Pet name (optional)"
              />

              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
                placeholder="Age (optional)"
              />

              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className={inputClass}
                placeholder="Breed, if known (optional)"
              />

              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
                placeholder="Weight (optional)"
              />
            </div>
          </div>

          <button
            onClick={analyzeCat}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-orange-500 p-4 text-lg font-bold text-white hover:bg-orange-600 disabled:bg-gray-400"
          >
            {loading ? "Analyzing Chonker Physics..." : "Analyze My Chonk"}
          </button>

          <div className="mt-8 rounded-2xl bg-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Analysis Result
            </h2>

            {!result && (
              <p className="mt-3 text-gray-600">
                Your chonk&apos;s body condition analysis will appear here.
              </p>
            )}

            {result?.error && (
              <p className="mt-3 text-red-500">{result.error}</p>
            )}

            {result?.bcs_score && (
              <div className="mt-4 space-y-4">
                {result.joke && (
                  <div className="rounded-xl bg-orange-100 p-5 text-orange-900 shadow">
                    <h3 className="font-bold">Chonk Joke 🐾</h3>
                    <p className="mt-2">{result.joke}</p>
                  </div>
                )}

                <div className="rounded-2xl bg-white p-6 text-center shadow">
                  <p className="text-sm font-medium text-gray-500">
                    Chonk Result
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

                <div
                  className={`grid gap-4 ${
                    shouldShowBreedCard() ? "md:grid-cols-3" : "md:grid-cols-2"
                  }`}
                >
                  <div className="rounded-xl bg-white p-5 shadow">
                    <p className="text-sm font-medium text-gray-500">
                      Species
                    </p>
                    <p className="mt-2 text-2xl font-bold capitalize text-gray-900">
                      {result.species}
                    </p>
                  </div>

                  {shouldShowBreedCard() && (
                    <div className="rounded-xl bg-white p-5 shadow">
                      <p className="text-sm font-medium text-gray-500">
                        Likely Breed
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {result.likely_breed}
                      </p>
                    </div>
                  )}

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
                  <h3 className="font-bold text-gray-900">
                    Official Chonk Analysis 🐾
                  </h3>

                  <p className="mt-3 text-lg font-medium text-orange-600">
                    {result.score_label === "Lean" &&
                      "A sleek little speed chonk."}
                    {result.score_label === "Ideal" &&
                      "A well-balanced and healthy chonker."}
                    {result.score_label === "Chonky" &&
                      "Certified premium household chonk."}
                    {result.score_label === "Oh Lawd" &&
                      "Oh lawd... this chonker has achieved legendary status."}
                  </p>

                  <p className="mt-3 text-gray-700">{result.summary}</p>
                </div>

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
                      {copied ? "Copied!" : "Copy Share Text"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Powered by AI, snacks, and questionable feline decisions.
          </p>
        </div>
      </div>
    </main>
  );
}