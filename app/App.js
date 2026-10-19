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
  ar: {
    status: "متصل الآن",
    newChat: "محادثة جديدة",
    chooseLanguage: "اختر اللغة",
    searchLanguage: "ابحث عن لغة...",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    attach: "إرفاق",
    remove: "إزالة",
    sources: "المصادر",
    thinking: "جاري التفكير...",
    welcomeTitle: "أهلًا! أنا Alaa AI",
    welcomeBody:
      "اسألني عن أي شيء، أو أرفق صورة أو ملفًا لمساعدتك في فهمه.",
    describeImage: "صف هذه الصورة واشرح ما يظهر فيها.",
    history: "سجل المحادثات",
    emptyHistory: "ما في محادثات محفوظة لسه.",
    deleteChat: "حذف المحادثة",
    openHistory: "عرض سجل المحادثات",
    choosePhoto: "اختيار صورة",
    chooseFile: "إرفاق ملف Word أو PDF أو TXT",
    attachedFile: "ملف مرفق",
    uploading: "جاري تجهيز الملف...",
    imageTooLarge: "حجم الصورة أكبر من 4 ميغابايت.",
    fileTooLarge: "حجم الملف أكبر من 4 ميغابايت.",
    unsupportedImage: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.",
    fileUnsupported: "الملف غير مدعوم. استخدم DOCX أو PDF أو TXT.",
    fileUploadError: "تعذّر قراءة الملف. تأكد أن الخادم يدعم /upload.",
    imagePickFailed: "تعذّر اختيار الصورة. حاول مرة أخرى.",
    networkError: "تعذّر الاتصال بالخادم. تحقق من الإنترنت.",
    serverError: "تعذّر الحصول على إجابة. حاول مرة أخرى.",
    quotaError: "وصلت إلى حد الاستخدام المتاح للذكاء الاصطناعي.",
    noLanguages: "لم يتم العثور على لغة.",
    notVerified: "لم يتم التحقق من هذه الإجابة عبر البحث المباشر.",
    openLink: "فتح المصدر",
    historySaved: "محفوظ محليًا على هذا الجهاز",
    untitled: "محادثة جديدة",
  },
  en: {
    status: "Online now",
    newChat: "New chat",
    chooseLanguage: "Choose language",
    searchLanguage: "Search languages...",
    placeholder: "Type your message...",
    send: "Send",
    attach: "Attach",
    remove: "Remove",
    sources: "Sources",
    thinking: "Thinking...",
    welcomeTitle: "Hi! I'm Alaa AI",
    welcomeBody:
      "Ask me anything, or attach an image or document for help understanding it.",
    describeImage: "Describe this image and explain what is shown.",
    history: "Chat history",
    emptyHistory: "No saved conversations yet.",
    deleteChat: "Delete conversation",
    openHistory: "Show chat history",
    choosePhoto: "Choose a photo",
    chooseFile: "Attach Word, PDF or TXT file",
    attachedFile: "Attached file",
    uploading: "Preparing file...",
    imageTooLarge: "The image is larger than 4 MB.",
    fileTooLarge: "The file is larger than 4 MB.",
    unsupportedImage: "Unsupported image format. Use JPG, PNG, or WebP.",
    fileUnsupported: "Unsupported file. Use DOCX, PDF or TXT.",
    fileUploadError:
      "Could not read the file. Check the server's /upload endpoint.",
    imagePickFailed: "Could not select the image. Please try again.",
    networkError:
      "Could not connect to the server. Check your internet connection.",
    serverError: "Could not get a response. Please try again.",
    quotaError: "The AI usage limit has been reached.",
    noLanguages: "No languages found.",
    notVerified: "This answer was not verified with live web search.",
    openLink: "Open source",
    historySaved: "Saved locally on this device",
    untitled: "New conversation",
  },
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

  const [language, setLanguage] = useState("ar");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [pendingImage, setPendingImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [historyReady, setHistoryReady] = useState(false);

  const [attachmentError, setAttachmentError] = useState("");
  const [networkError, setNetworkError] = useState("");

  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

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

  useEffect(() => {
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

  useEffect(() => {
    if (!historyReady) return;

    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {});
  }, [language, historyReady]);

  useEffect(() => {
    if (!historyReady) return;

    AsyncStorage.setItem(
      CHATS_STORAGE_KEY,
      JSON.stringify(conversations.slice(0, MAX_STORED_CHATS))
    ).catch(() => {});
  }, [conversations, historyReady]);

  useEffect(() => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
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

  const filteredLanguages = useMemo(() => {
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


```jsx
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
                {/* شعار AI بدل النجمة */}
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
                  {/* صورة الشاب التي أرسلتها بدل النجمة */}
                  <Image
                    source={require("./assets/alaa-ai-avatar.png")}
                    style={styles.welcomeAvatar}
                    resizeMode="cover"
                    accessibilityLabel="Alaa AI avatar"
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
                              {item.fileMimeType || "Document"}
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

              {(loading ||
