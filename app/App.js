
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StyleSheet,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./src/config";

// كل لغة تحتوي ترجمة فعلية للنصوص المعروضة في هذه الشاشة.
const LANGUAGES = [
  { code: "ar", name: "العربية", rtl: true, v: ["متصل الآن","اكتب رسالتك...","إرسال","إرفاق صورة","إزالة الصورة","المصادر","محادثة جديدة","اختر اللغة","ابحث عن لغة...","جاري التفكير...","أهلًا! أنا Alaa :) كيف أقدر أساعدك؟","تعذر الاتصال بالخادم.","الصورة كبيرة جدًا. اختر صورة أصغر.","ابدأ محادثة جديدة"] },
  { code: "en", name: "English", rtl: false, v: ["Online now","Type your message...","Send","Attach image","Remove image","Sources","New chat","Choose language","Search languages...","Thinking...","Hello! I'm Alaa :). How can I help?","Could not connect to the server.","Image is too large. Choose a smaller image.","Start a new conversation"] },
  { code: "fr", name: "Français", rtl: false, v: ["En ligne","Écrivez votre message...","Envoyer","Joindre une image","Supprimer l’image","Sources","Nouvelle discussion","Choisir la langue","Rechercher une langue...","Réflexion...","Bonjour ! Je suis Alaa :). Comment puis-je vous aider ?","Connexion au serveur impossible.","Image trop volumineuse. Choisissez-en une plus petite.","Commencer une conversation"] },
  { code: "es", name: "Español", rtl: false, v: ["En línea","Escribe tu mensaje...","Enviar","Adjuntar imagen","Eliminar imagen","Fuentes","Nuevo chat","Elegir idioma","Buscar idiomas...","Pensando...","¡Hola! Soy Alaa :). ¿Cómo puedo ayudarte?","No se pudo conectar al servidor.","La imagen es demasiado grande.","Iniciar una conversación"] },
  { code: "de", name: "Deutsch", rtl: false, v: ["Jetzt online","Nachricht schreiben...","Senden","Bild anhängen","Bild entfernen","Quellen","Neuer Chat","Sprache wählen","Sprachen suchen...","Denke nach...","Hallo! Ich bin Alaa :). Wie kann ich helfen?","Serververbindung fehlgeschlagen.","Das Bild ist zu groß.","Neue Unterhaltung starten"] },
  { code: "it", name: "Italiano", rtl: false, v: ["Online ora","Scrivi un messaggio...","Invia","Allega immagine","Rimuovi immagine","Fonti","Nuova chat","Scegli lingua","Cerca lingue...","Sto pensando...","Ciao! Sono Alaa :). Come posso aiutarti?","Connessione al server non riuscita.","L’immagine è troppo grande.","Inizia una conversazione"] },
  { code: "pt", name: "Português", rtl: false, v: ["Online agora","Escreva sua mensagem...","Enviar","Anexar imagem","Remover imagem","Fontes","Nova conversa","Escolher idioma","Pesquisar idiomas...","Pensando...","Olá! Sou Alaa :). Como posso ajudar?","Não foi possível conectar ao servidor.","A imagem é muito grande.","Iniciar conversa"] },
  { code: "tr", name: "Türkçe", rtl: false, v: ["Şu anda çevrimiçi","Mesajınızı yazın...","Gönder","Resim ekle","Resmi kaldır","Kaynaklar","Yeni sohbet","Dil seç","Dil ara...","Düşünüyor...","Merhaba! Ben Alaa :). Nasıl yardımcı olabilirim?","Sunucuya bağlanılamadı.","Resim çok büyük.","Yeni bir sohbet başlat"] },
  { code: "ru", name: "Русский", rtl: false, v: ["В сети","Введите сообщение...","Отправить","Прикрепить изображение","Удалить изображение","Источники","Новый чат","Выбрать язык","Поиск языков...","Думаю...","Привет! Я Alaa :). Чем могу помочь?","Не удалось подключиться к серверу.","Изображение слишком большое.","Начать новый разговор"] },
  { code: "zh-CN", name: "简体中文", rtl: false, v: ["在线","输入消息...","发送","附加图片","移除图片","来源","新对话","选择语言","搜索语言...","正在思考...","你好！我是 Alaa :)。有什么可以帮你？","无法连接服务器。","图片太大，请选择较小的图片。","开始新对话"] },
  { code: "zh-TW", name: "繁體中文", rtl: false, v: ["目前在線","輸入訊息...","傳送","附加圖片","移除圖片","來源","新對話","選擇語言","搜尋語言...","思考中...","你好！我是 Alaa :)。有什麼可以幫你？","無法連線至伺服器。","圖片太大，請選擇較小的圖片。","開始新對話"] },
  { code: "ja", name: "日本語", rtl: false, v: ["オンライン","メッセージを入力...","送信","画像を添付","画像を削除","ソース","新しいチャット","言語を選択","言語を検索...","考え中...","こんにちは！Alaa :) です。何をお手伝いできますか？","サーバーに接続できません。","画像が大きすぎます。","新しい会話を始める"] },
  { code: "ko", name: "한국어", rtl: false, v: ["온라인","메시지를 입력하세요...","보내기","이미지 첨부","이미지 삭제","출처","새 채팅","언어 선택","언어 검색...","생각 중...","안녕하세요! 저는 Alaa :)입니다. 무엇을 도와드릴까요?","서버에 연결할 수 없습니다.","이미지가 너무 큽니다.","새 대화 시작"] },
  { code: "hi", name: "हिन्दी", rtl: false, v: ["अभी ऑनलाइन","अपना संदेश लिखें...","भेजें","चित्र जोड़ें","चित्र हटाएँ","स्रोत","नई चैट","भाषा चुनें","भाषा खोजें...","सोच रहा हूँ...","नमस्ते! मैं Alaa :) हूँ। मैं कैसे मदद कर सकता हूँ?","सर्वर से कनेक्ट नहीं हो सका।","चित्र बहुत बड़ा है।","नई बातचीत शुरू करें"] },
  { code: "ur", name: "اردو", rtl: true, v: ["ابھی آن لائن","اپنا پیغام لکھیں...","بھیجیں","تصویر منسلک کریں","تصویر ہٹائیں","ذرائع","نئی گفتگو","زبان منتخب کریں","زبان تلاش کریں...","سوچ رہا ہوں...","سلام! میں Alaa :) ہوں۔ میں کیسے مدد کر سکتا ہوں؟","سرور سے رابطہ نہیں ہو سکا۔","تصویر بہت بڑی ہے۔","نئی گفتگو شروع کریں"] },
  { code: "bn", name: "বাংলা", rtl: false, v: ["এখন অনলাইন","আপনার বার্তা লিখুন...","পাঠান","ছবি সংযুক্ত করুন","ছবি সরান","সূত্র","নতুন চ্যাট","ভাষা নির্বাচন করুন","ভাষা খুঁজুন...","ভাবছি...","হ্যালো! আমি Alaa :)। কীভাবে সাহায্য করতে পারি?","সার্ভারে সংযোগ করা যায়নি।","ছবিটি অনেক বড়।","নতুন কথোপকথন শুরু করুন"] },
  { code: "id", name: "Bahasa Indonesia", rtl: false, v: ["Sedang online","Tulis pesan...","Kirim","Lampirkan gambar","Hapus gambar","Sumber","Obrolan baru","Pilih bahasa","Cari bahasa...","Sedang berpikir...","Halo! Saya Alaa :). Ada yang bisa saya bantu?","Tidak dapat terhubung ke server.","Gambar terlalu besar.","Mulai percakapan baru"] },
  { code: "ms", name: "Bahasa Melayu", rtl: false, v: ["Dalam talian sekarang","Taip mesej...","Hantar","Lampirkan imej","Buang imej","Sumber","Sembang baharu","Pilih bahasa","Cari bahasa...","Sedang berfikir...","Hai! Saya Alaa :). Apa yang boleh saya bantu?","Tidak dapat menyambung ke pelayan.","Imej terlalu besar.","Mulakan perbualan baharu"] },
  { code: "th", name: "ไทย", rtl: false, v: ["ออนไลน์อยู่","พิมพ์ข้อความ...","ส่ง","แนบรูปภาพ","ลบรูปภาพ","แหล่งที่มา","แชตใหม่","เลือกภาษา","ค้นหาภาษา...","กำลังคิด...","สวัสดี! ฉันคือ Alaa :) มีอะไรให้ช่วยไหม?","เชื่อมต่อเซิร์ฟเวอร์ไม่ได้","รูปภาพมีขนาดใหญ่เกินไป","เริ่มการสนทนาใหม่"] },
  { code: "vi", name: "Tiếng Việt", rtl: false, v: ["Đang trực tuyến","Nhập tin nhắn...","Gửi","Đính kèm ảnh","Xóa ảnh","Nguồn","Trò chuyện mới","Chọn ngôn ngữ","Tìm ngôn ngữ...","Đang suy nghĩ...","Xin chào! Tôi là Alaa :). Tôi có thể giúp gì?","Không thể kết nối máy chủ.","Ảnh quá lớn.","Bắt đầu cuộc trò chuyện mới"] },
  { code: "fa", name: "فارسی", rtl: true, v: ["اکنون آنلاین","پیامتان را بنویسید...","ارسال","پیوست تصویر","حذف تصویر","منابع","گفتگوی جدید","انتخاب زبان","جستجوی زبان...","در حال فکر کردن...","سلام! من Alaa :) هستم. چطور کمک کنم؟","اتصال به سرور برقرار نشد.","تصویر خیلی بزرگ است.","شروع گفتگوی جدید"] },
  { code: "he", name: "עברית", rtl: true, v: ["מחובר עכשיו","כתבו הודעה...","שליחה","צירוף תמונה","הסרת תמונה","מקורות","צ'אט חדש","בחירת שפה","חיפוש שפה...","חושב...","שלום! אני Alaa :). איך אפשר לעזור?","לא ניתן להתחבר לשרת.","התמונה גדולה מדי.","התחלת שיחה חדשה"] },
  { code: "nl", name: "Nederlands", rtl: false, v: ["Nu online","Typ je bericht...","Verzenden","Afbeelding bijvoegen","Afbeelding verwijderen","Bronnen","Nieuwe chat","Taal kiezen","Talen zoeken...","Aan het denken...","Hallo! Ik ben Alaa :). Hoe kan ik helpen?","Kan geen verbinding maken met de server.","De afbeelding is te groot.","Nieuw gesprek starten"] },
  { code: "pl", name: "Polski", rtl: false, v: ["Teraz online","Wpisz wiadomość...","Wyślij","Dodaj obraz","Usuń obraz","Źródła","Nowy czat","Wybierz język","Szukaj języka...","Myślę...","Cześć! Jestem Alaa :). W czym mogę pomóc?","Nie można połączyć się z serwerem.","Obraz jest za duży.","Rozpocznij nową rozmowę"] },
  { code: "el", name: "Ελληνικά", rtl: false, v: ["Σε σύνδεση","Γράψτε το μήνυμά σας...","Αποστολή","Επισύναψη εικόνας","Αφαίρεση εικόνας","Πηγές","Νέα συνομιλία","Επιλογή γλώσσας","Αναζήτηση γλώσσας...","Σκέφτομαι...","Γεια! Είμαι το Alaa :). Πώς μπορώ να βοηθήσω;","Δεν ήταν δυνατή η σύνδεση με τον διακομιστή.","Η εικόνα είναι πολύ μεγάλη.","Έναρξη νέας συνομιλίας"] },
  { code: "ro", name: "Română", rtl: false, v: ["Online acum","Scrie mesajul...","Trimite","Atașează imagine","Elimină imaginea","Surse","Chat nou","Alege limba","Caută limbi...","Mă gândesc...","Salut! Sunt Alaa :). Cu ce te pot ajuta?","Conectarea la server a eșuat.","Imaginea este prea mare.","Începe o conversație nouă"] },
];

const STORAGE_KEY = "alaa-selected-language-v1";

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const language = LANGUAGES.find(
    (item) => item.code === selectedLanguage
  ) || LANGUAGES[0];

  const t = useMemo(() => {
    const keys = [
      "online",
      "placeholder",
      "send",
      "attach",
      "remove",
      "sources",
      "newChat",
      "chooseLanguage",
      "searchLanguage",
      "thinking",
      "welcome",
      "error",
      "imageTooLarge",
      "empty",
    ];

    return {
      ...Object.fromEntries(
        keys.map((key, index) => [key, language.v[index]])
      ),
      rtl: language.rtl,
    };
  }, [language]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (LANGUAGES.some((item) => item.code === value)) {
          setSelectedLanguage(value);
        }
      })
      .catch(() => {})
      .finally(() => setLanguageLoaded(true));
  }, []);

  useEffect(() => {
    if (languageLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, selectedLanguage)
        .catch(() => {});
    }
  }, [selectedLanguage, languageLoaded]);

  const filteredLanguages = LANGUAGES.filter((item) =>
    item.name.toLowerCase().includes(languageSearch.trim().toLowerCase())
  );

  async function chooseImage() {
    setError("");

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError("Please allow photo library access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.75,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";
      const base64 = asset.base64;

      if (!base64) {
        setError("Could not read the selected image.");
        return;
      }

      if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
        setError(t.imageTooLarge);
        return;
      }

      if (base64.length > 5600000) {
        setError(t.imageTooLarge);
        return;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
        setError("Unsupported image format.");
        return;
      }

      setPendingImage({
        uri: asset.uri,
        base64,
        mimeType,
      });
    } catch {
      setError("Could not select the image.");
    }
  }

  function startNewChat() {
    setMessages([]);
    setDraft("");
    setPendingImage(null);
    setError("");
  }

  async function sendMessage() {
    const text = draft.trim();

    if ((!text && !pendingImage) || loading) return;

    setError("");

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      imageUri: pendingImage?.uri || null,
      imageBase64: pendingImage?.base64 || null,
      mimeType: pendingImage?.mimeType || null,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setPendingImage(null);
    setLoading(true);

    try {
      const history = nextMessages
        .slice(-12)
        .map((item) => ({
          role: item.role,
          content: item.content || "",
          ...(item.imageBase64
            ? {
                imageBase64: item.imageBase64,
                mimeType: item.mimeType,
              }
            : {}),
        }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history,
          language: selectedLanguage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.reply || "",
        sources: Array.isArray(data.sources) ? data.sources : [],
        searched: Boolean(data.searched),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function openSource(url) {
    try {
      const parsed = new URL(url);

      if (!["https:", "http:"].includes(parsed.protocol)) return;

      await Linking.openURL(parsed.href);
    } catch {
      setError(t.error);
    }
  }

  const rowDirection = t.rtl ? "row-reverse" : "row";
  const textDirection = t.rtl ? "right" : "left";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { flexDirection: rowDirection }]}>
          <View style={styles.brand}>
            <Text style={styles.logo}>✦ Alaa :)</Text>
            <Text style={styles.online}>{t.online}</Text>
          </View>

          <View style={[styles.headerButtons, { flexDirection: rowDirection }]}>
            <Pressable
              onPress={() => {
                setLanguageSearch("");
                setLanguageModal(true);
              }}
              style={styles.headerButton}
              accessibilityLabel={t.chooseLanguage}
            >
              <Text style={styles.headerButtonText}>🌐 {selectedLanguage.toUpperCase()}</Text>
            </Pressable>

            <Pressable
              onPress={startNewChat}
              style={styles.headerButton}
              accessibilityLabel={t.newChat}
            >
              <Text style={styles.headerButtonText}>＋</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <Text style={styles.welcomeIcon}>✦</Text>
              <Text
                style={[
                  styles.welcomeTitle,
                  { textAlign: t.rtl ? "right" : "left" },
                ]}
              >
                {t.welcome}
              </Text>
              <Text style={styles.welcomeSubtitle}>{t.empty}</Text>
            </View>
          ) : null}

          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                {
                  flexDirection: rowDirection,
                  justifyContent:
                    item.role === "user" ? "flex-end" : "flex-start",
                },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.messageImage}
                    resizeMode="cover"
                    accessibilityLabel="Attached image"
                  />
                ) : null}

                {item.content ? (
                  <Text
                    selectable
                    style={[
                      styles.messageText,
                      { textAlign: t.rtl ? "right" : "left" },
                    ]}
                  >
                    {item.content}
                  </Text>
                ) : null}

                {item.role === "assistant" && item.sources?.length > 0 ? (
                  <View style={styles.sources}>
                    <Text style={styles.sourcesTitle}>{t.sources}</Text>

                    {item.sources.map((source, index) => (
                      <Pressable
                        key={`${source.url}-${index}`}
                        onPress={() => openSource(source.url)}
                        style={styles.sourceLink}
                      >
                        <Text style={styles.sourceLinkText}>
                          {source.title || source.url} ↗
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ))}

          {loading ? (
            <View
              style={[
                styles.loading,
                { flexDirection: rowDirection },
              ]}
            >
              <ActivityIndicator color="#A78BFA" />
              <Text style={styles.loadingText}>{t.thinking}</Text>
            </View>
          ) : null}

          {error ? (
            <Text style={[styles.errorText, { textAlign: textDirection }]}>
              {error}
            </Text>
          ) : null}
        </ScrollView>

        {pendingImage ? (
          <View
            style={[
              styles.previewRow,
              { flexDirection: rowDirection },
            ]}
          >
            <Image
              source={{ uri: pendingImage.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => setPendingImage(null)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>{t.remove} ✕</Text>
            </Pressable>
          </View>
        ) : null}

        <View
          style={[
            styles.composer,
            { flexDirection: rowDirection },
          ]}
        >
          <Pressable
            onPress={chooseImage}
            style={styles.attachButton}
            accessibilityLabel={t.attach}
          >
            <Text style={styles.attachText}>📎</Text>
          </Pressable>

          <TextInput
            style={[
              styles.input,
              {
                textAlign: t.rtl ? "right" : "left",
                writingDirection: t.rtl ? "rtl" : "ltr",
              },
            ]}
            value={draft}
            onChangeText={setDraft}
            placeholder={t.placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={MAX_MESSAGE_LENGTH}
            returnKeyType="default"
          />

          <Pressable
            onPress={sendMessage}
            disabled={loading || (!draft.trim() && !pendingImage)}
            style={[
              styles.sendButton,
              loading ? styles.disabledButton : null,
            ]}
            accessibilityLabel={t.send}
          >
            <Text style={styles.sendText}>{loading ? "…" : "➤"}</Text>
          </Pressable>
        </View>

        <Modal
          visible={languageModal}
          animationType="slide"
          transparent
          onRequestClose={() => setLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.languagePanel}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.chooseLanguage}</Text>
                <Pressable onPress={() => setLanguageModal(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.languageSearch}
                value={languageSearch}
                onChangeText={setLanguageSearch}
                placeholder={t.searchLanguage}
                placeholderTextColor="#9CA3AF"
              />

              <FlatList
                data={filteredLanguages}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setSelectedLanguage(item.code);
                      setLanguageModal(false);
                      setError("");
                    }}
                    style={[
                      styles.languageOption,
                      {
                        flexDirection: item.rtl ? "row-reverse" : "row",
                      },
                    ]}
                  >
                    <Text style={styles.languageName}>{item.name}</Text>
                    <Text style={styles.languageCheck}>
                      {selectedLanguage === item.code ? "✓" : ""}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptySearch}>{t.empty}</Text>
                }
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  root: {
    flex: 1,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#242943",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    gap: 3,
  },
  logo: {
    color: "#B9A0FF",
    fontSize: 25,
    fontWeight: "800",
  },
  online: {
    color: "#86E6C3",
    fontSize: 12,
  },
  headerButtons: {
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    backgroundColor: "#202641",
    borderWidth: 1,
    borderColor: "#333B5A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  headerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  welcome: {
    flex: 1,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  welcomeIcon: {
    fontSize: 40,
    color: "#B9A0FF",
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
  },
  welcomeSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
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
  assistantBubble: {
    backgroundColor: "#202641",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
  },
  messageImage: {
    width: 230,
    height: 230,
    maxWidth: "100%",
    borderRadius: 12,
    backgroundColor: "#101629",
  },
  sources: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#454D6A",
    gap: 8,
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
  sourceLinkText: {
    color: "#AFC8FF",
    textDecorationLine: "underline",
    fontSize: 13,
  },
  loading: {
    alignItems: "center",
    gap: 10,
    padding: 12,
    alignSelf: "flex-start",
  },
  loadingText: {
    color: "#B9A0FF",
  },
  errorText: {
    color: "#FDA4AF",
    padding: 8,
  },
  previewRow: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  previewImage: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: "#202641",
  },
  removeButton: {
    backgroundColor: "#32243B",
    borderRadius: 10,
    padding: 9,
  },
  removeButtonText: {
    color: "#FFD4DD",
    fontSize: 12,
  },
  composer: {
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 18 : 12,
    borderTopWidth: 1,
    borderTopColor: "#242943",
    backgroundColor: "#090D1B",
  },
  attachButton: {
    backgroundColor: "#202641",
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  attachText: {
    fontSize: 22,
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
    backgroundColor: "#8065FF",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  languagePanel: {
    maxHeight: "85%",
    minHeight: "60%",
    backgroundColor: "#131A2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 22,
    padding: 5,
  },
  languageSearch: {
    backgroundColor: "#202641",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 12,
    textAlign: "left",
  },
  languageOption: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#29314B",
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
  emptySearch: {
    color: "#9CA3AF",
    textAlign: "center",
    padding: 20,
  },
});
