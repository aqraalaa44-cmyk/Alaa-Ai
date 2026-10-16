import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "200kb" }));

function getDemoReply(message) {
  const text = message.toLowerCase().trim();

  if (/^(مرحبا|مرحباً|أهلا|أهلًا|السلام عليكم|هلا)/.test(text)) {
    return "أهلًا! أنا علاء، مساعدك التجريبي. كيف أقدر أساعدك؟";
  }

  if (text.includes("اسمك") || text.includes("مين انت")) {
    return "أنا علاء (Alaa)، المساعد التجريبي في موقع Alaa AI.";
  }

  if (text.includes("html")) {
    return "HTML لغة تُستخدم لبناء هيكل صفحات الويب، مثل العناوين والفقرات والصور والروابط.";
  }

  if (text.includes("javascript") || text.includes("جافاسكربت")) {
    return "JavaScript لغة برمجة تُستخدم لإضافة التفاعل إلى المواقع.";
  }

  if (text.includes("unity") || text.includes("يونيتي")) {
    return "Unity محرك لتطوير الألعاب ثنائية وثلاثية الأبعاد.";
  }

  return "وصلني سؤالك! أنا حاليًا أعمل بالوضع التجريبي بدون نموذج ذكاء اصطناعي متصل.";
}

app.get("/", (_req, res) => {
  res.json({
    name: "Alaa AI Server",
    status: "online",
    mode: "demo"
  });
});

app.post("/chat", (req, res) => {
  const messages = Array.isArray(req.body?.messages)
    ? req.body.messages
    : [];

  const lastMessage = messages
    .filter(
      (m) =>
        m &&
        m.role === "user" &&
        typeof m.content === "string"
    )
    .slice(-1)[0];

  if (!lastMessage || !lastMessage.content.trim()) {
    return res.status(400).json({
      error: "الرجاء كتابة رسالة أولاً."
    });
  }

  return res.json({
    reply: getDemoReply(lastMessage.content.slice(0, 6000))
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Alaa AI Server running on port ${port}`);
  console.log("Mode: Demo (no external API)");
});