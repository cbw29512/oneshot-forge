// Production expansion: seven rooms after the inn, plus printable decks and player-ready pregens.
const existingById = Object.fromEntries(ADVENTURE.rooms.map(r => [r.id, r]));
ADVENTURE.timeline = [
  ["0:00–0:15","The Wishing Cake Inn: the Birthday Hero's wish is stolen"],
  ["0:15–0:35","1. Hall of Forgotten Birthdays"],
  ["0:35–0:55","2. Ruined Banquet Hall"],
  ["0:55–1:15","3. Wrapping Workshop"],
  ["1:15–1:35","4. Balloon Gallery"],
  ["1:35–1:55","5. Candle Maze"],
  ["1:55–2:20","6. Piñata Ballroom"],
  ["2:20–2:35","7. Hall of Wishes"],
  ["2:35–2:55","Wish Circle: Sepulchral"],
  ["2:55–3:00","Return the wish and present the dragon card"]
];

const room = (id,title,minutes,theme,readAloud,details,checks,trap,puzzle,tactics,birthdayHero,transition,dialogue=[],objectives=[]) => ({id,title,minutes,theme,readAloud,details,checks,trap,puzzle,tactics,birthdayHero,transition,dialogue,objectives});

ADVENTURE.rooms = [
  existingById.inn,
  room("forgotten","Room 1: Hall of Forgotten Birthdays","20 minutes","Memory",
    "Portraits line a moonlit corridor, each showing a birthday table with one empty chair. Beneath every portrait rests an unlit candle. At the corridor's end, a fresh canvas bears the Birthday Hero's name—but the painted figure is fading from the scene.",
    ["Six portraits show forgotten celebrants: a lonely child, an old knight, a baker, a sailor, a queen, and the Birthday Hero.","A low chorus whispers: REMEMBER US, AND THE WAY OPENS.","Nothing attacks unless the group repeatedly mocks or destroys the memorials."],
    ["DC 11 History or Insight: the people were not famous; they mattered because someone loved them.","DC 12 Perception: each frame bears a tiny symbol—cake, shield, loaf, wave, crown, dragon.","Any sincere toast, kind memory, or promise lights a candle automatically."],
    "Birthday Shadow: after three cruel or dismissive actions, one shadow forms per two heroes. AC 12, HP 9, +4 to hit, 1d6+2 necrotic; it vanishes when a hero speaks kindly of the forgotten person.",
    "Light all six candles. The Birthday Hero's candle must be last. It lights when another hero says why the Birthday Hero matters to them; the Birthday Hero cannot solve their own candle.",
    "If shadows appear, they extinguish one candle per round instead of focusing on damage.",
    "The Birthday Hero hears every remembered voice say together: ‘Your wish still knows the way home.’ She receives Wish Fragment I: NOT FOR ME ALONE.",
    "The dragon symbol on the Birthday Hero's frame becomes a brass handle and opens the banquet doors.",
    ["Whispering portrait: ‘A birthday forgotten is not a life forgotten—unless no one chooses to remember.’"]),
  existingById.banquet,
  room("wrapping","Room 3: The Wrapping Workshop","20 minutes","Generosity",
    "Ribbons creep across a workshop crowded with paper, bows, tags, and towering gifts. Silver scissors snip by themselves. A plaque above the far door reads: WHAT IS KEPT REMAINS CLOSED. WHAT IS GIVEN OPENS THE WAY.",
    ["Use two Animated Presents for four heroes, three for five or six.","Three marked gifts contain Frosting of Mending, Ribbon of Rescue, and a Party Horn of Heroism.","A box opens safely only when its holder willingly gives it to somebody else."],
    ["DC 12 Insight reveals the plaque is literal.","DC 13 Investigation identifies hostile gifts: their bows are knotted inward like clenched fists.","DC 12 Sleight of Hand lets a hero retie one hostile bow, preventing it from animating."],
    "Wrapping Cocoon: crossing the central ribbon without exchanging a gift triggers DC 13 Dexterity. Failure: restrained; escape DC 12 Strength or Dexterity. Cutting free deals no damage; fire frees the target but deals 1 fire damage.",
    "Each hero chooses a gift and gives it to another hero. Once everyone has given or received sincerely, the door opens. Never require a roll for the core solution.",
    "Animated Presents gang up on isolated heroes and use their ribbons to shove creatures toward the snare.",
    "A gift bearing the Birthday Hero's name cannot be opened by the Birthday Hero. When they give it away, Wish Fragment II appears: BUT FOR ONE MORE ADVENTURE.",
    "Glowing ribbon stitches itself into a bridge leading to the Balloon Gallery."),
  room("balloon-gallery","Room 4: The Balloon Gallery","20 minutes","Joy",
    "Balloons fill the chamber from floor to ceiling. Each translucent sphere shows a moving memory: shared meals, ridiculous jokes, hard-won victories, and quiet kindnesses. Three black balloons drift among them, their strings ending in sparking fuses.",
    ["Three true Birthday Hero memories bear a tiny gold dragon emblem.","A Balloon Swarm hides near the ceiling and attacks only if two wrong balloons are popped.","Tilly can appear here and warn: ‘Memories are carried, not collected.’"],
    ["DC 12 Perception: black balloons cast shadows in the wrong direction.","DC 13 Investigation: the dragon-emblem balloons react to the Birthday Hero's voice.","DC 12 Performance or Persuasion: telling a joyful Birthday Hero story lowers one correct balloon."],
    "Balloon Lift: touching a silver string triggers DC 13 Dexterity. Failure: lifted 20 feet and restrained. Each destroyed balloon lowers the target 5 feet; falling deals normal damage.",
    "Lower all three dragon balloons without popping them. A true memory is ideal, but an invented in-character memory is valid if it celebrates the Birthday Hero's courage, kindness, or humor.",
    "Balloon Swarm: AC 13, HP 22, fly 30; +4 slam, 2d4+2 bludgeoning. Piercing damage deals +2 damage. At half HP it bursts harmlessly into confetti.",
    "The three balloons join and reveal Wish Fragment III: TOGETHER. The Birthday Hero now knows the wish is about sharing another adventure, though they choose the final wording.",
    "The joined balloons become lanterns marking the entrance to the Candle Maze."),
  existingById.candles,
  room("pinata","Room 6: The Piñata Ballroom","25 minutes","Perseverance",
    "Music erupts as the doors open. Colorful piñatas swing above a polished dance floor while candy rattles inside them like teeth. At the center hangs one enormous smiling dragon piñata. Its painted eyes follow the Birthday Hero.",
    ["Use the supplied Piñata Mimic as the main encounter.","Place one supplied Exploding Piñata hazard on each side of the room.","Four support ropes can be cut: AC 12, 5 HP. Each dropped decoration creates a 10-foot patch of difficult terrain."],
    ["DC 13 Perception spots the main mimic breathing.","DC 12 Investigation identifies an Exploding Piñata by its glowing pull-string.","DC 12 Performance lets a hero match the ballroom rhythm, gaining advantage on one movement-related check."],
    "Musical Chairs: initiative count 20, glowing chairs slide 15 feet. A creature in their path makes DC 12 Dexterity or takes 1d6 bludgeoning and falls prone. Sitting in a chair before it moves disables it for that round.",
    "The exit opens when the mimic is defeated, calmed with candy, or lured into detonating an Exploding Piñata. Creative solutions are encouraged.",
    "The mimic uses hanging decorations as concealment, grapples the nearest isolated target, and shoves heroes toward hazards. At half HP, candy or a returned decoration can calm it with DC 13 Animal Handling or Persuasion.",
    "The dragon piñata spits out a golden scale that warms in the Birthday Hero's hand. It reads: KEEP GOING. YOUR WISH IS WAITING.",
    "The music slows into a heartbeat. A silver door opens into the Hall of Wishes."),
  room("hall-wishes","Room 7: The Hall of Wishes","15 minutes","Love",
    "Thousands of tiny lights drift through a silent gallery. Each light whispers a birthday wish: brave wishes, foolish wishes, selfish wishes, and wishes made for someone else. At the far end stands an empty pedestal shaped for the Birthday Hero's missing golden spark.",
    ["This is a roleplay and revelation room; do not force combat.","Three dark wishes show Sepulchral's past: waiting at a window, an unopened door, and an empty chair.","Tilly admits she showed Sepulchral the path because he promised no one would ever be disappointed again."],
    ["DC 12 Insight: Sepulchral is motivated by grief, not cruelty.","DC 13 Arcana: destroying the hall would destroy thousands of harmless wishes.","A hero who offers compassion gains Inspiration for the finale."],
    "Wish Drain: touching a dark wish without care requires DC 12 Wisdom. Failure: disadvantage on the next ability check as the hero experiences someone else's disappointment.",
    "Place the three recovered fragments on the pedestal in order: NOT FOR ME ALONE / BUT FOR ONE MORE ADVENTURE / TOGETHER. The phrase opens the Wish Circle.",
    "No standard tactics. Keep this scene quiet and brief; let players understand the antagonist before meeting him.",
    "The Birthday Hero sees that her wish was never fully formed because the final words must still be chosen by her. Nobody—not even Sepulchral—can decide them.",
    "The pedestal descends, revealing the final chamber."),
  existingById.finale
];

ADVENTURE.npcs = [
  ...ADVENTURE.npcs,
  {name:"Sir Cedric Butterfield",role:"Loud red herring",voice:"Grand, offended, and needlessly formal.",goal:"Avoid blame and preserve his dignity.",secret:"He sampled frosting early but saw a pale figure in the pantry mirror.",lines:["I object to being accused before dessert!","The reflection moved when the man did not."]},
  {name:"Professor Tinklebottom",role:"Gnome birthday historian",voice:"Rapid lecture punctuated by delighted gasps.",goal:"Document living wish magic.",secret:"Knows Sepulchral was once a mortal child.",lines:["A stolen wish remains attached to its dreamer until midnight!","Fascinating. Terrible, yes—but fascinating!"]},
  {name:"Mrs. Bumblewick",role:"Kindly inn guest",voice:"Practical, calm, always knitting.",goal:"Keep frightened guests safe.",secret:"Her late spouse once received a wish from the same cake.",lines:["Heroes need scarves too. Hold still.","A wish need not last forever to have mattered."]},
  {name:"Little Ellie",role:"Young birthday guest",voice:"Direct, curious, fearless.",goal:"Help the Birthday Hero get her wish back.",secret:"Can see wish sparks without magic.",lines:["The gold light went downstairs.","Grown-ups make wishes complicated."]}
];

ADVENTURE.traps = [
  {name:"Confetti Choke",rules:"Trigger: wrong banquet bell. Detect DC 12 Investigation. 10-foot cloud; DC 12 Constitution or blinded until end of next turn. Disarm by removing the stuffed clapper."},
  {name:"Wrapping Cocoon",rules:"Trigger: cross the workshop without exchanging a gift. DC 13 Dexterity or restrained. Escape DC 12 Strength/Dexterity. Cutting frees safely; fire deals 1 damage."},
  {name:"Balloon Lift",rules:"Trigger: silver string. DC 13 Dexterity or lifted 20 feet and restrained. Pop balloons to descend 5 feet each; catch or feather fall prevents falling damage."},
  {name:"Candlefall",rules:"Detect DC 13 Investigation. Pressure tile tips burning candles: DC 13 Dexterity, 2d6 fire, half on success. Jam with an iron spike."},
  {name:"Wax Flood",rules:"Three-round hazard. Round 1 difficult terrain; round 2 DC 12 Strength or speed becomes 0; round 3 one Wax Guardian forms. Cold damage or water clears a 5-foot square."},
  {name:"Musical Chairs",rules:"Initiative 20: chairs slide 15 feet. DC 12 Dexterity or 1d6 bludgeoning and prone. Sitting in a chair disables it for that round."},
  {name:"Exploding Piñata",rules:"Use the supplied card. Always telegraph the glowing pull-string. Allow attacks, thieves' tools, or deliberate use against the mimic."},
  {name:"Wish Drain",rules:"Touch a dark wish: DC 12 Wisdom or disadvantage on the next ability check. Speaking a comforting truth ends the effect early."}
];

ADVENTURE.monsters = [
  {name:"Paper Plate Mimic",rules:"Use supplied cut-and-fold monster card. Banquet Hall ambusher; grapples and drags beneath table."},
  {name:"Animated Present",rules:"Use supplied card. Workshop skirmisher; ribbons restrain and separate heroes."},
  {name:"Piñata Mimic",rules:"Use supplied card. Ballroom centerpiece; can be defeated, tricked, or calmed."},
  {name:"Exploding Piñata",rules:"Use supplied hazard card."},
  {name:"Sepulchral",rules:"Use both supplied cards: base statistics plus Spells & Wish Circle ritual."},
  {name:"Birthday Shadow",rules:"Small undead; AC 12, HP 9, speed 30; +4 touch, 1d6+2 necrotic. Vanishes when someone sincerely remembers its subject."},
  {name:"Balloon Swarm",rules:"Medium swarm; AC 13, HP 22, fly 30; +4 slam, 2d4+2 bludgeoning. Piercing attacks deal +2 damage; bursts harmlessly at 0 HP."},
  {name:"Wax Guardian",rules:"Medium construct; AC 14, HP 27, speed 20; +4 slam, 1d8+2 bludgeoning plus target speed -10 until next turn. Cold damage prevents this rider."},
  {name:"Frosting Ooze",rules:"Small ooze; AC 8, HP 18, speed 15/climb 15; +3 slam, 1d6+1 acid and target is sticky (escape DC 11). Fire deals +2 damage."},
  {name:"Living Streamer",rules:"Small construct; AC 13, HP 11, fly 30; +4 lash, 1d4+2 and grapple DC 12. Slashing damage has advantage against it."}
];

ADVENTURE.items = [
  ...ADVENTURE.items,
  {name:"Golden Candle",rules:"One use. As an action, automatically relight one magical flame or give all allies within 10 feet advantage on their next Wisdom save."},
  {name:"Cake Server of Sharing",rules:"One use. Divide one healing potion or edible healing item between two creatures; each receives the full healing roll."},
  {name:"Wish Coin",rules:"Flip before an ability check. On heads add 1d4; on tails give the 1d4 bonus to another hero's next check."},
  {name:"Sparkler Wand",rules:"Three charges. Action: reveal invisible creatures and magical writing within 10 feet until the start of your next turn."},
  {name:"Birthday Hat of Fortune",rules:"Once, reroll a natural 1 on an attack roll, save, or check. You must use the new result."},
  {name:"Endless Cupcake",rules:"As an action, create one fresh cupcake. Once per creature per day, eating one grants 2 temporary hit points."},
  {name:"Confetti Bomb",rules:"Thrown 20/60. Creatures in a 10-foot burst make DC 12 Constitution or are blinded until end of their next turn."},
  {name:"Boris's Rolling Pin",rules:"Club, +1 to attack and damage. Once, strike the floor to give allies within 10 feet advantage against being shoved or knocked prone for 1 minute."}
];

ADVENTURE.pregens = [
  {name:"Birthday Hero",class:"Human Barbarian 3 — Totem Warrior (Bear)",role:"Birthday hero and protector",ac:15,hp:32,speed:"30 ft",initiative:"+2",stats:"STR 16 (+3), DEX 14 (+2), CON 16 (+3), INT 8 (-1), WIS 12 (+1), CHA 10 (+0)",saves:"Strength +5, Constitution +5",skills:"Athletics +5, Perception +3, Survival +3, Intimidation +2",weapon:"Greataxe +5, 1d12+3 slashing (1d12+5 while raging)",features:"Rage 3/day: bonus action, 1 minute, advantage on Strength checks/saves, +2 melee damage, resistance to bludgeoning/piercing/slashing. Bear Spirit: while raging, resistance to all damage except psychic. Reckless Attack: first attack may gain advantage; attacks against you gain advantage until your next turn. Danger Sense: advantage on visible Dexterity saves.",equipment:"Greataxe, two handaxes, explorer's pack, four javelins, dragon birthday token.",hook:"Your unspoken birthday wish was stolen. You sense it is not about wealth or glory, but about sharing one more adventure with the people beside you.",personality:"Protective, warm, stubborn when friends are threatened.",bond:"Jonnelle is your closest friend; you would cross any darkness for them.",tactics:"Round 1: Rage, move beside the most dangerous enemy, attack. Use Reckless Attack when accuracy matters more than defense. Stay near allies and absorb damage.",signature:"‘Nobody gets left behind—not on my birthday.’"},
  {name:"Jonnelle",class:"Human Barbarian 3 — Totem Warrior (Wolf)",role:"Fearless friend and front-line partner",ac:15,hp:32,speed:"30 ft",initiative:"+2",stats:"STR 16 (+3), DEX 14 (+2), CON 16 (+3), INT 8 (-1), WIS 10 (+0), CHA 12 (+1)",saves:"Strength +5, Constitution +5",skills:"Athletics +5, Acrobatics +4, Intimidation +3, Perception +2",weapon:"Maul +5, 2d6+3 bludgeoning (2d6+5 while raging); handaxes ‘Cake’ and ‘Candles’ +5, 1d6+3",features:"Rage 3/day; Reckless Attack; Danger Sense. Wolf Spirit: while raging, allies have advantage on melee attacks against enemies within 5 feet of you.",equipment:"Maul, two named handaxes, explorer's pack, party whistle.",hook:"Somebody stole your friend's wish. This was an astonishingly bad decision.",personality:"Competitive, impulsive, fiercely loyal, laughs in danger.",bond:"the Birthday Hero is your closest friend; you are their storm.",tactics:"Rage and stand beside the enemy the Birthday Hero is fighting. Your Wolf Spirit grants allies melee advantage. Use Reckless Attack to keep pressure high.",signature:"‘If the Birthday Hero's going, I'm already there.’"},
  {name:"Mira Honeycup",class:"Lightfoot Halfling Cleric 3 — Life Domain",role:"Healer, support, and party heart",ac:18,hp:24,speed:"25 ft",initiative:"+1",stats:"STR 10 (+0), DEX 12 (+1), CON 14 (+2), INT 10 (+0), WIS 16 (+3), CHA 14 (+2)",saves:"Wisdom +5, Charisma +4",skills:"Insight +5, Medicine +5, Persuasion +4, Religion +2",weapon:"Mace +2, 1d6 bludgeoning; Sacred Flame DC 13, 1d8 radiant",features:"Spell save DC 13, spell attack +5. Channel Divinity: Preserve Life restores 15 HP divided among creatures below half HP. Disciple of Life adds 2 + spell level to healing.",equipment:"Chain mail, shield, mace, holy symbol shaped like a loaf, healer's kit.",hook:"You believe feeding people and healing people are the same sacred promise.",personality:"Gentle, practical, quietly fearless.",bond:"Boris once gave your temple food during a hard winter.",tactics:"Start hard fights with Bless. Use Healing Word at range for fallen allies. Spiritual Weapon attacks as a bonus action. Save Preserve Life for multiple wounded heroes.",signature:"‘Eat first. Panic after.’",spells:"Cantrips: Guidance, Sacred Flame, Thaumaturgy. 1st (4 slots): Bless, Cure Wounds, Healing Word, Sanctuary. 2nd (2 slots): Aid, Lesser Restoration, Spiritual Weapon."},
  {name:"Fizzwick Crumb",class:"Forest Gnome Wizard 3 — School of Illusion",role:"Puzzle solver and battlefield control",ac:13,hp:17,speed:"25 ft",initiative:"+3",stats:"STR 8 (-1), DEX 16 (+3), CON 14 (+2), INT 16 (+3), WIS 10 (+0), CHA 10 (+0)",saves:"Intelligence +5, Wisdom +2",skills:"Arcana +5, Investigation +5, History +5, Sleight of Hand +5",weapon:"Fire Bolt +5, 1d10 fire; dagger +5, 1d4+3",features:"Spell save DC 13, spell attack +5. Minor Illusion improved by Illusion Savant/Minor Illusion feature. Gnome Cunning: advantage on mental saves against magic.",equipment:"Spellbook, component pouch, dagger, scholar's pack, experimental sparklers.",hook:"You came to study magical baking and refuse to let reality waste a perfectly good wish.",personality:"Curious, excitable, explains dangerous ideas after trying them.",bond:"Lute is convinced your explosions improve his performances.",tactics:"Use Web to lock down groups. Shield when hit. Magic Missile finishes weak targets. Mage Hand and Minor Illusion are ideal for traps and puzzles.",signature:"‘I have a theory! Please stand slightly farther back.’",spells:"Cantrips: Fire Bolt, Mage Hand, Minor Illusion. 1st (4 slots): Detect Magic, Magic Missile, Shield, Sleep. 2nd (2 slots): Invisibility, Web."},
  {name:"Poppy Quickstep",class:"Lightfoot Halfling Rogue 3 — Thief",role:"Scout, locks, and traps",ac:15,hp:24,speed:"25 ft",initiative:"+3",stats:"STR 8 (-1), DEX 16 (+3), CON 14 (+2), INT 14 (+2), WIS 12 (+1), CHA 12 (+1)",saves:"Dexterity +5, Intelligence +4",skills:"Acrobatics +5, Investigation +6, Perception +3, Sleight of Hand +5, Stealth +7, thieves' tools +7",weapon:"Shortbow +5, 1d6+3 piercing; shortsword +5, 1d6+3. Sneak Attack +2d6 once/turn.",features:"Cunning Action: bonus action Dash, Disengage, or Hide. Fast Hands: bonus action thieves' tools, Sleight of Hand, or Use an Object. Second-Story Work improves climbing/jumping. Lucky rerolls natural 1s.",equipment:"Studded leather, shortbow and 20 arrows, shortsword, two daggers, thieves' tools, burglar's pack, absurd party hats.",hook:"You planned the party. Whoever ruined it has offended you professionally.",personality:"Cheerful, observant, always has a backup plan.",bond:"Pip helped hang every decoration and is your nervous assistant.",tactics:"Hide with Cunning Action, then attack for Sneak Attack. Stay mobile. Use Fast Hands on traps, doors, potions, and room objects.",signature:"‘That was absolutely part of the decorations.’"},
  {name:"Sir Garrick Dawnshield",class:"Human Paladin 3 — Oath of Devotion",role:"Defender and burst damage",ac:18,hp:28,speed:"30 ft",initiative:"+0",stats:"STR 16 (+3), DEX 10 (+0), CON 14 (+2), INT 8 (-1), WIS 12 (+1), CHA 14 (+2)",saves:"Wisdom +3, Charisma +4",skills:"Athletics +5, Insight +3, Persuasion +4, Religion +1",weapon:"Longsword +5, 1d8+3 slashing; javelin +5, 1d6+3",features:"Divine Sense 4/day. Lay on Hands 15 HP. Divine Smite: after a melee hit spend a slot for +2d8 radiant (3d8 vs undead). Channel Divinity: Sacred Weapon or Turn the Unholy. Spell save DC 12.",equipment:"Chain mail, shield, longsword, five javelins, holy symbol, explorer's pack.",hook:"You swore to defend sacred celebrations with exactly the seriousness others reserve for coronations.",personality:"Formal, honorable, secretly delighted by cake.",bond:"Little Ellie once declared you ‘official birthday security.’ You accepted the title.",tactics:"Stand between enemies and vulnerable allies. Use Lay on Hands to revive a fallen hero with 1 HP. Save Divine Smite for a critical hit or Sepulchral.",signature:"‘By cake, candle, and solemn oath—you shall not pass.’",spells:"1st (3 slots): Bless, Cure Wounds, Protection from Evil and Good, Shield of Faith."}
];
