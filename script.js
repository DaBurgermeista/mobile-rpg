import { player } from "./data/player.js";
import { enemies } from "./data/enemies.js";

const nameEl = document.getElementById('player-name');
const hpEl = document.getElementById('player-hp');
const xpEl = document.getElementById('player-xp');
const logEl = document.getElementById('log');

const enemyNameEl = document.getElementById('enemy-name');
const enemyHpEl = document.getElementById('enemy-hp');

const fightBtn = document.getElementById('fight-button');
const attackBtn = document.getElementById('attack-button');
const restBtn = document.getElementById('rest-button');

let currentEnemy = null;

function updateUI() {
  nameEl.textContent = player.name;
  hpEl.textContent = player.hp;
  xpEl.textContent = player.xp;

  if (currentEnemy){
    enemyNameEl.textContent = currentEnemy.name;
    enemyHpEl.textContent = currentEnemy.hp;
  } else {
    enemyNameEl.textContent = "None";
    enemyHpEl.textContent = "--";
  }
}

function log(message) {
  logEl.innerHTML = `<p>${message}</p>`;
}

fightBtn.addEventListener("click", () => {
  const enemyTemplate = enemies[Math.floor(Math.random() * enemies.length)];
  currentEnemy = { ...enemyTemplate }; // Clone
  
  log(`A wild ${currentEnemy.name} appears!`);
  attackBtn.disabled = false;
  updateUI();
});

attackBtn.addEventListener('click', () => {
  if(!currentEnemy) return;

  // Player Attacks
  currentEnemy.hp -= player.attack;
  log(`You hit the ${currentEnemy.name} for ${player.attack} damage.`);

  // Enemy defeated?
  if (currentEnemy.hp <= 0){
    log(`You defeated the ${currentEnemy.name} and gained ${currentEnemy.xp} XP!`);
    player.xp += currentEnemy.xp;
    currentEnemy = null;
    attackBtn.disabled = true;
    updateUI();
    return;
  }

  // Enemy attacks back
  const damage = currentEnemy.attack;
  player.hp -= damage;

  if(player.hp <= 0) {
    player.hp = 0;
    log(`The ${currentEnemy.name} strikes back and you fall in battle!`);
    attackBtn.disabled = true;
    currentEnemy = null;
  } else {
    log(`The ${currentEnemy.name} strikes back for ${damage} damage!`);
  }

  updateUI();
});

restBtn.addEventListener("click", () => {
  if(currentEnemy) {
    log(`You can't rest while in combat!`);
    return;
  }
  player.hp = player.maxHp;
  log(`💤 You feel rested.`);
  updateUI();
});

updateUI();