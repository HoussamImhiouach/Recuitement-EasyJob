import React, { useState } from "react";
import axios from "axios";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import mammoth from "mammoth";

function CoverLetterGenerator() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeContent, setResumeContent] = useState("");
  const [letterPurpose, setLetterPurpose] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file upload and parse its content
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension === "pdf") {
        parsePDF(file);
      } else if (fileExtension === "docx") {
        parseWord(file);
      } else {
        alert("Please upload a PDF or DOCX file.");
      }
    }
  };

  // Parse PDF file to extract text content
  const parsePDF = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }
      setResumeContent(extractedText);
    };
  };

  // Parse Word (DOCX) file to extract text content
  const parseWord = (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const result = await mammoth.extractRawText({
        arrayBuffer: reader.result,
      });
      setResumeContent(result.value);
    };
  };

  // Generate cover letter using OpenAI API
  const handleGenerateLetter = async () => {
    if (!resumeContent.trim() || !letterPurpose.trim()) {
      alert("Please upload a resume and specify the purpose of the letter.");
      return;
    }

    setLoading(true);

    const apiKey =
      "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"; //
    const prompt = `
      Generate a professional cover letter based on the following resume content and purpose.
      Purpose: ${letterPurpose}
      Resume Content: ${resumeContent}
    `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a professional assistant for creating cover letters.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const letter = response.data.choices[0].message.content.trim();
      setGeneratedLetter(letter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export the generated cover letter to a Word document
  const handleExportToWord = () => {
    if (!generatedLetter) {
      alert("No cover letter to export. Please generate one first.");
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: generatedLetter.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    break: 1,
                  }),
                ],
              })
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Cover_Letter.docx");
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Cover Letter Generator</h1>

      <input type="file" onChange={handleFileUpload} />
      <br />
      <textarea
        placeholder="Enter the purpose of the cover letter (e.g., job title, company name, position details, etc.)"
        value={letterPurpose}
        onChange={(e) => setLetterPurpose(e.target.value)}
        style={{
          margin: "10px 0",
          width: "80%",
          height: "100px",
          padding: "10px",
        }}
      />
      <br />
      <button
        onClick={handleGenerateLetter}
        disabled={loading}
        style={{ padding: "10px 20px", margin: "20px" }}
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {generatedLetter && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            textAlign: "left",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>Your Generated Cover Letter</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {generatedLetter}
          </pre>
          <button
            onClick={handleExportToWord}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Export to Word
          </button>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGenerator;
