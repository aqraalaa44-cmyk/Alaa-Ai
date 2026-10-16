import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { API_BASE_URL } from "./src/config";

const ALAA_AVATAR = require("./assets/alaa-avatar.jpg");

const SUGGESTIONS = [
  { icon: "💡", text: "اقترح لي أفكار مشاريع تقنية مميزة" },
  { icon: "✍️", text: "اكتب لي بريد إلكتروني رسمي باللغة العربية" },
  { icon: "💻", text: "اشرح لي ما هو الذكاء الاصطناعي ببساطة" },
  { icon: "🚀", text: "كيف أبدأ في تعلم البرمجة من الصفر؟" }
];

export default function App() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      role: "assistant",
      content:
        "أهلاً وسهلاً بك! أنا علاء (Alaa :) )، مساعدك الذكي الشخصي.\nجاهز لمساعدتك في أي سؤال، فكرة، كتابة محتوى، أو برمجة. كيف بقدر أساعدك اليوم؟",
      time: getCurrentTime()
    }
  ]);

  const scrollViewRef = useRef(null);

  function getCurrentTime() {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "م" : "ص";
    const formattedH = h % 12 || 12;
    const formattedM = m < 10 ? `0${m}` : m;
    return `${formattedH}:${formattedM} ${ampm}`;
  }

  useEffect(() => {
    // تمرير تلقائي لأسفل عند إضافة رسالة جديدة
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, busy]);

  async function handleSend(customPrompt) {
    const prompt = (customPrompt || text).trim();
    if (!prompt || busy) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      time: getCurrentTime()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (!customPrompt) setText("");
    setBusy(true);

    try {
      // إرسال سياق المحادثة الأخيرة للخادم
      const payload = {
        messages: nextMessages.slice(-15).map(m => ({
          role: m.role,
          content: m.content
        }))
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `خطأ ${response.status}`);
      }

      const aiReply =
        data.reply || "عفوًا، لم أتمكن من تجهيز الرد، يرجى المحاولة ثانية.";

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiReply,
          time: getCurrentTime()
        }
      ]);
    } catch (error) {
      console.log("Connection error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "⚠️ تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم Node.js وأن عنوان السيرفر صحيح في ملف src/config.js.",
          time: getCurrentTime(),
          isError: true
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleClearChat() {
    Alert.alert(
      "بدء محادثة جديدة",
      "هل تريد مسح الرسائل الحالية والبدء من جديد؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح",
          style: "destructive",
          onPress: () => {
            setMessages([
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "أهلاً بك مجددًا! ما الذي تود التحدث بشأنه الآن؟ 😊",
                time: getCurrentTime()
              }
            ]);
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={ALAA_AVATAR} style={styles.avatar} />
          <View style={styles.statusDot} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.brandName}>Alaa :)</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI</Text>
            </View>
          </View>
          <Text style={styles.statusText}>متصل الآن • جاهز للإجابة</Text>
        </View>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearChat}
          activeOpacity={0.7}
        >
          <Text style={styles.clearBtnIcon}>↺</Text>
          <Text style={styles.clearBtnText}>جديد</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Card if only 1 initial message */}
          {messages.length <= 1 && (
            <View style={styles.welcomeHero}>
              <View style={styles.heroAvatarWrapper}>
                <Image source={ALAA_AVATAR} style={styles.heroAvatar} />
                <View style={styles.heroHalo} />
              </View>
              <Text style={styles.heroTitle}>مرحباً بك مع Alaa :)</Text>
              <Text style={styles.heroSubtitle}>
                مساعد الذكاء الاصطناعي الذكي، صُمم ليقدم لك إجابات دقيقة
                ومحادثات ملهمة.
              </Text>

              {/* Suggestions */}
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsHeader}>جرّب أن تسأل:</Text>
                {SUGGESTIONS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(item.text)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionIcon}>{item.icon}</Text>
                    <Text style={styles.suggestionText}>{item.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat Messages */}
          {messages.map((m, index) => {
            const isUser = m.role === "user";
            return (
              <View
                key={m.id || index}
                style={[
                  styles.messageRow,
                  isUser ? styles.userMessageRow : styles.aiMessageRow
                ]}
              >
                {/* AI Avatar beside AI messages */}
                {!isUser && (
                  <Image source={ALAA_AVATAR} style={styles.miniAvatar} />
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                    m.isError && styles.errorBubble
                  ]}
                >
                  {!isUser && (
                    <Text style={styles.aiSenderLabel}>علاء (Alaa)</Text>
                  )}
                  <Text
                    style={[
                      styles.bubbleText,
                      isUser ? styles.userBubbleText : styles.aiBubbleText
                    ]}
                  >
                    {m.content}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      isUser ? styles.userTimestamp : styles.aiTimestamp
                    ]}
                  >
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {busy && (
            <View style={styles.typingContainer}>
              <Image source={ALAA_AVATAR} style={styles.miniAvatar} />
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#0EA5E9" />
                <Text style={styles.typingText}>علاء يفكّر في الإجابة...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Composer */}
        <View style={styles.composerWrapper}>
          <View style={styles.composerContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="اكتب رسالتك إلى علاء..."
              placeholderTextColor="#64748B"
              multiline
              maxLength={4000}
              textAlign="right"
              editable={!busy}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!text.trim() || busy) && styles.sendButtonDisabled
              ]}
              onPress={() => handleSend()}
              disabled={!text.trim() || busy}
              activeOpacity={0.8}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimerText}>
            Alaa AI مدعوم بالذكاء الاصطناعي • راجع المعلومات المهمة
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0F16" // لون خلفية مظلم وفخم مقتبس من خلفية الصورة
  },
  flex: {
    flex: 1
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111823",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B"
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#0EA5E9" // حلقة تركوازية متناسقة مع صورة علاء
  },
  statusDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#111823"
  },
  headerInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  brandName: {
    color: "#F8FAFC",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 0.3
  },
  badge: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800"
  },
  statusText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4
  },
  clearBtnIcon: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "bold"
  },
  clearBtnText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600"
  },

  // Messages Area
  messagesContainer: {
    padding: 16,
    paddingBottom: 20
  },

  // Welcome Hero
  welcomeHero: {
    alignItems: "center",
    marginVertical: 18,
    paddingHorizontal: 12
  },
  heroAvatarWrapper: {
    position: "relative",
    marginBottom: 14
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#0EA5E9"
  },
  heroHalo: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.35)",
    top: -7,
    left: -7
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center"
  },
  heroSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "85%",
    marginBottom: 20
  },

  // Suggestion Chips
  suggestionsContainer: {
    width: "100%",
    gap: 8,
    marginTop: 6
  },
  suggestionsHeader: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "right",
    paddingHorizontal: 4
  },
  suggestionChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#131C28",
    borderWidth: 1,
    borderColor: "#1E2C3D",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 10
  },
  suggestionIcon: {
    fontSize: 16
  },
  suggestionText: {
    color: "#CBD5E1",
    fontSize: 13,
    flex: 1,
    textAlign: "right"
  },

  // Message Bubbles
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16
  },
  userMessageRow: {
    justifyContent: "flex-end"
  },
  aiMessageRow: {
    justifyContent: "flex-start"
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#0EA5E9"
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18
  },
  userBubble: {
    backgroundColor: "#0284C7", // أزرق مائل للتركواز أنيق جداً وواضح
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: "#141D29", // رمادي كحلي داكن راقٍ
    borderWidth: 1,
    borderColor: "#1E2B3C",
    borderBottomLeftRadius: 4
  },
  errorBubble: {
    borderColor: "#EF4444",
    backgroundColor: "#241419"
  },
  aiSenderLabel: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    textAlign: "right"
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "right"
  },
  userBubbleText: {
    color: "#FFFFFF",
    fontWeight: "500"
  },
  aiBubbleText: {
    color: "#F1F5F9"
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    textAlign: "left"
  },
  userTimestamp: {
    color: "#BAE6FD"
  },
  aiTimestamp: {
    color: "#64748B"
  },

  // Typing state
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  typingBubble: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#141D29",
    borderWidth: 1,
    borderColor: "#1E2B3C",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    gap: 8
  },
  typingText: {
    color: "#94A3B8",
    fontSize: 12
  },

  // Input Composer
  composerWrapper: {
    backgroundColor: "#0D141F",
    borderTopWidth: 1,
    borderTopColor: "#1A2535",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 18 : 10
  },
  composerContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    backgroundColor: "#131C28",
    borderWidth: 1,
    borderColor: "#1E2D3F",
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#F8FAFC",
    fontSize: 15,
    textAlign: "right"
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center"
  },
  sendButtonDisabled: {
    backgroundColor: "#1E293B",
    opacity: 0.5
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    transform: [{ rotate: "180deg" }] // اتجاه الإرسال المناسب للعربية
  },
  disclaimerText: {
    color: "#475569",
    fontSize: 10,
    textAlign: "center",
    marginTop: 6
  }
});
