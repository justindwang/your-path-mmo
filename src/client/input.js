// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { keyInput, mouseMapInput, menuInput, skillInput } from './networking';
import { mouseToPixelCoords, updateHoveredTile, clearHoveredTile, getHoveredCoords } from './renderer';
import { getCurrentState } from './state';
import { wrap } from './console';
import { rankToColorHtml, truncateToFiveCharacters, mapGroupToIcon, compareArraysOfObjects, compareObjects } from '../shared/util';

const Constants = require('../shared/constants');

// document elements for menu

// weapon/skill tab
var weaponTab = document.getElementById('skill-weapon');
var skillTab = document.getElementById('skill-skills');
var skillFoot = document.getElementById('skill-foot')
var skillBody = document.getElementById('skill-body');

// ui elements
var shopTab = document.getElementById('shop-buy');
var sellTab = document.getElementById('shop-sell');

var inventoryButton = document.getElementById('pr-inventory');
var shopButton = document.getElementById('pr-shop');
var statsButton = document.getElementById('pr-stats');
var skillsButton = document.getElementById('pr-skills');
var jobsButton = document.getElementById('pr-jobs');
var outfitsButton = document.getElementById('pr-outfits');

var inventoryWindowEl = document.getElementById('inventory-window');
var shopWindowEl = document.getElementById('shop-window');
var statsWindowEl = document.getElementById('stats-window');
var skillsWindowEl = document.getElementById('skills-window');
var jobsWindowEl = document.getElementById('jobs-window');
var outfitsWindowEl = document.getElementById('outfits-window');

var inventoryFootType = document.getElementById('inventory-foot-type');
var inventoryFootRarity = document.getElementById('inventory-foot-rarity');
var inventoryFootName = document.getElementById('inventory-foot-name');
var sellFoot = document.getElementById('shop-foot');
var sellFootType = document.getElementById('shop-foot-type');
var sellFootRarity = document.getElementById('shop-foot-rarity');
var sellFootName = document.getElementById('shop-foot-name');
var statsFootType = document.getElementById('stats-foot-type');
var statsFootRarity = document.getElementById('stats-foot-rarity');
var statsFootName = document.getElementById('stats-foot-name');

var skillsFootRarity = document.getElementById('skills-foot-rarity');
var skillsFootName = document.getElementById('skills-foot-name');
var jobsFootName =  document.getElementById('jobs-foot-name');
var outfitsFootName = document.getElementById('outfits-foot-name');

var inventoryBody = document.getElementById('inventory-body');
var outfitsBody = document.getElementById('outfits-body');
var skillsBody = document.getElementById('skills-body');
var jobsBody = document.getElementById('jobs-body');
var shopBody = document.getElementById('shop-body');
var statsBody = document.getElementById('stats-body');

var currDisplay = 'none';
var buyOrSell = 'buy';
var weaponOrSkill = 'weapon';

// state caches
var inventoryCache = [];
var shopCache = [];
var shopInventoryCache = [];
var skillsCache = [];
var jobsCache = [];
var outfitsCache = [];
var fusedSkillCache = [];
var skillCdCache = null;
var statPointsCache = null;
var deadCache = null;
var weaponCache = null;

function clearCaches(){
  inventoryCache = [];
  shopCache = [];
  shopInventoryCache = [];
  skillsCache = [];
  jobsCache = [];
  outfitsCache = [];
  fusedSkillCache = [];
  statPointsCache = null;
  deadCache = null;
  weaponCache = null;
}

function renderWeapon(skipCache){
  weaponTab.style.color = '#e5e5e5';
  skillTab.style.color = '#ffffff33';
  var player = getCurrentState().player;
  if(!player){
    return;
  }
  var weapon = player.weapon;
  if(!weapon){
    return;
  }
  if(!skipCache){
    if(compareObjects(weaponCache, weapon))
      return;
  }
  weaponCache = weapon;
  var html = '';
  html += '<div class="weapon-icon"><img src="assets/' + weapon.sprite + '"/></div><div class="newline"></div><div class="tr"><div class="td_weapon" >[Name: ' + wrap(weapon) + ']</div></div><div class="tr"><div class="td_weapon">Weapon Rank: '+ weapon.rank + '</div></div><div class="tr"><div class="td_weapon">Modifiers: ' + weapon.stats + '</div></div><div class="tr"><div class="td_weapon">Range: ' + weapon.range+'</div></div>';
  skillBody.innerHTML = html;
}

function renderSkill(skipCache){
  weaponTab.style.color = '#ffffff33';
  skillTab.style.color = '#e5e5e5';
  var player = getCurrentState().player;
  if(!player){
    return;
  }
  var fusedSkill = player.fusedSkill;
  if(!fusedSkill){
    return;
  }
  if(!skipCache){
    if(compareArraysOfObjects(fusedSkillCache, fusedSkill.list) && fusedSkill.currCd == skillCdCache)
      return;
  }
  fusedSkillCache = fusedSkill.list;
  skillCdCache = fusedSkill.currCd;
  var html = '';
  if(fusedSkillCache.length > 0)
    html += '<div class="skill-icon"><div id="skill-overlay-container"><div id="skill-overlay"></div></div><div class="skill-icon-img" id="skill-icon-img"></div></div>';
  skillBody.innerHTML = html;

  // making skill collage
  let cssStyles = '';
  for (let i = 1; i <= fusedSkill.list.length; i++) {
    cssStyles += `#section${i} { background-position: 0 ${-100 * (i - 1)}%; }`;
  }

  // Create the style element dynamically and set the CSS styles
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    .skill-icon-img {
      width:80%;
      height:80%;
      margin-left: 10%;
      margin-top: 10%;
      filter: drop-shadow(0 0 5px 3px rgba(255,255,255,0.5));
      -webkit-filter: drop-shadow(0 0 5px rgba(255,255,255,0.5));
      display: grid;
      grid-template-rows: repeat(${fusedSkill.list.length}, 1fr);
      border-radius: 5px;
      overflow: hidden;
      z-index: 1;
    }
    .collage-section {
      width: 100%;
      height: 100%;
      background-size: 100% ${fusedSkill.list.length * 100}%;
    }
    ${cssStyles}
  `;

  // Remove the old styleElement (if it exists) to avoid cluttering the styles
  const existingStyleElement = document.getElementById('collage-styles');
  if (existingStyleElement) {
    document.head.removeChild(existingStyleElement);
  }

  // Set an id for the new style element
  styleElement.id = 'collage-styles';

  // Append the new style element to the head of the document
  document.head.appendChild(styleElement);

  // Generate the HTML for the collage sections
  const collageContainer = document.getElementById('skill-icon-img');
  for (let i = 0; i < fusedSkill.list.length; i++) {
    const collageSection = document.createElement('div');
    collageSection.classList.add('collage-section');
    collageSection.id = `section${i + 1}`;
    collageSection.style.backgroundImage = `url('assets/${fusedSkill.list[i].sprite}')`;
    collageContainer.appendChild(collageSection);
  }

  // update cd
  var overlay = document.getElementById('skill-overlay');
  if(overlay){
    var currCd = fusedSkill.currCd;
    var maxCd = fusedSkill.maxCd;
    var cooldownPercentage =  (1 - currCd / maxCd) * 100;

    // Scale the cooldown overlay to the calculated percentage
    overlay.style.transform = `scaleX(${1 - cooldownPercentage / 100})`;
  }
  // Check if the cooldown is complete
  // if (currCd <= 0) {
  //   // Reset the cooldown overlay when the cooldown is complete
  //   overlay.style.transform = 'scaleX(0)';
  // }

  if(fusedSkill.name)
    skillBody.innerHTML += '<div class="newline"></div> <div class="tr"><div class="td_weapon" >[Name: ' + wrap(fusedSkill) + ']</div></div><div class="tr"><div class="td_weapon">Fusion Skill Rank: '+ fusedSkill.rank + '</div></div><div class="tr"><div class="td_weapon">MP Cost: ' + fusedSkill.mpCost + '</div></div><div class="tr"><div class="td_weapon">Cooldown: ' + fusedSkill.cd +' Sec</div></div>';
}

function renderInventory(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var inventory = player.inventory;
  if(!inventory)
    return;
  if(compareArraysOfObjects(inventoryCache, inventory))
    return;
  inventoryCache = inventory;
  var icon = '';
  var color = '';
  var html = '';
  
  for(var i = 0; i<inventory.length; i++){
      icon = '<img src="assets/' +  inventory[i].sprite + '"/>';
      color = rankToColorHtml(inventory[i].rank);
      html += '<div class="menu-item" id="inventory-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + color + inventory[i].name + ' - ​' + inventory[i].rank +'</span><br> <span>' + inventory[i].stats + '</span></h4></div><div class="menu-item-amount"><h4>x' + inventory[i].amount + '</h4></div><div class="menu-item-confirm" id="inventory-item-confirm-'+ i + '"><h4> <span> use item?</span><br><p id="inventory-item-confirm-yes-'+ i + '"> ✔</p> <p id="inventory-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  inventoryBody.innerHTML = html;
  addBodyListeners(inventory, 'inventory', 'use-inventory');
}

function renderShop(skipCache){
  hide(sellFoot);
  sellTab.style.color = '#ffffff33';
  shopTab.style.color = '#e5e5e5';

  var shop = getCurrentState().shop;
  if(!shop)
    return;
  if(!skipCache){
    if(compareArraysOfObjects(shopCache, shop))
      return;
  }
  shopCache = shop;
  var icon = '';
  var color = '';
  var html = '';
  
  for(var i = 0; i < shop.length; i++){
    icon = '<img src="assets/' +  shop[i].sprite + '"/>'; 
    color = rankToColorHtml(shop[i].rank);
    html += '<div class="menu-item" id="shop-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + color + shop[i].name + ' - ​' + shop[i].rank +'</span> <br> <span>' + shop[i].stats + '</span></h4></div><div class="menu-item-amount"><img src="assets/icons/gold.png"/><p>' + truncateToFiveCharacters(shop[i].cost) + '</p></div><div class="menu-item-confirm" id="shop-item-confirm-'+ i + '"><h4> <span> Buy item?</span><br><p id="shop-item-confirm-yes-'+ i + '"> ✔</p> <p id="shop-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  shopBody.innerHTML = html;
  addBodyListeners(shop, 'shop', 'use-shop');
}

function renderSell(skipCache){
  show(sellFoot);
  shopTab.style.color = '#ffffff33';
  sellTab.style.color = '#e5e5e5';
  var player = getCurrentState().player;
  if(!player)
    return;
  var inventory = player.inventory;
  if(!inventory)
    return;
  if(!skipCache){
    if(compareArraysOfObjects(shopInventoryCache, inventory))
      return;
  }
  shopInventoryCache = inventory;
  var icon = '';
  var color = '';
  var html = '';
            
  for(var i = 0; i<inventory.length; i++){
    icon = '<img src="assets/' +  inventory[i].sprite + '"/>';
    color = rankToColorHtml(inventory[i].rank);
    html += '<div class="menu-item" id="sell-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + color + inventory[i].name + ' - ​' + inventory[i].rank +'</span><br> <span>' + inventory[i].stats + '</span></h4></div><div class="menu-item-amount"><h4>x' + inventory[i].amount + '</h4></div><div class="menu-item-confirm" id="sell-item-confirm-'+ i + '"><h4> <span> Sell item?</span><br><p id="sell-item-confirm-yes-'+ i + '"> ✔</p> <p id="sell-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  shopBody.innerHTML = html;
  addBodyListeners(inventory, 'sell', 'use-sell');
}

function renderSkills(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var skills = player.skills;
  if(!skills)
    return;
  if(compareArraysOfObjects(skillsCache, skills))
    return;
  skillsCache = skills;
  var icon = '';
  var color = '';
  var html = '';
  
  for(var i = 0; i<skills.length; i++){
      icon = '<img src="assets/' +  skills[i].sprite + '" class="skills-img"/>';
      color = rankToColorHtml(skills[i].rank);
      html += '<div class="menu-item" id="skills-item-'+ i + '"><div class="menu-item-icon2">' + icon + '</div><div class="menu-item-info"><h4>' + color + skills[i].name + ' - ​' + skills[i].rank +'</span><br> <span>' + skills[i].description + '</span></h4></div><div class="menu-item-confirm" id="skills-item-confirm-'+ i + '"><h4> <span> Fuse skill?</span><br><p id="skills-item-confirm-yes-'+ i + '"> ✔</p> <p id="skills-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  skillsBody.innerHTML = html;
  addBodyListeners(skills, 'skills', 'fuse-skills');
}

function renderJobs(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var jobs = player.jobs;
  if(!jobs)
    return;
  if(compareArraysOfObjects(jobsCache, jobs))
    return;
  jobsCache = jobs;
  var icon = '';
  var html = '';
  
  for(var i = 0; i<jobs.length; i++){
      icon = '<img src="assets/icons/' +  jobs[i].sprite + '"/>';
      html += '<div class="menu-item" id="job-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + jobs[i].name + '<br> <span style="color: #ffffff33;">' + jobs[i].description + '</span></h4></div><div class="menu-item-confirm" id="job-item-confirm-'+ i + '"><h4> <span> Change job?</span><br><p id="job-item-confirm-yes-'+ i + '"> ✔</p> <p id="job-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  jobsBody.innerHTML = html;
  addBodyListeners(jobs, 'job', 'use-job');
}

function renderOutfits(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var outfits = player.outfits;
  if(!outfits)
    return;
  if(compareArraysOfObjects(outfitsCache, outfits))
    return;
  outfitsCache = outfits;
  var icon = '';
  var html = '';
  
  for(var i = 0; i<outfits.length; i++){
      icon = '<img src="assets/icons/' +  outfits[i].sprite + '"/>';

      html += '<div class="menu-item" id="outfit-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + outfits[i].name + '<br> <span style="color: #ffffff33;">' + outfits[i].description + '</span></h4></div><div class="menu-item-confirm" id="outfit-item-confirm-'+ i + '"><h4> <span> Change outfit?</span><br><p id="outfit-item-confirm-yes-'+ i + '"> ✔</p> <p id="outfit-item-confirm-no-'+ i + '">✘</p></h4></div></div>';
  }
  outfitsBody.innerHTML = html;
  addBodyListeners(outfits, 'outfit', 'use-outfit');
}

// need to add stats cache
function renderStats(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var stats = player.stats;
  if(!stats)
    return;
  var icon = '';
  var color = '';
  var html = '';       
  for(var i = 0; i< stats.length; i++){
      icon = mapGroupToIcon(stats[i].group);
      color = rankToColorHtml(stats[i].rank);
      html += '<div class="menu-item" id="stats-item-'+ i + '"><div class="menu-item-icon">' + icon + '</div><div class="menu-item-info"><h4>' + color + stats[i].name + ' - ​' + stats[i].rank +'</span> <br> <span>' + stats[i].count + '</span></h4></div></div>';
  }
  statsBody.innerHTML = html;
}

function renderStatPoints(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var statPoints = player.statPoints;
  if(statPoints == null)
    return;
  if(statPointsCache == statPoints)
    return;
  statPointsCache = statPoints;
  if(statPoints > 0){
    let statPointsEl = document.getElementById('stat-points');
    statPointsEl.innerHTML = '(Stat Points: ' + statPoints + ')';
    let elements = document.querySelectorAll('.player-stat-item');
    for (let element of elements) 
      show(element);
    show(statPointsEl);
  }
  else{
    let elements = document.querySelectorAll('.player-stat-item');
    for (let element of elements) 
      hide(element);
    hide(document.getElementById('stat-points'));
  }
}

function renderRespawn(){
  var player = getCurrentState().player;
  if(!player)
    return;
  var dead = player.dead;
  if(deadCache == dead)
    return;
  deadCache = dead;
  let dark = document.getElementById('game-over-overlay');
  let respawn = document.getElementById('respawn-menu');
  if(!dead){
    hide(dark);
    hide(respawn);
    dark.style.zIndex = -1;
    respawn.style.zIndex = -1;
    dead = false;
  }
  else{
    dark.style.zIndex = 5;
    show(dark);
    respawn.style.zIndex = 6;
    show(respawn);
  }
}

export function renderMenu(){
  if(weaponOrSkill == 'weapon')
    renderWeapon();
  else
    renderSkill();
  renderStatPoints();
  renderRespawn();
  switch(currDisplay){
    case 'shop': 
      if(buyOrSell == 'buy')
        renderShop(false);
      else
        renderSell(false);
      return;
    case 'inventory': renderInventory(); return;
    case 'jobs': renderJobs(); return;
    case 'outfits': renderOutfits(); return;
    case 'stats': renderStats(); return;
    case 'skills': renderSkills(); return;
  }
}


function displayInventoryMenu(){
  currDisplay = 'inventory';
  show(inventoryWindowEl);
  hide(shopWindowEl);
  hide(statsWindowEl);
  hide(skillsWindowEl);
  hide(jobsWindowEl);
  hide(outfitsWindowEl);
}

function displayShopMenu(){
  currDisplay = 'shop';
  show(shopWindowEl);
  hide(inventoryWindowEl);
  hide(statsWindowEl);
  hide(skillsWindowEl);
  hide(jobsWindowEl);
  hide(outfitsWindowEl);
}

function displayStatsMenu() {
  currDisplay = 'stats';
  show(statsWindowEl);
  hide(inventoryWindowEl);
  hide(shopWindowEl);
  hide(skillsWindowEl);
  hide(jobsWindowEl);
  hide(outfitsWindowEl);
}

function displaySkillsMenu() {
  currDisplay = 'skills';
  show(skillsWindowEl);
  hide(inventoryWindowEl);
  hide(shopWindowEl);
  hide(statsWindowEl);
  hide(jobsWindowEl);
  hide(outfitsWindowEl);
}

function displayJobsMenu() {
  currDisplay = 'jobs';
  show(jobsWindowEl);
  hide(inventoryWindowEl);
  hide(shopWindowEl);
  hide(statsWindowEl);
  hide(skillsWindowEl);
  hide(outfitsWindowEl);
}

function displayOutfitsMenu() {
  currDisplay = 'outfits';
  show(outfitsWindowEl);
  hide(inventoryWindowEl);
  hide(shopWindowEl);
  hide(statsWindowEl);
  hide(skillsWindowEl);
  hide(jobsWindowEl);
}

function sortInventoryType() {
  if(inventoryFootType.style.color == 'rgb(229, 229, 229)')
    inventoryFootType.style.color = '#ffffff33';
  else
    inventoryFootType.style.color = '#e5e5e5';
  inventoryFootRarity.style.color = '#ffffff33';
  inventoryFootName.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-type'});
}

function sortInventoryName() {
  if(inventoryFootName.style.color == 'rgb(229, 229, 229)')
    inventoryFootName.style.color = '#ffffff33';
  else
    inventoryFootName.style.color = '#e5e5e5';
  inventoryFootType.style.color = '#ffffff33';
  inventoryFootRarity.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-name'});
}

function sortInventoryRarity() {
  if(inventoryFootRarity.style.color == 'rgb(229, 229, 229)')
    inventoryFootRarity.style.color = '#ffffff33';
  else
    inventoryFootRarity.style.color = '#e5e5e5'
  inventoryFootType.style.color = '#ffffff33';
  inventoryFootName.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-rarity'});
}

function sortSellType() {
  if(sellFootType.style.color == 'rgb(229, 229, 229)')
    sellFootType.style.color = '#ffffff33';
  else
    sellFootType.style.color = '#e5e5e5';
  sellFootRarity.style.color = '#ffffff33';
  sellFootName.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-type'});
}

function sortSellRarity() {
  if(sellFootRarity.style.color == 'rgb(229, 229, 229)')
    sellFootRarity.style.color = '#ffffff33';
  else
    sellFootRarity.style.color = '#e5e5e5'
  sellFootType.style.color = '#ffffff33';
  sellFootName.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-rarity'});
}

function sortSellName() {
  if(sellFootName.style.color == 'rgb(229, 229, 229)')
    sellFootName.style.color = '#ffffff33';
  else
    sellFootName.style.color = '#e5e5e5';
  sellFootType.style.color = '#ffffff33';
  sellFootRarity.style.color = '#ffffff33';
  menuInput({type:'sort-inventory-name'});
}

function sortJobsName(){
  if(jobsFootName.style.color == 'rgb(229, 229, 229)')
    jobsFootName.style.color = '#ffffff33';
  else
    jobsFootName.style.color = '#e5e5e5'
  menuInput({type:'sort-jobs-name'});
}

function sortOutfitsName(){
  if(outfitsFootName.style.color == 'rgb(229, 229, 229)')
    outfitsFootName.style.color = '#ffffff33';
  else
    outfitsFootName.style.color = '#e5e5e5'
  menuInput({type:'sort-outfits-name'});
}

function sortStatsType() {
  if(statsFootType.style.color == 'rgb(229, 229, 229)')
    statsFootType.style.color = '#ffffff33';
  else
    statsFootType.style.color = '#e5e5e5';
  statsFootRarity.style.color = '#ffffff33';
  statsFootName.style.color = '#ffffff33';
  menuInput({type:'sort-stats-type'});
}

function sortStatsRarity() {
  if(statsFootRarity.style.color == 'rgb(229, 229, 229)')
    statsFootRarity.style.color = '#ffffff33';
  else
    statsFootRarity.style.color = '#e5e5e5'
  statsFootType.style.color = '#ffffff33';
  statsFootName.style.color = '#ffffff33';
  menuInput({type:'sort-stats-rarity'});
}

function sortStatsName() {
  if(statsFootName.style.color == 'rgb(229, 229, 229)')
    statsFootName.style.color = '#ffffff33';
  else
    statsFootName.style.color = '#e5e5e5';
  statsFootType.style.color = '#ffffff33';
  statsFootRarity.style.color = '#ffffff33';
  menuInput({type:'sort-stats-name'});
}

function sortSkillsRarity() {
  if(skillsFootRarity.style.color == 'rgb(229, 229, 229)')
    skillsFootRarity.style.color = '#ffffff33';
  else
    skillsFootRarity.style.color = '#e5e5e5';
  skillsFootName.style.color = '#ffffff33';
  menuInput({type:'sort-skills-rarity'});
}

function sortSkillsName() {
  if(skillsFootName.style.color == 'rgb(229, 229, 229)')
    skillsFootName.style.color = '#ffffff33';
  else
    skillsFootName.style.color = '#e5e5e5';
  skillsFootRarity.style.color = '#ffffff33';
  menuInput({type:'sort-skills-name'});
}

export function hide(element){
  element.style.visibility = 'hidden';
  element.style.opacity = 0;
}

export function show(element){
  element.style.visibility = 'visible';
  element.style.opacity = 1;
}

function toggleShow(element){
  if(element.style.opacity == 1)
    hide(element);
  else
    show(element);
}

function addBodyListeners(arr, type, message){
  // var inventory = this.game.player.inventory;
  for(let i = 0; i<arr.length; i++){
      document.getElementById(type + '-item-' + i).addEventListener('click', (event) => {event.stopPropagation(); toggleShow(document.getElementById(type + '-item-confirm-' + i)); });
      document.getElementById(type + '-item-confirm-yes-' + i).addEventListener('click', (event) => { event.stopPropagation(); hide(document.getElementById(type + '-item-confirm-' + i)); menuInput({type: message, index: i});});
      document.getElementById(type + '-item-confirm-no-' + i).addEventListener('click', (event) => {event.stopPropagation(); hide(document.getElementById(type + '-item-confirm-' + i));});
  }
}

export function log(obj){
  document.getElementById(obj.type + '-console-h4').innerHTML = obj.message;
  show(document.getElementById(obj.type + '-console'));
  setTimeout(() => {
    hide(document.getElementById(obj.type + '-console'));
  }, 3000);
}

function getActionFromKeyCode(keyCode) {
  if (keyCode in Constants.KEYCODE_BINDINGS) {
      return Constants.KEYCODE_BINDINGS[keyCode];
  }
  return false;
}

function onKeyboardInput(event) {
  // ignore if modifer keys pressed
  if(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey){
      return true;
  }
  var keyCode = event.keyCode;
  var action = getActionFromKeyCode(keyCode);
  // if no action bound to this keycode resolve the keydown event normally
  if (action === false) {
      return true;
  }
  if (action == 'skill'){
    skillInput(getHoveredCoords());
  }
  else
  // call onKeyAction callback with the action matched
  // this.onKeyAction(action);
    keyInput(action);

  // cancel default browser keypress behavior
  event.preventDefault();
  return false;
}

function onMouseMapInput(event) {
  var coords = mouseToPixelCoords(event.clientX, event.clientY);
  mouseMapInput(coords);
}

function startMenuListeners(){
  inventoryButton.addEventListener('click', displayInventoryMenu);
  shopButton.addEventListener('click', displayShopMenu);
  statsButton.addEventListener('click', displayStatsMenu);
  skillsButton.addEventListener('click', displaySkillsMenu);
  jobsButton.addEventListener('click', displayJobsMenu);
  outfitsButton.addEventListener('click', displayOutfitsMenu);

  inventoryFootType.addEventListener('click', (event) => {event.stopPropagation(); sortInventoryType();});
  inventoryFootRarity.addEventListener('click', (event) => {event.stopPropagation(); sortInventoryRarity();});
  inventoryFootName.addEventListener('click', (event) => {event.stopPropagation(); sortInventoryName();});

  sellFootType.addEventListener('click', (event) => {event.stopPropagation(); sortSellType();});
  sellFootRarity.addEventListener('click', (event) => {event.stopPropagation(); sortSellRarity();});
  sellFootName.addEventListener('click', (event) => {event.stopPropagation(); sortSellName();});

  statsFootType.addEventListener('click', sortStatsType);
  statsFootRarity.addEventListener('click', sortStatsRarity);
  statsFootName.addEventListener('click', sortStatsName);
  skillsFootRarity.addEventListener('click', (event) => {event.stopPropagation(); sortSkillsRarity();});
  skillsFootName.addEventListener('click', (event) => {event.stopPropagation(); sortSkillsName();});
  jobsFootName.addEventListener('click', sortJobsName);
  outfitsFootName.addEventListener('click', sortOutfitsName);
  // document.getElementById('skill-foot-next').addEventListener('click', () => {this.nextSkill()});
  // document.getElementById('skill-foot-back').addEventListener('click', () => {this.prevSkill()});

  document.getElementById('shop-buy').addEventListener('click', () => {buyOrSell = 'buy'; renderShop(true);});
  document.getElementById('shop-sell').addEventListener('click', () => {buyOrSell = 'sell'; renderSell(true);});

  document.getElementById('skill-weapon').addEventListener('click', () => {weaponOrSkill = 'weapon'; renderWeapon(true);});
  document.getElementById('skill-skills').addEventListener('click', () => {weaponOrSkill = 'skill'; renderSkill(true);});

  
  document.addEventListener('click', () => {
    var elements = document.getElementsByClassName("menu-item-confirm");
    for (var i = 0; i < elements.length; i++) {
      hide(elements[i]);
    }
    });
  document.getElementById('up-strength').addEventListener('click', () => { menuInput({type: 'up-stat', stat: 'strength'}); });
  document.getElementById('up-vitality').addEventListener('click', () => { menuInput({type: 'up-stat', stat: 'vitality'}); });
  document.getElementById('up-agility').addEventListener('click', () => { menuInput({type: 'up-stat', stat: 'agility'}); });
  document.getElementById('up-intelligence').addEventListener('click', () => { menuInput({type: 'up-stat', stat: 'intelligence'}); });
  document.getElementById('up-luck').addEventListener('click', () => { menuInput({type: 'up-stat', stat: 'luck'}); });
  
  document.getElementById('respawn-button').addEventListener('click', () => { menuInput({type: 'respawn'}); clearCaches();});
}

export function startCapturingInput() {
  document.addEventListener('keydown', onKeyboardInput);
  var mapEl = document.getElementById('map');
  mapEl.addEventListener('click', onMouseMapInput);
  mapEl.addEventListener('mousemove', updateHoveredTile);
  mapEl.addEventListener('mouseenter', updateHoveredTile);
  mapEl.addEventListener('mouseleave', clearHoveredTile);
  startMenuListeners();
}

export function stopCapturingInput() {
  document.removeEventListener('keydown', onKeyboardInput);
  var mapEl = document.getElementById('map');
  mapEl.removeEventListener('click', onMouseMapInput);
  mapEl.removeEventListener('mousemove', updateHoveredTile);
  mapEl.removeEventListener('mouseenter', updateHoveredTile);
  mapEl.removeEventListener('mouseleave', clearHoveredTile);
}
