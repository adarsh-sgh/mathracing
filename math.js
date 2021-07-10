const socket = io();
socket.on('userJoined', (id) => {
  console.log(`user joined same room with id :${id}`);
  addPlayer(id, 'guest');
});
socket.on('userName', (id, userName) => {
  document.querySelector(`#${id} .lblName`).innerHTML = userName;
});
socket.on('scoreUpdateToClient', (id, scr) => {
  console.log(id, scr);
  if (scr == 10) rankUpdate(id, ++usersCompletedRace);
  scoreUpdate(id, scr);
  moveCar(id, scr * 10);
});
socket.on('existingUsers', (d) => d.forEach((id) => addPlayer(id, 'guest')));
// temporary hack to make all users at same level
hide('settings');
addPlayer('self', 'you');
let from1;
let to1;
let from2;
let to2;
let questionLeft;
let operator;
let correct = 0;
let incorrect = 0;
let num1;
let num2;
let ans;
let userAns;
let intervalId;
let usersCompletedRace = 0;
formRead();
document.getElementById('userAns').focus();

function formRead() {
  from1 = +document.forms.settings.from1.value;
  to1 = +document.forms.settings.to1.value;
  from2 = +document.forms.settings.from2.value;
  to2 = +document.forms.settings.to2.value;
  questionLeft = +document.forms.settings.NumberOfQuestions.value;
  operator = [];
  operatorsSelected();
  correct = 0;
  incorrect = 0;
  document.getElementById('correct').innerHTML = `correct : ${correct}`;
  document.getElementById('incorrect').innerHTML = `incorrect : ${incorrect}`;

  showQues();
}

function quesmul() {
  num1 = intRange(from1, to1);
  num2 = intRange(from2, to2);
  ans = (num1) * (num2);
  const ques = `${num1}&times${num2}`;
  document.getElementById('question').innerHTML = ques;
  document.getElementById('userAns').value = '';
}

function quesadd() {
  num1 = intRange(from1, to1);
  num2 = intRange(from2, to2);
  ans = (num1) + (num2);
  const ques = `${num1}+${num2}`;
  document.getElementById('question').innerHTML = ques;
  document.getElementById('userAns').value = '';
}

function quessub() {
  num1 = intRange(from1, to1);
  num2 = intRange(from2, to2);
  ans = (num1) - (num2);
  const ques = `${num1}-${num2}`;
  document.getElementById('question').innerHTML = ques;
  document.getElementById('userAns').value = '';
}

function quesdiv() {
  num1 = intRange(from1, to1);
  num2 = intRange(from2, to2);
  ans = (num1) / (num2);
  const ques = `${num1}/${num2}`;
  document.getElementById('question').innerHTML = ques;
  document.getElementById('userAns').value = '';
}

function autoEnter() {
  if (Math.abs(+document.getElementById('userAns').value - ans) < 0.01) {
    check();
  }
} // auto enters the answer if it's corrrect

let timeElapsed = 0;
function check() {
  if (correct == 0 && incorrect == 0) {
    const interval = 1;// in seconds
    timerStart();
    function timerStart() {
      intervalId = setInterval(() => {
        timeElapsed += interval;
        const min = Math.floor(timeElapsed / 60);
        const sec = timeElapsed % 60;
        document.getElementById('timer').innerHTML = `${min} : ${sec}`;
      }, 1000 * interval);
    }
  }
  userAns = +document.getElementById('userAns').value;
  if (Math.abs(ans - userAns) < 0.01) {
    correct++;
    document.getElementById('correct').innerHTML = `correct : ${correct}`;
  } else {
    incorrect++;
    document.getElementById('incorrect').innerHTML = `incorrect : ${incorrect}`;
  }
  if (--questionLeft > 0) {
    document.getElementById('notice').innerHTML = `${questionLeft} Question Remaining`;
    showQues();
  } else {
    clearInterval(intervalId);
    document.getElementById('notice').innerHTML = 'Well Done ! Refresh page or Modify settings below to continue practicing.';
    attentionGet('notice', 4);
  }
  // let score=timeElapsed?(correct-incorrect/4)/timeElapsed:0;
  const score = correct;
  console.log(score);
  socket.emit('scoreUpdate', score);
  scoreUpdate('self', score);
  if (score == 10) rankUpdate('self', ++usersCompletedRace);
  moveCar('self', score * 10);
}

function showQues() {
  if (document.getElementById('real').checked) {
    quesReal();
  } else {
    randomElement(operator)();
  }
}

function operatorsSelected() {
  if (document.getElementById('add').checked) {
    operator.push(quesadd);
  }
  if (document.getElementById('sub').checked) {
    operator.push(quessub);
  }
  if (document.getElementById('div').checked) {
    operator.push(quesdiv);
  }
  if (document.getElementById('mul').checked || operator.length == 0) { // if no operator is selected push mul.
    operator.push(quesmul);
  }
}

function attentionGet(id, strength = 1, color = 'Yellow') {
  document.getElementById(id).style.backgroundColor = color;
  setTimeout(() => {
    document.getElementById(id).style.backgroundColor = '';
  }, 500 * strength);
}

function intRange(a, b) {
  return Math.floor(Math.random() * (b - a)) + a;
} // random int from a to b-1

function randomElement(inputArray) {
  const randomIndex = intRange(0, inputArray.length);
  return inputArray[randomIndex];
}

function quesReal() {
  if (ans < 500) {
    mulreal();
  } else if (ans < 1000) {
    addreal();
  } else {
    subreal();
  }

  function mulreal() {
    num1 = userAns || intRange(from1, to1);
    num2 = intRange(0, 20);
    ans = (num1) * (num2);
    const ques = `${num1}&times${num2}`;
    document.getElementById('question').innerHTML = ques;
    document.getElementById('userAns').value = '';
  }

  function addreal() {
    num1 = userAns || intRange(0, 1000);
    num2 = intRange(from2, to2);
    ans = (num1) + (num2);
    const ques = `${num1}+${num2}`;
    document.getElementById('question').innerHTML = ques;
    document.getElementById('userAns').value = '';
  }

  function subreal() {
    num1 = userAns || intRange(from1, to1);
    num2 = intRange(0, 1000);
    ans = (num1) - (num2);
    const ques = `${num1}-${num2}`;
    document.getElementById('question').innerHTML = ques;
    document.getElementById('userAns').value = '';
  }
}

function dropdownState(idToggled, idButton) {
  if (document.getElementById(idToggled).style.display == 'none') {
    writeOn(idButton, '▼');
  } else {
    writeOn(idButton, '▲');
  }
}

function hide(id) {
  document.getElementById(id).style.display = 'none';
}

function show(id) {
  document.getElementById(id).style.display = 'block';
}

function toggleVisibility(id) {
  if (document.getElementById(id).style.display == 'none') {
    show(id);
  } else hide(id);
}

function writeOn(id, message) {
  document.getElementById(id).innerHTML = message;
}

function toggleLevel() {
  toggleVisibility('levelSet');
  dropdownState('levelSet', 'levelDropdownSymbol');
}

// code related to service workers(for making app pwa) copied from web!
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// let deferredPrompt;
// const addBtn = document.querySelector('.add-button');
// addBtn.style.display = 'none';
// window.addEventListener('beforeinstallprompt', (e) => {
//    // Prevent Chrome 67 and earlier from automatically showing the prompt
//    e.preventDefault();
//    // Stash the event so it can be triggered later.
//    deferredPrompt = e;
//    // Update UI to notify the user they can add to home screen
//    addBtn.style.display = 'block';

//    addBtn.addEventListener('click', (e) => {
//       // hide our user interface that shows our A2HS button
//       addBtn.style.display = 'none';
//       // Show the prompt
//       deferredPrompt.prompt();
//       // Wait for the user to respond to the prompt
//       deferredPrompt.userChoice.then((choiceResult) => {
//          if (choiceResult.outcome === 'accepted') {
//             console.log('User accepted the A2HS prompt');
//          } else {
//             console.log('User dismissed the A2HS prompt');
//          }
//          deferredPrompt = null;
//       });
//    });
// });

function addPlayer(id, name) {
  const carHtml = `<tr id="${id}">
   <td align="left" width="80%" style="vertical-align: bottom;">
       <div class="progressBar" style="padding-left: 0%;">
           <div class="avatar avatar-self">
               <div class="nameContainer">
                   <div class="lblName" style="white-space: nowrap;">${name}</div><span
                       class="lblUsername">
                       <!-- add username here -->
                       </span>
               </div><img
                   src="https://play.typeracer.com/com.typeracer.redesign.Redesign/clear.cache.gif"
                   style="width:58px;height:24px;background:url(https://play.typeracer.com/com.typeracer.redesign.Redesign/335AE846C4E0C3647FC3331F512A1E25.cache.png) no-repeat -638px 0px;"
                   border="0">
           </div>
       </div>
   </td>
   <td align="left" width="20%" style="vertical-align: top;">
       <div class="rankPanel">
           <div class="rank" style="white-space: normal;">
         <!--rank-->  
           </div>
           <div class="rankPanelScore rankPanelWpm-self" style="white-space: normal;">
           <!--score-->
           </div>
       </div>
   </td>
</tr>`;

  document.getElementById('tbody').innerHTML += carHtml;
}
function moveCar(id, positionPercentage) {
  // multiplying positionPercentage with .9 is a hack in below line so that car does'nt goes beyond road
  document.querySelector(`#${id} .progressBar`).style.paddingLeft = `${String(positionPercentage * 0.9)}%`;
}
function rankUpdate(id, rank) {
  document.querySelector(`#${id} .rank`).innerHTML = `Rank: ${rank}`;
}

function scoreUpdate(id, score) {
  document.querySelector(`#${id} .rankPanelScore`).innerHTML = `${score} questions done`;
}

function sendName() {
  const name = document.getElementById('name').value;
  socket.emit('userName', name);
  hide('name');
  document.getElementById('userAns').focus();
}
