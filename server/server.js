
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// عنوان Ollama المحلي على جهازك
const OLLAMA_URL = "http://127.0.0.1:11434";
const OLLAMA_MODEL = "gemma3:1b";

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const SYSTEM_INSTRUCTION = `
أنت علاء (Alaa AI)، مساعد ذكاء اصطناعي ودود ومفيد.
تحدث بالعربية إذا تحدث المستخدم بالعربية.
استخدم أسلوبًا واضحًا وبسيطًا.
ساعد المستخدم في البرمجة والتعلم وكتابة النصوص وحل المشكلات.
حاول تقديم إجابات دقيقة ومفيدة.
إذا لم تعرف الإجابة، وضّح أنك غير متأكد.
`;

app.get("/", (_req, res) => {
  res.json({
    name: "Alaa AI Server",
    status: "online",
    mode: "ollama-local",
    model: OLLAMA_MODEL
  });
});

app.post("/chat", async (req, res) => {
  try {
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
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 4000)
      }));

    if (
      messages.length === 0 ||
      !messages.some((m) => m.role === "user")
    ) {
      return res.status(400).json({
        error: "الرجاء كتابة رسالة أولاً."
      });
    }

    // إرسال السؤال إلى نموذج Ollama
    const response = await fetch(
      `${OLLAMA_URL}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            ...messages
          ],
          stream: false
        })
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error("Ollama response error:", {
        status: response.status,
        details
      });

      return res.status(502).json({
        error: "تعذر الحصول على إجابة من Ollama. تأكد من تشغيل النموذج."
      });
    }

    const data = await response.json();
    const reply = data.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "لم يُرجع النموذج إجابة. حاول مرة أخرى."
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error.message);

    return res.status(502).json({
      error:
        "تعذر الاتصال بالذكاء الاصطناعي المحلي. تأكد من تشغيل Ollama على جهازك."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Alaa AI Server running on port ${port}`);
  console.log("Mode: Ollama local AI");
  console.log(`Model: ${OLLAMA_MODEL}`);
});
