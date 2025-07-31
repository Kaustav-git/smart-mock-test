// Mock Test Web App with Upload + Auto Test Generator

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function MockTestApp() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Simple PDF parser mock for demo purposes
  const extractQuestions = async (text) => {
    const blocks = text.match(/Q\.\d+.*?(?=Q\.\d+|$)/gs);
    const parsed = blocks?.map((block) => {
      const lines = block.split("\n").filter((l) => l.trim());
      const q = lines[0].replace(/Q\.\d+\s*/, "");
      const options = lines.slice(1, 5);
      const answerLine = lines.find((l) => l.match(/Ans\s*[:\d]/));
      const correct = answerLine?.match(/(\d)/)?.[1];
      return { q, options, correct };
    });
    setQuestions(parsed || []);
  };

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      await extractQuestions(text);
    };
    reader.readAsText(uploadedFile);
  };

  const handleAnswer = (i) => setAnswers({ ...answers, [currentIndex]: i });

  const handleNext = () =>
    setCurrentIndex((prev) => (prev < questions.length - 1 ? prev + 1 : prev));

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));

  const handleSubmit = () => setSubmitted(true);

  const score = Object.entries(answers).filter(
    ([i, v]) => v === questions[i]?.correct
  ).length;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mock Test App</h1>

      {!questions.length && (
        <Card className="p-4 mb-4">
          <Input type="file" accept=".txt,.pdf" onChange={handleUpload} />
        </Card>
      )}

      {questions.length > 0 && !submitted && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="text-lg font-medium">
              Q{currentIndex + 1}: {questions[currentIndex].q}
            </div>
            {questions[currentIndex].options.map((opt, i) => (
              <div key={i}>
                <label>
                  <input
                    type="radio"
                    name="option"
                    checked={answers[currentIndex] == i + 1}
                    onChange={() => handleAnswer((i + 1).toString())}
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              </div>
            ))}
            <div className="flex justify-between">
              <Button onClick={handlePrev} disabled={currentIndex === 0}>
                Prev
              </Button>
              {currentIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit}>Submit</Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
            <Progress
              value={((currentIndex + 1) / questions.length) * 100}
            />
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Result Summary</h2>
          <p>
            You scored {score} out of {questions.length}
          </p>
          <ul className="list-disc mt-3 pl-5">
            {questions.map((q, i) => (
              <li key={i}>
                Q{i + 1}: {answers[i] === q.correct ? "✅" : "❌"} (Correct:
                Option {q.correct})
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
