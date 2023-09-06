// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { getAsset } from './assets';
import { getCurrentState } from './state';
import RendererLayer from './renderer-layer';
import { renderMenu } from './input';

const Constants = require('../shared/constants');
const { MAP_SIZE, RENDER_SIZE, TILE_SIZE } = Constants;
const { truncateToFiveCharacters, mapLengthToFlexTd, truncateToFourCharacters, compareObjects, mapJobToSize } = require('../shared/util');

// Create the canvas graphics context and variables
let canvas = document.getElementById('map');
let ctx = canvas.getContext('2d');
let buffer = canvas.cloneNode();
let bufferCtx = buffer.getContext('2d');

// player UI
let nameEl = document.getElementById('stat-name');
let levelEl = document.getElementById('stat-level');
let jobEl = document.getElementById('stat-job');
let titleEl = document.getElementById('stat-title');
let goldEl = document.getElementById('stat-gold');
let hpEl = document.getElementById('stat-hp');
let hpMaxEl = document.getElementById('stat-hp-max');
let hpBarEl = document.getElementById('stat-hp-bar');
let mpEl = document.getElementById('stat-mp');
let mpMaxEl = document.getElementById('stat-mp-max');
let mpBarEl = document.getElementById('stat-mp-bar');

let strengthEl = document.getElementById('stat-strength');
let vitalityEl = document.getElementById('stat-vitality');
let agilityEl = document.getElementById('stat-agility');
let intelligenceEl = document.getElementById('stat-intelligence');
let luckEl = document.getElementById('stat-luck');

let playerCache = {};
let hoverX = null;
let hoverY = null;


let layers = [
  new RendererLayer('map',       {draw: true,   mergeWithPrevLayer: false}),
  
  // new RendererLayer('furniture', {draw: false,   mergeWithPrevLayer: true}),
  // new RendererLayer('item',      {draw: false,   mergeWithPrevLayer: true}),
  new RendererLayer('sprite',    {draw: true,   mergeWithPrevLayer: false}),
  new RendererLayer('smash',    {draw: true,   mergeWithPrevLayer: true}), 
  new RendererLayer('damage',    {draw: true,   mergeWithPrevLayer: false}),
  new RendererLayer('info',    {draw: true,   mergeWithPrevLayer: false}),

  // new RendererLayer('lighting',  {draw: true,    mergeWithPrevLayer: false}),
];
let canvasSize = RENDER_SIZE;
let devicePixelRatio = window.devicePixelRatio || 1;
let offsetX = Math.floor(canvasSize * 0.5);
let offsetY = Math.floor(canvasSize * 0.5);
let bgColor = '#000';
let font = 'Friend';

resize(canvasSize);

function resize(size) {
  if(size !== void 0){
    canvasSize = size;
  }
  size = canvasSize * TILE_SIZE;

  if(devicePixelRatio !== 1){
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    buffer.style.width = size + 'px';
    buffer.style.height = size + 'px';

    size = Math.round(size * devicePixelRatio);
  }
  canvas.width = size;
  canvas.height = size;

  buffer.width = size;
  buffer.height = size;
  bufferCtx.scale(devicePixelRatio, devicePixelRatio);
  offsetX = Math.floor(canvasSize * 0.5);
  offsetY = Math.floor(canvasSize * 0.5);
}

let animationFrameRequestId;

// renders map and ui
function render() {
  fillBg();
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    for (var x = canvasSize - 1; x >= 0; x--) {
      for (var y = canvasSize - 1; y >= 0; y--) {
        // no need to recenter and recalculate actual map coordinates, should only get the 10x10 from server  
        drawTile(x, y, layer);
      }
    }
  }
  // draw cursor
  if(hoverX){
    bufferCtx.drawImage(getAsset('cursor.png'), hoverX * TILE_SIZE, hoverY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  renderHtml();
  renderMenu();
  drawBufferToCanvas();
  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(render);
}

function drawTile(x, y, layer){
  var tileData = {};

  tileData = layer.getModifiedTileData(x, y, tileData);

  if(layer.cancelTileDrawWhenNotFound && !tileData){
      return false;
  }
  if(tileData && layer.draw){
    drawTileToCanvas(x, y, tileData, bufferCtx);
  }
}

function drawTileToCanvas(x, y, tileData, ctx) {
  ctx = ctx || bufferCtx;

  if(tileData.bgColor){
      ctx.fillStyle = tileData.bgColor;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  var imgX = x * (TILE_SIZE) + (TILE_SIZE * 0.5) + (tileData.offsetX || 0);
  var imgY = y * (TILE_SIZE) + (TILE_SIZE * 0.5) + (tileData.offsetY || 0);
  if(tileData.sprite){
    var asset = getAsset(tileData.sprite);
    var offsetW = TILE_SIZE/2;
    var offsetSize = TILE_SIZE;
    if(tileData.stunned){
      ctx.globalAlpha = 0.5;
      ctx.drawImage(asset, imgX - offsetW, imgY - offsetW, offsetSize, offsetSize);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(getAsset('stunned.png'), imgX - offsetW + 20, imgY - offsetW - 10, 20, 20);
    }
    else
      ctx.drawImage(asset, imgX - offsetW, imgY - offsetW, offsetSize, offsetSize);
  }
  else if(tileData.char && tileData.color){
      if(tileData.mask){
          ctx.save();
          ctx.beginPath();
          ctx.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.clip();
          ctx.closePath();
      }

      var fontSize = tileData.fontSize || TILE_SIZE;
      var textX = x * (TILE_SIZE) + (TILE_SIZE * 0.5) + (tileData.offsetX || 0);
      var textY = y * (TILE_SIZE) + (TILE_SIZE * 0.5) + (tileData.offsetY || 0);

      ctx.fillStyle = tileData.color;
      ctx.textAlign = tileData.textAlign || 'center';
      ctx.textBaseline = tileData.textBaseline || 'middle';

      ctx.font = fontSize + 'px ' + (tileData.font || font);
      if(tileData.charStrokeColor){
          ctx.strokeStyle = tileData.charStrokeColor;
          ctx.lineWidth = tileData.charStrokeWidth || 1;
          ctx.strokeText(tileData.char, textX, textY);
          ctx.strokeText(tileData.char, textX, textY+1);
      }
      ctx.fillText(tileData.char, textX, textY);
      if(tileData.mask){
          ctx.restore();
      }

  }
  if(tileData.hp){
    if(tileData.hp != tileData.hpMax){
      var hpX = x * (TILE_SIZE) + (TILE_SIZE * 0.1);
      var hpY = y * (TILE_SIZE) + (TILE_SIZE * 0.5) + 25;
      var hpWidth = Math.round((tileData.hp / tileData.hpMax) * (TILE_SIZE * 0.8));
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e5e5e5';
      // ctx.fillStyle = '#e5e5e5';
      // ctx.roundRect(hpX, hpY, (TILE_SIZE * 0.8), 10, 5);
      // ctx.fill();
      ctx.fillStyle = '#71bc68';
      // ctx.fillStyle = '#e5e5e5';
      ctx.fillRect(hpX, hpY, hpWidth, 4);
      ctx.strokeRect(hpX, hpY, (TILE_SIZE * 0.8), 4);
    }
  }
  if(tileData.name){
    var fontSize = TILE_SIZE/4;
    var nameX = x * (TILE_SIZE) + (TILE_SIZE * 0.5);
    var nameY = y * (TILE_SIZE) + (TILE_SIZE * 0.5) + 33;
    if(tileData.hp != tileData.hpMax)
      nameY += 5;
    ctx.fillStyle = '#e5e5e5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = fontSize + 'px ' + (tileData.font || font);
    ctx.fillText(tileData.name.toUpperCase(), nameX, nameY);
  }
  if(tileData.borderColor){
      var borderWidth = tileData.borderWidth || 1;
      var borderOffset = Math.floor(borderWidth * 0.5);
      var borderRectSize = TILE_SIZE - borderWidth;
      if(borderWidth % 2 !== 0){
          borderOffset += 0.5;
      }
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = tileData.borderColor;

      var bx = x * TILE_SIZE + borderOffset;
      var by = y * TILE_SIZE + borderOffset;
      ctx.strokeRect(bx, by, borderRectSize, borderRectSize);
  }
}

function fillBg(color, ctx) {
  ctx = ctx || bufferCtx;
  ctx.fillStyle = color || bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBufferToCanvas(){
  // draw from buffer canvas to canvas in DOM only once all buffer draws are complete
  ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
}

export function mouseToPixelCoords(x, y){
  var pos = canvas.getBoundingClientRect(),
      mx = x - pos.left,
      my = y - pos.top;
  return {x: mx, y: my};
}

export function updateHoveredTile(event) {
  var coords = mouseToPixelCoords(event.clientX, event.clientY);
  hoverX = Math.floor(coords.x / Constants.TILE_SIZE);
  hoverY = Math.floor(coords.y / Constants.TILE_SIZE);
}

export function clearHoveredTile(event) {
  hoverX = null;
  hoverY = null;
}

export function getHoveredCoords(){
  return {x: hoverX, y: hoverY};
}

function renderHtml(){
  let player = getCurrentState().player;
  if(!player)
    return;
  let {inventory, jobs, outfits, sprite, stats, weapon, socketId, ...rest} = player;
  if(compareObjects(rest, playerCache))
      return;
  playerCache = rest;
  nameEl.innerHTML = 'Name: ' + player.name;
  levelEl.innerHTML = 'Level: ' + player.level;
  if(player.job)
      jobEl.innerHTML = 'Job: ' + player.job;
  else
      jobEl.innerHTML = 'Job: None'
  
  if(player.job.length > 10){
    var obj = mapJobToSize('Job: ' + player.job);
    console.log(obj);
    jobEl.innerHTML = obj.text;
    jobEl.style.width = obj.width + 'px';
    document.getElementById('status-space-flex').style.width = mapLengthToFlexTd(Math.max(obj.maxLength, player.name.length));
  }
  else{
    jobEl.style.width = 'auto';
    document.getElementById('status-space-flex').style.width = mapLengthToFlexTd(Math.max(player.job.length, player.name.length));
  }
  titleEl.innerHTML = 'Title: ' + player.title;
  goldEl.innerHTML = 'Gold: ' + truncateToFiveCharacters(player.gold);

  hpEl.innerHTML = 'HP: ' + truncateToFourCharacters(player.hp) + '/' + truncateToFourCharacters(player.hpMax);
  hpBarEl.value = player.hp;
  hpBarEl.max = player.hpMax;

  mpEl.innerHTML = 'MP: ' + truncateToFourCharacters(player.mp) + '/' + truncateToFourCharacters(player.mpMax);
  mpBarEl.value = player.mp;
  mpBarEl.max = player.mpMax;

  strengthEl.innerHTML = 'Strength: ' + truncateToFourCharacters(player.strength);
  vitalityEl.innerHTML = 'Vitality: ' + truncateToFourCharacters(player.vitality);
  agilityEl.innerHTML = 'Agility: ' + truncateToFourCharacters(player.agility);
  intelligenceEl.innerHTML = 'Intelligence: ' + truncateToFourCharacters(player.intelligence);
  luckEl.innerHTML = 'Luck: ' + truncateToFourCharacters(player.luck);
}

function renderMainMenu() {
  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}

// animationFrameRequestId = requestAnimationFrame(renderMainMenu);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  document.getElementById('start-menu').style.display = 'none';
  let _game = document.getElementById('game');
  _game.style.height = 'auto';
  _game.style.opacity = 1;
  _game.style.overflow = 'visible';
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(render);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}