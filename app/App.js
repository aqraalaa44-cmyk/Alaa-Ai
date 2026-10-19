import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./src/config";

const MAX_MESSAGE_LENGTH = 20000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = 5600000;
const LANGUAGE_STORAGE_KEY = "alaa_ai_language_v1";

// ترتيب النصوص بكل لغة:
// status, newChat, chooseLanguage, searchLanguage, placeholder,
// send, attach, remove, sources, thinking, welcomeTitle, welcomeBody,
// describeImage, imageTooLarge, unsupportedImage, imagePickFailed,
// networkError, serverError, noLanguages

const LANGUAGES = [
  {
    code: "ar", name: "العربية", rtl: true,
    v: [
      "متصل الآن", "محادثة جديدة", "اختر اللغة", "ابحث عن لغة...",
      "اكتب رسالتك...", "إرسال", "إرفاق صورة", "إزالة الصورة",
      "المصادر", "جاري التفكير...", "أهلًا! أنا Alaa :)",
      "اسألني عن أي شيء، أو أرفق صورة حتى أساعدك في فهمها.",
      "صف هذه الصورة واشرح ما يظهر فيها.",
      "حجم الصورة أكبر من 4 ميغابايت. اختر صورة أصغر.",
      "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.",
      "تعذّر اختيار الصورة. حاول مرة أخرى.",
      "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.",
      "تعذّر الحصول على إجابة. حاول مرة أخرى.",
      "لم يتم العثور على لغة."
    ]
  },
  {
    code: "en", name: "English", rtl: false,
    v: [
      "Online now", "New chat", "Choose language", "Search languages...",
      "Type your message...", "Send", "Attach image", "Remove image",
      "Sources", "Thinking...", "Hi! I'm Alaa :)",
      "Ask me anything, or attach an image and I'll help you understand it.",
      "Describe this image and explain what is shown.",
      "Image is larger than 4 MB. Choose a smaller image.",
      "Unsupported image format. Use JPG, PNG, or WebP.",
      "Could not select the image. Try again.",
      "Could not connect to the server. Check your internet connection.",
      "Could not get a response. Please try again.",
      "No languages found."
    ]
  },
  {
    code: "fr", name: "Français", rtl: false,
    v: [
      "En ligne", "Nouvelle conversation", "Choisir la langue",
      "Rechercher des langues...", "Écrivez votre message...", "Envoyer",
      "Joindre une image", "Supprimer l’image", "Sources",
      "Réflexion en cours...", "Bonjour ! Je suis Alaa :)",
      "Posez-moi une question ou joignez une image pour mieux la comprendre.",
      "Décrivez cette image et expliquez ce qui est visible.",
      "L’image dépasse 4 Mo. Choisissez une image plus petite.",
      "Format non pris en charge. Utilisez JPG, PNG ou WebP.",
      "Impossible de sélectionner l’image. Réessayez.",
      "Connexion au serveur impossible. Vérifiez Internet.",
      "Impossible d’obtenir une réponse. Réessayez.",
      "Aucune langue trouvée."
    ]
  },
  {
    code: "es", name: "Español", rtl: false,
    v: [
      "En línea", "Nuevo chat", "Elegir idioma", "Buscar idiomas...",
      "Escribe tu mensaje...", "Enviar", "Adjuntar imagen", "Quitar imagen",
      "Fuentes", "Pensando...", "¡Hola! Soy Alaa :)",
      "Pregúntame lo que quieras o adjunta una imagen para entenderla.",
      "Describe esta imagen y explica lo que aparece.",
      "La imagen supera los 4 MB. Elige una más pequeña.",
      "Formato no compatible. Usa JPG, PNG o WebP.",
      "No se pudo seleccionar la imagen. Inténtalo de nuevo.",
      "No se pudo conectar al servidor. Comprueba Internet.",
      "No se pudo obtener una respuesta. Inténtalo de nuevo.",
      "No se encontraron idiomas."
    ]
  },
  {
    code: "de", name: "Deutsch", rtl: false,
    v: [
      "Jetzt online", "Neuer Chat", "Sprache wählen", "Sprachen suchen...",
      "Nachricht eingeben...", "Senden", "Bild anhängen", "Bild entfernen",
      "Quellen", "Denke nach...", "Hallo! Ich bin Alaa :)",
      "Stelle eine Frage oder füge ein Bild hinzu, damit ich es erklären kann.",
      "Beschreibe dieses Bild und erkläre, was zu sehen ist.",
      "Das Bild ist größer als 4 MB. Wähle ein kleineres Bild.",
      "Nicht unterstütztes Format. Verwende JPG, PNG oder WebP.",
      "Bild konnte nicht ausgewählt werden. Bitte erneut versuchen.",
      "Verbindung zum Server fehlgeschlagen. Prüfe das Internet.",
      "Keine Antwort erhalten. Bitte erneut versuchen.",
      "Keine Sprachen gefunden."
    ]
  },
  {
    code: "it", name: "Italiano", rtl: false,
    v: [
      "Online ora", "Nuova chat", "Scegli la lingua", "Cerca lingue...",
      "Scrivi il tuo messaggio...", "Invia", "Allega immagine",
      "Rimuovi immagine", "Fonti", "Sto pensando...", "Ciao! Sono Alaa :)",
      "Fammi una domanda o allega un'immagine per comprenderla meglio.",
      "Descrivi questa immagine e spiega cosa mostra.",
      "L'immagine supera 4 MB. Scegline una più piccola.",
      "Formato non supportato. Usa JPG, PNG o WebP.",
      "Impossibile selezionare l'immagine. Riprova.",
      "Impossibile connettersi al server. Controlla Internet.",
      "Impossibile ottenere una risposta. Riprova.",
      "Nessuna lingua trovata."
    ]
  },
  {
    code: "pt", name: "Português", rtl: false,
    v: [
      "Online agora", "Nova conversa", "Escolher idioma",
      "Pesquisar idiomas...", "Escreva sua mensagem...", "Enviar",
      "Anexar imagem", "Remover imagem", "Fontes", "Pensando...",
      "Olá! Sou Alaa :)", "Faça uma pergunta ou anexe uma imagem para entendê-la.",
      "Descreva esta imagem e explique o que aparece.",
      "A imagem excede 4 MB. Escolha uma imagem menor.",
      "Formato não suportado. Use JPG, PNG ou WebP.",
      "Não foi possível selecionar a imagem. Tente novamente.",
      "Não foi possível conectar ao servidor. Verifique a internet.",
      "Não foi possível obter uma resposta. Tente novamente.",
      "Nenhum idioma encontrado."
    ]
  },
  {
    code: "tr", name: "Türkçe", rtl: false,
    v: [
      "Şu anda çevrimiçi", "Yeni sohbet", "Dil seç", "Dil ara...",
      "Mesajını yaz...", "Gönder", "Görsel ekle", "Görseli kaldır",
      "Kaynaklar", "Düşünüyor...", "Merhaba! Ben Alaa :)",
      "Bana bir soru sor veya anlamana yardımcı olmam için bir görsel ekle.",
      "Bu görseli açıkla ve neler gösterdiğini anlat.",
      "Görsel 4 MB'dan büyük. Daha küçük bir görsel seç.",
      "Desteklenmeyen biçim. JPG, PNG veya WebP kullan.",
      "Görsel seçilemedi. Lütfen tekrar dene.",
      "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.",
      "Yanıt alınamadı. Lütfen tekrar dene.",
      "Dil bulunamadı."
    ]
  },
  {
    code: "ru", name: "Русский", rtl: false,
    v: [
      "В сети", "Новый чат", "Выбрать язык", "Поиск языков...",
      "Введите сообщение...", "Отправить", "Прикрепить изображение",
      "Удалить изображение", "Источники", "Думаю...", "Привет! Я Alaa :)",
      "Задайте вопрос или прикрепите изображение, чтобы я помог его понять.",
      "Опишите изображение и расскажите, что на нём показано.",
      "Изображение больше 4 МБ. Выберите изображение меньшего размера.",
      "Формат не поддерживается. Используйте JPG, PNG или WebP.",
      "Не удалось выбрать изображение. Попробуйте снова.",
      "Не удалось подключиться к серверу. Проверьте интернет.",
      "Не удалось получить ответ. Попробуйте снова.",
      "Языки не найдены."
    ]
  },
  {
    code: "zh-CN", name: "简体中文", rtl: false,
    v: [
      "在线", "新对话", "选择语言", "搜索语言...",
      "输入消息...", "发送", "附加图片", "移除图片",
      "来源", "正在思考...", "你好！我是 Alaa :)",
      "你可以提问，也可以附加图片让我帮你理解。",
      "描述这张图片并解释其中的内容。",
      "图片超过 4 MB，请选择较小的图片。",
      "不支持此格式。请使用 JPG、PNG 或 WebP。",
      "无法选择图片，请重试。",
      "无法连接服务器，请检查网络。",
      "无法获取回复，请重试。",
      "未找到语言。"
    ]
  },
  {
    code: "zh-TW", name: "繁體中文", rtl: false,
    v: [
      "目前在線", "新對話", "選擇語言", "搜尋語言...",
      "輸入訊息...", "傳送", "附加圖片", "移除圖片",
      "來源", "思考中...", "你好！我是 Alaa :)",
      "你可以提問，也可以附加圖片讓我幫你理解。",
      "描述這張圖片並解釋其中的內容。",
      "圖片超過 4 MB，請選擇較小的圖片。",
      "不支援此格式。請使用 JPG、PNG 或 WebP。",
      "無法選擇圖片，請再試一次。",
      "無法連線至伺服器，請檢查網路。",
      "無法取得回覆，請再試一次。",
      "找不到語言。"
    ]
  },
  {
    code: "ja", name: "日本語", rtl: false,
    v: [
      "オンライン", "新しいチャット", "言語を選択", "言語を検索...",
      "メッセージを入力...", "送信", "画像を添付", "画像を削除",
      "ソース", "考え中...", "こんにちは！Alaa :) です",
      "質問したり、画像を添付して内容の説明を求めたりできます。",
      "この画像を説明し、何が写っているか教えてください。",
      "画像が4MBを超えています。小さい画像を選んでください。",
      "未対応形式です。JPG、PNG、WebPを使用してください。",
      "画像を選択できませんでした。もう一度お試しください。",
      "サーバーに接続できません。ネットワークを確認してください。",
      "回答を取得できませんでした。もう一度お試しください。",
      "言語が見つかりません。"
    ]
  },
  {
    code: "ko", name: "한국어", rtl: false,
    v: [
      "온라인", "새 채팅", "언어 선택", "언어 검색...",
      "메시지를 입력하세요...", "보내기", "이미지 첨부",
      "이미지 삭제", "출처", "생각 중...", "안녕하세요! Alaa입니다 :)",
      "질문을 하거나 이미지를 첨부하여 내용을 알아볼 수 있습니다.",
      "이 이미지를 설명하고 무엇이 보이는지 알려주세요.",
      "이미지가 4MB보다 큽니다. 더 작은 이미지를 선택하세요.",
      "지원되지 않는 형식입니다. JPG, PNG 또는 WebP를 사용하세요.",
      "이미지를 선택하지 못했습니다. 다시 시도하세요.",
      "서버에 연결할 수 없습니다. 인터넷을 확인하세요.",
      "답변을 가져오지 못했습니다. 다시 시도하세요.",
      "언어를 찾을 수 없습니다."
    ]
  },
  {
    code: "hi", name: "हिन्दी", rtl: false,
    v: [
      "अभी ऑनलाइन", "नई चैट", "भाषा चुनें", "भाषाएँ खोजें...",
      "अपना संदेश लिखें...", "भेजें", "चित्र जोड़ें", "चित्र हटाएँ",
      "स्रोत", "सोच रहा हूँ...", "नमस्ते! मैं Alaa हूँ :)",
      "कोई प्रश्न पूछें या समझने में मदद के लिए चित्र जोड़ें।",
      "इस चित्र का वर्णन करें और बताएं कि इसमें क्या दिख रहा है।",
      "चित्र 4 MB से बड़ा है। छोटा चित्र चुनें।",
      "यह प्रारूप समर्थित नहीं है। JPG, PNG या WebP इस्तेमाल करें।",
      "चित्र नहीं चुना जा सका। फिर से प्रयास करें।",
      "सर्वर से कनेक्ट नहीं हो सका। इंटरनेट जाँचें।",
      "उत्तर नहीं मिल सका। फिर से प्रयास करें।",
      "कोई भाषा नहीं मिली।"
    ]
  },
  {
    code: "ur", name: "اردو", rtl: true,
    v: [
      "ابھی آن لائن", "نئی گفتگو", "زبان منتخب کریں", "زبان تلاش کریں...",
      "اپنا پیغام لکھیں...", "بھیجیں", "تصویر منسلک کریں",
      "تصویر ہٹائیں", "ذرائع", "سوچ رہا ہوں...", "سلام! میں Alaa ہوں :)",
      "سوال پوچھیں یا تصویر منسلک کریں تاکہ میں اسے سمجھنے میں مدد دوں۔",
      "اس تصویر کی وضاحت کریں اور بتائیں کہ اس میں کیا دکھائی دیتا ہے۔",
      "تصویر 4 MB سے بڑی ہے۔ چھوٹی تصویر منتخب کریں۔",
      "یہ فارمیٹ سپورٹ نہیں ہے۔ JPG، PNG یا WebP استعمال کریں۔",
      "تصویر منتخب نہیں ہو سکی۔ دوبارہ کوشش کریں۔",
      "سرور سے رابطہ نہیں ہو سکا۔ انٹرنیٹ چیک کریں۔",
      "جواب حاصل نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
      "کوئی زبان نہیں ملی۔"
    ]
  },
  {
    code: "bn", name: "বাংলা", rtl: false,
    v: [
      "এখন অনলাইন", "নতুন চ্যাট", "ভাষা নির্বাচন করুন", "ভাষা খুঁজুন...",
      "আপনার বার্তা লিখুন...", "পাঠান", "ছবি সংযুক্ত করুন",
      "ছবি সরান", "সূত্র", "ভাবছি...", "হ্যালো! আমি Alaa :)",
      "প্রশ্ন করুন বা বুঝতে সাহায্যের জন্য একটি ছবি সংযুক্ত করুন।",
      "ছবিটি বর্ণনা করুন এবং এতে কী দেখা যাচ্ছে তা ব্যাখ্যা করুন।",
      "ছবিটি 4 MB-এর বেশি। ছোট ছবি বেছে নিন।",
      "এই ফরম্যাট সমর্থিত নয়। JPG, PNG বা WebP ব্যবহার করুন।",
      "ছবি নির্বাচন করা যায়নি। আবার চেষ্টা করুন।",
      "সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট পরীক্ষা করুন।",
      "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।",
      "কোনো ভাষা পাওয়া যায়নি।"
    ]
  },
  {
    code: "id", name: "Bahasa Indonesia", rtl: false,
    v: [
      "Sedang online", "Obrolan baru", "Pilih bahasa", "Cari bahasa...",
      "Ketik pesan Anda...", "Kirim", "Lampirkan gambar",
      "Hapus gambar", "Sumber", "Sedang berpikir...", "Hai! Saya Alaa :)",
      "Ajukan pertanyaan atau lampirkan gambar agar saya membantu memahaminya.",
      "Jelaskan gambar ini dan terangkan apa yang terlihat.",
      "Gambar lebih besar dari 4 MB. Pilih gambar yang lebih kecil.",
      "Format tidak didukung. Gunakan JPG, PNG, atau WebP.",
      "Gambar tidak dapat dipilih. Coba lagi.",
      "Tidak dapat terhubung ke server. Periksa internet.",
      "Jawaban tidak dapat diperoleh. Coba lagi.",
      "Bahasa tidak ditemukan."
    ]
  },
  {
    code: "ms", name: "Bahasa Melayu", rtl: false,
    v: [
      "Dalam talian sekarang", "Sembang baharu", "Pilih bahasa",
      "Cari bahasa...", "Taip mesej anda...", "Hantar",
      "Lampirkan imej", "Buang imej", "Sumber", "Sedang berfikir...",
      "Hai! Saya Alaa :)", "Tanya soalan atau lampirkan imej supaya saya dapat membantu memahaminya.",
      "Huraikan imej ini dan jelaskan perkara yang kelihatan.",
      "Imej melebihi 4 MB. Pilih imej yang lebih kecil.",
      "Format tidak disokong. Gunakan JPG, PNG atau WebP.",
      "Imej tidak dapat dipilih. Cuba lagi.",
      "Tidak dapat menyambung ke pelayan. Semak internet.",
      "Jawapan tidak dapat diperoleh. Cuba lagi.",
      "Tiada bahasa ditemui."
    ]
  },
  {
    code: "th", name: "ไทย", rtl: false,
    v: [
      "ออนไลน์อยู่", "แชตใหม่", "เลือกภาษา", "ค้นหาภาษา...",
      "พิมพ์ข้อความ...", "ส่ง", "แนบรูปภาพ", "ลบรูปภาพ",
      "แหล่งที่มา", "กำลังคิด...", "สวัสดี! ฉันคือ Alaa :)",
      "ถามคำถามหรือแนบรูปภาพเพื่อให้ช่วยอธิบายได้",
      "อธิบายภาพนี้และบอกว่ามีอะไรอยู่ในภาพ",
      "รูปภาพมีขนาดเกิน 4 MB โปรดเลือกรูปที่เล็กกว่า",
      "ไม่รองรับรูปแบบนี้ โปรดใช้ JPG, PNG หรือ WebP",
      "เลือกรูปภาพไม่ได้ โปรดลองอีกครั้ง",
      "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ โปรดตรวจสอบอินเทอร์เน็ต",
      "รับคำตอบไม่ได้ โปรดลองอีกครั้ง",
      "ไม่พบภาษา"
    ]
  },
  {
    code: "vi", name: "Tiếng Việt", rtl: false,
    v: [
      "Đang trực tuyến", "Trò chuyện mới", "Chọn ngôn ngữ",
      "Tìm ngôn ngữ...", "Nhập tin nhắn...", "Gửi", "Đính kèm ảnh",
      "Xóa ảnh", "Nguồn", "Đang suy nghĩ...", "Xin chào! Tôi là Alaa :)",
      "Hãy đặt câu hỏi hoặc đính kèm ảnh để tôi giúp bạn hiểu ảnh.",
      "Mô tả hình ảnh này và giải thích những gì xuất hiện trong ảnh.",
      "Ảnh lớn hơn 4 MB. Hãy chọn ảnh nhỏ hơn.",
      "Định dạng không được hỗ trợ. Dùng JPG, PNG hoặc WebP.",
      "Không thể chọn ảnh. Vui lòng thử lại.",
      "Không thể kết nối máy chủ. Hãy kiểm tra Internet.",
      "Không thể nhận câu trả lời. Vui lòng thử lại.",
      "Không tìm thấy ngôn ngữ."
    ]
  },
  {
    code: "fa", name: "فارسی", rtl: true,
    v: [
      "اکنون آنلاین", "گفتگوی جدید", "انتخاب زبان", "جستجوی زبان...",
      "پیام خود را بنویسید...", "ارسال", "پیوست تصویر", "حذف تصویر",
      "منابع", "در حال فکر کردن...", "سلام! من Alaa هستم :)",
      "سؤال بپرسید یا تصویری پیوست کنید تا در درک آن کمک کنم.",
      "این تصویر را توصیف کنید و بگویید چه چیزی در آن دیده می‌شود.",
      "تصویر بیش از ۴ مگابایت است. تصویر کوچک‌تری انتخاب کنید.",
      "این قالب پشتیبانی نمی‌شود. از JPG، PNG یا WebP استفاده کنید.",
      "انتخاب تصویر ممکن نشد. دوباره تلاش کنید.",
      "اتصال به سرور ممکن نیست. اینترنت را بررسی کنید.",
      "دریافت پاسخ ممکن نشد. دوباره تلاش کنید.",
      "زبانی پیدا نشد."
    ]
  },
  {
    code: "he", name: "עברית", rtl: true,
    v: [
      "מחובר עכשיו", "צ'אט חדש", "בחירת שפה", "חיפוש שפות...",
      "כתבו הודעה...", "שליחה", "צירוף תמונה", "הסרת תמונה",
      "מקורות", "חושב...", "שלום! אני Alaa :)",
      "אפשר לשאול שאלה או לצרף תמונה כדי שאעזור להבין אותה.",
      "תאר את התמונה והסבר מה מופיע בה.",
      "התמונה גדולה מ־4 MB. בחר תמונה קטנה יותר.",
      "הפורמט אינו נתמך. יש להשתמש ב־JPG, PNG או WebP.",
      "לא ניתן לבחור את התמונה. נסו שוב.",
      "לא ניתן להתחבר לשרת. בדקו את האינטרנט.",
      "לא ניתן לקבל תשובה. נסו שוב.",
      "לא נמצאו שפות."
    ]
  },
  {
    code: "nl", name: "Nederlands", rtl: false,
    v: [
      "Nu online", "Nieuwe chat", "Taal kiezen", "Talen zoeken...",
      "Typ je bericht...", "Verzenden", "Afbeelding toevoegen",
      "Afbeelding verwijderen", "Bronnen", "Aan het nadenken...",
      "Hoi! Ik ben Alaa :)", "Stel een vraag of voeg een afbeelding toe zodat ik kan helpen.",
      "Beschrijf deze afbeelding en leg uit wat erop te zien is.",
      "De afbeelding is groter dan 4 MB. Kies een kleinere afbeelding.",
      "Niet-ondersteund formaat. Gebruik JPG, PNG of WebP.",
      "De afbeelding kon niet worden gekozen. Probeer het opnieuw.",
      "Kan geen verbinding maken met de server. Controleer internet.",
      "Er kon geen antwoord worden opgehaald. Probeer opnieuw.",
      "Geen talen gevonden."
    ]
  },
  {
    code: "pl", name: "Polski", rtl: false,
    v: [
      "Teraz online", "Nowy czat", "Wybierz język", "Szukaj języków...",
      "Wpisz wiadomość...", "Wyślij", "Dołącz obraz", "Usuń obraz",
      "Źródła", "Myślę...", "Cześć! Jestem Alaa :)",
      "Zadaj pytanie lub dołącz obraz, abym pomógł Ci go zrozumieć.",
      "Opisz ten obraz i wyjaśnij, co przedstawia.",
      "Obraz przekracza 4 MB. Wybierz mniejszy obraz.",
      "Nieobsługiwany format. Użyj JPG, PNG lub WebP.",
      "Nie można wybrać obrazu. Spróbuj ponownie.",
      "Nie można połączyć się z serwerem. Sprawdź internet.",
      "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.",
      "Nie znaleziono języków."
    ]
  },
  {
    code: "el", name: "Ελληνικά", rtl: false,
    v: [
      "Σε σύνδεση", "Νέα συνομιλία", "Επιλογή γλώσσας",
      "Αναζήτηση γλωσσών...", "Πληκτρολογήστε μήνυμα...", "Αποστολή",
      "Επισύναψη εικόνας", "Αφαίρεση εικόνας", "Πηγές",
      "Σκέφτομαι...", "Γεια! Είμαι το Alaa :)",
      "Κάντε μια ερώτηση ή επισυνάψτε μια εικόνα για να σας βοηθήσω.",
      "Περιγράψτε αυτήν την εικόνα και εξηγήστε τι φαίνεται.",
      "Η εικόνα είναι μεγαλύτερη από 4 MB. Επιλέξτε μικρότερη.",
      "Μη υποστηριζόμενη μορφή. Χρησιμοποιήστε JPG, PNG ή WebP.",
      "Δεν ήταν δυνατή η επιλογή εικόνας. Δοκιμάστε ξανά.",
      "Δεν είναι δυνατή η σύνδεση με τον διακομιστή. Ελέγξτε το διαδίκτυο.",
      "Δεν ήταν δυνατή η λήψη απάντησης. Δοκιμάστε ξανά.",
      "Δεν βρέθηκαν γλώσσες."
    ]
  },
  {
    code: "ro", name: "Română", rtl: false,
    v: [
      "Online acum", "Chat nou", "Alege limba", "Caută limbi...",
      "Scrie mesajul...", "Trimite", "Atașează imagine",
      "Elimină imaginea", "Surse", "Mă gândesc...",
      "Salut! Sunt Alaa :)", "Pune o întrebare sau atașează o imagine ca să te ajut să o înțelegi.",
      "Descrie această imagine și explică ce se vede.",
      "Imaginea depășește 4 MB. Alege o imagine mai mică.",
      "Format neacceptat. Folosește JPG, PNG sau WebP.",
      "Imaginea nu a putut fi selectată. Încearcă din nou.",
      "Conectarea la server a eșuat. Verifică internetul.",
      "Nu s-a putut obține un răspuns. Încearcă din nou.",
      "Nu s-au găsit limbi."
    ]
  },
];

function getTranslation(code) {
  const language = LANGUAGES.find((item) => item.code === code);
  return language?.v || LANGUAGES[1].v;
}

function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {}
  return null;
}

export default function App() {
  const [languageCode, setLanguageCode] = useState("ar");
  const [languageModal, setLanguageModal] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const language =
    LANGUAGES.find((item) => item.code === languageCode) || LANGUAGES[0];

  const t = getTranslation(languageCode);
  const isRTL = language.rtl;
  const direction = isRTL ? "row-reverse" : "row";
  const alignment = isRTL ? "right" : "left";

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (LANGUAGES.some((item) => item.code === stored)) {
          setLanguageCode(stored);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  const filteredLanguages = useMemo(() => {
    const query = languageQuery.trim().toLocaleLowerCase();

    if (!query) return LANGUAGES;

    return LANGUAGES.filter((item) =>
      `${item.name} ${item.code}`.toLocaleLowerCase().includes(query)
    );
  }, [languageQuery]);

  async function changeLanguage(code) {
    setLanguageCode(code);
    setLanguageModal(false);
    setLanguageQuery("");
    setError("");

    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // The selected language remains active for this session.
    }
  }

  async function pickImage() {
    setError("");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        base64: true,
        quality: 0.75,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri || !asset?.base64) {
        setError(t[15]);
        return;
      }

      let mimeType = asset.mimeType;

      if (!mimeType) {
        mimeType = /\.png$/i.test(asset.fileName || "")
          ? "image/png"
          : /\.webp$/i.test(asset.fileName || "")
          ? "image/webp"
          : "image/jpeg";
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
        setError(t[14]);
        return;
      }

      if (
        (typeof asset.fileSize === "number" &&
          asset.fileSize > MAX_IMAGE_BYTES) ||
        asset.base64.length > MAX_IMAGE_BASE64_LENGTH
      ) {
        setError(t[13]);
        return;
      }

      setPendingImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType,
      });
    } catch {
      setError(t[15]);
    }
  }

  async function openSource(rawUrl) {
    const url = safeSourceUrl(rawUrl);
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch {
      setError(t[17]);
    }
  }

  async function sendMessage() {
    const text = input.trim();

    if ((!text && !pendingImage) || loading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text || t[12],
      imageUri: pendingImage?.uri || null,
      imageBase64: pendingImage?.base64 || null,
      mimeType: pendingImage?.mimeType || null,
      sources: [],
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setPendingImage(null);
    setError("");
    setLoading(true);

    try {
      // إرسال آخر 12 رسالة، مع صورة واحدة فقط لتقليل حجم الطلب.
      const history = updatedMessages.slice(-12);

      let lastImageIndex = -1;

      history.forEach((message, index) => {
        if (message.imageBase64) lastImageIndex = index;
      });

      const apiMessages = history.map((message, index) => ({
        role: message.role,
        content: message.content || "",
        ...(message.imageBase64 && index === lastImageIndex
          ? {
              imageBase64: message.imageBase64,
              mimeType: message.mimeType,
            }
          : {}),
      }));

      const baseUrl = API_BASE_URL.replace(/\/+$/, "");

      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          language: languageCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || t[17]);
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content:
            typeof data.reply === "string" ? data.reply : t[17],
          sources: Array.isArray(data.sources) ? data.sources : [],
          searched: Boolean(data.searched),
          searchNotice: data.searchNotice || "",
        },
      ]);
    } catch (err) {
      setError(err?.message || t[16]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setPendingImage(null);
    setError("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={[styles.header, { flexDirection: direction }]}>
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Text style={styles.logo}>✦ Alaa :)</Text>
            <Text style={styles.status}>{t[0]}</Text>
          </View>

          <View style={[styles.headerActions, { flexDirection: direction }]}>
            <Pressable
              style={styles.headerButton}
              onPress={() => setLanguageModal(true)}
              accessibilityRole="button"
              accessibilityLabel={t[2]}
            >
              <Text style={styles.headerButtonText}>
                🌐 {language.code.toUpperCase()}
              </Text>
            </Pressable>

            <Pressable
              style={styles.headerButton}
              onPress={newChat}
              accessibilityRole="button"
            >
              <Text style={styles.headerButtonText}>＋ {t[1]}</Text>
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeSymbol}>✦</Text>
                <Text
                  style={[
                    styles.welcomeTitle,
                    { textAlign: alignment },
                  ]}
                >
                  {t[10]}
                </Text>
                <Text
                  style={[
                    styles.welcomeBody,
                    { textAlign: alignment },
                  ]}
                >
                  {t[11]}
                </Text>
              </View>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    {
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    {message.imageUri ? (
                      <Image
                        source={{ uri: message.imageUri }}
                        style={styles.chatImage}
                        resizeMode="cover"
                      />
                    ) : null}

                    {message.content ? (
                      <Text
                        selectable
                        style={[
                          styles.messageText,
                          {
                            textAlign: alignment,
                            writingDirection: isRTL ? "rtl" : "ltr",
                          },
                        ]}
                      >
                        {message.content}
                      </Text>
                    ) : null}

                    {!isUser && message.sources?.length > 0 ? (
                      <View style={styles.sourcesBlock}>
                        <Text style={styles.sourcesTitle}>{t[8]}</Text>

                        {message.sources.map((source, index) => {
                          const url = safeSourceUrl(source?.url);
                          if (!url) return null;

                          return (
                            <Pressable
                              key={`${url}-${index}`}
                              onPress={() => openSource(url)}
                              style={styles.sourceLink}
                              accessibilityRole="link"
                            >
                              <Text style={styles.sourceText}>
                                {source.title || url} ↗
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#B9A0FF" />
                <Text style={styles.loadingText}>{t[9]}</Text>
              </View>
            )}
          </ScrollView>

          {!!error && (
            <Pressable
              style={styles.errorBanner}
              onPress={() => setError("")}
            >
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.dismissText}>×</Text>
            </Pressable>
          )}

          {!!pendingImage && (
            <View
              style={[
                styles.pendingImageBar,
                { flexDirection: direction },
              ]}
            >
              <Image
                source={{ uri: pendingImage.uri }}
                style={styles.pendingImage}
                resizeMode="cover"
              />

              <Text style={styles.pendingLabel}>{t[6]}</Text>

              <Pressable
                onPress={() => setPendingImage(null)}
                accessibilityRole="button"
                accessibilityLabel={t[7]}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.composerOuter}>
            <View
              style={[
                styles.composer,
                { flexDirection: direction },
              ]}
            >
              <Pressable
                style={styles.attachButton}
                onPress={pickImage}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t[6]}
              >
                <Text style={styles.attachIcon}>＋</Text>
              </Pressable>

              <TextInput
                style={[
                  styles.input,
                  {
                    textAlign: alignment,
                    writingDirection: isRTL ? "rtl" : "ltr",
                  },
                ]}
                value={input}
                onChangeText={setInput}
                placeholder={t[4]}
                placeholderTextColor="#9097B2"
                multiline
                maxLength={MAX_MESSAGE_LENGTH}
                editable={!loading}
                accessibilityLabel={t[4]}
              />

              <Pressable
                style={[
                  styles.sendButton,
                  loading && styles.disabledButton,
                ]}
                onPress={sendMessage}
                disabled={loading || (!input.trim() && !pendingImage)}
                accessibilityRole="button"
                accessibilityLabel={t[5]}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={languageModal}
        animationType="fade"
        transparent
        onRequestClose={() => setLanguageModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.languageModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t[2]}</Text>

              <Pressable
                onPress={() => setLanguageModal(false)}
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>

            <TextInput
              value={languageQuery}
              onChangeText={setLanguageQuery}
              placeholder={t[3]}
              placeholderTextColor="#9097B2"
              style={[
                styles.languageSearch,
                { textAlign: alignment },
              ]}
              autoCorrect={false}
            />

            <ScrollView
              style={styles.languageList}
              keyboardShouldPersistTaps="handled"
            >
              {filteredLanguages.map((item) => (
                <Pressable
                  key={item.code}
                  onPress={() => changeLanguage(item.code)}
                  style={[
                    styles.languageItem,
                    item.code === languageCode &&
                      styles.languageItemSelected,
                    {
                      flexDirection: item.rtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Text style={styles.languageName}>{item.name}</Text>
                  <Text style={styles.languageCheck}>
                    {item.code === languageCode ? "✓" : ""}
                  </Text>
                </Pressable>
              ))}

              {filteredLanguages.length === 0 && (
                <Text style={styles.noLanguages}>{t[18]}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  screen: {
    flex: 1,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    backgroundColor: "#090D1B",
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#252B45",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  logo: {
    color: "#C4B2FF",
    fontWeight: "800",
    fontSize: 24,
  },
  status: {
    color: "#A9F0D0",
    fontSize: 12,
    marginTop: 4,
  },
  headerActions: {
    alignItems: "center",
    gap: 7,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#303654",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: "#151A30",
  },
  headerButtonText: {
    color: "#E8E9F6",
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 25,
    flexGrow: 1,
  },
  welcomeCard: {
    width: "100%",
    maxWidth: 550,
    alignSelf: "center",
    marginTop: 45,
    padding: 24,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#2B3150",
    backgroundColor: "#141A30",
  },
  welcomeSymbol: {
    color: "#B9A0FF",
    fontSize: 33,
    marginBottom: 12,
  },
  welcomeTitle: {
    color: "#F3F1FF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  welcomeBody: {
    color: "#BFC5DC",
    fontSize: 15,
    lineHeight: 24,
  },
  messageRow: {
    width: "100%",
    marginBottom: 14,
  },
  bubble: {
    maxWidth: "88%",
    padding: 13,
    borderRadius: 19,
    gap: 9,
  },
  userBubble: {
    backgroundColor: "#6655E8",
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: "#202641",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },
  chatImage: {
    width: 230,
    height: 230,
    borderRadius: 12,
    backgroundColor: "#101629",
  },
  sourcesBlock: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#454D6A",
    gap: 7,
  },
  sourcesTitle: {
    color: "#D9CEFF",
    fontSize: 14,
    fontWeight: "700",
  },
  sourceLink: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  sourceText: {
    color: "#AFC8FF",
    textDecorationLine: "underline",
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  loadingText: {
    color: "#B9A0FF",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3A1E32",
    padding: 11,
    marginHorizontal: 12,
    marginBottom: 7,
    borderRadius: 12,
  },
  errorText: {
    color: "#FFD4DD",
    flex: 1,
  },
  dismissText: {
    color: "#FFD4DD",
    fontSize: 20,
    paddingHorizontal: 8,
  },
  pendingImageBar: {
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  pendingImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  pendingLabel: {
    color: "#FFFFFF",
    flex: 1,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#32243B",
  },
  removeButtonText: {
    color: "#FFD4DD",
    fontSize: 23,
  },
  composerOuter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#242943",
    backgroundColor: "#090D1B",
  },
  composer: {
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202641",
  },
  attachIcon: {
    color: "#FFFFFF",
    fontSize: 25,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    backgroundColor: "#202641",
    borderWidth: 1,
    borderColor: "#333B5A",
    borderRadius: 18,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8065FF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 18,
  },
  languageModal: {
    maxHeight: "85%",
    backgroundColor: "#131A2E",
    borderRadius: 22,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    color: "#FFFFFF",
    fontSize: 26,
    paddingHorizontal: 6,
  },
  languageSearch: {
    backgroundColor: "#202641",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
  },
  languageList: {
    flexGrow: 0,
  },
  languageItem: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#29314B",
  },
  languageItemSelected: {
    backgroundColor: "#252344",
    borderRadius: 9,
  },
  languageName: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  languageCheck: {
    color: "#B9A0FF",
    fontWeight: "800",
    fontSize: 18,
  },
  noLanguages: {
    color: "#9CA3AF",
    textAlign: "center",
    padding: 20,
  },
});
