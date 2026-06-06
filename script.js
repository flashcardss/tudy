document.addEventListener("DOMContentLoaded", () => {

let flashcards = [];
let current = 0;
let answerVisible = false;

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

const showBtn = document.getElementById("showBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const counterEl = document.getElementById("counter");

fetch("flashcards.json?" + Date.now())
    .then(response => response.json())
    .then(data => {
        flashcards = data;
        showCard();
    });

function showCard() {

    const card = flashcards[current];

    questionEl.textContent = card.question;
    answerEl.textContent = card.answer;

    answerEl.style.display = "none";

    answerVisible = false;
    showBtn.textContent = "Mostrar resposta";

    counterEl.textContent =
        `${current + 1} / ${flashcards.length}`;
}

showBtn.addEventListener("click", () => {

    if (answerVisible) {

        answerEl.style.display = "none";
        showBtn.textContent = "Mostrar resposta";
        answerVisible = false;

    } else {

        answerEl.style.display = "block";
        showBtn.textContent = "Amagar resposta";
        answerVisible = true;
    }
});

nextBtn.addEventListener("click", () => {

    current++;

    if (current >= flashcards.length) {
        current = 0;
    }

    showCard();
});

prevBtn.addEventListener("click", () => {

    current--;

    if (current < 0) {
        current = flashcards.length - 1;
    }

    showCard();
});
