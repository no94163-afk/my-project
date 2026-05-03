const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";
let modelsLoaded = false;
let currentImage = null;

// مصفوفة التوصيات (كما هي)
const RECOMMENDATIONS = {
    Happy: [{ type: "Activity", icon: "🎉", text: "Channel that joy! Call a friend you haven't spoken to in a while.", sub: "Happiness multiplies when shared." }],
    Sad: [{ type: "Quote", icon: "🌱", text: "Even the darkest night will end and the sun will rise.", sub: "Be gentle with yourself today." }],
    Angry: [{ type: "Activity", icon: "🧘", text: "Try box breathing: inhale 4, hold 4, exhale 4. Repeat 4 times.", sub: "Calm your nervous system." }],
    Surprised: [{ type: "Activity", icon: "📓", text: "Journal about what just surprised you. Capture the moment.", sub: "Discovery is exciting." }],
    Fearful: [{ type: "Activity", icon: "🤝", text: "Name 3 things you can see and 2 you can hear.", sub: "Grounding reduces anxiety." }],
    Neutral: [{ type: "Activity", icon: "🎯", text: "Set one meaningful intention for the rest of your day.", sub: "Plan from a calm mind." }]
};

// 1. دالة لحفظ النتيجة في الـ LocalStorage
function saveToHistory(emotion, confidence) {
    let history = JSON.parse(localStorage.getItem('emotiScan_history') || '[]');
    const newEntry = {
        emotion: emotion,
        confidence: confidence,
        date: new Date().toLocaleString()
    };
    history.unshift(newEntry); // إضافة الجديد في الأول
    localStorage.setItem('emotiScan_history', JSON.stringify(history));
    renderHistory(); // تحديث القائمة في الصفحة
}

// 2. دالة لعرض التاريخ المخزن في الـ HTML
function renderHistory() {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;

    let history = JSON.parse(localStorage.getItem('emotiScan_history') || '[]');

    if (history.length === 0) {
        timeline.innerHTML = '<div class="tl-empty">No detections yet.</div>';
        return;
    }

    timeline.innerHTML = history.map(item => `
        <div class="step" style="margin-bottom: 10px; border-left: 3px solid var(--primary);">
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px;">${item.emotion} (${item.confidence}%)</div>
                <div style="font-size: 11px; color: var(--text-light);">${item.date}</div>
            </div>
            <div style="font-size: 18px;">${getEmoji(item.emotion)}</div>
        </div>
    `).join('');
}

// دالة مساعدة لجلب الإيموجي المناسب للتاريخ
function getEmoji(emotion) {
    const mapping = { Happy: "😊", Sad: "😢", Angry: "😠", Surprised: "😮", Fearful: "😨", Neutral: "😐" };
    return mapping[emotion] || "😶";
}

function getRecommendation(emotion) {
    const list = RECOMMENDATIONS[emotion] || RECOMMENDATIONS["Neutral"];
    return list[Math.floor(Math.random() * list.length)];
}

function showRecommendation(emotion) {
    const rec = getRecommendation(emotion);
    const card = document.getElementById("recCard");
    if(!card) return;
    document.getElementById("recType").textContent = rec.type;
    document.getElementById("recIcon").textContent = rec.icon;
    document.getElementById("recText").textContent = rec.text;
    document.getElementById("recSub").textContent = rec.sub;

    card.style.display = "block";
    setTimeout(() => card.classList.add("visible", "show"), 10);
}

async function loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      modelsLoaded = true;
      document.getElementById("dot").className = "dot busy";
      document.getElementById("serverStatus").textContent = "AI Ready (Local)";
      document.getElementById("btnLabel").textContent = "Analyze Emotion";
      if (currentImage) document.getElementById("btn").disabled = false;
      
      // استرجاع التاريخ أول ما الموديل يحمل
      renderHistory();
    } catch (e) {
      document.getElementById("serverStatus").textContent = "Error Loading AI";
    }
}

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.getElementById("preview");
      img.onload = () => {
        currentImage = img;
        if (modelsLoaded) document.getElementById("btn").disabled = false;
      };
      img.src = ev.target.result;
      img.style.display = "block";
      document.getElementById("placeholder").style.display = "none";
      document.getElementById("zone").classList.add("filled");
    };
    reader.readAsDataURL(file);
}

async function analyze() {
    if (!currentImage || !modelsLoaded) return;
    const btn = document.getElementById("btn");
    const lbl = document.getElementById("btnLabel");
    btn.disabled = true;
    lbl.innerHTML = '<div class="spinner"></div> AI analyzing…';

    try {
      const options = new faceapi.TinyFaceDetectorOptions();
      const detection = await faceapi.detectSingleFace(currentImage, options).withFaceExpressions();

      if (!detection) throw new Error("No face detected!");

      const expr = detection.expressions;
      let dominant = "Neutral", maxScore = 0;
      for (const [key, val] of Object.entries(expr)) {
        if (val > maxScore) { 
            maxScore = val; 
            dominant = key.charAt(0).toUpperCase() + key.slice(1); 
        }
      }

      const confidence = Math.round(maxScore * 100);
      renderResult(dominant, confidence, expr);
      showRecommendation(dominant);
      
      // حفظ النتيجة في التاريخ الدائم
      saveToHistory(dominant, confidence);

      lbl.textContent = "Analyze Again";
      btn.disabled = false;
    } catch (e) {
      alert(e.message);
      lbl.textContent = "Retry";
      btn.disabled = false;
    }
}

function renderResult(emotion, confidence, allScores) {
    document.getElementById("rName").textContent = emotion;
    document.getElementById("rConf").textContent = `Confidence: ${confidence}%`;
    document.getElementById("resultCard").classList.add("show");
}

function clearHistory() {
    localStorage.removeItem('emotiScan_history');
    renderHistory();
}

// تشغيل التحميل فوراً
loadModels();