//initialize--------------------------------------------------------
let state;
window.onload = () => {
  setTimeout(() => {
    document.getElementById("line1").children[0].focus();
    state = {
      validWord: false,
      myWord: "",
      pattern: "",
      patternArray: [],
      winCount: 0,
      closeCount: 0,
      lineCount: 1,
      getPatternArray: () => {
        let pattern = this.pattern;
        this.patternArray = pattern.split("");
      },
    };
  }, 200);
  const inputBoxes = document.querySelectorAll("div>input");
  for (let element of inputBoxes) {
    element.addEventListener("input", nextBox);
  }
  function nextBox(e) {
    if (e.data != null) {
      e.target.nextElementSibling.focus();
    }
  }
};
getWordFromAPI();
//-------------------------------------------------------------------

window.addEventListener("keydown", keyDownHandler);
function keyDownHandler(e) {
  let myLine = e.target.parentElement.children;
  let myWordArray = [];
  if (e.key == "Backspace") {
    e.target.previousElementSibling.focus();
    e.target.value = null;
  }
  if (e.key == "Enter") {
    clearWordArray(myWordArray);
    for (element of myLine) {
      myWordArray.push(element.value);
    }
    var myWord = getWordFromArray(myWordArray);
    state.myWord = myWord;
    validateWord(state.myWord);
    //state.validWord updated!! require 1000ms latency to complete
    setTimeout(() => {
      if (state.lineCount < 6 && state.validWord == true) {
        nextLine(e);
        for (let element of myLine) {
          element.disabled = true;
        }
      } else if (state.winCount < 5 && state.lineCount < 6) {
        for (let i = 0; i < 5; i++) {
          myLine[i].value = null;
          myLine[i].classList = "";
        }
        myLine[0].focus();
        alert("please give valid word.");
      }
    }, 1000);

    function nextLine(e) {
      e.target.parentElement.nextElementSibling.children[0].focus();
      state.lineCount += 1;
    }
    function clearWordArray(array) {
      return (array.length = 0);
    }

    function getWordFromArray(array) {
      return array.filter((x) => x != "").join("");
    }
  }

  function processGuessedWord() {
    if (e.key == "Enter") {
      getPatternArray();
      var patternArray = state.patternArray;
      var myWordArray = state.myWord.split("");

      for (let i = 0; i < 5; i++) {
        if (myWordArray[i] === patternArray[i]) {
          myLine[i].classList.add("win");
          state.patternArray[i] = ".";
          state.winCount += 1;
        }
        if (state.patternArray.includes(myWordArray[i])) {
          myLine[i].classList.add("close");
          state.patternArray[state.patternArray.indexOf(myWordArray[i])] = ".";
        }
      }
      checkWinLoose(state.winCount, state.lineCount);
    }
  }
  processGuessedWord();

  function getPatternArray() {
    const patternArray = state.pattern.split("");
    state.patternArray = patternArray;
    return patternArray;
  }

  function checkWinLoose(winCount, lineCount) {
    if (winCount == 5) {
      setTimeout(() => {
        alert("YAY YOU WON!");
        playWinSound();
      }, 500);
      setTimeout(() => {
        state.lineCount = 0;
        document.location.reload(true);
      }, 1000);
    } else if (lineCount >= 6) {
      setTimeout(() => {
        alert("YOU LOOSE - TRY AGAIN :(");
        looseSound.play();
      }, 500);
      setTimeout(() => {
        state.lineCount = 0;
        document.location.reload(true);
      }, 1000);
    } else {
      state.winCount = 0;
    }
  }
}
function getWordFromAPI() {
  fetch("https://words.dev-apis.com/word-of-the-day")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      state.pattern = data.word;
    });
}
async function validateWord(myWord) {
  let myJSON = {};
  myJSON["word"] = myWord;
  const response = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(myJSON),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      state.validWord = data["validWord"];
      console.log("word validated!!!");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
