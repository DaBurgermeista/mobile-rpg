import { player } from "./data/player.js";
import { enemies } from "./data/enemies.js";

const nameEl = document.getElementById('player-name');
const hpEl = document.getElementById('player-hp');
const xpEl = document.getElementById('player-xp');
const logEl = document.getElementById('log');

function updateUI() {
  nameEl.textContent = player.name;
  hpEl.textContent = player.hp;
  xpEl.textContent = player.xp;
}

function log(message) {
  logEl.innerHTML = `<p>${message}</p>`;
}

document.getElementById('fight-button').addEventListener("click", () => {
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  const damage = enemy.attack;
  player.hp -= damage;

  if (player.hp <= 0) {
    player.hp = 0;
    log(`💀 The ${enemy.name} defeated you!`);
  } else {
    player.xp += enemy.xp;
    log(`⚔️ You fought a ${enemy.name} and took ${damage} damage.`);
  }

  updateUI();
});

document.getElementById('rest-button').addEventListener("click", () => {
  player.hp = player.maxHp;
  log(`💤 You feel rested.`);
  updateUI();
});

updateUI();