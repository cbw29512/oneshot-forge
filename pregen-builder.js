const CLASSES = [
  { id: "barbarian", name: "Barbarian", hd: 12, saves: ["Strength", "Constitution"], skills: 2, skillList: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], primary: ["str", "con", "dex"], sub: "Berserker", caster: null,
    features: { 1: ["Rage", "Unarmored Defense"], 2: ["Reckless Attack", "Danger Sense"], 3: ["Frenzy"], 4: ["Ability Score Improvement"], 5: ["Extra Attack", "Fast Movement"], 6: ["Mindless Rage"], 7: ["Feral Instinct"], 8: ["Ability Score Improvement"], 9: ["Brutal Critical (1 die)"], 10: ["Intimidating Presence"], 11: ["Relentless Rage"], 12: ["Ability Score Improvement"], 13: ["Brutal Critical (2 dice)"], 14: ["Ability Score Improvement"], 15: ["Persistent Rage"], 16: ["Ability Score Improvement"], 17: ["Brutal Critical (3 dice)"], 18: ["Indomitable Might"], 19: ["Ability Score Improvement"], 20: ["Primal Champion"] } },
  { id: "bard", name: "Bard", hd: 8, saves: ["Dexterity", "Charisma"], skills: 3, skillList: ["any"], primary: ["cha", "dex", "con"], sub: "College of Lore", caster: "full",
    features: { 1: ["Bardic Inspiration", "Spellcasting"], 2: ["Jack of All Trades", "Song of Rest"], 3: ["Cutting Words", "Expertise"], 4: ["Ability Score Improvement"], 5: ["Bardic Inspiration (d8)", "Font of Inspiration"], 6: ["Countercharm", "Additional Magical Secrets"], 7: ["—"], 8: ["Ability Score Improvement"], 9: ["Song of Rest (d8)"], 10: ["Bardic Inspiration (d10)", "Expertise", "Magical Secrets"], 11: ["—"], 12: ["Ability Score Improvement"], 13: ["Song of Rest (d10)"], 14: ["Magical Secrets", "Peerless Skill"], 15: ["Bardic Inspiration (d12)"], 16: ["Ability Score Improvement"], 17: ["Song of Rest (d12)"], 18: ["Magical Secrets"], 19: ["Ability Score Improvement"], 20: ["Superior Inspiration"] } },
  { id: "cleric", name: "Cleric", hd: 8, saves: ["Wisdom", "Charisma"], skills: 2, skillList: ["History", "Insight", "Medicine", "Persuasion", "Religion"], primary: ["wis", "con", "str"], sub: "Life Domain", caster: "full",
    features: { 1: ["Spellcasting", "Disciple of Life"], 2: ["Channel Divinity", "Preserve Life", "Turn Undead"], 3: ["—"], 4: ["Ability Score Improvement"], 5: ["Destroy Undead (CR 1/2)"], 6: ["Channel Divinity (2)", "Blessed Healer"], 7: ["—"], 8: ["Ability Score Improvement", "Destroy Undead (CR 1)", "Divine Strike"], 9: ["—"], 10: ["Divine Intervention"], 11: ["Destroy Undead (CR 2)"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Destroy Undead (CR 3)"], 15: ["—"], 16: ["Ability Score Improvement"], 17: ["Destroy Undead (CR 4)", "Supreme Healing"], 18: ["Channel Divinity (3)"], 19: ["Ability Score Improvement"], 20: ["Divine Intervention improvement"] } },
  { id: "druid", name: "Druid", hd: 8, saves: ["Intelligence", "Wisdom"], skills: 2, skillList: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"], primary: ["wis", "con", "dex"], sub: "Circle of the Land", caster: "full",
    features: { 1: ["Druidic", "Spellcasting"], 2: ["Wild Shape", "Natural Recovery"], 3: ["Circle spells"], 4: ["Ability Score Improvement", "Wild Shape (CR 1/2)"], 5: ["—"], 6: ["Land's Stride"], 7: ["—"], 8: ["Ability Score Improvement", "Wild Shape (CR 1)"], 9: ["—"], 10: ["Nature's Ward"], 11: ["—"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Nature's Sanctuary"], 15: ["—"], 16: ["Ability Score Improvement"], 17: ["—"], 18: ["Timeless Body", "Beast Spells"], 19: ["Ability Score Improvement"], 20: ["Archdruid"] } },
  { id: "fighter", name: "Fighter", hd: 10, saves: ["Strength", "Constitution"], skills: 2, skillList: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"], primary: ["str", "con", "dex"], sub: "Champion", caster: null,
    features: { 1: ["Fighting Style", "Second Wind"], 2: ["Action Surge"], 3: ["Improved Critical"], 4: ["Ability Score Improvement"], 5: ["Extra Attack"], 6: ["Ability Score Improvement"], 7: ["Remarkable Athlete"], 8: ["Ability Score Improvement"], 9: ["Indomitable"], 10: ["Additional Fighting Style"], 11: ["Extra Attack (2)"], 12: ["Ability Score Improvement"], 13: ["Indomitable (2)"], 14: ["Ability Score Improvement"], 15: ["Superior Critical"], 16: ["Ability Score Improvement"], 17: ["Action Surge (2)", "Indomitable (3)"], 18: ["—"], 19: ["Ability Score Improvement"], 20: ["Extra Attack (3)"] } },
  { id: "monk", name: "Monk", hd: 8, saves: ["Strength", "Dexterity"], skills: 2, skillList: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"], primary: ["dex", "wis", "con"], sub: "Open Hand", caster: null,
    features: { 1: ["Unarmored Defense", "Martial Arts"], 2: ["Ki", "Unarmored Movement"], 3: ["Open Hand Technique", "Deflect Missiles"], 4: ["Ability Score Improvement", "Slow Fall"], 5: ["Extra Attack", "Stunning Strike"], 6: ["Ki-Empowered Strikes", "Wholeness of Body"], 7: ["Evasion", "Stillness of Mind"], 8: ["Ability Score Improvement"], 9: ["Unarmored Movement improvement"], 10: ["Purity of Body"], 11: ["Tranquility"], 12: ["Ability Score Improvement"], 13: ["Tongue of the Sun and Moon"], 14: ["Diamond Soul"], 15: ["Timeless Body"], 16: ["Ability Score Improvement"], 17: ["Quivering Palm"], 18: ["Empty Body"], 19: ["Ability Score Improvement"], 20: ["Perfect Self"] } },
  { id: "paladin", name: "Paladin", hd: 10, saves: ["Wisdom", "Charisma"], skills: 2, skillList: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"], primary: ["str", "cha", "con"], sub: "Oath of Devotion", caster: "half",
    features: { 1: ["Divine Sense", "Lay on Hands"], 2: ["Fighting Style", "Spellcasting", "Divine Smite"], 3: ["Sacred Weapon", "Turn the Unholy", "Divine Health"], 4: ["Ability Score Improvement"], 5: ["Extra Attack"], 6: ["Aura of Protection"], 7: ["Aura of Devotion"], 8: ["Ability Score Improvement"], 9: ["—"], 10: ["Aura of Courage"], 11: ["Improved Divine Smite"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Cleansing Touch"], 15: ["—"], 16: ["Ability Score Improvement"], 17: ["—"], 18: ["Aura improvements"], 19: ["Ability Score Improvement"], 20: ["Holy Nimbus"] } },
  { id: "ranger", name: "Ranger", hd: 10, saves: ["Strength", "Dexterity"], skills: 3, skillList: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"], primary: ["dex", "wis", "con"], sub: "Hunter", caster: "half",
    features: { 1: ["Favored Enemy", "Natural Explorer"], 2: ["Fighting Style", "Spellcasting"], 3: ["Hunter's Prey", "Primeval Awareness"], 4: ["Ability Score Improvement"], 5: ["Extra Attack"], 6: ["Favored Enemy improvement", "Natural Explorer improvement"], 7: ["Defensive Tactics"], 8: ["Ability Score Improvement", "Land's Stride"], 9: ["—"], 10: ["Hide in Plain Sight", "Natural Explorer improvement"], 11: ["Multiattack"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Vanish", "Favored Enemy improvement"], 15: ["Superior Hunter's Defense"], 16: ["Ability Score Improvement"], 17: ["—"], 18: ["Feral Senses"], 19: ["Ability Score Improvement"], 20: ["Foe Slayer"] } },
  { id: "rogue", name: "Rogue", hd: 8, saves: ["Dexterity", "Intelligence"], skills: 4, skillList: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"], primary: ["dex", "int", "con"], sub: "Thief", caster: null,
    features: { 1: ["Expertise", "Sneak Attack", "Thieves' Cant"], 2: ["Cunning Action"], 3: ["Fast Hands", "Second-Story Work"], 4: ["Ability Score Improvement"], 5: ["Uncanny Dodge"], 6: ["Expertise"], 7: ["Evasion"], 8: ["Ability Score Improvement"], 9: ["Supreme Sneak"], 10: ["Ability Score Improvement"], 11: ["Reliable Talent"], 12: ["Ability Score Improvement"], 13: ["Use Magic Device"], 14: ["Blindsense"], 15: ["Slippery Mind"], 16: ["Ability Score Improvement"], 17: ["Thief's Reflexes"], 18: ["Elusive"], 19: ["Ability Score Improvement"], 20: ["Stroke of Luck"] } },
  { id: "sorcerer", name: "Sorcerer", hd: 6, saves: ["Constitution", "Charisma"], skills: 2, skillList: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"], primary: ["cha", "con", "dex"], sub: "Draconic Bloodline", caster: "full",
    features: { 1: ["Spellcasting", "Dragon Ancestor", "Draconic Resilience"], 2: ["Font of Magic"], 3: ["Metamagic"], 4: ["Ability Score Improvement"], 5: ["—"], 6: ["Elemental Affinity"], 7: ["—"], 8: ["Ability Score Improvement"], 9: ["—"], 10: ["Metamagic"], 11: ["—"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Dragon Wings"], 15: ["—"], 16: ["Ability Score Improvement"], 17: ["Metamagic"], 18: ["Draconic Presence"], 19: ["Ability Score Improvement"], 20: ["Sorcerous Restoration"] } },
  { id: "warlock", name: "Warlock", hd: 8, saves: ["Wisdom", "Charisma"], skills: 2, skillList: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"], primary: ["cha", "con", "dex"], sub: "The Fiend", caster: "pact",
    features: { 1: ["Pact Magic", "Dark One's Blessing"], 2: ["Eldritch Invocations"], 3: ["Pact Boon"], 4: ["Ability Score Improvement"], 5: ["—"], 6: ["Dark One's Own Luck"], 7: ["—"], 8: ["Ability Score Improvement"], 9: ["—"], 10: ["Fiendish Resilience"], 11: ["Mystic Arcanum (6th)"], 12: ["Ability Score Improvement"], 13: ["Mystic Arcanum (7th)"], 14: ["Hurl Through Hell"], 15: ["Mystic Arcanum (8th)"], 16: ["Ability Score Improvement"], 17: ["Mystic Arcanum (9th)"], 18: ["—"], 19: ["Ability Score Improvement"], 20: ["Eldritch Master"] } },
  { id: "wizard", name: "Wizard", hd: 6, saves: ["Intelligence", "Wisdom"], skills: 2, skillList: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"], primary: ["int", "con", "dex"], sub: "School of Evocation", caster: "full",
    features: { 1: ["Spellcasting", "Arcane Recovery", "Evocation Savant", "Sculpt Spells"], 2: ["—"], 3: ["—"], 4: ["Ability Score Improvement"], 5: ["—"], 6: ["Potent Cantrip"], 7: ["—"], 8: ["Ability Score Improvement"], 9: ["—"], 10: ["Empowered Evocation"], 11: ["—"], 12: ["Ability Score Improvement"], 13: ["—"], 14: ["Overchannel"], 15: ["—"], 16: ["Ability Score Improvement"], 17: ["—"], 18: ["Spell Mastery"], 19: ["Ability Score Improvement"], 20: ["Signature Spells"] } }
];

const FULL = {1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,3,1,1,1,1],19:[4,3,3,3,3,2,1,1,1],20:[4,3,3,3,3,2,2,1,1]};
const HALF = {2:[2],3:[3],4:[3],5:[4,2],6:[4,2],7:[4,3],8:[4,3],9:[4,3,2],10:[4,3,2],11:[4,3,3],12:[4,3,3],13:[4,3,3,1],14:[4,3,3,1],15:[4,3,3,2],16:[4,3,3,2],17:[4,3,3,3,1],18:[4,3,3,3,1],19:[4,3,3,3,2],20:[4,3,3,3,2]};
const PACT = {1:[1,1],2:[2,1],3:[0,2],5:[0,0,2],7:[0,0,0,2],9:[0,0,0,0,2],11:[0,0,0,0,3],17:[0,0,0,0,4]};

const classSel = document.getElementById("pg-class");
const subSel = document.getElementById("pg-sub");
const levelSel = document.getElementById("pg-level");
const grid = document.getElementById("pg-grid");
const verify = document.getElementById("pg-verify");

CLASSES.forEach(c => classSel.add(new Option(c.name, c.id)));
for (let i = 0; i <= 20; i++) levelSel.add(new Option(i === 0 ? "0 — on screen" : String(i), String(i)));
levelSel.value = "0";

function current() { return CLASSES.find(c => c.id === classSel.value); }
function level() { return Number(levelSel.value); }
function pb(n) { return n < 1 ? 2 : n < 5 ? 2 : n < 9 ? 3 : n < 13 ? 4 : n < 17 ? 5 : 6; }
function slots(c, n) {
  if (!c.caster || n < 1) return "none";
  const table = c.caster === "half" ? HALF : c.caster === "pact" ? PACT : FULL;
  const keys = Object.keys(table).map(Number).filter(k => k <= n);
  const row = table[keys[keys.length - 1]] || [];
  if (c.caster === "pact") {
    const slot = row.findIndex(x => x) + 1;
    return slot ? row[slot - 1] + " pact slots of level " + slot : "none";
  }
  return row.map((count, i) => count ? "L" + (i + 1) + " × " + count : "").filter(Boolean).join(", ") || "none";
}
function scores(c) {
  const base = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  const arr = [15, 14, 13, 12, 10, 8];
  c.primary.forEach((k, i) => { base[k] = arr[i]; });
  const rest = ["str", "dex", "con", "int", "wis", "cha"].filter(k => !c.primary.includes(k));
  rest.forEach((k, i) => { base[k] = arr[c.primary.length + i]; });
  const asi = [4, 8, 12, 16, 19].filter(n => n <= level()).length;
  base[c.primary[0]] += asi * 2;
  if (base[c.primary[0]] > 20) base[c.primary[0]] = 20;
  return base;
}
function features(c, n) {
  const out = [];
  for (let i = 1; i <= n; i++) (c.features[i] || []).filter(f => f !== "—").forEach(f => out.push("L" + i + " " + f));
  return out;
}
function sneak(n) { return n < 1 ? 0 : Math.ceil(n / 2); }

function render() {
  const c = current();
  subSel.innerHTML = "";
  subSel.add(new Option(c.sub + " (SRD)", c.sub));
  const n = level();
  verify.textContent = n === 0
    ? "Level 0. No class features yet. Standard array applies when you leave 0."
    : c.name + " " + n + " · " + c.sub + " · proficiency +" + pb(n) + " · spell slots: " + slots(c, n) + ". Feature names follow the 2014 SRD class table.";
  grid.innerHTML = CLASSES.map(item => {
    const on = item.id === c.id;
    return '<button type="button" class="pg-card' + (on ? " on" : "") + '" data-id="' + item.id + '"><b>' + item.name + '</b><span>Level ' + (on ? n : 0) + ' · ' + item.sub + '</span></button>';
  }).join("");
  grid.querySelectorAll(".pg-card").forEach(btn => btn.onclick = () => { classSel.value = btn.dataset.id; levelSel.value = "0"; render(); });
}


const SKILLS = [
  ["Acrobatics","dex"],["Animal Handling","wis"],["Arcana","int"],["Athletics","str"],["Deception","cha"],
  ["History","int"],["Insight","wis"],["Intimidation","cha"],["Investigation","int"],["Medicine","wis"],
  ["Nature","int"],["Perception","wis"],["Performance","cha"],["Persuasion","cha"],["Religion","int"],
  ["Sleight of Hand","dex"],["Stealth","dex"],["Survival","wis"]
];
const GEAR = {
  barbarian: "Explorer's pack, four javelins, two handaxes, no armor (Unarmored Defense).",
  bard: "Diplomat's pack, lute, leather armor, dagger, rapier.",
  cleric: "Priest's pack, shield, mace, chain mail, holy symbol.",
  druid: "Explorer's pack, leather armor, wooden shield, scimitar, druidic focus.",
  fighter: "Dungeoneer's pack, chain mail, longsword, shield, light crossbow, 20 bolts.",
  monk: "Dungeoneer's pack, shortsword, 10 darts, no armor.",
  paladin: "Priest's pack, chain mail, longsword, shield, five javelins, holy symbol.",
  ranger: "Explorer's pack, scale mail, longbow, 20 arrows, two shortswords.",
  rogue: "Burglar's pack, leather armor, rapier, shortbow, 20 arrows, thieves' tools.",
  sorcerer: "Dungeoneer's pack, light crossbow, 20 bolts, two daggers, arcane focus, no armor.",
  warlock: "Scholar's pack, leather armor, light crossbow, 20 bolts, two daggers, arcane focus.",
  wizard: "Scholar's pack, spellbook, quarterstaff, dagger, component pouch, no armor."
};
const PERSON = {
  fighter: ["I keep my kit ready.", "Duty. I finish the watch.", "My company is still counting on me.", "I answer a challenge before I answer a question."],
  barbarian: ["I say it plain.", "Freedom. No one holds my rage.", "My people are one road behind me.", "I break what I cannot name."],
  bard: ["I learn a room by its song.", "Art. A true story outlives a sword.", "I owe a song to the one who taught me.", "I cannot leave a crowd unworked."],
  cleric: ["I bless the bread before I eat.", "Faith. The light is borrowed, not owned.", "My temple expects a report.", "I trust a prayer more than a plan."],
  druid: ["I listen before I speak.", "Balance. Take only the night's need.", "The grove still knows my name.", "I distrust a wall."],
  monk: ["I count my breath.", "Discipline. The form is the answer.", "My monastery holds my place.", "I correct people who did not ask."],
  paladin: ["I name the oath before the fight.", "Honor. My word is the armor.", "I swore this in front of witnesses.", "I cannot walk past a wrong."],
  ranger: ["I mark the trail.", "The wild. I keep the road open.", "Someone is waiting at the far end.", "I trust beasts more than towns."],
  rogue: ["I check the exit first.", "Freedom. I owe no lock.", "I still have a debt in a town I will not name.", "I take the useful thing."],
  sorcerer: ["The spark answers when I call.", "Power. I was born with it.", "My bloodline is not a secret at home.", "I reach for magic first."],
  warlock: ["I keep the bargain.", "Knowledge. The patron pays in facts.", "The pact is written. I signed it.", "I ask one question too many."],
  wizard: ["I write it down.", "Knowledge. A spell unread is a spell lost.", "My school still has my name on a slate.", "I will open the book before I open the door."]
};
const SPELLS = {
  bard: ["Vicious Mockery", "Mage Hand", "Cure Wounds", "Healing Word", "Thunderwave", "Hold Person", "Invisibility"],
  cleric: ["Sacred Flame", "Guidance", "Bless", "Cure Wounds", "Guiding Bolt", "Spiritual Weapon", "Revivify"],
  druid: ["Druidcraft", "Produce Flame", "Entangle", "Cure Wounds", "Moonbeam", "Call Lightning", "Conjure Animals"],
  paladin: ["Bless", "Cure Wounds", "Divine Favor", "Lesser Restoration", "Magic Weapon"],
  ranger: ["Cure Wounds", "Hunter's Mark", "Goodberry", "Pass without Trace", "Spike Growth"],
  sorcerer: ["Fire Bolt", "Mage Hand", "Shield", "Magic Missile", "Misty Step", "Fireball", "Counterspell"],
  warlock: ["Eldritch Blast", "Mage Hand", "Hex", "Hellish Rebuke", "Misty Step", "Counterspell", "Fireball"],
  wizard: ["Fire Bolt", "Mage Hand", "Shield", "Magic Missile", "Misty Step", "Fireball", "Counterspell"]
};

function magicItems(c, n) {
  if (n < 1) return "None. Level 0 carries ordinary clothes and a belt knife.";
  const kits = {
    barbarian: ["Potion of healing", "+1 handaxe", "Potion of hill giant strength", "Boots of speed"],
    bard: ["Spell scroll (healing word)", "Cloak of protection", "Spell scroll (invisibility)", "Wand of magic missiles"],
    cleric: ["Spell scroll (cure wounds)", "+1 shield", "Spell scroll (lesser restoration)", "+1 mace"],
    druid: ["Spell scroll (entangle)", "Cloak of elvenkind", "Spell scroll (call lightning)", "Staff of the woodlands"],
    fighter: ["Potion of healing", "+1 longsword", "+1 shield", "+1 chain mail"],
    monk: ["Potion of healing", "Bracers of defense", "Cloak of protection", "Boots of speed"],
    paladin: ["Potion of healing", "+1 longsword", "+1 shield", "Spell scroll (lesser restoration)"],
    ranger: ["Ammunition +1 (20 arrows)", "Bracers of archery", "Cloak of elvenkind", "Boots of elvenkind"],
    rogue: ["Potion of healing", "Cloak of elvenkind", "Boots of elvenkind", "+1 rapier"],
    sorcerer: ["Spell scroll (shield)", "Wand of magic missiles", "Spell scroll (fireball)", "Cloak of protection"],
    warlock: ["Spell scroll (hex)", "Wand of magic missiles", "Spell scroll (counterspell)", "Wand of fear"],
    wizard: ["Spell scroll (shield)", "Spell scroll (magic missile)", "Headband of intellect", "Wand of fireballs"]
  };
  const row = kits[c.id] || ["Potion of healing"];
  const count = n >= 17 ? 4 : n >= 11 ? 4 : n >= 5 ? 3 : n >= 2 ? 2 : 1;
  return row.slice(0, count).join("; ") + ". SRD 5.1. Chosen for this class. No armor on a barbarian or monk. No wand on a fighter.";
}
function sign(n) { return n >= 0 ? "+" + n : String(n); }
function sheetHtml() {
  const c = current();
  const n = level();
  const s = scores(c);
  const mod = k => Math.floor((s[k] - 10) / 2);
  const prof = pb(n);
  const hp = n === 0 ? 4 : c.hd + mod("con") + (n - 1) * (Math.floor(c.hd / 2) + 1 + mod("con"));
  const ac = c.id === "barbarian" || c.id === "monk" ? 10 + mod("dex") + mod(c.id === "monk" ? "wis" : "con") : (["fighter","paladin","cleric"].includes(c.id) ? 16 : ["ranger"].includes(c.id) ? 14 + Math.min(mod("dex"), 2) : 11 + mod("dex"));
  const proficient = new Set((c.skillList[0] === "any" ? ["Perception","Persuasion","Stealth","Arcana","Insight","Investigation"] : c.skillList).slice(0, c.skills));
  const saveNames = new Set(c.saves);
  const abilityName = { str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma" };
  const saveRows = Object.entries(abilityName).map(([k, name]) => {
    const on = saveNames.has(name);
    const bonus = mod(k) + (on && n ? prof : 0);
    return "<div>" + (on && n ? "●" : "○") + " " + name + " " + sign(bonus) + "</div>";
  }).join("");
  const skillRows = SKILLS.map(([name, ab]) => {
    const on = proficient.has(name) && n;
    const bonus = mod(ab) + (on ? prof : 0) + (c.id === "bard" && n >= 2 ? Math.floor(prof / 2) : 0);
    return "<div>" + (on ? "●" : "○") + " " + name + " " + sign(bonus) + "</div>";
  }).join("");
  const toHit = sign(mod(c.primary[0]) + (n ? prof : 0));
  const dmg = sign(mod(c.primary[0]));
  const attacks = n === 0 ? "Unarmed strike +0, 1 bludgeoning." : "Primary weapon " + toHit + " to hit, 1d8" + dmg + ". Ranged " + sign(mod("dex") + prof) + " to hit, 1d8" + sign(mod("dex")) + ".";
  const extra = n >= 5 && ["fighter","barbarian","monk","paladin","ranger"].includes(c.id) ? " Extra Attack: two attacks when you take the Attack action." : "";
  const feats = n === 0 ? ["No class features at level 0."] : features(c, n);
  const pers = PERSON[c.id];
  const spellList = (SPELLS[c.id] || []).slice(0, n === 0 ? 0 : Math.min(7, 1 + Math.ceil(n / 2)));
  const cast = c.caster && n ? "Spell ability " + c.primary[0].toUpperCase() + " · DC " + (8 + prof + mod(c.primary[0])) + " · attack " + sign(prof + mod(c.primary[0])) + " · slots " + slots(c, n) : "No spellcasting.";
  return '<article class="screen-sheet web-fixed-sheet">' +
    '<header class="pr-head"><div class="pr-id"><p class="pr-kicker">99¢ ONE-SHOTS · SRD SHEET</p><h2>' + c.name + ' ' + n + '</h2>' +
    '<p><b>' + c.sub + '</b> · Human · ' + (c.id === "fighter" ? "Soldier" : "Acolyte") + ' · Neutral good</p>' +
    '<p class="pr-subid">2014 SRD 5.1 · XP milestone · proficiency ' + sign(prof) + '</p></div>' +
    '<div class="pr-vitals"><span><small>AC</small><b>' + ac + '</b></span><span><small>Max HP</small><b>' + hp + '</b></span>' +
    '<span><small>Init</small><b>' + sign(mod("dex")) + '</b></span><span><small>Speed</small><b>30</b></span>' +
    '<span><small>Prof</small><b>' + sign(prof) + '</b></span><span><small>Passive Per</small><b>' + (10 + mod("wis") + (proficient.has("Perception") && n ? prof : 0)) + '</b></span></div></header>' +
    '<div class="pr-fixed-grid">' +
    '<section class="pr-zone"><h3>Abilities</h3>' + ["str","dex","con","int","wis","cha"].map(k => "<p><b>" + k.toUpperCase() + "</b> " + s[k] + " (" + sign(mod(k)) + ")</p>").join("") + '</section>' +
    '<section class="pr-zone"><h3>Saving Throws</h3>' + saveRows + '</section>' +
    '<section class="pr-zone"><h3>Skills</h3>' + skillRows + '</section>' +
    '<section class="pr-zone"><h3>Combat</h3><p><b>Current HP</b> ' + hp + ' · <b>Temp HP</b> 0</p><p><b>Hit dice</b> ' + Math.max(n, 1) + 'd' + c.hd + '</p><p><b>Death saves</b> success ○ ○ ○ · failure ○ ○ ○</p><p><b>Attacks</b> ' + attacks + extra + '</p><p><b>Inspiration</b> no</p></section>' +
    '<section class="pr-zone"><h3>Gear and training</h3><p><b>Armor</b> ' + (["fighter","paladin","cleric"].includes(c.id) ? "all armor, shields" : "light armor") + '</p><p><b>Weapons</b> simple weapons' + (["fighter","paladin","ranger","barbarian"].includes(c.id) ? ", martial weapons" : "") + '</p><p><b>Tools</b> ' + (c.id === "rogue" ? "thieves' tools" : "none from class") + '</p><p><b>Languages</b> Common, one extra</p><p><b>Equipment</b> ' + GEAR[c.id] + '</p></section>' +
    '<section class="pr-zone"><h3>Character</h3><p><b>Trait</b> ' + pers[0] + '</p><p><b>Ideal</b> ' + pers[1] + '</p><p><b>Bond</b> ' + pers[2] + '</p><p><b>Flaw</b> ' + pers[3] + '</p></section>' +
    '<section class="pr-zone"><h3>Features</h3><ul>' + feats.map(f => "<li>" + f + "</li>").join("") + '</ul></section>' +
    '<section class="pr-zone"><h3>Spells</h3><p>' + cast + '</p><p>' + (spellList.length ? spellList.join(", ") : "No spells at this level.") + '</p></section>' +
    '</div></article>';
}
document.getElementById("pg-up").onclick = () => { levelSel.value = String(Math.min(20, level() + 1)); render(); };
document.getElementById("pg-print").onclick = () => window.print();
classSel.onchange = () => { levelSel.value = "0"; render(); };
levelSel.onchange = render;
subSel.onchange = render;
const oldRender = render;
render = function () {
  oldRender();
  document.getElementById("pg-print").innerHTML = sheetHtml();
};
render();
