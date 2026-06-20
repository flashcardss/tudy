// Dades extretes estrictament de la font de dades proporcionada per l'usuari (EAPC Wiki - 5. Sistema retributiu)
let rawData = [];
let indexDataGlobal = [];

async function loadFlashcards() {

    // Carrega l’índex general
const indexResponse = await fetch('index.json');
const indexData = await indexResponse.json();

indexDataGlobal = indexData;

    let totesLesTargetes = [];

    // Carrega cada TemaXX.json
for (const tema of indexData) {

    try {

        const temaResponse = await fetch(tema.fitxer);
        let temaData = await temaResponse.json();

        temaData = temaData.map((card, index) => ({
            id: `${tema.fitxer}-${index}`,
            question: card.question,
            answer: card.answer,
            doctrina: card.doctrina || "",
            sector: card.sector || "",
            bloc: tema.bloc,
            tema: tema.tema,
            fitxer: tema.fitxer
        }));

        totesLesTargetes = totesLesTargetes.concat(temaData);

    } catch (error) {

        console.error("ERROR AL FITXER:", tema.fitxer);
        console.error(error);

    }
    }

     rawData = totesLesTargetes;
}
    let sourceCards = [];
    let currentEssayCards = [];
    let currentIndex = 0;
    let sessionCount = 0; 
    let history = [];
    let currentStats = { correct: 0, incorrect: 0 };
    let chartCtx = null;
    let currentEssayType = ""; 
const STORAGE_KEY = "flashcards_eapc_progress";

function saveProgress() {

    const progress = {

        history,
        sessionCount,

        cards: sourceCards.map(c => ({

            id: c.id,

            markedForReview: c.markedForReview,
            lastResult: c.lastResult,

            totalOk: c.totalOk,
            totalFail: c.totalFail,

            lastOkDate: c.lastOkDate,
            lastFailDate: c.lastFailDate

        }))
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
    );
}

function loadProgress() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

        const progress =
            JSON.parse(saved);

history = (progress.history || []).map(h => ({
    ...h,
    date: new Date(h.date)
}));

        sessionCount =
            progress.sessionCount || 0;

        const cardsState =
            progress.cards || [];

        cardsState.forEach(savedCard => {

            const card =
                sourceCards.find(
                    c => c.id === savedCard.id
                );

            if (!card) return;

            card.markedForReview =
                savedCard.markedForReview;

            card.lastResult =
                savedCard.lastResult;

            card.totalOk =
                savedCard.totalOk || 0;

            card.totalFail =
                savedCard.totalFail || 0;

            card.lastOkDate =
                savedCard.lastOkDate || null;

            card.lastFailDate =
                savedCard.lastFailDate || null;
        });

    } catch(error) {

        console.error(error);

    }
}
function omplirSelectorTemes() {

    const select = document.getElementById('tema-select');

    indexDataGlobal.forEach(item => {

        const opcio = document.createElement('option');

        opcio.value = item.fitxer;

        opcio.textContent =
            `${item.bloc} - ${item.tema}`;

        select.appendChild(opcio);
    });

    select.addEventListener('change', canviarTema);
}
function canviarTema() {

    const valor =
        document.getElementById('tema-select').value;

    if (valor === 'all') {

sourceCards = rawData.map(d => ({
    ...d,

    markedForReview: false,
    lastResult: null,

    totalOk: 0,
    totalFail: 0,

    lastOkDate: null,
    lastFailDate: null
}));
      loadProgress();  
setupChart();
startNewEssay();
    } else {

        sourceCards = rawData
            .filter(c => c.fitxer === valor)
            .map(d => ({
                ...d,
                markedForReview: false,
                lastResult: null
            }));
    }

    startNewEssay();
}
    async function init() {

omplirSelectorTemes();

sourceCards = rawData.map(d => ({
    ...d,
    markedForReview: false,
    lastResult: null,

    totalOk: 0,
    totalFail: 0,

    lastOkDate: null,
    lastFailDate: null
}));

loadProgress();

setupChart();
startNewEssay();
        
        document.getElementById('scene').addEventListener('click', (e) => {
            if (e.target.closest('.review-toggle')) return;
            toggleFlip();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); toggleFlip(); }
            if (e.code === 'ArrowRight') nextCard();
            if (e.code === 'ArrowLeft') prevCard();
        });
    }

    function startNewEssay() {
        currentEssayType = ""; 
        currentEssayCards = [...sourceCards].sort(() => Math.random() - 0.5).map(c => ({ ...c, answeredInThisSession: false }));
        resetSessionStats();
        renderCard();
    }

    function startFailedEssay() {
        const failed = sourceCards.filter(c => c.lastResult === 'fail');
        if (failed.length === 0) {
            alert("No hi ha conceptes fallats registrats en aquesta sessió!");
            return;
        }
        currentEssayType = "fallades";
        currentEssayCards = failed.map(c => ({ ...c, answeredInThisSession: false }));
        resetSessionStats();
        renderCard();
    }

    function startReviewEssay() {
        const reviews = sourceCards.filter(c => c.markedForReview);
        if (reviews.length === 0) {
            alert("No tens cap targeta marcada amb l'estrella de repàs!");
            return;
        }
        currentEssayType = "repàs";
        currentEssayCards = reviews.map(c => ({ ...c, answeredInThisSession: false }));
        resetSessionStats();
        renderCard();
    }
function startDifficultEssay() {

    const difficultCards = sourceCards
        .filter(c => c.totalFail > 0)
        .sort(
            (a, b) =>
            (b.totalFail - b.totalOk)
            -
            (a.totalFail - a.totalOk)
        );

    if (difficultCards.length === 0) {

        alert(
            "Encara no hi ha preguntes difícils registrades."
        );

        return;
    }

    currentEssayType = "dificils";

    currentEssayCards =
        difficultCards.map(c => ({
            ...c,
            answeredInThisSession: false
        }));

    resetSessionStats();

    renderCard();
}
    function resetSessionStats() {
        currentIndex = 0;
        sessionCount++; 
        currentStats = { correct: 0, incorrect: 0 };
        updateUI();
    }

    function toggleFlip() {
        const card = document.getElementById('card');
        card.classList.toggle('is-flipped');
        const isFlipped = card.classList.contains('is-flipped');
        document.getElementById('val-controls').classList.toggle('visible', isFlipped);
    }

    function renderCard() {
        if (currentEssayCards.length === 0) return;
        
        const cardData = currentEssayCards[currentIndex];
document.getElementById('front-text').textContent = cardData.question;

let respostaHtml = cardData.answer.replace(/\n/g, '<br>');

if (cardData.doctrina) {
    respostaHtml += `
        <div class="doctrina-box">
            <div class="doctrina-title">
                Context / Matís d'Estudi
            </div>
            <div>${cardData.doctrina}</div>
        </div>
    `;
}

document.getElementById('back-text').innerHTML = respostaHtml;
        
        const cardEl = document.getElementById('card');
        cardEl.classList.remove('is-flipped');
        document.getElementById('val-controls').classList.remove('visible');

        const reviewBtn = document.getElementById('btn-toggle-review');
        const realCard = sourceCards.find(c => c.id === cardData.id);
        realCard.markedForReview ? reviewBtn.classList.add('active') : reviewBtn.classList.remove('active');
        
        updateCounter();
    }

    function markResult(isOk) {
        const card = currentEssayCards[currentIndex];
        if (!card.answeredInThisSession) {
            card.answeredInThisSession = true;
            isOk ? currentStats.correct++ : currentStats.incorrect++;
            
            const realCard = sourceCards.find(c => c.id === card.id);
            realCard.lastResult = isOk ? 'ok' : 'fail';

if (isOk) {

    realCard.totalOk++;

    realCard.lastOkDate =
        new Date().toISOString();

} else {

    realCard.totalFail++;

    realCard.lastFailDate =
        new Date().toISOString();
}

history.push({
    sessionId: sessionCount,
    sessionType: currentEssayType,
    date: new Date(),

    question: card.question,
    answer: card.answer,

    result: isOk ? "Encert" : "Error"
});

updateChart();
updateUI();
saveProgress();
        }
        nextCard();
    }

    function nextCard() {
        if (currentIndex < currentEssayCards.length - 1) {
            currentIndex++;
            renderCard();
            updateUI();
        } else {
            if(confirm("Has completat les targetes actives de l'assaig d'EAPC. Vols reiniciar aquesta llista?")) {
                currentIndex = 0;
                currentEssayCards.forEach(c => c.answeredInThisSession = false);
                renderCard();
                updateUI();
            }
        }
    }

    function prevCard() {
        if (currentIndex > 0) {
            currentIndex--;
            renderCard();
            updateUI();
        }
    }

    function updateUI() {
        document.getElementById('btn-prev').disabled = currentIndex === 0;
        document.getElementById('btn-next').disabled = currentIndex === currentEssayCards.length - 1;
        
        const total = currentEssayCards.length;
        const totalAnswered = currentStats.correct + currentStats.incorrect;
        const percent = totalAnswered > 0 ? Math.round((currentStats.correct / totalAnswered) * 100) : 0;
        const typeLabel = currentEssayType ? ` (Filtre: ${currentEssayType})` : " (Assaig General)";

        document.getElementById('stats-summary').innerHTML = 
            `Estat actual del bloc retributiu${typeLabel}: ${currentStats.correct} Encerts / ${currentStats.incorrect} Errors (${totalAnswered} de ${total} avaluats)<br>` +
            `<strong>Percentatge d'èxit de la sessió: ${percent}%</strong>`;
    }

    function updateCounter() {
        document.getElementById('counter').textContent = `${currentIndex + 1} / ${currentEssayCards.length}`;
    }

    document.getElementById('btn-mark-ok').onclick = (e) => { e.stopPropagation(); markResult(true); };
    document.getElementById('btn-mark-fail').onclick = (e) => { e.stopPropagation(); markResult(false); };
    document.getElementById('btn-next').onclick = nextCard;
    document.getElementById('btn-prev').onclick = prevCard;
    document.getElementById('btn-new-essay').onclick = startNewEssay;
    document.getElementById('btn-essay-failed').onclick = startFailedEssay;
    document.getElementById('btn-essay-review').onclick = startReviewEssay;
    document.getElementById('btn-essay-difficult').onclick =
    startDifficultEssay;
    document.getElementById('btn-toggle-review').onclick = (e) => {
        e.stopPropagation();
        const card = currentEssayCards[currentIndex];
        const realCard = sourceCards.find(c => c.id === card.id);
        realCard.markedForReview =
    !realCard.markedForReview;

saveProgress();

renderCard();
    };

    function setupChart() {
        const canvas = document.getElementById('scoreChart');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        chartCtx = canvas.getContext('2d');
        chartCtx.scale(dpr, dpr);
        updateChart();
    }

    function updateChart() {
        if (!chartCtx) return;
        const canvas = document.getElementById('scoreChart');
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        chartCtx.clearRect(0, 0, w, h);

        const dataBySession = {};
        history.forEach(item => {
            if(!dataBySession[item.sessionId]) dataBySession[item.sessionId] = { ok: 0, fail: 0, type: item.sessionType };
            item.result === "Encert" ? dataBySession[item.sessionId].ok++ : dataBySession[item.sessionId].fail++;
        });

        const sessions = Object.keys(dataBySession).sort((a,b) => a-b).slice(-7);
        const margin = 40;
        const cH = h - margin * 2;
        const barW = 18;
        
        let maxVal = 5;
        sessions.forEach(s => {
            const sum = Math.max(dataBySession[s].ok, dataBySession[s].fail);
            if(sum > maxVal) maxVal = sum;
        });

        chartCtx.strokeStyle = "#bdc3c7";
        chartCtx.beginPath();
        chartCtx.moveTo(margin, margin);
        chartCtx.lineTo(margin, h - margin);
        chartCtx.lineTo(w - margin, h - margin);
        chartCtx.stroke();

        sessions.forEach((sId, i) => {
            const d = dataBySession[sId];
            const xBase = margin + 25 + i * (barW * 4);
            
            const hOk = (d.ok / (maxVal + 1)) * cH;
            chartCtx.fillStyle = "#2ecc71";
            chartCtx.fillRect(xBase, h - margin - hOk, barW, hOk);
            
            chartCtx.fillStyle = "#27ae60";
            chartCtx.font = "bold 9px sans-serif";
            chartCtx.textAlign = "center";
            if(d.ok > 0) chartCtx.fillText(d.ok, xBase + barW/2, h - margin - hOk - 4);
            
            const hFail = (d.fail / (maxVal + 1)) * cH;
            chartCtx.fillStyle = "#e74c3c";
            chartCtx.fillRect(xBase + barW + 4, h - margin - hFail, barW, hFail);

            chartCtx.fillStyle = "#c0392b";
            if(d.fail > 0) chartCtx.fillText(d.fail, xBase + barW + 4 + barW/2, h - margin - hFail - 4);
            
            const total = d.ok + d.fail;
            const percent = Math.round((d.ok / total) * 100);
            chartCtx.fillStyle = "#2c3e50";
            chartCtx.font = "bold 10px sans-serif";
            chartCtx.fillText(`S${sId}`, xBase + barW, h - margin + 14);
            chartCtx.fillStyle = "#7f8c8d";
            chartCtx.font = "9px sans-serif";
            chartCtx.fillText(`${percent}%`, xBase + barW, h - margin + 26);
        });
    }

    document.getElementById('btn-export').onclick = () => {
        if (history.length === 0) return alert("No hi ha dades per exportar en l'historial d'assaigs actual.");
        
        let csv = "Sessió;Filtre_Assaig;Data;Hora;Pregunta_Concepte;Resultat_Avaluació;Doctrina_Literal_EAPC\n";
        
        history.forEach(h => {
            
            const typeLabel = h.sessionType || "general";
            const escapedAnswer =
    (h.answer || "").replace(/"/g, '""');
            const year = h.date.getFullYear();
            const month = String(h.date.getMonth() + 1).padStart(2, '0');
            const day = String(h.date.getDate()).padStart(2, '0');
            const hours = String(h.date.getHours()).padStart(2, '0');
            const minutes = String(h.date.getMinutes()).padStart(2, '0');
            
            csv += `${h.sessionId};"${typeLabel}";${year}-${month}-${day};${hours}:${minutes};"${h.question}";${h.result};"${escapedAnswer}"\n`;
        });
        
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "progres_retributiu_EAPC.csv"; a.click();
    };

    document.getElementById('btn-reset-chart').onclick = () => {
        if(confirm("Segur que vols esborrar l'historial complet i posar el comptador de sessions a zero?")) {
           history = [];

sourceCards.forEach(c => {

    c.lastResult = null;

    c.markedForReview = false;

    c.totalOk = 0;
    c.totalFail = 0;

    c.lastOkDate = null;
    c.lastFailDate = null;
});

sessionCount = 0;

localStorage.removeItem(
    STORAGE_KEY
);
            startNewEssay();
            updateChart();
        }
    };

    window.addEventListener('DOMContentLoaded', async () => {
    await loadFlashcards();
    init();
});
    window.onresize = setupChart;
