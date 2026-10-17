
import express from "express";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import path from "node:path";
import { createRequire } from "node:module";

// إصلاح استيراد pdf-parse مع Node.js وES Modules
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const port = process.env.PORT || 3000;

// Ollama يعمل على نفس الجهاز الذي يشغّل هذا السيرفر
const OLLAMA_URL = "http://127.0.0.1:11434";
const OLLAMA_MODEL = "gemma3:1b";

app.use(cors());
app.use(express.json({ limit: "300kb" }));

const SYSTEM_INSTRUCTION = `
أنت علاء (Alaa AI)، مساعد ذكاء اصطناعي ودود ومفيد.
تحدث بالعربية إذا تحدث المستخدم بالعربية.
استخدم أسلوبًا واضحًا وبسيطًا.
ساعد المستخدم في البرمجة والتعلم وكتابة النصوص وحل المشكلات.
حاول تقديم إجابات دقيقة ومفيدة.
إذا لم تعرف الإجابة، وضّح أنك غير متأكد.
إذا أرفق المستخدم ملفًا وسأل عنه، اعتمد على محتواه.
`;

// استقبال ملف في الذاكرة دون حفظه على القرص
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".txt", ".pdf", ".docx"];

    if (!allowed.includes(ext)) {
      return cb(
        new Error("الملفات المدعومة هي TXT وPDF وDOCX فقط.")
      );
    }

    cb(null, true);
  },
});

// اختبار حالة السيرفر
app.get("/", (_req, res) => {
  res.json({
    name: "Alaa AI Server",
    status: "online",
    mode: "ollama-local",
    model: OLLAMA_MODEL,
    fileUpload: true,
  });
});

// استقبال الملف واستخراج النص
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "الرجاء اختيار ملف أولًا.",
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = "";

    if (ext === ".txt") {
      text = req.file.buffer.toString("utf8");
    } else if (ext === ".pdf") {
      const result = await pdfParse(req.file.buffer);
      text = result.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      text = result.value;
    }

    text = text.trim();

    if (!text) {
      return res.status(400).json({
        error:
          "لم أجد نصًا قابلًا للقراءة داخل الملف. ربما يحتوي على صور فقط.",
      });
    }

    const maxChars = 20000;
    const truncated = text.length > maxChars;

    return res.json({
      name: req.file.originalname,
      text: text.slice(0, maxChars),
      truncated,
    });
  } catch (error) {
    console.error("File processing error:", error.message);

    return res.status(400).json({
      error: "تعذرت قراءة الملف. جرّب ملفًا آخر.",
    });
  }
});

// المحادثة مع الذكاء الاصطناعي
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
        content: m.content.slice(0, 24000),
      }));

    if (
      messages.length === 0 ||
      !messages.some((m) => m.role === "user")
    ) {
      return res.status(400).json({
        error: "الرجاء كتابة رسالة أولًا.",
      });
    }

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTION,
          },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const details = await response.text();

      console.error("Ollama response error:", {
        status: response.status,
        details,
      });

      return res.status(502).json({
        error:
          "تعذر الحصول على إجابة من Ollama. تأكد من تشغيل النموذج.",
      });
    }

    const data = await response.json();
    const reply = data.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "لم يُرجع النموذج إجابة. حاول مرة أخرى.",
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error.message);

    return res.status(502).json({
      error:
        "تعذر الاتصال بـ Ollama. تأكد من تشغيله على الجهاز المستضيف للسيرفر.",
    });
  }
});

// معالجة أخطاء الملفات والطلبات
app.use((err, _req, res, _next) => {
  console.error("Request error:", err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "حجم الملف أكبر من الحد المسموح: 5 ميغابايت.",
      });
    }

    return res.status(400).json({
      error: "تعذر رفع الملف.",
    });
  }

  if (
    err.message === "الملفات المدعومة هي TXT وPDF وDOCX فقط."
  ) {
    return res.status(400).json({
      error: err.message,
    });
  }

  return res.status(400).json({
    error: "حدث خطأ أثناء استقبال الملف أو الطلب.",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Alaa AI Server running on port ${port}`);
  console.log("Mode: Ollama local AI");
  console.log(`Model: ${OLLAMA_MODEL}`);
  console.log("File upload endpoint: /upload");
});
