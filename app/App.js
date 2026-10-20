import React from "react";
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
  useWindowDimensions,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./src/config";

const LANGUAGE_STORAGE_KEY = "alaa_ai_language_v1";
const CHATS_STORAGE_KEY = "alaa_ai_chat_history_v1";
const ACTIVE_CHAT_STORAGE_KEY = "alaa_ai_active_chat_v1";

const MAX_MESSAGE_LENGTH = 20000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = 5600000;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_EXTRACTED_TEXT = 12000;
const MAX_STORED_CHATS = 30;
const MAX_STORED_MESSAGES = 20;

const LANGUAGES = [
  { code: "ar", name: "العربية", rtl: true },
  { code: "en", name: "English", rtl: false },
  { code: "fr", name: "Français", rtl: false },
  { code: "es", name: "Español", rtl: false },
  { code: "de", name: "Deutsch", rtl: false },
  { code: "it", name: "Italiano", rtl: false },
  { code: "pt", name: "Português", rtl: false },
  { code: "tr", name: "Türkçe", rtl: false },
  { code: "ru", name: "Русский", rtl: false },
  { code: "zh-CN", name: "简体中文", rtl: false },
  { code: "zh-TW", name: "繁體中文", rtl: false },
  { code: "ja", name: "日本語", rtl: false },
  { code: "ko", name: "한국어", rtl: false },
  { code: "hi", name: "हिन्दी", rtl: false },
  { code: "ur", name: "اردو", rtl: true },
  { code: "bn", name: "বাংলা", rtl: false },
  { code: "id", name: "Bahasa Indonesia", rtl: false },
  { code: "ms", name: "Bahasa Melayu", rtl: false },
  { code: "th", name: "ไทย", rtl: false },
  { code: "vi", name: "Tiếng Việt", rtl: false },
  { code: "fa", name: "فارسی", rtl: true },
  { code: "he", name: "עברית", rtl: true },
  { code: "nl", name: "Nederlands", rtl: false },
  { code: "pl", name: "Polski", rtl: false },
  { code: "el", name: "Ελληνικά", rtl: false },
  { code: "ro", name: "Română", rtl: false },
];

const TRANSLATIONS = {
  "ar": {
    "status": "متصل الآن",
    "newChat": "محادثة جديدة",
    "chooseLanguage": "اختر اللغة",
    "searchLanguage": "ابحث عن لغة...",
    "placeholder": "اكتب رسالتك...",
    "send": "إرسال",
    "attach": "إرفاق",
    "remove": "إزالة",
    "sources": "المصادر",
    "thinking": "جاري التفكير...",
    "welcomeTitle": "أهلًا! أنا Alaa AI",
    "welcomeBody": "اسألني عن أي شيء، أو أرفق صورة أو ملفًا لمساعدتك في فهمه.",
    "describeImage": "صف هذه الصورة واشرح ما يظهر فيها.",
    "history": "سجل المحادثات",
    "emptyHistory": "ما في محادثات محفوظة لسه.",
    "deleteChat": "حذف المحادثة",
    "openHistory": "عرض سجل المحادثات",
    "choosePhoto": "اختيار صورة",
    "chooseFile": "إرفاق ملف Word أو PDF أو TXT",
    "attachedFile": "ملف مرفق",
    "uploading": "جاري تجهيز الملف...",
    "imageTooLarge": "حجم الصورة أكبر من 4 ميغابايت.",
    "fileTooLarge": "حجم الملف أكبر من 4 ميغابايت.",
    "unsupportedImage": "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.",
    "fileUnsupported": "الملف غير مدعوم. استخدم DOCX أو PDF أو TXT.",
    "fileUploadError": "تعذّر قراءة الملف. تأكد أن الخادم يدعم /upload.",
    "imagePickFailed": "تعذّر اختيار الصورة. حاول مرة أخرى.",
    "networkError": "تعذّر الاتصال بالخادم. تحقق من الإنترنت.",
    "serverError": "تعذّر الحصول على إجابة. حاول مرة أخرى.",
    "quotaError": "وصلت إلى حد الاستخدام المتاح للذكاء الاصطناعي.",
    "noLanguages": "لم يتم العثور على لغة.",
    "notVerified": "لم يتم التحقق من هذه الإجابة عبر البحث المباشر.",
    "openLink": "فتح المصدر",
    "historySaved": "محفوظ محليًا على هذا الجهاز",
    "untitled": "محادثة جديدة",
    "document": "مستند",
    "close": "إغلاق",
    "avatarLabel": "الصورة الرمزية لـ Alaa AI",
    "fileNote": "DOCX · PDF · TXT · الحد الأقصى 4 ميغابايت"
  },
  "en": {
    "status": "Online now",
    "newChat": "New chat",
    "chooseLanguage": "Choose language",
    "searchLanguage": "Search languages...",
    "placeholder": "Type your message...",
    "send": "Send",
    "attach": "Attach",
    "remove": "Remove",
    "sources": "Sources",
    "thinking": "Thinking...",
    "welcomeTitle": "Hi! I’m Alaa AI",
    "welcomeBody": "Ask me anything, or attach an image or document for help understanding it.",
    "describeImage": "Describe this image and explain what is shown.",
    "history": "Chat history",
    "emptyHistory": "No saved conversations yet.",
    "deleteChat": "Delete conversation",
    "openHistory": "Show chat history",
    "choosePhoto": "Choose a photo",
    "chooseFile": "Attach a Word, PDF, or TXT file",
    "attachedFile": "Attached file",
    "uploading": "Preparing file...",
    "imageTooLarge": "The image is larger than 4 MB.",
    "fileTooLarge": "The file is larger than 4 MB.",
    "unsupportedImage": "Unsupported image format. Use JPG, PNG, or WebP.",
    "fileUnsupported": "Unsupported file. Use DOCX, PDF, or TXT.",
    "fileUploadError": "Could not read the file. Check that the server supports /upload.",
    "imagePickFailed": "Could not select the image. Please try again.",
    "networkError": "Could not connect to the server. Check your internet connection.",
    "serverError": "Could not get a response. Please try again.",
    "quotaError": "The AI usage limit has been reached.",
    "noLanguages": "No languages found.",
    "notVerified": "This answer was not verified with live web search.",
    "openLink": "Open source",
    "historySaved": "Saved locally on this device",
    "untitled": "New conversation",
    "document": "Document",
    "close": "Close",
    "avatarLabel": "Alaa AI avatar",
    "fileNote": "DOCX · PDF · TXT · Max 4 MB"
  },
  "fr": {
    "status": "En ligne",
    "newChat": "Nouvelle discussion",
    "chooseLanguage": "Choisir la langue",
    "searchLanguage": "Rechercher une langue...",
    "placeholder": "Écrivez votre message...",
    "send": "Envoyer",
    "attach": "Joindre",
    "remove": "Retirer",
    "sources": "Sources",
    "thinking": "Réflexion en cours...",
    "welcomeTitle": "Bonjour ! Je suis Alaa AI",
    "welcomeBody": "Posez-moi une question ou joignez une image ou un document pour obtenir de l’aide.",
    "describeImage": "Décrivez cette image et expliquez ce qu’elle montre.",
    "history": "Historique des discussions",
    "emptyHistory": "Aucune discussion enregistrée pour le moment.",
    "deleteChat": "Supprimer la discussion",
    "openHistory": "Afficher l’historique des discussions",
    "choosePhoto": "Choisir une photo",
    "chooseFile": "Joindre un fichier Word, PDF ou TXT",
    "attachedFile": "Fichier joint",
    "uploading": "Préparation du fichier...",
    "imageTooLarge": "L’image dépasse 4 Mo.",
    "fileTooLarge": "Le fichier dépasse 4 Mo.",
    "unsupportedImage": "Format d’image non pris en charge. Utilisez JPG, PNG ou WebP.",
    "fileUnsupported": "Fichier non pris en charge. Utilisez DOCX, PDF ou TXT.",
    "fileUploadError": "Impossible de lire le fichier. Vérifiez que le serveur prend en charge /upload.",
    "imagePickFailed": "Impossible de sélectionner l’image. Réessayez.",
    "networkError": "Impossible de se connecter au serveur. Vérifiez votre connexion Internet.",
    "serverError": "Impossible d’obtenir une réponse. Réessayez.",
    "quotaError": "La limite d’utilisation de l’IA a été atteinte.",
    "noLanguages": "Aucune langue trouvée.",
    "notVerified": "Cette réponse n’a pas été vérifiée par une recherche Web en direct.",
    "openLink": "Ouvrir la source",
    "historySaved": "Enregistré localement sur cet appareil",
    "untitled": "Nouvelle conversation",
    "document": "Document",
    "close": "Fermer",
    "avatarLabel": "Avatar Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Maximum 4 Mo"
  },
  "es": {
    "status": "En línea ahora",
    "newChat": "Nuevo chat",
    "chooseLanguage": "Elegir idioma",
    "searchLanguage": "Buscar idiomas...",
    "placeholder": "Escribe tu mensaje...",
    "send": "Enviar",
    "attach": "Adjuntar",
    "remove": "Quitar",
    "sources": "Fuentes",
    "thinking": "Pensando...",
    "welcomeTitle": "¡Hola! Soy Alaa AI",
    "welcomeBody": "Pregúntame lo que quieras o adjunta una imagen o documento para que te ayude a entenderlo.",
    "describeImage": "Describe esta imagen y explica qué aparece en ella.",
    "history": "Historial de chats",
    "emptyHistory": "Aún no hay conversaciones guardadas.",
    "deleteChat": "Eliminar conversación",
    "openHistory": "Mostrar historial de chats",
    "choosePhoto": "Elegir una foto",
    "chooseFile": "Adjuntar archivo Word, PDF o TXT",
    "attachedFile": "Archivo adjunto",
    "uploading": "Preparando archivo...",
    "imageTooLarge": "La imagen supera los 4 MB.",
    "fileTooLarge": "El archivo supera los 4 MB.",
    "unsupportedImage": "Formato de imagen no compatible. Usa JPG, PNG o WebP.",
    "fileUnsupported": "Archivo no compatible. Usa DOCX, PDF o TXT.",
    "fileUploadError": "No se pudo leer el archivo. Comprueba que el servidor admita /upload.",
    "imagePickFailed": "No se pudo seleccionar la imagen. Inténtalo de nuevo.",
    "networkError": "No se pudo conectar con el servidor. Comprueba tu conexión a Internet.",
    "serverError": "No se pudo obtener una respuesta. Inténtalo de nuevo.",
    "quotaError": "Se alcanzó el límite de uso de la IA.",
    "noLanguages": "No se encontraron idiomas.",
    "notVerified": "Esta respuesta no se verificó mediante una búsqueda web en directo.",
    "openLink": "Abrir fuente",
    "historySaved": "Guardado localmente en este dispositivo",
    "untitled": "Nueva conversación",
    "document": "Documento",
    "close": "Cerrar",
    "avatarLabel": "Avatar de Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Máximo 4 MB"
  },
  "de": {
    "status": "Jetzt online",
    "newChat": "Neuer Chat",
    "chooseLanguage": "Sprache auswählen",
    "searchLanguage": "Sprachen suchen...",
    "placeholder": "Nachricht eingeben...",
    "send": "Senden",
    "attach": "Anhängen",
    "remove": "Entfernen",
    "sources": "Quellen",
    "thinking": "Denke nach...",
    "welcomeTitle": "Hallo! Ich bin Alaa AI",
    "welcomeBody": "Stelle mir eine Frage oder hänge ein Bild oder Dokument an, damit ich dir beim Verstehen helfen kann.",
    "describeImage": "Beschreibe dieses Bild und erkläre, was darauf zu sehen ist.",
    "history": "Chatverlauf",
    "emptyHistory": "Noch keine gespeicherten Unterhaltungen.",
    "deleteChat": "Unterhaltung löschen",
    "openHistory": "Chatverlauf anzeigen",
    "choosePhoto": "Foto auswählen",
    "chooseFile": "Word-, PDF- oder TXT-Datei anhängen",
    "attachedFile": "Angehängte Datei",
    "uploading": "Datei wird vorbereitet...",
    "imageTooLarge": "Das Bild ist größer als 4 MB.",
    "fileTooLarge": "Die Datei ist größer als 4 MB.",
    "unsupportedImage": "Nicht unterstütztes Bildformat. Verwende JPG, PNG oder WebP.",
    "fileUnsupported": "Nicht unterstützte Datei. Verwende DOCX, PDF oder TXT.",
    "fileUploadError": "Datei konnte nicht gelesen werden. Prüfe, ob der Server /upload unterstützt.",
    "imagePickFailed": "Bild konnte nicht ausgewählt werden. Bitte erneut versuchen.",
    "networkError": "Verbindung zum Server fehlgeschlagen. Prüfe deine Internetverbindung.",
    "serverError": "Keine Antwort erhalten. Bitte erneut versuchen.",
    "quotaError": "Das Nutzungslimit der KI wurde erreicht.",
    "noLanguages": "Keine Sprachen gefunden.",
    "notVerified": "Diese Antwort wurde nicht durch eine Live-Websuche überprüft.",
    "openLink": "Quelle öffnen",
    "historySaved": "Lokal auf diesem Gerät gespeichert",
    "untitled": "Neue Unterhaltung",
    "document": "Dokument",
    "close": "Schließen",
    "avatarLabel": "Alaa-AI-Avatar",
    "fileNote": "DOCX · PDF · TXT · Max. 4 MB"
  },
  "it": {
    "status": "Online ora",
    "newChat": "Nuova chat",
    "chooseLanguage": "Scegli la lingua",
    "searchLanguage": "Cerca lingue...",
    "placeholder": "Scrivi il tuo messaggio...",
    "send": "Invia",
    "attach": "Allega",
    "remove": "Rimuovi",
    "sources": "Fonti",
    "thinking": "Sto pensando...",
    "welcomeTitle": "Ciao! Sono Alaa AI",
    "welcomeBody": "Chiedimi qualsiasi cosa oppure allega un’immagine o un documento per ricevere aiuto a comprenderlo.",
    "describeImage": "Descrivi questa immagine e spiega cosa mostra.",
    "history": "Cronologia chat",
    "emptyHistory": "Nessuna conversazione salvata.",
    "deleteChat": "Elimina conversazione",
    "openHistory": "Mostra cronologia chat",
    "choosePhoto": "Scegli una foto",
    "chooseFile": "Allega un file Word, PDF o TXT",
    "attachedFile": "File allegato",
    "uploading": "Preparazione del file...",
    "imageTooLarge": "L’immagine supera i 4 MB.",
    "fileTooLarge": "Il file supera i 4 MB.",
    "unsupportedImage": "Formato immagine non supportato. Usa JPG, PNG o WebP.",
    "fileUnsupported": "File non supportato. Usa DOCX, PDF o TXT.",
    "fileUploadError": "Impossibile leggere il file. Verifica che il server supporti /upload.",
    "imagePickFailed": "Impossibile selezionare l’immagine. Riprova.",
    "networkError": "Impossibile connettersi al server. Controlla la connessione Internet.",
    "serverError": "Impossibile ottenere una risposta. Riprova.",
    "quotaError": "Il limite di utilizzo dell’IA è stato raggiunto.",
    "noLanguages": "Nessuna lingua trovata.",
    "notVerified": "Questa risposta non è stata verificata con una ricerca web in tempo reale.",
    "openLink": "Apri fonte",
    "historySaved": "Salvato localmente su questo dispositivo",
    "untitled": "Nuova conversazione",
    "document": "Documento",
    "close": "Chiudi",
    "avatarLabel": "Avatar di Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Massimo 4 MB"
  },
  "pt": {
    "status": "Online agora",
    "newChat": "Novo chat",
    "chooseLanguage": "Escolher idioma",
    "searchLanguage": "Pesquisar idiomas...",
    "placeholder": "Escreva sua mensagem...",
    "send": "Enviar",
    "attach": "Anexar",
    "remove": "Remover",
    "sources": "Fontes",
    "thinking": "Pensando...",
    "welcomeTitle": "Olá! Sou o Alaa AI",
    "welcomeBody": "Pergunte qualquer coisa ou anexe uma imagem ou documento para receber ajuda para entendê-lo.",
    "describeImage": "Descreva esta imagem e explique o que ela mostra.",
    "history": "Histórico de conversas",
    "emptyHistory": "Ainda não há conversas salvas.",
    "deleteChat": "Excluir conversa",
    "openHistory": "Mostrar histórico de conversas",
    "choosePhoto": "Escolher uma foto",
    "chooseFile": "Anexar arquivo Word, PDF ou TXT",
    "attachedFile": "Arquivo anexado",
    "uploading": "Preparando arquivo...",
    "imageTooLarge": "A imagem excede 4 MB.",
    "fileTooLarge": "O arquivo excede 4 MB.",
    "unsupportedImage": "Formato de imagem não compatível. Use JPG, PNG ou WebP.",
    "fileUnsupported": "Arquivo não compatível. Use DOCX, PDF ou TXT.",
    "fileUploadError": "Não foi possível ler o arquivo. Verifique se o servidor oferece suporte a /upload.",
    "imagePickFailed": "Não foi possível selecionar a imagem. Tente novamente.",
    "networkError": "Não foi possível conectar ao servidor. Verifique sua conexão com a Internet.",
    "serverError": "Não foi possível obter uma resposta. Tente novamente.",
    "quotaError": "O limite de uso da IA foi atingido.",
    "noLanguages": "Nenhum idioma encontrado.",
    "notVerified": "Esta resposta não foi verificada por uma pesquisa na web em tempo real.",
    "openLink": "Abrir fonte",
    "historySaved": "Salvo localmente neste dispositivo",
    "untitled": "Nova conversa",
    "document": "Documento",
    "close": "Fechar",
    "avatarLabel": "Avatar do Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Máximo 4 MB"
  },
  "tr": {
    "status": "Şu anda çevrimiçi",
    "newChat": "Yeni sohbet",
    "chooseLanguage": "Dil seç",
    "searchLanguage": "Dil ara...",
    "placeholder": "Mesajınızı yazın...",
    "send": "Gönder",
    "attach": "Ekle",
    "remove": "Kaldır",
    "sources": "Kaynaklar",
    "thinking": "Düşünüyor...",
    "welcomeTitle": "Merhaba! Ben Alaa AI",
    "welcomeBody": "Bana istediğinizi sorun veya anlamanıza yardımcı olmam için bir görsel ya da belge ekleyin.",
    "describeImage": "Bu görseli açıklayın ve ne gösterdiğini anlatın.",
    "history": "Sohbet geçmişi",
    "emptyHistory": "Henüz kaydedilmiş sohbet yok.",
    "deleteChat": "Sohbeti sil",
    "openHistory": "Sohbet geçmişini göster",
    "choosePhoto": "Fotoğraf seç",
    "chooseFile": "Word, PDF veya TXT dosyası ekle",
    "attachedFile": "Ekli dosya",
    "uploading": "Dosya hazırlanıyor...",
    "imageTooLarge": "Görsel 4 MB sınırını aşıyor.",
    "fileTooLarge": "Dosya 4 MB sınırını aşıyor.",
    "unsupportedImage": "Desteklenmeyen görsel biçimi. JPG, PNG veya WebP kullanın.",
    "fileUnsupported": "Desteklenmeyen dosya. DOCX, PDF veya TXT kullanın.",
    "fileUploadError": "Dosya okunamadı. Sunucunun /upload uç noktasını desteklediğini kontrol edin.",
    "imagePickFailed": "Görsel seçilemedi. Lütfen tekrar deneyin.",
    "networkError": "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.",
    "serverError": "Yanıt alınamadı. Lütfen tekrar deneyin.",
    "quotaError": "Yapay zekâ kullanım sınırına ulaşıldı.",
    "noLanguages": "Dil bulunamadı.",
    "notVerified": "Bu yanıt canlı web aramasıyla doğrulanmadı.",
    "openLink": "Kaynağı aç",
    "historySaved": "Bu cihazda yerel olarak kaydedildi",
    "untitled": "Yeni konuşma",
    "document": "Belge",
    "close": "Kapat",
    "avatarLabel": "Alaa AI avatarı",
    "fileNote": "DOCX · PDF · TXT · En fazla 4 MB"
  },
  "ru": {
    "status": "Сейчас в сети",
    "newChat": "Новый чат",
    "chooseLanguage": "Выбрать язык",
    "searchLanguage": "Поиск языков...",
    "placeholder": "Введите сообщение...",
    "send": "Отправить",
    "attach": "Прикрепить",
    "remove": "Удалить",
    "sources": "Источники",
    "thinking": "Думаю...",
    "welcomeTitle": "Привет! Я Alaa AI",
    "welcomeBody": "Задайте любой вопрос или прикрепите изображение либо документ, чтобы я помог разобраться.",
    "describeImage": "Опишите изображение и объясните, что на нём показано.",
    "history": "История чатов",
    "emptyHistory": "Пока нет сохранённых бесед.",
    "deleteChat": "Удалить беседу",
    "openHistory": "Показать историю чатов",
    "choosePhoto": "Выбрать фото",
    "chooseFile": "Прикрепить файл Word, PDF или TXT",
    "attachedFile": "Прикреплённый файл",
    "uploading": "Подготовка файла...",
    "imageTooLarge": "Размер изображения превышает 4 МБ.",
    "fileTooLarge": "Размер файла превышает 4 МБ.",
    "unsupportedImage": "Неподдерживаемый формат изображения. Используйте JPG, PNG или WebP.",
    "fileUnsupported": "Неподдерживаемый файл. Используйте DOCX, PDF или TXT.",
    "fileUploadError": "Не удалось прочитать файл. Убедитесь, что сервер поддерживает /upload.",
    "imagePickFailed": "Не удалось выбрать изображение. Попробуйте ещё раз.",
    "networkError": "Не удалось подключиться к серверу. Проверьте подключение к интернету.",
    "serverError": "Не удалось получить ответ. Попробуйте ещё раз.",
    "quotaError": "Достигнут лимит использования ИИ.",
    "noLanguages": "Языки не найдены.",
    "notVerified": "Этот ответ не был проверен с помощью поиска в интернете в реальном времени.",
    "openLink": "Открыть источник",
    "historySaved": "Сохранено локально на этом устройстве",
    "untitled": "Новая беседа",
    "document": "Документ",
    "close": "Закрыть",
    "avatarLabel": "Аватар Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Максимум 4 МБ"
  },
  "zh-CN": {
    "status": "当前在线",
    "newChat": "新建聊天",
    "chooseLanguage": "选择语言",
    "searchLanguage": "搜索语言...",
    "placeholder": "输入消息...",
    "send": "发送",
    "attach": "添加附件",
    "remove": "移除",
    "sources": "来源",
    "thinking": "正在思考...",
    "welcomeTitle": "你好！我是 Alaa AI",
    "welcomeBody": "你可以问我任何问题，也可以附加图片或文档，让我帮你理解内容。",
    "describeImage": "描述这张图片，并解释其中显示的内容。",
    "history": "聊天记录",
    "emptyHistory": "暂无保存的对话。",
    "deleteChat": "删除对话",
    "openHistory": "显示聊天记录",
    "choosePhoto": "选择照片",
    "chooseFile": "附加 Word、PDF 或 TXT 文件",
    "attachedFile": "已附加文件",
    "uploading": "正在准备文件...",
    "imageTooLarge": "图片超过 4 MB。",
    "fileTooLarge": "文件超过 4 MB。",
    "unsupportedImage": "不支持此图片格式。请使用 JPG、PNG 或 WebP。",
    "fileUnsupported": "不支持此文件。请使用 DOCX、PDF 或 TXT。",
    "fileUploadError": "无法读取文件。请确认服务器支持 /upload。",
    "imagePickFailed": "无法选择图片，请重试。",
    "networkError": "无法连接服务器。请检查网络连接。",
    "serverError": "无法获取回复，请重试。",
    "quotaError": "已达到 AI 使用上限。",
    "noLanguages": "未找到语言。",
    "notVerified": "此回答未经实时网页搜索验证。",
    "openLink": "打开来源",
    "historySaved": "已保存在此设备本地",
    "untitled": "新建对话",
    "document": "文档",
    "close": "关闭",
    "avatarLabel": "Alaa AI 头像",
    "fileNote": "DOCX · PDF · TXT · 最大 4 MB"
  },
  "zh-TW": {
    "status": "目前在線",
    "newChat": "新增聊天",
    "chooseLanguage": "選擇語言",
    "searchLanguage": "搜尋語言...",
    "placeholder": "輸入訊息...",
    "send": "傳送",
    "attach": "附加檔案",
    "remove": "移除",
    "sources": "來源",
    "thinking": "思考中...",
    "welcomeTitle": "嗨！我是 Alaa AI",
    "welcomeBody": "你可以問我任何問題，也可以附加圖片或文件，讓我協助你理解內容。",
    "describeImage": "描述這張圖片，並說明其中顯示的內容。",
    "history": "聊天記錄",
    "emptyHistory": "目前沒有已儲存的對話。",
    "deleteChat": "刪除對話",
    "openHistory": "顯示聊天記錄",
    "choosePhoto": "選擇照片",
    "chooseFile": "附加 Word、PDF 或 TXT 檔案",
    "attachedFile": "已附加檔案",
    "uploading": "正在準備檔案...",
    "imageTooLarge": "圖片超過 4 MB。",
    "fileTooLarge": "檔案超過 4 MB。",
    "unsupportedImage": "不支援此圖片格式。請使用 JPG、PNG 或 WebP。",
    "fileUnsupported": "不支援此檔案。請使用 DOCX、PDF 或 TXT。",
    "fileUploadError": "無法讀取檔案。請確認伺服器支援 /upload。",
    "imagePickFailed": "無法選擇圖片，請再試一次。",
    "networkError": "無法連線至伺服器。請檢查網路連線。",
    "serverError": "無法取得回覆，請再試一次。",
    "quotaError": "已達到 AI 使用上限。",
    "noLanguages": "找不到語言。",
    "notVerified": "此回答尚未經過即時網頁搜尋驗證。",
    "openLink": "開啟來源",
    "historySaved": "已儲存在此裝置",
    "untitled": "新增對話",
    "document": "文件",
    "close": "關閉",
    "avatarLabel": "Alaa AI 頭像",
    "fileNote": "DOCX · PDF · TXT · 上限 4 MB"
  },
  "ja": {
    "status": "オンライン中",
    "newChat": "新しいチャット",
    "chooseLanguage": "言語を選択",
    "searchLanguage": "言語を検索...",
    "placeholder": "メッセージを入力...",
    "send": "送信",
    "attach": "添付",
    "remove": "削除",
    "sources": "ソース",
    "thinking": "考え中...",
    "welcomeTitle": "こんにちは！Alaa AI です",
    "welcomeBody": "何でも質問できます。画像や文書を添付すれば、内容の理解もお手伝いします。",
    "describeImage": "この画像を説明し、何が写っているかを教えてください。",
    "history": "チャット履歴",
    "emptyHistory": "保存された会話はまだありません。",
    "deleteChat": "会話を削除",
    "openHistory": "チャット履歴を表示",
    "choosePhoto": "写真を選択",
    "chooseFile": "Word、PDF、TXT ファイルを添付",
    "attachedFile": "添付ファイル",
    "uploading": "ファイルを準備中...",
    "imageTooLarge": "画像が 4 MB を超えています。",
    "fileTooLarge": "ファイルが 4 MB を超えています。",
    "unsupportedImage": "対応していない画像形式です。JPG、PNG、WebP を使用してください。",
    "fileUnsupported": "対応していないファイルです。DOCX、PDF、TXT を使用してください。",
    "fileUploadError": "ファイルを読み取れません。サーバーが /upload に対応しているか確認してください。",
    "imagePickFailed": "画像を選択できませんでした。もう一度お試しください。",
    "networkError": "サーバーに接続できません。インターネット接続を確認してください。",
    "serverError": "応答を取得できませんでした。もう一度お試しください。",
    "quotaError": "AI の利用上限に達しました。",
    "noLanguages": "言語が見つかりません。",
    "notVerified": "この回答はリアルタイムのウェブ検索で確認されていません。",
    "openLink": "ソースを開く",
    "historySaved": "この端末にローカル保存済み",
    "untitled": "新しい会話",
    "document": "ドキュメント",
    "close": "閉じる",
    "avatarLabel": "Alaa AI のアバター",
    "fileNote": "DOCX · PDF · TXT · 最大 4 MB"
  },
  "ko": {
    "status": "온라인",
    "newChat": "새 채팅",
    "chooseLanguage": "언어 선택",
    "searchLanguage": "언어 검색...",
    "placeholder": "메시지를 입력하세요...",
    "send": "보내기",
    "attach": "첨부",
    "remove": "제거",
    "sources": "출처",
    "thinking": "생각 중...",
    "welcomeTitle": "안녕하세요! Alaa AI입니다",
    "welcomeBody": "무엇이든 질문하거나 이미지 또는 문서를 첨부해 내용을 이해하는 데 도움을 받아 보세요.",
    "describeImage": "이 이미지를 설명하고 무엇이 보이는지 알려 주세요.",
    "history": "채팅 기록",
    "emptyHistory": "저장된 대화가 아직 없습니다.",
    "deleteChat": "대화 삭제",
    "openHistory": "채팅 기록 보기",
    "choosePhoto": "사진 선택",
    "chooseFile": "Word, PDF 또는 TXT 파일 첨부",
    "attachedFile": "첨부된 파일",
    "uploading": "파일 준비 중...",
    "imageTooLarge": "이미지가 4MB를 초과합니다.",
    "fileTooLarge": "파일이 4MB를 초과합니다.",
    "unsupportedImage": "지원하지 않는 이미지 형식입니다. JPG, PNG 또는 WebP를 사용하세요.",
    "fileUnsupported": "지원하지 않는 파일입니다. DOCX, PDF 또는 TXT를 사용하세요.",
    "fileUploadError": "파일을 읽을 수 없습니다. 서버가 /upload를 지원하는지 확인하세요.",
    "imagePickFailed": "이미지를 선택하지 못했습니다. 다시 시도하세요.",
    "networkError": "서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.",
    "serverError": "응답을 가져오지 못했습니다. 다시 시도하세요.",
    "quotaError": "AI 사용 한도에 도달했습니다.",
    "noLanguages": "언어를 찾을 수 없습니다.",
    "notVerified": "이 답변은 실시간 웹 검색으로 확인되지 않았습니다.",
    "openLink": "출처 열기",
    "historySaved": "이 기기에 로컬로 저장됨",
    "untitled": "새 대화",
    "document": "문서",
    "close": "닫기",
    "avatarLabel": "Alaa AI 아바타",
    "fileNote": "DOCX · PDF · TXT · 최대 4MB"
  },
  "hi": {
    "status": "अभी ऑनलाइन",
    "newChat": "नई चैट",
    "chooseLanguage": "भाषा चुनें",
    "searchLanguage": "भाषाएँ खोजें...",
    "placeholder": "अपना संदेश लिखें...",
    "send": "भेजें",
    "attach": "संलग्न करें",
    "remove": "हटाएँ",
    "sources": "स्रोत",
    "thinking": "सोच रहा है...",
    "welcomeTitle": "नमस्ते! मैं Alaa AI हूँ",
    "welcomeBody": "मुझसे कुछ भी पूछें या समझने में मदद पाने के लिए कोई तस्वीर या दस्तावेज़ संलग्न करें।",
    "describeImage": "इस तस्वीर का वर्णन करें और बताएँ कि इसमें क्या दिख रहा है।",
    "history": "चैट इतिहास",
    "emptyHistory": "अभी तक कोई सहेजी गई बातचीत नहीं है।",
    "deleteChat": "बातचीत हटाएँ",
    "openHistory": "चैट इतिहास दिखाएँ",
    "choosePhoto": "तस्वीर चुनें",
    "chooseFile": "Word, PDF या TXT फ़ाइल संलग्न करें",
    "attachedFile": "संलग्न फ़ाइल",
    "uploading": "फ़ाइल तैयार हो रही है...",
    "imageTooLarge": "तस्वीर 4 MB से बड़ी है।",
    "fileTooLarge": "फ़ाइल 4 MB से बड़ी है।",
    "unsupportedImage": "तस्वीर का फ़ॉर्मैट समर्थित नहीं है। JPG, PNG या WebP इस्तेमाल करें।",
    "fileUnsupported": "फ़ाइल समर्थित नहीं है। DOCX, PDF या TXT इस्तेमाल करें।",
    "fileUploadError": "फ़ाइल पढ़ी नहीं जा सकी। जाँचें कि सर्वर /upload का समर्थन करता है।",
    "imagePickFailed": "तस्वीर नहीं चुनी जा सकी। फिर से कोशिश करें।",
    "networkError": "सर्वर से कनेक्ट नहीं हो सका। इंटरनेट कनेक्शन जाँचें।",
    "serverError": "जवाब नहीं मिला। फिर से कोशिश करें।",
    "quotaError": "AI उपयोग की सीमा पूरी हो गई है।",
    "noLanguages": "कोई भाषा नहीं मिली।",
    "notVerified": "इस जवाब की लाइव वेब खोज से पुष्टि नहीं की गई।",
    "openLink": "स्रोत खोलें",
    "historySaved": "इस डिवाइस पर स्थानीय रूप से सहेजा गया",
    "untitled": "नई बातचीत",
    "document": "दस्तावेज़",
    "close": "बंद करें",
    "avatarLabel": "Alaa AI अवतार",
    "fileNote": "DOCX · PDF · TXT · अधिकतम 4 MB"
  },
  "ur": {
    "status": "ابھی آن لائن",
    "newChat": "نئی چیٹ",
    "chooseLanguage": "زبان منتخب کریں",
    "searchLanguage": "زبانیں تلاش کریں...",
    "placeholder": "اپنا پیغام لکھیں...",
    "send": "بھیجیں",
    "attach": "منسلک کریں",
    "remove": "ہٹائیں",
    "sources": "ذرائع",
    "thinking": "سوچ رہا ہے...",
    "welcomeTitle": "سلام! میں Alaa AI ہوں",
    "welcomeBody": "مجھ سے کچھ بھی پوچھیں یا سمجھنے میں مدد کے لیے تصویر یا دستاویز منسلک کریں۔",
    "describeImage": "اس تصویر کی وضاحت کریں اور بتائیں کہ اس میں کیا دکھائی دے رہا ہے۔",
    "history": "چیٹ کی سرگزشت",
    "emptyHistory": "ابھی تک کوئی گفتگو محفوظ نہیں۔",
    "deleteChat": "گفتگو حذف کریں",
    "openHistory": "چیٹ کی سرگزشت دکھائیں",
    "choosePhoto": "تصویر منتخب کریں",
    "chooseFile": "Word، PDF یا TXT فائل منسلک کریں",
    "attachedFile": "منسلک فائل",
    "uploading": "فائل تیار کی جا رہی ہے...",
    "imageTooLarge": "تصویر 4 MB سے بڑی ہے۔",
    "fileTooLarge": "فائل 4 MB سے بڑی ہے۔",
    "unsupportedImage": "تصویر کی یہ قسم معاون نہیں۔ JPG، PNG یا WebP استعمال کریں۔",
    "fileUnsupported": "یہ فائل معاون نہیں۔ DOCX، PDF یا TXT استعمال کریں۔",
    "fileUploadError": "فائل پڑھی نہیں جا سکی۔ تصدیق کریں کہ سرور /upload کو سپورٹ کرتا ہے۔",
    "imagePickFailed": "تصویر منتخب نہیں ہو سکی۔ دوبارہ کوشش کریں۔",
    "networkError": "سرور سے رابطہ نہیں ہو سکا۔ انٹرنیٹ کنکشن چیک کریں۔",
    "serverError": "جواب حاصل نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
    "quotaError": "AI کے استعمال کی حد پوری ہو گئی ہے۔",
    "noLanguages": "کوئی زبان نہیں ملی۔",
    "notVerified": "اس جواب کی لائیو ویب سرچ سے تصدیق نہیں ہوئی۔",
    "openLink": "ماخذ کھولیں",
    "historySaved": "اس ڈیوائس پر مقامی طور پر محفوظ",
    "untitled": "نئی گفتگو",
    "document": "دستاویز",
    "close": "بند کریں",
    "avatarLabel": "Alaa AI اوتار",
    "fileNote": "DOCX · PDF · TXT · زیادہ سے زیادہ 4 MB"
  },
  "bn": {
    "status": "এখন অনলাইনে",
    "newChat": "নতুন চ্যাট",
    "chooseLanguage": "ভাষা নির্বাচন করুন",
    "searchLanguage": "ভাষা খুঁজুন...",
    "placeholder": "আপনার বার্তা লিখুন...",
    "send": "পাঠান",
    "attach": "সংযুক্ত করুন",
    "remove": "সরান",
    "sources": "সূত্র",
    "thinking": "ভাবছি...",
    "welcomeTitle": "হ্যালো! আমি Alaa AI",
    "welcomeBody": "আমাকে যেকোনো প্রশ্ন করুন, অথবা বুঝতে সাহায্য পেতে একটি ছবি বা নথি সংযুক্ত করুন।",
    "describeImage": "এই ছবিটির বর্ণনা দিন এবং এতে কী দেখা যাচ্ছে তা ব্যাখ্যা করুন।",
    "history": "চ্যাটের ইতিহাস",
    "emptyHistory": "এখনও কোনো সংরক্ষিত কথোপকথন নেই।",
    "deleteChat": "কথোপকথন মুছুন",
    "openHistory": "চ্যাটের ইতিহাস দেখান",
    "choosePhoto": "ছবি নির্বাচন করুন",
    "chooseFile": "Word, PDF বা TXT ফাইল সংযুক্ত করুন",
    "attachedFile": "সংযুক্ত ফাইল",
    "uploading": "ফাইল প্রস্তুত করা হচ্ছে...",
    "imageTooLarge": "ছবির আকার ৪ MB-এর বেশি।",
    "fileTooLarge": "ফাইলের আকার ৪ MB-এর বেশি।",
    "unsupportedImage": "অসমর্থিত ছবির ফরম্যাট। JPG, PNG বা WebP ব্যবহার করুন।",
    "fileUnsupported": "অসমর্থিত ফাইল। DOCX, PDF বা TXT ব্যবহার করুন।",
    "fileUploadError": "ফাইল পড়া যায়নি। সার্ভার /upload সমর্থন করে কি না দেখুন।",
    "imagePickFailed": "ছবি নির্বাচন করা যায়নি। আবার চেষ্টা করুন।",
    "networkError": "সার্ভারের সঙ্গে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।",
    "serverError": "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।",
    "quotaError": "AI ব্যবহারের সীমা শেষ হয়েছে।",
    "noLanguages": "কোনো ভাষা পাওয়া যায়নি।",
    "notVerified": "এই উত্তরটি লাইভ ওয়েব অনুসন্ধান দিয়ে যাচাই করা হয়নি।",
    "openLink": "সূত্র খুলুন",
    "historySaved": "এই ডিভাইসে স্থানীয়ভাবে সংরক্ষিত",
    "untitled": "নতুন কথোপকথন",
    "document": "নথি",
    "close": "বন্ধ করুন",
    "avatarLabel": "Alaa AI অবতার",
    "fileNote": "DOCX · PDF · TXT · সর্বোচ্চ ৪ MB"
  },
  "id": {
    "status": "Sedang online",
    "newChat": "Chat baru",
    "chooseLanguage": "Pilih bahasa",
    "searchLanguage": "Cari bahasa...",
    "placeholder": "Ketik pesan Anda...",
    "send": "Kirim",
    "attach": "Lampirkan",
    "remove": "Hapus",
    "sources": "Sumber",
    "thinking": "Sedang berpikir...",
    "welcomeTitle": "Hai! Saya Alaa AI",
    "welcomeBody": "Tanyakan apa saja, atau lampirkan gambar atau dokumen agar saya membantu memahaminya.",
    "describeImage": "Jelaskan gambar ini dan apa yang terlihat di dalamnya.",
    "history": "Riwayat chat",
    "emptyHistory": "Belum ada percakapan tersimpan.",
    "deleteChat": "Hapus percakapan",
    "openHistory": "Tampilkan riwayat chat",
    "choosePhoto": "Pilih foto",
    "chooseFile": "Lampirkan file Word, PDF, atau TXT",
    "attachedFile": "File terlampir",
    "uploading": "Menyiapkan file...",
    "imageTooLarge": "Gambar lebih besar dari 4 MB.",
    "fileTooLarge": "File lebih besar dari 4 MB.",
    "unsupportedImage": "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.",
    "fileUnsupported": "File tidak didukung. Gunakan DOCX, PDF, atau TXT.",
    "fileUploadError": "File tidak dapat dibaca. Pastikan server mendukung /upload.",
    "imagePickFailed": "Gambar tidak dapat dipilih. Coba lagi.",
    "networkError": "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
    "serverError": "Tidak dapat memperoleh jawaban. Coba lagi.",
    "quotaError": "Batas penggunaan AI telah tercapai.",
    "noLanguages": "Bahasa tidak ditemukan.",
    "notVerified": "Jawaban ini belum diverifikasi melalui pencarian web langsung.",
    "openLink": "Buka sumber",
    "historySaved": "Disimpan secara lokal di perangkat ini",
    "untitled": "Percakapan baru",
    "document": "Dokumen",
    "close": "Tutup",
    "avatarLabel": "Avatar Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Maks. 4 MB"
  },
  "ms": {
    "status": "Sedang dalam talian",
    "newChat": "Sembang baharu",
    "chooseLanguage": "Pilih bahasa",
    "searchLanguage": "Cari bahasa...",
    "placeholder": "Taip mesej anda...",
    "send": "Hantar",
    "attach": "Lampirkan",
    "remove": "Buang",
    "sources": "Sumber",
    "thinking": "Sedang berfikir...",
    "welcomeTitle": "Hai! Saya Alaa AI",
    "welcomeBody": "Tanya apa sahaja atau lampirkan imej atau dokumen supaya saya dapat membantu memahaminya.",
    "describeImage": "Huraikan imej ini dan terangkan perkara yang ditunjukkannya.",
    "history": "Sejarah sembang",
    "emptyHistory": "Belum ada perbualan yang disimpan.",
    "deleteChat": "Padam perbualan",
    "openHistory": "Paparkan sejarah sembang",
    "choosePhoto": "Pilih foto",
    "chooseFile": "Lampirkan fail Word, PDF atau TXT",
    "attachedFile": "Fail dilampirkan",
    "uploading": "Menyediakan fail...",
    "imageTooLarge": "Imej melebihi 4 MB.",
    "fileTooLarge": "Fail melebihi 4 MB.",
    "unsupportedImage": "Format imej tidak disokong. Gunakan JPG, PNG atau WebP.",
    "fileUnsupported": "Fail tidak disokong. Gunakan DOCX, PDF atau TXT.",
    "fileUploadError": "Fail tidak dapat dibaca. Pastikan pelayan menyokong /upload.",
    "imagePickFailed": "Imej tidak dapat dipilih. Cuba lagi.",
    "networkError": "Tidak dapat menyambung ke pelayan. Semak sambungan Internet anda.",
    "serverError": "Tidak dapat mendapatkan jawapan. Cuba lagi.",
    "quotaError": "Had penggunaan AI telah dicapai.",
    "noLanguages": "Tiada bahasa ditemukan.",
    "notVerified": "Jawapan ini tidak disahkan melalui carian web langsung.",
    "openLink": "Buka sumber",
    "historySaved": "Disimpan secara setempat pada peranti ini",
    "untitled": "Perbualan baharu",
    "document": "Dokumen",
    "close": "Tutup",
    "avatarLabel": "Avatar Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Maksimum 4 MB"
  },
  "th": {
    "status": "ออนไลน์อยู่",
    "newChat": "แชตใหม่",
    "chooseLanguage": "เลือกภาษา",
    "searchLanguage": "ค้นหาภาษา...",
    "placeholder": "พิมพ์ข้อความของคุณ...",
    "send": "ส่ง",
    "attach": "แนบไฟล์",
    "remove": "นำออก",
    "sources": "แหล่งที่มา",
    "thinking": "กำลังคิด...",
    "welcomeTitle": "สวัสดี! ฉันคือ Alaa AI",
    "welcomeBody": "ถามฉันได้ทุกเรื่อง หรือแนบรูปภาพหรือเอกสารเพื่อให้ช่วยทำความเข้าใจ",
    "describeImage": "อธิบายภาพนี้และบอกว่ามีอะไรอยู่ในภาพ",
    "history": "ประวัติแชต",
    "emptyHistory": "ยังไม่มีบทสนทนาที่บันทึกไว้",
    "deleteChat": "ลบบทสนทนา",
    "openHistory": "แสดงประวัติแชต",
    "choosePhoto": "เลือกรูปภาพ",
    "chooseFile": "แนบไฟล์ Word, PDF หรือ TXT",
    "attachedFile": "ไฟล์แนบ",
    "uploading": "กำลังเตรียมไฟล์...",
    "imageTooLarge": "รูปภาพมีขนาดเกิน 4 MB",
    "fileTooLarge": "ไฟล์มีขนาดเกิน 4 MB",
    "unsupportedImage": "ไม่รองรับรูปแบบภาพนี้ โปรดใช้ JPG, PNG หรือ WebP",
    "fileUnsupported": "ไม่รองรับไฟล์นี้ โปรดใช้ DOCX, PDF หรือ TXT",
    "fileUploadError": "อ่านไฟล์ไม่ได้ โปรดตรวจสอบว่าเซิร์ฟเวอร์รองรับ /upload",
    "imagePickFailed": "เลือกรูปภาพไม่ได้ โปรดลองอีกครั้ง",
    "networkError": "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ โปรดตรวจสอบอินเทอร์เน็ต",
    "serverError": "รับคำตอบไม่ได้ โปรดลองอีกครั้ง",
    "quotaError": "ถึงขีดจำกัดการใช้งาน AI แล้ว",
    "noLanguages": "ไม่พบภาษา",
    "notVerified": "คำตอบนี้ไม่ได้รับการตรวจสอบด้วยการค้นหาเว็บแบบเรียลไทม์",
    "openLink": "เปิดแหล่งที่มา",
    "historySaved": "บันทึกไว้ในอุปกรณ์นี้",
    "untitled": "บทสนทนาใหม่",
    "document": "เอกสาร",
    "close": "ปิด",
    "avatarLabel": "รูปประจำตัว Alaa AI",
    "fileNote": "DOCX · PDF · TXT · สูงสุด 4 MB"
  },
  "vi": {
    "status": "Đang trực tuyến",
    "newChat": "Cuộc trò chuyện mới",
    "chooseLanguage": "Chọn ngôn ngữ",
    "searchLanguage": "Tìm ngôn ngữ...",
    "placeholder": "Nhập tin nhắn...",
    "send": "Gửi",
    "attach": "Đính kèm",
    "remove": "Xóa",
    "sources": "Nguồn",
    "thinking": "Đang suy nghĩ...",
    "welcomeTitle": "Xin chào! Tôi là Alaa AI",
    "welcomeBody": "Hãy hỏi bất cứ điều gì hoặc đính kèm hình ảnh hay tài liệu để tôi giúp bạn hiểu nội dung.",
    "describeImage": "Mô tả hình ảnh này và giải thích những gì xuất hiện trong đó.",
    "history": "Lịch sử trò chuyện",
    "emptyHistory": "Chưa có cuộc trò chuyện nào được lưu.",
    "deleteChat": "Xóa cuộc trò chuyện",
    "openHistory": "Hiển thị lịch sử trò chuyện",
    "choosePhoto": "Chọn ảnh",
    "chooseFile": "Đính kèm tệp Word, PDF hoặc TXT",
    "attachedFile": "Tệp đính kèm",
    "uploading": "Đang chuẩn bị tệp...",
    "imageTooLarge": "Hình ảnh lớn hơn 4 MB.",
    "fileTooLarge": "Tệp lớn hơn 4 MB.",
    "unsupportedImage": "Định dạng ảnh không được hỗ trợ. Hãy dùng JPG, PNG hoặc WebP.",
    "fileUnsupported": "Tệp không được hỗ trợ. Hãy dùng DOCX, PDF hoặc TXT.",
    "fileUploadError": "Không thể đọc tệp. Hãy kiểm tra máy chủ có hỗ trợ /upload không.",
    "imagePickFailed": "Không thể chọn ảnh. Vui lòng thử lại.",
    "networkError": "Không thể kết nối máy chủ. Hãy kiểm tra kết nối Internet.",
    "serverError": "Không thể nhận câu trả lời. Vui lòng thử lại.",
    "quotaError": "Đã đạt giới hạn sử dụng AI.",
    "noLanguages": "Không tìm thấy ngôn ngữ.",
    "notVerified": "Câu trả lời này chưa được xác minh bằng tìm kiếm web trực tiếp.",
    "openLink": "Mở nguồn",
    "historySaved": "Đã lưu cục bộ trên thiết bị này",
    "untitled": "Cuộc trò chuyện mới",
    "document": "Tài liệu",
    "close": "Đóng",
    "avatarLabel": "Ảnh đại diện Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Tối đa 4 MB"
  },
  "fa": {
    "status": "اکنون آنلاین",
    "newChat": "گفت‌وگوی جدید",
    "chooseLanguage": "انتخاب زبان",
    "searchLanguage": "جست‌وجوی زبان...",
    "placeholder": "پیام خود را بنویسید...",
    "send": "ارسال",
    "attach": "پیوست",
    "remove": "حذف",
    "sources": "منابع",
    "thinking": "در حال فکر کردن...",
    "welcomeTitle": "سلام! من Alaa AI هستم",
    "welcomeBody": "هر سؤالی دارید بپرسید یا برای کمک در درک محتوا، تصویر یا سندی پیوست کنید.",
    "describeImage": "این تصویر را توصیف کنید و توضیح دهید چه چیزی در آن دیده می‌شود.",
    "history": "تاریخچه گفتگو",
    "emptyHistory": "هنوز گفتگویی ذخیره نشده است.",
    "deleteChat": "حذف گفتگو",
    "openHistory": "نمایش تاریخچه گفتگو",
    "choosePhoto": "انتخاب عکس",
    "chooseFile": "پیوست فایل Word، PDF یا TXT",
    "attachedFile": "فایل پیوست‌شده",
    "uploading": "در حال آماده‌سازی فایل...",
    "imageTooLarge": "حجم تصویر بیش از ۴ مگابایت است.",
    "fileTooLarge": "حجم فایل بیش از ۴ مگابایت است.",
    "unsupportedImage": "قالب تصویر پشتیبانی نمی‌شود. از JPG، PNG یا WebP استفاده کنید.",
    "fileUnsupported": "این فایل پشتیبانی نمی‌شود. از DOCX، PDF یا TXT استفاده کنید.",
    "fileUploadError": "خواندن فایل ممکن نشد. بررسی کنید که سرور از /upload پشتیبانی کند.",
    "imagePickFailed": "انتخاب تصویر ممکن نشد. دوباره تلاش کنید.",
    "networkError": "اتصال به سرور ممکن نشد. اتصال اینترنت را بررسی کنید.",
    "serverError": "دریافت پاسخ ممکن نشد. دوباره تلاش کنید.",
    "quotaError": "به محدودیت استفاده از هوش مصنوعی رسیده‌اید.",
    "noLanguages": "زبانی پیدا نشد.",
    "notVerified": "این پاسخ با جست‌وجوی زنده وب تأیید نشده است.",
    "openLink": "باز کردن منبع",
    "historySaved": "به‌صورت محلی در این دستگاه ذخیره شده است",
    "untitled": "گفتگوی جدید",
    "document": "سند",
    "close": "بستن",
    "avatarLabel": "آواتار Alaa AI",
    "fileNote": "DOCX · PDF · TXT · حداکثر ۴ مگابایت"
  },
  "he": {
    "status": "מחובר עכשיו",
    "newChat": "צ׳אט חדש",
    "chooseLanguage": "בחירת שפה",
    "searchLanguage": "חיפוש שפות...",
    "placeholder": "הקלידו את ההודעה שלכם...",
    "send": "שליחה",
    "attach": "צירוף",
    "remove": "הסרה",
    "sources": "מקורות",
    "thinking": "חושב...",
    "welcomeTitle": "שלום! אני Alaa AI",
    "welcomeBody": "אפשר לשאול אותי כל דבר או לצרף תמונה או מסמך כדי שאעזור להבין אותם.",
    "describeImage": "תארו את התמונה והסבירו מה מופיע בה.",
    "history": "היסטוריית צ׳אטים",
    "emptyHistory": "אין עדיין שיחות שמורות.",
    "deleteChat": "מחיקת השיחה",
    "openHistory": "הצגת היסטוריית צ׳אטים",
    "choosePhoto": "בחירת תמונה",
    "chooseFile": "צירוף קובץ Word, PDF או TXT",
    "attachedFile": "קובץ מצורף",
    "uploading": "מכין את הקובץ...",
    "imageTooLarge": "התמונה גדולה מ־4 MB.",
    "fileTooLarge": "הקובץ גדול מ־4 MB.",
    "unsupportedImage": "פורמט התמונה אינו נתמך. השתמשו ב־JPG, PNG או WebP.",
    "fileUnsupported": "הקובץ אינו נתמך. השתמשו ב־DOCX, PDF או TXT.",
    "fileUploadError": "לא ניתן לקרוא את הקובץ. ודאו שהשרת תומך ב־/upload.",
    "imagePickFailed": "לא ניתן לבחור את התמונה. נסו שוב.",
    "networkError": "לא ניתן להתחבר לשרת. בדקו את חיבור האינטרנט.",
    "serverError": "לא ניתן לקבל תשובה. נסו שוב.",
    "quotaError": "הגעתם למגבלת השימוש בבינה המלאכותית.",
    "noLanguages": "לא נמצאו שפות.",
    "notVerified": "התשובה הזו לא אומתה באמצעות חיפוש חי באינטרנט.",
    "openLink": "פתיחת המקור",
    "historySaved": "נשמר מקומית במכשיר זה",
    "untitled": "שיחה חדשה",
    "document": "מסמך",
    "close": "סגירה",
    "avatarLabel": "הדמות של Alaa AI",
    "fileNote": "DOCX · PDF · TXT · עד 4 MB"
  },
  "nl": {
    "status": "Nu online",
    "newChat": "Nieuwe chat",
    "chooseLanguage": "Taal kiezen",
    "searchLanguage": "Talen zoeken...",
    "placeholder": "Typ je bericht...",
    "send": "Verzenden",
    "attach": "Bijvoegen",
    "remove": "Verwijderen",
    "sources": "Bronnen",
    "thinking": "Aan het nadenken...",
    "welcomeTitle": "Hoi! Ik ben Alaa AI",
    "welcomeBody": "Stel me alles wat je wilt vragen, of voeg een afbeelding of document toe zodat ik je kan helpen het te begrijpen.",
    "describeImage": "Beschrijf deze afbeelding en leg uit wat erop te zien is.",
    "history": "Chatgeschiedenis",
    "emptyHistory": "Er zijn nog geen gesprekken opgeslagen.",
    "deleteChat": "Gesprek verwijderen",
    "openHistory": "Chatgeschiedenis tonen",
    "choosePhoto": "Foto kiezen",
    "chooseFile": "Word-, PDF- of TXT-bestand bijvoegen",
    "attachedFile": "Bijgevoegd bestand",
    "uploading": "Bestand voorbereiden...",
    "imageTooLarge": "De afbeelding is groter dan 4 MB.",
    "fileTooLarge": "Het bestand is groter dan 4 MB.",
    "unsupportedImage": "Niet-ondersteund afbeeldingsformaat. Gebruik JPG, PNG of WebP.",
    "fileUnsupported": "Niet-ondersteund bestand. Gebruik DOCX, PDF of TXT.",
    "fileUploadError": "Het bestand kon niet worden gelezen. Controleer of de server /upload ondersteunt.",
    "imagePickFailed": "De afbeelding kon niet worden geselecteerd. Probeer het opnieuw.",
    "networkError": "Kan geen verbinding maken met de server. Controleer je internetverbinding.",
    "serverError": "Er kon geen antwoord worden opgehaald. Probeer het opnieuw.",
    "quotaError": "De AI-gebruikslimiet is bereikt.",
    "noLanguages": "Geen talen gevonden.",
    "notVerified": "Dit antwoord is niet gecontroleerd met live zoeken op het web.",
    "openLink": "Bron openen",
    "historySaved": "Lokaal opgeslagen op dit apparaat",
    "untitled": "Nieuw gesprek",
    "document": "Document",
    "close": "Sluiten",
    "avatarLabel": "Alaa AI-avatar",
    "fileNote": "DOCX · PDF · TXT · Max. 4 MB"
  },
  "pl": {
    "status": "Online teraz",
    "newChat": "Nowy czat",
    "chooseLanguage": "Wybierz język",
    "searchLanguage": "Szukaj języków...",
    "placeholder": "Wpisz wiadomość...",
    "send": "Wyślij",
    "attach": "Załącz",
    "remove": "Usuń",
    "sources": "Źródła",
    "thinking": "Myślę...",
    "welcomeTitle": "Cześć! Jestem Alaa AI",
    "welcomeBody": "Zapytaj mnie o cokolwiek lub dołącz obraz albo dokument, abym pomógł Ci go zrozumieć.",
    "describeImage": "Opisz ten obraz i wyjaśnij, co przedstawia.",
    "history": "Historia czatów",
    "emptyHistory": "Brak zapisanych rozmów.",
    "deleteChat": "Usuń rozmowę",
    "openHistory": "Pokaż historię czatów",
    "choosePhoto": "Wybierz zdjęcie",
    "chooseFile": "Dołącz plik Word, PDF lub TXT",
    "attachedFile": "Załączony plik",
    "uploading": "Przygotowywanie pliku...",
    "imageTooLarge": "Obraz przekracza 4 MB.",
    "fileTooLarge": "Plik przekracza 4 MB.",
    "unsupportedImage": "Nieobsługiwany format obrazu. Użyj JPG, PNG lub WebP.",
    "fileUnsupported": "Nieobsługiwany plik. Użyj DOCX, PDF lub TXT.",
    "fileUploadError": "Nie można odczytać pliku. Sprawdź, czy serwer obsługuje /upload.",
    "imagePickFailed": "Nie można wybrać obrazu. Spróbuj ponownie.",
    "networkError": "Nie można połączyć się z serwerem. Sprawdź połączenie z internetem.",
    "serverError": "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.",
    "quotaError": "Osiągnięto limit korzystania z AI.",
    "noLanguages": "Nie znaleziono języków.",
    "notVerified": "Ta odpowiedź nie została zweryfikowana za pomocą wyszukiwania na żywo.",
    "openLink": "Otwórz źródło",
    "historySaved": "Zapisano lokalnie na tym urządzeniu",
    "untitled": "Nowa rozmowa",
    "document": "Dokument",
    "close": "Zamknij",
    "avatarLabel": "Awatar Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Maks. 4 MB"
  },
  "el": {
    "status": "Σε σύνδεση τώρα",
    "newChat": "Νέα συνομιλία",
    "chooseLanguage": "Επιλογή γλώσσας",
    "searchLanguage": "Αναζήτηση γλωσσών...",
    "placeholder": "Πληκτρολογήστε το μήνυμά σας...",
    "send": "Αποστολή",
    "attach": "Επισύναψη",
    "remove": "Αφαίρεση",
    "sources": "Πηγές",
    "thinking": "Σκέφτομαι...",
    "welcomeTitle": "Γεια! Είμαι το Alaa AI",
    "welcomeBody": "Ρωτήστε με οτιδήποτε ή επισυνάψτε μια εικόνα ή ένα έγγραφο για να σας βοηθήσω να το κατανοήσετε.",
    "describeImage": "Περιγράψτε αυτή την εικόνα και εξηγήστε τι φαίνεται σε αυτήν.",
    "history": "Ιστορικό συνομιλιών",
    "emptyHistory": "Δεν υπάρχουν ακόμη αποθηκευμένες συνομιλίες.",
    "deleteChat": "Διαγραφή συνομιλίας",
    "openHistory": "Εμφάνιση ιστορικού συνομιλιών",
    "choosePhoto": "Επιλογή φωτογραφίας",
    "chooseFile": "Επισύναψη αρχείου Word, PDF ή TXT",
    "attachedFile": "Συνημμένο αρχείο",
    "uploading": "Προετοιμασία αρχείου...",
    "imageTooLarge": "Η εικόνα υπερβαίνει τα 4 MB.",
    "fileTooLarge": "Το αρχείο υπερβαίνει τα 4 MB.",
    "unsupportedImage": "Μη υποστηριζόμενη μορφή εικόνας. Χρησιμοποιήστε JPG, PNG ή WebP.",
    "fileUnsupported": "Μη υποστηριζόμενο αρχείο. Χρησιμοποιήστε DOCX, PDF ή TXT.",
    "fileUploadError": "Δεν ήταν δυνατή η ανάγνωση του αρχείου. Ελέγξτε αν ο διακομιστής υποστηρίζει το /upload.",
    "imagePickFailed": "Δεν ήταν δυνατή η επιλογή εικόνας. Δοκιμάστε ξανά.",
    "networkError": "Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο.",
    "serverError": "Δεν ήταν δυνατή η λήψη απάντησης. Δοκιμάστε ξανά.",
    "quotaError": "Έχει επιτευχθεί το όριο χρήσης AI.",
    "noLanguages": "Δεν βρέθηκαν γλώσσες.",
    "notVerified": "Αυτή η απάντηση δεν επαληθεύτηκε με ζωντανή αναζήτηση στον ιστό.",
    "openLink": "Άνοιγμα πηγής",
    "historySaved": "Αποθηκεύτηκε τοπικά σε αυτήν τη συσκευή",
    "untitled": "Νέα συνομιλία",
    "document": "Έγγραφο",
    "close": "Κλείσιμο",
    "avatarLabel": "Άβαταρ Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Μέγιστο 4 MB"
  },
  "ro": {
    "status": "Online acum",
    "newChat": "Chat nou",
    "chooseLanguage": "Alege limba",
    "searchLanguage": "Caută limbi...",
    "placeholder": "Scrie mesajul...",
    "send": "Trimite",
    "attach": "Atașează",
    "remove": "Elimină",
    "sources": "Surse",
    "thinking": "Se gândește...",
    "welcomeTitle": "Salut! Sunt Alaa AI",
    "welcomeBody": "Întreabă-mă orice sau atașează o imagine ori un document pentru a te ajuta să-l înțelegi.",
    "describeImage": "Descrie această imagine și explică ce se vede în ea.",
    "history": "Istoricul conversațiilor",
    "emptyHistory": "Nu există încă conversații salvate.",
    "deleteChat": "Șterge conversația",
    "openHistory": "Afișează istoricul conversațiilor",
    "choosePhoto": "Alege o fotografie",
    "chooseFile": "Atașează un fișier Word, PDF sau TXT",
    "attachedFile": "Fișier atașat",
    "uploading": "Se pregătește fișierul...",
    "imageTooLarge": "Imaginea depășește 4 MB.",
    "fileTooLarge": "Fișierul depășește 4 MB.",
    "unsupportedImage": "Format de imagine neacceptat. Folosește JPG, PNG sau WebP.",
    "fileUnsupported": "Fișier neacceptat. Folosește DOCX, PDF sau TXT.",
    "fileUploadError": "Fișierul nu a putut fi citit. Verifică dacă serverul acceptă /upload.",
    "imagePickFailed": "Imaginea nu a putut fi selectată. Încearcă din nou.",
    "networkError": "Conectarea la server a eșuat. Verifică conexiunea la internet.",
    "serverError": "Nu s-a putut obține un răspuns. Încearcă din nou.",
    "quotaError": "Limita de utilizare AI a fost atinsă.",
    "noLanguages": "Nu s-au găsit limbi.",
    "notVerified": "Acest răspuns nu a fost verificat printr-o căutare web în timp real.",
    "openLink": "Deschide sursa",
    "historySaved": "Salvat local pe acest dispozitiv",
    "untitled": "Conversație nouă",
    "document": "Document",
    "close": "Închide",
    "avatarLabel": "Avatar Alaa AI",
    "fileNote": "DOCX · PDF · TXT · Maximum 4 MB"
  }
};

function getTranslation(language) {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeSourceUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    // تجاهل الروابط غير الصالحة.
  }

  return null;
}

function getConversationTitle(messages, labels) {
  const firstUserMessage = messages.find(
    (message) => message.role === "user"
  );

  if (!firstUserMessage) {
    return labels.untitled;
  }

  const title =
    firstUserMessage.fileName ||
    firstUserMessage.text ||
    labels.untitled;

  return String(title).replace(/\s+/g, " ").trim().slice(0, 42);
}

function getMimeFromExtension(name) {
  const ext = String(name || "").split(".").pop().toLowerCase();

  if (ext === "pdf") return "application/pdf";

  if (ext === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (ext === "txt") return "text/plain";

  return "application/octet-stream";
}

function cleanMessagesForStorage(messages) {
  return (Array.isArray(messages) ? messages : [])
    .slice(-MAX_STORED_MESSAGES)
    .map((message) => {
      const copy = { ...message };

      // لا نخزن بيانات الصورة الكبيرة داخل سجل المحادثات.
      delete copy.imageBase64;

      // روابط صور الويب المؤقتة لن تبقى صالحة بعد تحديث الصفحة.
      if (
        typeof copy.imageUri === "string" &&
        copy.imageUri.startsWith("blob:")
      ) {
        copy.imageUri = null;
      }

      if (typeof copy.documentContext === "string") {
        copy.documentContext = copy.documentContext.slice(
          0,
          MAX_EXTRACTED_TEXT
        );
      }

      return copy;
    });
}

export default function App() {
  const { width } = useWindowDimensions();
  const showDesktopHistory = width >= 900;

  const [language, setLanguage] = React.useState("ar");
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [languageQuery, setLanguageQuery] = React.useState("");

  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");

  const [pendingImage, setPendingImage] = React.useState(null);
  const [pendingFile, setPendingFile] = React.useState(null);

  const [attachmentMenuVisible, setAttachmentMenuVisible] = React.useState(false);
  const [historyModalVisible, setHistoryModalVisible] = React.useState(false);

  const [conversations, setConversations] = React.useState([]);
  const [activeConversationId, setActiveConversationId] = React.useState(null);
  const [historyReady, setHistoryReady] = React.useState(false);

  const [attachmentError, setAttachmentError] = React.useState("");
  const [networkError, setNetworkError] = React.useState("");

  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const scrollRef = React.useRef(null);

  const t = getTranslation(language);

  const labels = {
    ...TRANSLATIONS.en,
    ...t,
    history: t.history || TRANSLATIONS.en.history,
    emptyHistory: t.emptyHistory || TRANSLATIONS.en.emptyHistory,
    deleteChat: t.deleteChat || TRANSLATIONS.en.deleteChat,
    openHistory: t.openHistory || TRANSLATIONS.en.openHistory,
    choosePhoto: t.choosePhoto || TRANSLATIONS.en.choosePhoto,
    chooseFile: t.chooseFile || TRANSLATIONS.en.chooseFile,
    attachedFile: t.attachedFile || TRANSLATIONS.en.attachedFile,
    uploading: t.uploading || TRANSLATIONS.en.uploading,
    fileTooLarge: t.fileTooLarge || TRANSLATIONS.en.fileTooLarge,
    fileUnsupported: t.fileUnsupported || TRANSLATIONS.en.fileUnsupported,
    fileUploadError: t.fileUploadError || TRANSLATIONS.en.fileUploadError,
    historySaved: t.historySaved || TRANSLATIONS.en.historySaved,
    untitled: t.untitled || TRANSLATIONS.en.untitled,
  };

  const selectedLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  const isRTL = selectedLanguage.rtl;
  const textAlignment = isRTL ? "right" : "left";
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");

  React.useEffect(() => {
    let mounted = true;

    async function loadSavedData() {
      try {
        const [savedLanguage, savedHistory, savedActiveId] =
          await Promise.all([
            AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
            AsyncStorage.getItem(CHATS_STORAGE_KEY),
            AsyncStorage.getItem(ACTIVE_CHAT_STORAGE_KEY),
          ]);

        if (!mounted) return;

        if (LANGUAGES.some((item) => item.code === savedLanguage)) {
          setLanguage(savedLanguage);
        }

        let parsedHistory = [];

        try {
          const parsed = JSON.parse(savedHistory || "[]");

          if (Array.isArray(parsed)) {
            parsedHistory = parsed;
          }
        } catch {
          parsedHistory = [];
        }

        parsedHistory = parsedHistory
          .filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              Array.isArray(item.messages)
          )
          .map((item) => ({
            id: item.id,
            title: item.title || labels.untitled,
            createdAt: Number(item.createdAt) || Date.now(),
            updatedAt: Number(item.updatedAt) || Date.now(),
            messages: cleanMessagesForStorage(item.messages),
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, MAX_STORED_CHATS);

        setConversations(parsedHistory);

        const active = parsedHistory.find(
          (item) => item.id === savedActiveId
        );

        if (active) {
          setActiveConversationId(active.id);
          setMessages(active.messages);
        }
      } catch {
        // تظل المحادثة قابلة للاستخدام حتى لو تعذر تحميل السجل.
      } finally {
        if (mounted) {
          setHistoryReady(true);
        }
      }
    }

    loadSavedData();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!historyReady) return;

    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {});
  }, [language, historyReady]);

  React.useEffect(() => {
    if (!historyReady) return;

    AsyncStorage.setItem(
      CHATS_STORAGE_KEY,
      JSON.stringify(conversations.slice(0, MAX_STORED_CHATS))
    ).catch(() => {});
  }, [conversations, historyReady]);

  React.useEffect(() => {
    if (!historyReady) return;

    if (activeConversationId) {
      AsyncStorage.setItem(
        ACTIVE_CHAT_STORAGE_KEY,
        activeConversationId
      ).catch(() => {});
    } else {
      AsyncStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY).catch(() => {});
    }
  }, [activeConversationId, historyReady]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  React.useEffect(() => {
    if (!historyReady || !activeConversationId || messages.length === 0) {
      return;
    }

    const savedMessages = cleanMessagesForStorage(messages);
    const now = Date.now();

    setConversations((previous) => {
      const existing = previous.find(
        (item) => item.id === activeConversationId
      );

      const updatedConversation = {
        id: activeConversationId,
        title: getConversationTitle(savedMessages, labels),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        messages: savedMessages,
      };

      return [
        updatedConversation,
        ...previous.filter((item) => item.id !== activeConversationId),
      ]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_STORED_CHATS);
    });
  }, [messages, activeConversationId, historyReady, language]);

  const filteredLanguages = React.useMemo(() => {
    const query = languageQuery.trim().toLocaleLowerCase();

    if (!query) return LANGUAGES;

    return LANGUAGES.filter((item) =>
      `${item.name} ${item.code}`.toLocaleLowerCase().includes(query)
    );
  }, [languageQuery]);

  async function chooseLanguage(code) {
    setLanguage(code);
    setLanguageModalVisible(false);
    setLanguageQuery("");
    setAttachmentError("");
    setNetworkError("");

    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // يستمر اختيار اللغة حتى لو تعذر حفظه.
    }
  }

  async function pickImage() {
    setAttachmentMenuVisible(false);
    setAttachmentError("");
    setNetworkError("");

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
        setAttachmentError(t.imagePickFailed);
        return;
      }

      const mimeType =
        asset.mimeType ||
        (/\.png$/i.test(asset.fileName || "")
          ? "image/png"
          : /\.webp$/i.test(asset.fileName || "")
          ? "image/webp"
          : "image/jpeg");

      if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
        setAttachmentError(t.unsupportedImage);
        return;
      }

      if (
        (typeof asset.fileSize === "number" &&
          asset.fileSize > MAX_IMAGE_BYTES) ||
        asset.base64.length > MAX_IMAGE_BASE64_LENGTH
      ) {
        setAttachmentError(t.imageTooLarge);
        return;
      }

      setPendingImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType,
        name: asset.fileName || "image",
      });

      setPendingFile(null);
    } catch {
      setAttachmentError(t.imagePickFailed);
    }
  }

  async function pickDocument() {
    setAttachmentMenuVisible(false);
    setAttachmentError("");
    setNetworkError("");

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri || !asset?.name) {
        setAttachmentError(labels.fileUploadError);
        return;
      }

      const extension = asset.name.split(".").pop()?.toLowerCase();

      if (!["pdf", "docx", "txt"].includes(extension)) {
        setAttachmentError(labels.fileUnsupported);
        return;
      }

      if (
        typeof asset.size === "number" &&
        asset.size > MAX_FILE_BYTES
      ) {
        setAttachmentError(labels.fileTooLarge);
        return;
      }

      setUploadingFile(true);

      const form = new FormData();
      const mimeType = asset.mimeType || getMimeFromExtension(asset.name);

      if (Platform.OS === "web") {
        let browserFile = asset.file;

        if (!browserFile) {
          const fileResponse = await fetch(asset.uri);
          browserFile = await fileResponse.blob();
        }

        form.append("file", browserFile, asset.name);
      } else {
        form.append("file", {
          uri: asset.uri,
          name: asset.name,
          type: mimeType,
        });
      }

      const response = await fetch(`${baseUrl}/upload`, {
        method: "POST",
        body: form,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || labels.fileUploadError);
      }

      const extractedText =
        data.text ||
        data.extractedText ||
        data.extracted_text ||
        data.content ||
        data.document?.text ||
        data.data?.text;

      if (
        typeof extractedText !== "string" ||
        !extractedText.trim()
      ) {
        throw new Error(labels.fileUploadError);
      }

      setPendingFile({
        name: data.name || data.filename || asset.name,
        mimeType,
        size: asset.size || null,
        extractedText: extractedText.slice(0, MAX_EXTRACTED_TEXT),
      });

      setPendingImage(null);
    } catch (err) {
      setAttachmentError(err?.message || labels.fileUploadError);
    } finally {
      setUploadingFile(false);
    }
  }

  async function openSource(rawUrl) {
    const url = safeSourceUrl(rawUrl);

    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch {
      setNetworkError(t.serverError);
    }
  }

  function openConversation(conversation) {
    setActiveConversationId(conversation.id);
    setMessages(cleanMessagesForStorage(conversation.messages));
    setInput("");
    setPendingImage(null);
    setPendingFile(null);
    setAttachmentError("");
    setNetworkError("");
    setHistoryModalVisible(false);
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setPendingImage(null);
    setPendingFile(null);
    setAttachmentError("");
    setNetworkError("");
    setHistoryModalVisible(false);
  }

  function deleteConversation(id) {
    setConversations((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
      setInput("");
      setPendingImage(null);
      setPendingFile(null);
    }
  }

  async function sendMessage() {
    const typedText = input.trim();

    if (
      (!typedText && !pendingImage && !pendingFile) ||
      loading ||
      uploadingFile
    ) {
      return;
    }

    const conversationId = activeConversationId || makeId();

    const displayText =
      typedText ||
      (pendingFile
        ? `${labels.attachedFile}: ${pendingFile.name}`
        : t.describeImage);

    const userMessage = {
      id: makeId(),
      role: "user",
      text: displayText,
      imageUri: pendingImage?.uri || null,
      imageName: pendingImage?.name || null,
      imageBase64: pendingImage?.base64 || null,
      mimeType: pendingImage?.mimeType || null,
      fileName: pendingFile?.name || null,
      fileMimeType: pendingFile?.mimeType || null,
      documentContext: pendingFile?.extractedText || null,
      sources: [],
    };

    const updatedMessages = [...messages, userMessage];

    setActiveConversationId(conversationId);
    setMessages(updatedMessages);
    setInput("");
    setPendingImage(null);
    setPendingFile(null);
    setAttachmentError("");
    setNetworkError("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(-12);

      let lastImageIndex = -1;

      history.forEach((item, index) => {
        if (item.imageBase64) {
          lastImageIndex = index;
        }
      });

      const apiMessages = history.map((item, index) => {
        let content = item.text || "";

        if (item.documentContext) {
          content +=
            `\n\n[Extracted text from attached file: ${item.fileName || "document"}]\n` +
            item.documentContext;
        }

        return {
          role: item.role,
          content,
          ...(item.imageBase64 && index === lastImageIndex
            ? {
                imageBase64: item.imageBase64,
                mimeType: item.mimeType,
              }
            : {}),
        };
      });

      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          language,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(t.quotaError);
        }

        throw new Error(data.error || t.serverError);
      }

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          text:
            typeof data.reply === "string" ? data.reply : t.serverError,
          sources: Array.isArray(data.sources) ? data.sources : [],
          searched: Boolean(data.searched),
          searchNotice:
            typeof data.searchNotice === "string" ? data.searchNotice : "",
        },
      ]);
    } catch (err) {
      setNetworkError(err?.message || t.networkError);
    } finally {
      setLoading(false);
    }
  }

  const historyPanel = (
    <View
      style={[
        styles.historySidebar,
        !showDesktopHistory && styles.mobileHistoryPanel,
      ]}
    >
      <View style={styles.historyHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.historyTitle}>{labels.history}</Text>
          <Text style={styles.historySubtitle}>
            {labels.historySaved}
          </Text>
        </View>

        {!showDesktopHistory && (
          <Pressable
            onPress={() => setHistoryModalVisible(false)}
            style={styles.closeHistoryButton}
          >
            <Text style={styles.closeHistoryText}>×</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.newChatButton} onPress={startNewChat}>
        <Text style={styles.newChatButtonText}>
          ＋ {t.newChat}
        </Text>
      </Pressable>

      <ScrollView
        style={styles.historyList}
        contentContainerStyle={styles.historyListContent}
      >
        {conversations.length === 0 ? (
          <Text style={styles.emptyHistory}>
            {labels.emptyHistory}
          </Text>
        ) : (
          conversations
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((conversation) => {
              const previewMessage = [
                ...(conversation.messages || []),
              ]
                .reverse()
                .find((item) => item.role === "user");

              const preview =
                conversation.title ||
                previewMessage?.text ||
                labels.untitled;

              return (
                <View
                  key={conversation.id}
                  style={[
                    styles.historyItem,
                    conversation.id === activeConversationId &&
                      styles.historyItemActive,
                  ]}
                >
                  <Pressable
                    style={styles.historyItemOpen}
                    onPress={() => openConversation(conversation)}
                    accessibilityRole="button"
                  >
                    <Text
                      style={styles.historyItemTitle}
                      numberOfLines={1}
                    >
                      {preview}
                    </Text>

                    <Text
                      style={styles.historyItemPreview}
                      numberOfLines={2}
                    >
                      {previewMessage?.text || labels.untitled}
                    </Text>

                    {previewMessage?.fileName ? (
                      <Text style={styles.historyAttachment}>
                        📎 {previewMessage.fileName}
                      </Text>
                    ) : null}
                  </Pressable>

                  <Pressable
                    style={styles.deleteChatButton}
                    onPress={() => deleteConversation(conversation.id)}
                    accessibilityRole="button"
                    accessibilityLabel={labels.deleteChat}
                  >
                    <Text style={styles.deleteChatText}>×</Text>
                  </Pressable>
                </View>
              );
            })
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.workspace}>
        <View style={styles.chatColumn}>
          <View
            style={[
              styles.header,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <View
              style={[
                styles.brandBlock,
                {
                  alignItems: isRTL ? "flex-end" : "flex-start",
                },
              ]}
            >
              <View style={styles.brandLine}>
                {/* شعار AI بجانب اسم Alaa :) */}
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>AI</Text>
                </View>

                <Text style={styles.logo}>Alaa :)</Text>
              </View>

              <View
                style={[
                  styles.statusRow,
                  {
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                ]}
              >
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>{t.status}</Text>
              </View>
            </View>

            <View
              style={[
                styles.headerActions,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              {!showDesktopHistory && (
                <Pressable
                  style={styles.headerButton}
                  onPress={() => setHistoryModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={labels.openHistory}
                >
                  <Text style={styles.headerButtonIcon}>☷</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.headerButton}
                onPress={() => setLanguageModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t.chooseLanguage}
              >
                <Text style={styles.headerButtonIcon}>🌐</Text>
                <Text style={styles.headerButtonText}>
                  {selectedLanguage.code.toUpperCase()}
                </Text>
              </Pressable>

              <Pressable
                style={styles.headerButton}
                onPress={startNewChat}
                accessibilityRole="button"
              >
                <Text style={styles.headerButtonIcon}>＋</Text>
                <Text style={styles.headerButtonText}>
                  {t.newChat}
                </Text>
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
                  {/* صورة الشاب الكرتونية بدل النجمة */}
                  <Image
                    source={require("./assets/alaa-ai-avatar.png")}
                    style={styles.welcomeAvatar}
                    resizeMode="cover"
                    accessibilityLabel={t.avatarLabel}
                  />

                  <Text
                    style={[
                      styles.welcomeTitle,
                      { textAlign: textAlignment },
                    ]}
                  >
                    {t.welcomeTitle}
                  </Text>

                  <Text
                    style={[
                      styles.welcomeBody,
                      { textAlign: textAlignment },
                    ]}
                  >
                    {t.welcomeBody}
                  </Text>
                </View>
              )}

              {messages.map((item) => {
                const isUser = item.role === "user";

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageRow,
                      {
                        justifyContent: isUser
                          ? "flex-end"
                          : "flex-start",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                      ]}
                    >
                      {!!item.imageUri && (
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.chatImage}
                          resizeMode="cover"
                          accessibilityLabel={t.attach}
                        />
                      )}

                      {!!item.imageName && !item.imageUri && (
                        <View style={styles.messageFileCard}>
                          <Text style={styles.messageFileIcon}>🖼️</Text>

                          <View style={styles.messageFileTextArea}>
                            <Text
                              style={styles.messageFileName}
                              numberOfLines={2}
                            >
                              {item.imageName}
                            </Text>

                            <Text style={styles.messageFileType}>
                              {t.attach}
                            </Text>
                          </View>
                        </View>
                      )}

                      {!!item.fileName && (
                        <View style={styles.messageFileCard}>
                          <Text style={styles.messageFileIcon}>📄</Text>

                          <View style={styles.messageFileTextArea}>
                            <Text
                              style={styles.messageFileName}
                              numberOfLines={2}
                            >
                              {item.fileName}
                            </Text>

                            <Text style={styles.messageFileType}>
                              {item.fileMimeType || t.document}
                            </Text>
                          </View>
                        </View>
                      )}

                      {!!item.text && (
                        <Text
                          selectable
                          style={[
                            styles.messageText,
                            {
                              textAlign: textAlignment,
                              writingDirection: isRTL ? "rtl" : "ltr",
                            },
                          ]}
                        >
                          {item.text}
                        </Text>
                      )}

                      {!isUser &&
                        Array.isArray(item.sources) &&
                        item.sources.length > 0 && (
                          <View style={styles.sourcesBlock}>
                            <Text
                              style={[
                                styles.sourcesTitle,
                                { textAlign: textAlignment },
                              ]}
                            >
                              {t.sources}
                            </Text>

                            {item.sources.map((source, index) => {
                              const url = safeSourceUrl(source?.url);

                              if (!url) return null;

                              return (
                                <Pressable
                                  key={`${url}-${index}`}
                                  onPress={() => openSource(url)}
                                  style={[
                                    styles.sourceLink,
                                    {
                                      flexDirection: isRTL
                                        ? "row-reverse"
                                        : "row",
                                    },
                                  ]}
                                  accessibilityRole="link"
                                  accessibilityLabel={`${t.openLink}: ${
                                    source.title || url
                                  }`}
                                >
                                  <Text style={styles.sourceIcon}>↗</Text>

                                  <Text
                                    style={[
                                      styles.sourceText,
                                      { textAlign: textAlignment },
                                    ]}
                                  >
                                    {source.title || url}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        )}

                      {!isUser &&
                      item.searched === false &&
                      item.searchNotice ? (
                        <Text
                          style={[
                            styles.noticeText,
                            { textAlign: textAlignment },
                          ]}
                        >
                          {t.notVerified}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}

              {(loading || uploadingFile) && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#B9A0FF" />
                  <Text style={styles.loadingText}>
                    {uploadingFile ? labels.uploading : t.thinking}
                  </Text>
                </View>
              )}
            </ScrollView>

            {!!networkError && (
              <View style={styles.errorBanner}>
                <Text
                  style={[
                    styles.errorText,
                    { textAlign: textAlignment },
                  ]}
                >
                  {networkError}
                </Text>

                <Pressable onPress={() => setNetworkError("")}>
                  <Text style={styles.errorDismiss}>×</Text>
                </Pressable>
              </View>
            )}

            {!!attachmentError && (
              <View style={styles.errorBanner}>
                <Text
                  style={[
                    styles.errorText,
                    { textAlign: textAlignment },
                  ]}
                >
                  {attachmentError}
                </Text>

                <Pressable onPress={() => setAttachmentError("")}>
                  <Text style={styles.errorDismiss}>×</Text>
                </Pressable>
              </View>
            )}

            {!!pendingImage && (
              <View
                style={[
                  styles.pendingAttachmentBar,
                  {
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                ]}
              >
                <Image
                  source={{ uri: pendingImage.uri }}
                  style={styles.pendingImage}
                  resizeMode="cover"
                />

                <Text
                  style={[
                    styles.pendingLabel,
                    { textAlign: textAlignment },
                  ]}
                >
                  {pendingImage.name || t.attach}
                </Text>

                <Pressable
                  onPress={() => setPendingImage(null)}
                  accessibilityRole="button"
                  accessibilityLabel={t.remove}
                  style={styles.removeAttachmentButton}
                >
                  <Text style={styles.removeAttachmentText}>×</Text>
                </Pressable>
              </View>
            )}

            {!!pendingFile && (
              <View
                style={[
                  styles.pendingAttachmentBar,
                  {
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                ]}
              >
                <View style={styles.pendingFileIconBox}>
                  <Text style={styles.pendingFileIcon}>📄</Text>
                </View>

                <View style={styles.pendingFileTextArea}>
                  <Text
                    style={[
                      styles.pendingLabel,
                      { textAlign: textAlignment },
                    ]}
                    numberOfLines={1}
                  >
                    {pendingFile.name}
                  </Text>

                  <Text style={styles.pendingFileSubLabel}>
                    {labels.attachedFile}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setPendingFile(null)}
                  accessibilityRole="button"
                  accessibilityLabel={t.remove}
                  style={styles.removeAttachmentButton}
                >
                  <Text style={styles.removeAttachmentText}>×</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.composerOuter}>
              <View
                style={[
                  styles.composer,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Pressable
                  style={styles.attachButton}
                  onPress={() => setAttachmentMenuVisible(true)}
                  disabled={loading || uploadingFile}
                  accessibilityRole="button"
                  accessibilityLabel={labels.chooseFile}
                >
                  <Text style={styles.attachIcon}>＋</Text>
                </Pressable>

                <TextInput
                  style={[
                    styles.input,
                    {
                      textAlign: textAlignment,
                      writingDirection: isRTL ? "rtl" : "ltr",
                    },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder={t.placeholder}
                  placeholderTextColor="#9097B2"
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  editable={!loading && !uploadingFile}
                  accessibilityLabel={t.placeholder}
                />

                <Pressable
                  style={[
                    styles.sendButton,
                    (loading || uploadingFile) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={sendMessage}
                  disabled={
                    loading ||
                    uploadingFile ||
                    (!input.trim() && !pendingImage && !pendingFile)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t.send}
                >
                  <Text style={styles.sendIcon}>➤</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>

        {showDesktopHistory && historyPanel}
      </View>

      {!showDesktopHistory && (
        <Modal
          visible={historyModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setHistoryModalVisible(false)}
        >
          <View style={styles.drawerBackdrop}>
            <Pressable
              style={styles.drawerScrim}
              onPress={() => setHistoryModalVisible(false)}
            />

            {historyPanel}
          </View>
        </Modal>
      )}

      <Modal
        visible={attachmentMenuVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAttachmentMenuVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAttachmentMenuVisible(false)}
          />

          <View style={styles.optionModal}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>{labels.attachedFile}</Text>

              <Pressable
                onPress={() => setAttachmentMenuVisible(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalText}>×</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.attachmentOption}
              onPress={pickImage}
            >
              <Text style={styles.attachmentOptionIcon}>🖼️</Text>
              <Text style={styles.attachmentOptionText}>
                {labels.choosePhoto}
              </Text>
            </Pressable>

            <Pressable
              style={styles.attachmentOption}
              onPress={pickDocument}
            >
              <Text style={styles.attachmentOptionIcon}>📄</Text>
              <Text style={styles.attachmentOptionText}>
                {labels.chooseFile}
              </Text>
            </Pressable>

            <Text style={styles.fileNote}>
              {t.fileNote}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={languageModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setLanguageModalVisible(false)}
          />

          <View style={styles.languageModal}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>{t.chooseLanguage}</Text>

              <Pressable
                onPress={() => setLanguageModalVisible(false)}
                style={styles.closeModalButton}
                accessibilityLabel={t.close}
              >
                <Text style={styles.closeModalText}>×</Text>
              </Pressable>
            </View>

            <TextInput
              value={languageQuery}
              onChangeText={setLanguageQuery}
              placeholder={t.searchLanguage}
              placeholderTextColor="#9097B2"
              style={[
                styles.languageSearch,
                { textAlign: textAlignment },
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
                  onPress={() => chooseLanguage(item.code)}
                  style={[
                    styles.languageItem,
                    item.code === language && styles.languageItemSelected,
                    {
                      flexDirection: item.rtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Text style={styles.languageName}>{item.name}</Text>

                  <Text style={styles.languageCode}>
                    {item.code === language
                      ? "✓"
                      : item.code.toUpperCase()}
                  </Text>
                </Pressable>
              ))}

              {filteredLanguages.length === 0 && (
                <Text style={styles.noLanguages}>
                  {t.noLanguages}
                </Text>
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
  workspace: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#090D1B",
  },
  chatColumn: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#090D1B",
  },
  header: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#252B45",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandBlock: {
    flex: 1,
  },
  brandLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // تصميم شعار AI الجديد
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7662F0",
    borderWidth: 1,
    borderColor: "#A394FF",
    shadowColor: "#7662F0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logo: {
    color: "#C4B2FF",
    fontWeight: "800",
    fontSize: 24,
    letterSpacing: 0.3,
  },
  statusRow: {
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#54D6A1",
  },
  statusText: {
    color: "#A9F0D0",
    fontSize: 12,
  },
  headerActions: {
    alignItems: "center",
    gap: 7,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderColor: "#303654",
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: "#151A30",
  },
  headerButtonIcon: {
    fontSize: 16,
    color: "#D9D0FF",
  },
  headerButtonText: {
    color: "#E8E9F6",
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
  welcomeCard: {
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    marginTop: 45,
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2B3150",
    backgroundColor: "#141A30",
  },
  welcomeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#7662F0",
    backgroundColor: "#141A30",
    alignSelf: "center",
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
    marginBottom: 13,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    gap: 8,
  },
  userBubble: {
    backgroundColor: "#6655E8",
    borderColor: "#7869F1",
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: "#1B223B",
    borderColor: "#2A3150",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    color: "#F8F8FF",
    fontSize: 15,
    lineHeight: 23,
    writingDirection: "auto",
  },
  chatImage: {
    width: 240,
    height: 240,
    borderRadius: 13,
    marginBottom: 8,
    backgroundColor: "#0F1426",
  },
  messageFileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 175,
    maxWidth: 280,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(9,13,27,0.35)",
  },
  messageFileIcon: {
    fontSize: 25,
  },
  messageFileTextArea: {
    flex: 1,
    minWidth: 0,
  },
  messageFileName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  messageFileType: {
    color: "#D3D5E9",
    fontSize: 10,
    marginTop: 3,
  },
  sourcesBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#373F61",
    gap: 7,
  },
  sourcesTitle: {
    color: "#D6CAFF",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 3,
  },
  sourceLink: {
    alignItems: "center",
    gap: 7,
    backgroundColor: "#10162A",
    borderRadius: 9,
    padding: 9,
  },
  sourceIcon: {
    color: "#AFA0FF",
    fontSize: 16,
  },
  sourceText: {
    color: "#C7BCFF",
    textDecorationLine: "underline",
    fontSize: 13,
    flexShrink: 1,
  },
  noticeText: {
    color: "#B7BDD1",
    fontSize: 11,
    marginTop: 9,
    lineHeight: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  loadingText: {
    color: "#C8CBE0",
    fontSize: 13,
  },
  errorBanner: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#3A1D30",
    borderWidth: 1,
    borderColor: "#8D355D",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  errorText: {
    flex: 1,
    color: "#FFD6E7",
    fontSize: 13,
    lineHeight: 19,
  },
  errorDismiss: {
    color: "#FFD6E7",
    fontSize: 22,
    paddingHorizontal: 5,
  },
  pendingAttachmentBar: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  pendingImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#1D2440",
  },
  pendingLabel: {
    flex: 1,
    color: "#DDE0F1",
    fontSize: 12,
  },
  pendingFileIconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#1D2440",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingFileIcon: {
    fontSize: 25,
  },
  pendingFileTextArea: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  pendingFileSubLabel: {
    color: "#A9F0D0",
    fontSize: 11,
  },
  removeAttachmentButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D263D",
  },
  removeAttachmentText: {
    color: "#FFD6E7",
    fontSize: 21,
    lineHeight: 24,
  },
  composerOuter: {
    padding: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#242A43",
  },
  composer: {
    alignItems: "flex-end",
    gap: 9,
    padding: 8,
    borderWidth: 1,
    borderColor: "#343A5A",
    borderRadius: 22,
    backgroundColor: "#151B31",
  },
  attachButton: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252B49",
  },
  attachIcon: {
    color: "#D4CBFF",
    fontSize: 25,
    lineHeight: 29,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 42,
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 7,
    paddingTop: 10,
    paddingBottom: 7,
  },
  sendButton: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C65F4",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  optionModal: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#141A30",
    borderRadius: 22,
    borderColor: "#353C5C",
    borderWidth: 1,
    padding: 16,
  },
  attachmentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#202641",
    marginTop: 8,
  },
  attachmentOptionIcon: {
    fontSize: 23,
  },
  attachmentOptionText: {
    color: "#F3F1FF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  fileNote: {
    color: "#8F98B8",
    fontSize: 11,
    marginTop: 13,
    textAlign: "center",
  },
  historySidebar: {
    width: 285,
    flexShrink: 0,
    height: "100%",
    padding: 15,
    backgroundColor: "#101629",
    borderLeftWidth: 1,
    borderLeftColor: "#292F4A",
  },
  mobileHistoryPanel: {
    width: "88%",
    maxWidth: 360,
    height: "100%",
    alignSelf: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: "#353C5C",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#292F4A",
  },
  historyTitle: {
    color: "#F3F1FF",
    fontSize: 18,
    fontWeight: "800",
  },
  historySubtitle: {
    color: "#878FAB",
    fontSize: 10,
    marginTop: 4,
  },
  closeHistoryButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252B49",
  },
  closeHistoryText: {
    color: "#FFFFFF",
    fontSize: 22,
  },
  newChatButton: {
    marginTop: 14,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#6D59EA",
    alignItems: "center",
  },
  newChatButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    gap: 8,
    paddingBottom: 20,
  },
  emptyHistory: {
    color: "#969EB8",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingTop: 25,
    fontSize: 13,
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#171E34",
    borderWidth: 1,
    borderColor: "#252D48",
    overflow: "hidden",
  },
  historyItemActive: {
    borderColor: "#806BFA",
    backgroundColor: "#232044",
  },
  historyItemOpen: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 11,
    gap: 5,
  },
  historyItemTitle: {
    color: "#F2F1FF",
    fontSize: 12,
    fontWeight: "700",
  },
  historyItemPreview: {
    color: "#969FBD",
    fontSize: 11,
    lineHeight: 15,
  },
  historyAttachment: {
    color: "#B9A0FF",
    fontSize: 10,
  },
  deleteChatButton: {
    alignSelf: "stretch",
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#29314B",
  },
  deleteChatText: {
    color: "#D79AB4",
    fontSize: 20,
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  drawerScrim: {
    flex: 1,
  },
  languageModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    alignSelf: "center",
    backgroundColor: "#141A30",
    borderRadius: 22,
    borderColor: "#353C5C",
    borderWidth: 1,
    padding: 16,
  },
  modalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#F3F1FF",
    fontSize: 19,
    fontWeight: "800",
  },
  closeModalButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#282E4B",
    alignItems: "center",
    justifyContent: "center",
  },
  closeModalText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 27,
  },
  languageSearch: {
    color: "#FFFFFF",
    backgroundColor: "#0D1224",
    borderColor: "#353C5C",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  languageList: {
    flexGrow: 0,
  },
  languageItem: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#262D48",
  },
  languageItemSelected: {
    backgroundColor: "#2A2450",
    borderBottomColor: "#7665D7",
  },
  languageName: {
    color: "#F0F1FC",
    fontSize: 15,
  },
  languageCode: {
    color: "#BBAEFF",
    fontSize: 12,
    fontWeight: "700",
  },
  noLanguages: {
    color: "#BDC4DC",
    textAlign: "center",
    padding: 20,
  },
});
