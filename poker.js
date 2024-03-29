const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMathFailed",
  CardsMatched: "CardsMatched",
  GameFinish: "GameFinished",
};

const Symbols = [
  "./image/diamonds.png",
  "./image/club.png",
  "./image/heart.png",
  "./image/spade.png",
];

const utility = {
  getRandomNumberArr(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * number.length);
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return ` 
       <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`;
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");

    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(card.dataset.index);
        return;
      }

      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.map((card) => card.classList.add("paired"));
  },

  renderScore(score) {
    document.getElementById("score").innerText = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.getElementById(
      "triedTimes"
    ).innerText = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (e) => {
          e.target.classList.remove("wrong");
        },
        { once: true }
      );
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};
const model = {
  revealCards: [],

  isRevealedCardMatched() {
    return (
      this.revealCards[0].dataset.index % 13 ===
      this.revealCards[1].dataset.index % 13
    );
  },

  score: 0,
  triedTimes: 1,
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCard() {
    view.displayCards(utility.getRandomNumberArr(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        view.renderTriedTimes(model.triedTimes++);

        if (model.isRevealedCardMatched()) {
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealCards);
          model.revealCards = [];
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealCards);
          setTimeout(this.resetCard, 1000);
        }
        break;
    }
  },
  resetCard() {
    view.flipCards(...model.revealCards);
    model.revealCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

controller.generateCard();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
