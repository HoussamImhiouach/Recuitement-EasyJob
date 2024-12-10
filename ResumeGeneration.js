import React, { useState } from "react";
import axios from "axios";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

function ResumeGeneration() {
  const [textInput, setTextInput] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateResume = async () => {
    if (!textInput.trim()) {
      alert("Please enter your professional details.");
      return;
    }

    setLoading(true);

    const apiKey =
      "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"; // Replace with your OpenAI API key
    const prompt = `You are an expert resume writer. Using the following input, generate a professional resume in a structured format:\n${textInput}`;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume writer. Generate a professional resume in a structured format based on the user's input.",
            },
            { role: "user", content: textInput },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const generatedText = response.data.choices[0].message.content.trim();
      setGeneratedResume(generatedText);
    } catch (error) {
      if (error.response) {
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
      alert(
        "An error occurred while generating the resume. Check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportToWord = () => {
    if (!generatedResume) {
      alert("No resume to export. Please generate a resume first.");
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: generatedResume.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: line.startsWith("#"), // Make headings bold
                    break: 1,
                  }),
                ],
              })
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Generated_Resume.docx");
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Resume Generation</h1>
      <textarea
        style={{
          width: "80%",
          height: "200px",
          margin: "20px 0",
          fontSize: "16px",
          padding: "10px",
        }}
        placeholder="Enter your details here (e.g., name, contact, skills, experience, etc.)"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />
      <br />
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={handleGenerateResume}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Resume"}
      </button>

      {generatedResume && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            textAlign: "left",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>Your Generated Resume</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {generatedResume}
          </pre>
          <button
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
            onClick={handleExportToWord}
          >
            Export to Word
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeGeneration;
