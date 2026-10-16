
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const ollamaUrl = "http://127.0.0.1:11434";
const model = "gemma3:1b";

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const SYSTEM_INSTRUCTION = `
أنت Alaa AI، مساعد ذكي وودود.
تحدث بالعربية عندما يكتب المستخدم بالعربية.
استخدم أسلوبًا واضحًا وبسيطًا.
أجب عن الأسئلة بدقة، وساعد في البرمجة والتعلم
وكتابة النصوص وحل المشكلات.
`;

app.get("/", (_req, res) => {
  res.json({
    name: "Alaa AI Server",
    status: "online",
    mode: "ollama",
    model
  });
});

app.post("/chat", async (req, res) => {
  const incoming = Array.isArray(req.body?.messages)
    ? req.body.messages
    : [];

  const messages = incoming
    .filter(
      (m) =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
    )
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 6000)
    }));

  if (
    !messages.length ||
    !messages.some((m) => m.role === "user")
  ) {
    return res.status(400).json({
      error: "الرجاء كتابة رسالة أولاً."
    });
  }

  try {
    const response = await fetch(
      `${ollamaUrl}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            ...messages
          ],
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 1000
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Ollama error:", response.status, data);

      return res.status(502).json({
        error: "تعذر الحصول على إجابة من نموذج الذكاء الاصطناعي."
      });
    }

    const reply = data.message?.content?.trim();

    return res.json({
      reply:
        reply || "ما قدرت أجهّز ردًا. جرّب مرة ثانية."
    });
  } catch (error) {
    console.error("Ollama connection failed:", error.message);

    return res.status(502).json({
      error:
        "تعذر الاتصال بـ Ollama. تأكد أنه يعمل على جهازك."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log("========================================");
  console.log("  Alaa AI Server running on port " + port);
  console.log("  Mode: Ollama local AI");
  console.log("  Model: " + model);
  console.log("========================================");
});
