document.addEventListener("DOMContentLoaded", () => {

let flashcards = [];
let current = 0;

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const flashcardEl = document.getElementById("flashcard");

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

    flashcardEl.classList.remove("flip");

    counterEl.textContent =
        `${current + 1} / ${flashcards.length}`;
}

flashcardEl.addEventListener("click", () => {


    flashcardEl.classList.toggle("flip");

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

});
