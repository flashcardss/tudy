// =======================
// CONFIGURACIÓ
// =======================
const CURS_BASE = "oposicions_cos_superior";

let cards = [];
let currentCard = 0;

// =======================
// INICIALITZACIÓ
// =======================
window.addEventListener("DOMContentLoaded", async () => {

    console.log("DOM carregat");

    const select = document.getElementById("temaSelect");

    if (!select) {
        console.error("NO EXISTEIX temaSelect al DOM");
        return;
    }

    const index = await carregarIndex();

    console.log("INDEX:", index);

    select.innerHTML = "";

    index.forEach(item => {
        const option = document.createElement("option");
        option.value = item.fitxer;
        option.textContent = `${item.bloc} - ${item.tema}`;
        select.appendChild(option);
    });

    console.log("SELECT OMPLERT OK");
});

// =======================
// CARREGAR INDEX.JSON
// =======================
async function carregarIndex() {
    const response = await fetch("index.json");
    return await response.json();
}

// =======================
// OMPLIR SELECTOR
// =======================
async function inicialitzarSelector() {
    const index = await carregarIndex();

    const select = document.getElementById("temaSelect");
    select.innerHTML = "";

    index.forEach(item => {
        const option = document.createElement("option");
        option.value = item.fitxer;
        option.textContent = `${item.bloc} - ${item.tema}`;
        select.appendChild(option);
    });

    console.log("Selector carregat:", index);
}

// =======================
// CARREGAR TEMA
// =======================
async function carregarTema(rutaFitxer) {
    const response = await fetch(`${CURS_BASE}/${rutaFitxer}`);
    cards = await response.json();

    currentCard = 0;

    renderCard();
}

// =======================
// RENDER DE TARGETA
// =======================
function renderCard() {
    if (!cards.length) return;

    const card = cards[currentCard];

    document.getElementById("front-text").textContent = card.pregunta;

    let respostaHtml = card.resposta.replace(/\n/g, "<br>");

    if (card.context) {
        respostaHtml += `
            <div class="context-box">
                <div class="context-title">Context</div>
                <div>${card.context}</div>
            </div>
        `;
    }

    document.getElementById("back-text").innerHTML = respostaHtml;

    document.getElementById("counter").textContent =
        `${currentCard + 1} / ${cards.length}`;

    const cardEl = document.getElementById("card");
    if (cardEl.classList.contains("is-flipped")) {
        cardEl.classList.remove("is-flipped");
    }
}

// =======================
// ACCIONS BÀSIQUES
// =======================
function nextCard() {
    if (currentCard < cards.length - 1) {
        currentCard++;
        renderCard();
    }
}

function prevCard() {
    if (currentCard > 0) {
        currentCard--;
        renderCard();
    }
}

function toggleFlip() {
    document.getElementById("card")
        .classList.toggle("is-flipped");
}

// =======================
// EVENTS BÀSICS
// =======================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        toggleFlip();
    }

    if (e.code === "ArrowRight") nextCard();
    if (e.code === "ArrowLeft") prevCard();
});

// (Opcional si tens botons)
document.getElementById("btn-next")?.addEventListener("click", nextCard);
document.getElementById("btn-prev")?.addEventListener("click", prevCard);
document.getElementById("card")?.addEventListener("click", toggleFlip);
