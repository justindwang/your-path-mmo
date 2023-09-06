// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, newPlayer, authenticate } from './networking';
import { startRendering, stopRendering } from './renderer';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState, getCurrentState } from './state';

// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const startButton = document.getElementById('start-button');
const input = document.getElementById('name-input');
const start = document.getElementById('start-text');
const name = document.getElementById('start-name-prompt');
const textbox = document.getElementById('name-input');
const select = document.getElementById('class-select');
const loginButton = document.getElementById('login-button');
export var intervalId = null;
let job = '';
let discordId = null;

Promise.all([
  connect(stopGame),
  downloadAssets(),
]).then(() => {

  const fragment = new URLSearchParams(window.location.search);
  const code = fragment.get('code');
  if(code) {
    authenticate(code);
    console.log('code sending');
  }

  // guest play
  startButton.onclick = () => {
    characterSetup();
  };
}).catch(console.error);

function characterSetup(){
  // Start!
  document.getElementById('start-arrow').style.display = 'none';
  loginButton.style.display = 'none';
  input.style.visibility = 'visible';
  input.style.opacity = 1;
  start.style.visibility = 'hidden';
  start.style.opacity = 0;
  name.style.visibility = 'visible';
  name.style.opacity = 1;
  input.addEventListener("keyup", ({key}) => {
      if (key === "Enter") {
          // remove start button listener
          var old_element = document.getElementById("start-button");
          var new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);

          const startClass = document.getElementById('start-class-prompt');
          const name2 = document.getElementById('start-name-prompt');

          startClass.style.visibility = 'visible';
          startClass.style.opacity = 1;
          name2.style.visibility = 'hidden';
          name2.style.opacity = 0;
          textbox.style.visibility = 'hidden';
          textbox.style.opacity = 0;
          select.style.visibility = 'visible';
          select.style.opacity = 1;
          document.getElementById('class-knight').addEventListener('click', () => {job = 'knight'; startGame();});
          document.getElementById('class-knightess').addEventListener('click', () => {job = 'knightess'; startGame();});
          document.getElementById('class-warrior').addEventListener('click', () => {job = 'warrior'; startGame();});
          document.getElementById('class-warrioress').addEventListener('click', () => {job = 'warrioress'; startGame();});
          document.getElementById('class-mage').addEventListener('click', () => {job = 'mage'; startGame();});
          document.getElementById('class-sorceress').addEventListener('click', () => {job = 'sorceress'; startGame();});
          document.getElementById('class-ranger').addEventListener('click', () => {job = 'ranger'; startGame();});
          document.getElementById('class-archeress').addEventListener('click', () => {job = 'archeress'; startGame();});
          document.getElementById('class-ninja').addEventListener('click', () => {job = 'ninja'; startGame();});
          document.getElementById('class-kunoichi').addEventListener('click', () => {job = 'kunoichi'; startGame();});
      }
  });
}

export function stopGame() {
  stopCapturingInput();
  stopRendering();
}

function startGame() {
  let player = {
    name: input.value,
    job: job,
    discordId: discordId,
  }
  newPlayer(player);
  initState();
  startCapturingInput();
  startRendering();

  // for debugging
  intervalId = setInterval(function(){
    console.log(getCurrentState());
  }, 2000);
}

export function manageLogin(obj){
  if(obj.message == 'newPlayer'){
    characterSetup();
    discordId = obj.discordId;
  }
  else{
    // returning player
    initState();
    startCapturingInput();
    startRendering();

    // for debugging
    intervalId = setInterval(function(){
      console.log(getCurrentState());
    }, 2000);
  }
}