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
                {/* شعار AI الجديد بدل النجمة */}
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>AI</Text>
                </View>

                {/* اسم Alaa :) بجانب الشعار */}
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
                  <Text style={styles.welcomeSpark}>✦</Text>

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
              DOCX · PDF · TXT · Max 4 MB
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
                accessibilityLabel="Close"
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
  welcomeSpark: {
    color: "#B9A0FF",
    fontSize: 34,
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
