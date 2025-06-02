import { player } from "./data/player.js";
import { enemies } from "./data/enemies.js";
import { items } from "./data/items.js";

const levelEl = document.getElementById('player-level');
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
let selectedItemIndex = null;
let runStats = {
  turns: 0,
  kills: 0,
  itemsUsed: 0,
  xpEarned: 0,
};

function updateUI() {
  levelEl.textContent = player.level;
  nameEl.textContent = player.name;
  hpEl.textContent = `${player.hp}/${player.maxHp}`;
  xpEl.textContent = `${player.xp}/${player.xpToNext}`;

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
  // runStats.turns++;
  log(`A wild ${currentEnemy.name} appears!\n\n${currentEnemy.flavor}`);
  attackBtn.disabled = false;
  fightBtn.disabled = true;
  updateUI();
});

function checkLevelUp(){
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.attack += 1;
    player.maxHp += 5;
    player.hp = player.maxHp;

    // Increase next level XP threshold
    player.xpToNext = Math.floor(player.xpToNext * 1.5);

    log(`You leveled up to level ${player.level}! +1 Attack, +5 Max HP!`);
    showLevelUpAnimation();
    spawnParticles();
  }
}

function showLevelUpAnimation() {
  const popup = document.getElementById('level-up-popup');
  popup.classList.add("show");
  popup.classList.remove("hidden");

  setTimeout(() => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  }, 1800);
}

function spawnParticles(count = 12) {
  const container = document.getElementById("level-up-particles");
  const containerRect = container.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = "✨";

    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height * 0.6 + containerRect.height * 0.2;

    p.style.position = "absolute";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    p.style.animationDuration = `${Math.random() * 0.5 + 0.8}s`;

    container.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

function showFloatingText(text, type = "xp") {
  const container = document.getElementById('float-effects');
  const float = document.createElement("div");

  float.className = `floating-text ${type}`;
  float.textContent = text;

  float.style.left = `${Math.random() * 70 + 15}%`;
  float.style.top = `${Math.random() *60 + 20}%`;

  container.appendChild(float);

  setTimeout(() => float.remove(), 1000);
}

function updateInventory() {
  const list = document.getElementById('inventory-list');
  list.innerHTML = "";

  player.inventory.forEach((entry, index) => {
    const item = items[entry.id];
    const li = document.createElement("li");
    li.textContent = `${item.name} x${entry.quantity}`;
    li.addEventListener("click", () => {
      selectedItemIndex = index;
      const item = items[entry.id];
      document.getElementById("item-detail-name").textContent = item.name;
      document.getElementById("item-detail-desc").textContent = item.description;
      document.getElementById("item-detail").classList.remove("hidden");
    });

    list.appendChild(li);
  });
}

function useItem(index) {
  const entry = player.inventory[index];
  const item = items[entry.id];

  if (item.effect === "heal") {
    const amount = Math.min(item.value, player.maxHp - player.hp);
    player.hp += amount;
    log(`🩹 You used ${item.name} and recovered ${amount} HP.`);
    showFloatingText(`+${amount} HP`, "heal");
    runStats.itemsUsed += 1;
  }

  entry.quantity -= 1;
  if (entry.quantity <= 0) {
    player.inventory.splice(index, 1);
  }

  updateUI();
  updateInventory();
}

function showRunSummary() {
  const summaryModal = document.getElementById("run-summary");
  const statsList = document.getElementById("run-stats-list");

  statsList.innerHTML = "";

  Object.entries(runStats).forEach(([key, value]) => {
    const li = document.createElement("li");
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    li.textContent = `${label}: ${value}`;
    statsList.appendChild(li);
  });

  const score = calculateScore(runStats);
  const scoreLi = document.createElement("li");
  scoreLi.textContent = `Score: ${score}`;
  scoreLi.style.marginTop = "1rem";
  scoreLi.style.fontWeight = "bold";
  statsList.appendChild(scoreLi);

  summaryModal.classList.remove("hidden");
}


document.getElementById("close-item-btn").addEventListener("click", () => {
  document.getElementById("item-detail").classList.add("hidden");
});

document.getElementById("use-item-btn").addEventListener("click", () => {
  if (selectedItemIndex !== null) {
    useItem(selectedItemIndex);
    document.getElementById("item-detail").classList.add("hidden");
    selectedItemIndex = null;
  }
});

attackBtn.addEventListener('click', () => {
  if(!currentEnemy) return;
  runStats.turns++;
  // Player Attacks
  currentEnemy.hp -= player.attack;
  log(`You hit the ${currentEnemy.name} for ${player.attack} damage.`);
  showFloatingText(`-${player.attack} HP`, "damage");

  // Enemy defeated?
  if (currentEnemy.hp <= 0){
    log(`You defeated the ${currentEnemy.name} and gained ${currentEnemy.xp} XP!`);
    showFloatingText(`+${currentEnemy.xp} XP`, "xp");
    player.xp += currentEnemy.xp;
    runStats.xpEarned += currentEnemy.xp;
    runStats.kills++;
    checkLevelUp();
    if (currentEnemy.loot && currentEnemy.loot.length > 0) {
      const dropId = currentEnemy.loot[Math.floor(Math.random() * currentEnemy.loot.length)];
      const droppedItem = items[dropId];

      if (droppedItem) {
        const existing = player.inventory.find(i => i.id === droppedItem.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          player.inventory.push({id: droppedItem.id, quantity: 1});
        }
        log(`You found a ${droppedItem.name}!`);
        showFloatingText(`+${droppedItem.name}`, "heal");
      }
    }
    updateInventory();
    currentEnemy = null;
    attackBtn.disabled = true;
    fightBtn.disabled = false;
    updateUI();
    return;
  }

  // Enemy attacks back
  const damage = currentEnemy.attack;
  player.hp -= damage;

  if(player.hp <= 0) {
    player.hp = 0;
    log(`You have fallen. Your journey ends here.`);
    attackBtn.disabled = true;
    fightBtn.disabled = true;
    restBtn.disabled = true;
    showRunSummary();
    currentEnemy = null;
  } else {
    log(`The ${currentEnemy.name} strikes back for ${damage} damage!`);
  }

  updateUI();
});

document.getElementById("new-run-btn").addEventListener("click", () => {
  location.reload(); // simplest restart
});

function calculateScore(stats){
  return(
    (stats.kills || 0) * 10 +
    (stats.xpEarned || 0) * 2 +
    (stats.turns || 0) * 1 -
    (stats.itemsUsed || 0) * 5
  );
}

restBtn.addEventListener("click", () => {
  runStats.turns++;
  if(currentEnemy) {
    log(`You can't rest while in combat!`);
    return;
  }
  showFloatingText(`+${player.maxHp - player.hp} HP`, "heal");
  player.hp = player.maxHp;
  log(`💤 You feel rested.`);
  updateUI();
});

updateUI();
updateInventory();
document.getElementById("item-detail").classList.add("hidden");
