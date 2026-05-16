import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm FoodBot 🍔 I can help you find affordable food near you.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // IMPORTANT:
      // Make sure you created:
      // .env
      // VITE_GROQ_API_KEY=your_key_here

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },

          body: JSON.stringify({
            model: "llama-3.1-8b-instant",

            messages: [
              {
                role: "system",
                content: `
You are FoodBot for FoodRoutes.

Only answer questions about:
- food
- groceries
- cheap meals
- grocery stores
- food banks
- affordable eating
- FoodRoutes app

Keep responses:
- short
- friendly
- practical
- use emojis sometimes

If user asks unrelated questions, politely refuse.
                `,
              },

              ...updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ],

            max_tokens: 300,
          }),
        },
      );

      // CHECK FOR BAD RESPONSES
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      console.log(data);

      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Check console.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        .chat-bubble {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: #3F7D20;
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1000;
        }

        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 340px;
          height: 500px;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          z-index: 1000;
        }

        .chat-header {
          background: #3F7D20;
          color: white;
          padding: 16px;
          font-weight: bold;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f5f5f5;
        }

        .msg {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 14px;
          line-height: 1.4;
          font-size: 14px;
        }

        .msg-user {
          align-self: flex-end;
          background: #3F7D20;
          color: white;
        }

        .msg-bot {
          align-self: flex-start;
          background: white;
          border: 1px solid #ddd;
        }

        .chat-input-row {
          display: flex;
          padding: 12px;
          gap: 8px;
          border-top: 1px solid #ddd;
        }

        .chat-input {
          flex: 1;
          padding: 10px;
          border-radius: 999px;
          border: 1px solid #ccc;
          outline: none;
        }

        .chat-send {
          border: none;
          padding: 10px 16px;
          border-radius: 999px;
          background: #3F7D20;
          color: white;
          cursor: pointer;
        }

        .chat-send:disabled {
          background: gray;
          cursor: not-allowed;
        }

        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3F7D20;
          animation: bounce 1s infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      <button className="chat-bubble" onClick={() => setOpen((prev) => !prev)}>
        {open ? "✕" : "🍔"}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">🍔 FoodBot</div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`msg ${m.role === "user" ? "msg-user" : "msg-bot"}`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="msg msg-bot typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask about food..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void sendMessage();
                }
              }}
            />

            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
