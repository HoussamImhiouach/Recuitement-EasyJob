import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Chatbox({ toggleChat }) {
  const [messages, setMessages] = useState([
    {
      text: "Hello! How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getChatbotResponse([...messages, userMessage]);
      const botMessage = { text: response, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "Sorry, something went wrong. Please try again later.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getChatbotResponse = async (conversationHistory) => {
    const apiKey =
      "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"; //

    // Convert messages into the format required by OpenAI API
    const formattedMessages = conversationHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    // Include the system prompt
    formattedMessages.unshift({
      role: "system",
      content:
        "You are a helpful assistant specializing in work-related questions for candidates and recruiters. Only respond to professional queries. Make your answers short and to the point. When asked WHO someone is, do not respond and give a reminder that you're accepting professional queries only.",
    });

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: formattedMessages,
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("API Error:", error);
      return "Sorry, I couldn't process your request at the moment.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="chatbox"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        width: "350px",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
        borderRadius: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        zIndex: 1000,
      }}
    >
      <div
        className="chatbox-header"
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Chat</span>
        <button
          onClick={toggleChat}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div
        className="chatbox-content"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                color: msg.sender === "user" ? "#fff" : "#000",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {isTyping && (
          <div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div
        className="chatbox-input-area"
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ccc",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbox;
