// Final table-ready structure: 2 puzzles, 1 trap, 3 combats, then a three-phase boss.
ADVENTURE.runtime = "3 hours";
ADVENTURE.timeline = [
  ["0:00–0:25", "The Wishing Cake Inn: celebration, introductions, and the stolen wish"],
  ["0:25–0:45", "Puzzle 1: Hall of Forgotten Birthdays"],
  ["0:45–1:10", "Combat 1: Ruined Banquet Hall"],
  ["1:10–1:25", "Balloon Gallery: the Birthday Hero's memories"],
  ["1:25–1:45", "Puzzle 2: Wrapping Workshop"],
  ["1:45–2:10", "The single trap and Combat 2: Candle Maze"],
  ["2:10–2:35", "Combat 3: Piñata Ballroom"],
  ["2:35–2:45", "Hall of Wishes: Sepulchral's truth"],
  ["2:45–3:10", "Three-phase boss and the Birthday Hero's returned wish"]
];

const scene = (id, title, minutes, theme, readAloud, details, checks, birthdayHero, transition, extras={}) => ({
  id, title, minutes, theme, readAloud, details, checks, birthdayHero, transition, ...extras
});

ADVENTURE.rooms = [
  scene("inn", "Opening: The Wishing Cake Inn", "25 minutes", "Celebration",
    "Warm lamplight turns the common room gold. Paper dragons hang between dark wooden beams, their wings stirring whenever the front door opens. The room smells of cinnamon, baked apples, beeswax, and the deep buttery sweetness of fresh cake. Mugs clink, chairs scrape, and Lute Merriweather tests the same three notes again and again while Boris Ironladle shouts from the kitchen that nobody is to touch the frosting. At the center table, the Birthday Hero's cake waits beneath a glass dome. Its candles burn with tiny golden flames that lean toward her as though listening. When the Birthday Hero draws breath to make her wish, every flame snaps out. The room becomes suddenly cold. A golden spark tears free from the cake, circles the Birthday Hero once, and streaks through the pantry door. Somewhere below the floor, an ancient clock begins to strike.",
    [
      "Martha Bramblepot keeps the Birthday Hero in the place of honor and introduces every guest as though presenting visiting royalty.",
      "Boris carries the cake with both hands, his floury beard tied with bright ribbons. He is loud, proud, and terrified anything will happen to his masterpiece.",
      "Pip arrives late with a parcel and muddy boots. He saw a pale reflection in the pantry mirror before the wish was stolen.",
      "Lute's unfinished birthday song becomes the adventure's recurring musical motif. When the party stalls later, one of his remembered lyrics can provide a hint.",
      "The stolen wish leaves a trail of golden ash and tiny frosting footprints. There is no combat here; let the players care about the celebration before taking it away."
    ],
    [
      "DC 11 Arcana: the golden spark is a genuine unspoken birthday wish, magically separated from the Birthday Hero.",
      "DC 12 Investigation: the trail passes through the pantry and down an old stair hidden beneath a flour bin.",
      "DC 10 Persuasion: calm Pip enough for him to describe the tall, pale figure he saw only in the mirror."
    ],
    "The Birthday Hero alone hears the fleeing spark whisper: 'Find me before the last candle dies.'",
    "Martha removes a brass key from beneath her apron. The pantry floor unlocks with a sigh, revealing stairs into the forgotten celebration halls.",
    { dialogue:[
      "Martha: 'No one celebrates alone under my roof, my dear. Not tonight.'",
      "Boris: 'WHO TOUCHED THE CAKE? ...No one? Good. I panic loudly.'",
      "Martha, after the theft: 'That was not merely a cake. Something has taken the wish the Birthday Hero had not yet spoken.'",
      "Pip: 'The shadow was in the mirror, but when I turned around... there was nobody there.'"
    ]}
  ),

  scene("forgotten", "Scene 1: Hall of Forgotten Birthdays", "20 minutes", "Puzzle — Memory",
    "The stair opens into a corridor washed in blue moonlight, although no windows pierce the stone. Portraits line both walls. Each shows a birthday table, a cake, and one empty chair. Beneath every frame sits a cold candle in a tarnished holder. The air smells of old paper, lavender, and the faint dusty sweetness of sugar left too long in a cupboard. Your footsteps are muffled by a faded carpet that feels soft in places and brittle in others. At the corridor's end, a fresh canvas bears the Birthday Hero's name, but the painted figure is slowly fading from the scene.",
    [
      "Six portraits depict ordinary people rather than kings or legendary heroes. The point is that remembrance gives a life meaning, not fame.",
      "When a candle is touched, the character feels a brief emotion belonging to the painted celebrant: pride, loneliness, relief, mischief, love, or hope.",
      "There is no punishment for guessing wrong and no combat. This is a warm roleplaying puzzle, not a test of trivia."
    ],
    [
      "DC 11 Insight: each candle responds to sincere remembrance rather than a password.",
      "DC 12 Perception: the Birthday Hero's frame bears a tiny gold dragon emblem matching the pop-up card motif.",
      "Any sincere toast, kind memory, or statement about why a person matters lights one candle automatically."
    ],
    "The Birthday Hero's candle must be lit by another hero saying why the Birthday Hero matters to them. the Birthday Hero cannot solve their own candle. When it lights, they receive Wish Fragment I: NOT FOR ME ALONE.",
    "When all six candles burn, the painted dragon curls around the frame and becomes a brass door handle.",
    { puzzle:"Puzzle 1 — Forgotten Candles: light all six candles through sincere remembrance. Never require a die roll for a heartfelt answer.", dialogue:["Whispering portrait: 'A birthday forgotten is not a life forgotten—unless no one chooses to remember.'"] }
  ),

  scene("banquet", "Scene 2: The Ruined Banquet Hall", "25 minutes", "Combat 1 — Surprise",
    "A long banquet table disappears into a dim hall. White cloth hangs over its sides like still water. Crystal goblets remain full, and silverware is arranged with almost painful precision. The room smells of vanilla cake, sour wine, and damp stone. Somewhere under the tablecloth comes a slow ceramic scrape. Streamers overhead do not move, yet their shadows twist across the ceiling. At the table's center sits one perfect slice of warm cake on a spotless paper plate.",
    [
      "The cake is real, warm, and fragrant. The plate beneath it is the Paper Plate Mimic.",
      "Two Animated Presents hide among gift boxes beneath the table. For four players use one; for five or six use two.",
      "The punch bowl can be tipped to create a 10-foot slippery area. A creature entering it must succeed on DC 11 Dexterity or fall prone.",
      "Cutting the hanging streamers drops them over one creature: DC 12 Dexterity or restrained until it uses an action to escape.",
      "Tilly the sugar sprite is hiding beneath a serving cart and appears after the battle."
    ],
    [
      "Passive Perception 13: the plate seems to blink.",
      "DC 12 Investigation: there are no crumbs around the cake, and its warmth is magical.",
      "DC 13 Perception: tiny bite marks score the streamers directly above the table."
    ],
    "The mimic lunges toward the Birthday Hero first because it can smell the stolen wish's lingering magic. This makes the Birthday Hero central without forcing her actions.",
    "After the fight, Tilly points toward a doorway stitched shut with glowing ribbon.",
    { tactics:"The Paper Plate Mimic grapples the first creature reaching for the cake. Animated Presents harass isolated heroes and shove them toward the table. At half hit points, the mimic tries to flee beneath the cloth.", dialogue:[
      "Tilly: 'Please don't hurt him—the pale man, I mean. He doesn't hate birthdays. He hates what comes after them.'",
      "Tilly: 'He took the Birthday Hero's wish toward the rooms that still remember how celebrations used to feel.'"
    ]}
  ),

  scene("balloons", "Scene 3: The Balloon Gallery", "15 minutes", "Exploration — Joy",
    "Hundreds of balloons drift from floor to ceiling, turning the chamber into a slow-moving sea of red, blue, gold, and violet. Their surfaces are cool and slightly damp when they brush your skin, leaving a faint static tingle behind. The air smells of strawberries, spun sugar, and fresh paper. From within the balloons come tiny sounds: a burst of laughter, a clink of mugs, the first notes of a song, somebody whispering 'happy birthday.' Golden light moves inside several balloons like memories trying to be seen.",
    [
      "This is an exploration and character scene. There is no trap, puzzle, or combat.",
      "Characters may touch balloons to glimpse brief memories. Let players invent shared memories with the Birthday Hero if they wish.",
      "Three balloons show the Birthday Hero's courage, kindness, and humor. They bear tiny gold dragon marks.",
      "A dark balloon shows Sepulchral sitting alone at a birthday table, but do not explain it yet."
    ],
    [
      "DC 12 Perception: three memories with gold dragon emblems respond to the Birthday Hero's voice.",
      "DC 12 Insight: the dark memory contains grief rather than malice.",
      "A character who shares a genuine or in-character memory of the Birthday Hero gains Inspiration."
    ],
    "When the Birthday Hero touches the three gold-dragon balloons, they orbit her without popping. Their images show that the wish is connected to the people celebrating with her.",
    "The three balloons become lanterns and drift into the Wrapping Workshop.",
    { dialogue:["Tilly: 'Memories are carried, not collected. Hold them gently.'"] }
  ),

  scene("wrapping", "Scene 4: The Wrapping Workshop", "20 minutes", "Puzzle — Generosity",
    "The next chamber is crowded with rolls of bright paper, towers of boxes, silver scissors, and spools of ribbon. Paper rustles though the air is still. Bows turn slowly toward you like flowers following sunlight. The room smells of pine shavings, sealing wax, peppermint, and ink. Ribbons slide softly across your boots, smooth as silk and warm as living skin. Above the far door, silver letters read: WHAT IS KEPT REMAINS CLOSED. WHAT IS GIVEN OPENS THE WAY.",
    [
      "Each hero finds a box tagged with their name. The boxes are harmless and cannot be forced open.",
      "A box opens only when its owner willingly gives it to another hero.",
      "Inside the exchanged boxes are small personal tokens, jokes, snacks, or one of the four adventure items. Keep descriptions brief and tailored to the character.",
      "There is no combat here and no hidden punishment. The challenge is understanding the room's meaning."
    ],
    [
      "DC 11 Insight: the inscription is literal and emphasizes giving.",
      "DC 12 Arcana: the magic reacts to intention, so pretending to give a gift does not work.",
      "Creative exchanges, including giving a box to an NPC, are valid."
    ],
    "the Birthday Hero's box will not open in her hands. When they give it to another companion, it reveals Wish Fragment II: BUT FOR ONE MORE ADVENTURE.",
    "When everyone has genuinely given or received a gift, ribbons weave themselves into a glowing path toward the Candle Maze.",
    { puzzle:"Puzzle 2 — Gift Exchange: each marked gift opens only after being freely given to someone else." }
  ),

  scene("candles", "Scene 5: The Candle Maze", "25 minutes", "Single Trap + Combat 2",
    "Heat presses gently against your faces as hundreds of candles rise from the floor like a glowing garden. Narrow paths wind between pools of honey-colored wax. The air smells of beeswax, warm sugar, smoke, and something faintly scorched. Every step produces a soft sticky pull beneath your boots. Glass chimes ring in the distance whenever another flame goes dark. The room is beautiful, but it feels fragile—as though one careless breath could extinguish every light at once.",
    [
      "This is the adventure's only trap. It is an escalating environmental sequence rather than a hidden gotcha.",
      "The safe route is marked by flames leaning toward the Birthday Hero. Tell the players this after one successful observation check.",
      "The party must earn three successes before two failures using appropriate skills or spells.",
      "After two failures, the Wax Guardian awakens and Combat 2 begins. The heroes still reach the far side after defeating it."
    ],
    [
      "DC 12 Perception or Survival: follow the direction of the leaning flames.",
      "DC 12 Arcana or Sleight of Hand: shield a group of candles from magical wind.",
      "DC 12 Athletics or Acrobatics: cross a widening pool of hot wax safely."
    ],
    "Only the Birthday Hero can lift the golden lantern at the maze's center. It whispers the recovered phrase back to her and grants the Birthday Candle of Courage if the party does not already have it.",
    "The lantern's flame stretches into a bright musical note that opens the Piñata Ballroom.",
    { trap:"The One Trap — Fading Candle Maze: earn 3 successes before 2 failures. Each failure deals 1d6 fire damage to one volunteer or costs five minutes. At two failures the Wax Guardian rises.", tactics:"Wax Guardian: AC 14, HP 32, speed 20. Slam +4, 1d8+2 bludgeoning; on hit reduce target speed by 10 feet until its next turn. Cold damage prevents the speed reduction." }
  ),

  scene("pinata", "Scene 6: The Piñata Ballroom", "25 minutes", "Combat 3 — Spectacle",
    "The doors burst open and music crashes over you—drums, horns, clapping, and a wildly cheerful melody played by invisible musicians. A polished dance floor reflects hanging piñatas in a hundred bright colors. Candy rattles inside them like teeth. The air smells of citrus sweets, paper glue, sawdust, and the sharp spark of spent fireworks. Warm confetti drifts against your face and sticks to sweaty skin. At the center hangs an enormous smiling dragon piñata. Its painted eyes turn toward the Birthday Hero.",
    [
      "Use the Piñata Mimic as the primary enemy and one Exploding Piñata as an obvious interactive hazard.",
      "Use the existing hazard card, but telegraph it clearly: its pull-string glows and spits sparks.",
      "Support ropes can be cut (AC 12, 5 HP) to drop decorations and create difficult terrain.",
      "Candy scattered across the floor can calm the mimic after it is bloodied with DC 13 Animal Handling or Persuasion."
    ],
    [
      "DC 13 Perception: the dragon piñata is breathing.",
      "DC 12 Investigation: the glowing pull-string marks the Exploding Piñata.",
      "DC 12 Performance: move with the enchanted rhythm to gain advantage on one Acrobatics check or Dexterity save."
    ],
    "The dragon piñata reacts to the Birthday Hero's name and focuses its attention on her, but it can be calmed when another hero protects her or offers candy in her name.",
    "When the encounter ends, the dragon piñata releases a warm golden scale reading: KEEP GOING. YOUR WISH IS WAITING.",
    { tactics:"The mimic grapples an isolated hero and shoves targets toward the Exploding Piñata. At half hit points it becomes frightened by loud cheering and can be calmed instead of killed." }
  ),

  scene("hall-wishes", "Scene 7: The Hall of Wishes", "10 minutes", "Revelation",
    "The music dies the moment the silver door closes. Beyond it, thousands of tiny lights drift through a vast dark gallery like fireflies over still water. The air is cold enough to raise gooseflesh and carries the scent of rain on stone. Every light whispers a wish: a child asking for courage, a sailor asking to return home, an old woman asking for one more spring. The floor is smooth black glass, and each footstep sends pale ripples beneath it. Three dark memories hover near the far wall: a child waiting beside a cake, an unopened door, and an empty chair.",
    [
      "This room explains Sepulchral without excusing his actions.",
      "The dark memories show that, centuries ago, nobody came to his birthday. His wish was for one person to return, and it failed.",
      "Tilly admits she helped him enter the inn because he promised that no wish would ever hurt anyone again.",
      "Keep the scene quiet and brief. Its purpose is to change how the players understand the final fight."
    ],
    [
      "DC 12 Insight: Sepulchral acts from grief and fear, not cruelty.",
      "DC 12 Religion or Arcana: the Birthday Hero's wish can be restored without destroying the other wishes.",
      "Any hero who voices compassion gains advantage on their first social check during the boss fight."
    ],
    "the Birthday Hero realizes her wish was not fully formed when stolen. The fragments describe its heart, but she alone chooses its final words.",
    "The three recovered fragments—NOT FOR ME ALONE / BUT FOR ONE MORE ADVENTURE / TOGETHER—open the Wish Circle.",
    { dialogue:[
      "Tilly: 'He waited until every candle burned down. Nobody came.'",
      "Tilly: 'He thinks hope is the cruel part. Please show him he is wrong.'"
    ]}
  ),

  scene("finale", "Finale: The Wish Circle", "25–30 minutes", "Three-Phase Boss",
    "A circular chamber opens beneath a night sky that cannot exist underground. Thousands of candles float overhead, their flames reflected in black stone. the Birthday Hero's birthday cake hangs inside a ring of silver runes, and within it struggles a small golden light. The air tastes metallic, like lightning about to strike. The floor vibrates beneath your feet with each beat of an unseen heart. Sepulchral stands beside the circle in pale ceremonial robes, one hand raised toward the fading wish. His voice is quiet enough that everyone must lean closer to hear it. 'You call it hope,' he says. 'I call it the beginning of disappointment.'",
    [
      "Phase 1 — Keeper of Lost Wishes: traditional combat until Sepulchral reaches half hit points. At initiative 20, one rune flares and a candle extinguishes.",
      "Phase 2 — The Empty Chair: combat pauses. The room becomes Sepulchral's childhood birthday. Players may speak to him, examine the memory, or simply listen. Three successful DC 12 Insight, Persuasion, Performance, or compassionate roleplay successes weaken the final phase. Failure never stops the story.",
      "Phase 3 — The Last Wish: Sepulchral becomes a storm of dark wish fragments. Damage can hold them back, but cannot end the encounter. Each hero must contribute a memory, promise, hope, or sincere birthday wish for the Birthday Hero. After every hero contributes—or after three strong contributions for a large table—the golden wish reforms.",
      "If the party chose violence only in Phase 2, add one round of hostile wish fragments before contributions can begin."
    ],
    [
      "Erase a glowing rune: DC 13 Arcana, Religion, or thieves' tools as an action.",
      "Relight a candle: DC 12 Performance, Persuasion, or any suitable flame magic as an action.",
      "Reach Sepulchral emotionally: DC 12 Insight or Persuasion, with advantage for characters who showed compassion in the Hall of Wishes."
    ],
    "the Birthday Hero chooses the final meaning of her returned wish. She may wish for herself, include her companions, or offer Sepulchral a place at the celebration. Any sincere choice succeeds.",
    "The cake returns to the inn. Martha lights its candles and says, 'I believe this has been waiting for you.' Hand the Birthday Hero the real pop-up dragon card and allow the silence to do the work.",
    { objectives:[
      "Phase 1: reduce Sepulchral to half HP while managing the ritual runes.",
      "Phase 2: achieve three compassionate successes or hear his full memory.",
      "Phase 3: rebuild the Birthday Hero's wish through sincere contributions rather than damage."
    ], dialogue:[
      "Sepulchral: 'Every candle goes dark. Every song ends. Why teach her to hope?'",
      "Sepulchral, during the memory: 'I waited. That is all I did. I waited until there was no light left.'",
      "Martha's remembered words: 'Darkness does not make the light a lie.'",
      "Sepulchral, at the end: 'And if the wish fails?'"
    ]}
  )
];

// Six focused NPCs only.
ADVENTURE.npcs = [
  {name:"Martha Bramblepot",role:"Innkeeper and emotional anchor",voice:"Soft, warm, unhurried; calls everyone 'my dear.'",goal:"Bring the Birthday Hero's wish home without allowing fear to erase hope.",secret:"She witnessed one stolen wish forty years ago and has feared its return ever since.",lines:["No one celebrates alone under my roof, my dear.","That wish belongs to the Birthday Hero. We are bringing it home.","Darkness does not make the light a lie."]},
  {name:"Boris Ironladle",role:"Dwarven baker and comic relief",voice:"Thunderous volume with sudden tender whispers.",goal:"Save his cake, protect the Birthday Hero, and prove the missing blessing was not his fault.",secret:"He forgot the traditional final blessing and blames himself for the theft.",lines:["WHO TOUCHED MY CAKE? ...Sorry. I panic loudly.","I kneaded that dough for six hours!", "If hope needs butter, I have butter."]},
  {name:"Pip Underbough",role:"Young stable hand and first witness",voice:"Fast, apologetic, brave only after he has already acted.",goal:"Prove he can help instead of hiding.",secret:"He briefly fell asleep, but the pale figure appeared in the mirror before he woke.",lines:["I wasn't asleep. I was listening with my eyes closed.","The shadow was in the mirror, not the room.","I can come too. I mean—unless that would make things worse."]},
  {name:"Lute Merriweather",role:"Bard, atmosphere, and gentle hint system",voice:"Dramatic, musical, occasionally rhyming by accident.",goal:"Finish the Birthday Hero's birthday song before the final candle dies.",secret:"The forgotten halls sometimes use his unfinished lyrics to answer puzzles.",lines:["A wish in flight, a candle's light... oh. That might actually be a clue.","Every ending deserves a final verse.","I had a rhyme for 'Sepulchral,' but mercifully I forgot it."]},
  {name:"Tilly",role:"Sugar sprite guide and remorseful accomplice",voice:"Tiny, breathless, and painfully sincere.",goal:"Return the wish and save Sepulchral from his own grief.",secret:"She showed Sepulchral how to enter the inn because she believed his promise to end disappointment.",lines:["He doesn't hate birthdays. He hates what comes after.","Memories are carried, not collected.","Please save the wish. Please save him too, if you can."]},
  {name:"Sepulchral",role:"Keeper of Forgotten Wishes and final antagonist",voice:"Quiet, ancient, and controlled; never shouts.",goal:"Destroy the Birthday Hero's wish before it can disappoint her.",secret:"His childhood wish was for someone to return to a birthday where nobody came.",lines:["I do not steal wishes. I prevent wounds.","Every candle goes dark. Every song ends.","What becomes of hope when the world says no?"]}
];

// Four meaningful, one-use items only.
ADVENTURE.items = [
  {name:"Birthday Candle of Courage",rules:"One use. Bonus action: one creature within 30 feet gains 5 temporary hit points and immediately ends the frightened condition."},
  {name:"Ribbon of Rescue",rules:"One use. Reaction: pull a willing ally within 20 feet up to 10 feet without provoking opportunity attacks."},
  {name:"Frosting of Mending",rules:"One use. Action: a creature eating the frosting regains 2d4+2 hit points."},
  {name:"Party Horn of Heroism",rules:"One use. Bonus action: one ally within 30 feet gains advantage on its next attack roll or saving throw."}
];

// Only cards needed at the table.
ADVENTURE.traps = [
  {name:"Fading Candle Maze",rules:"The adventure's only trap. Earn 3 group successes before 2 failures using DC 12 Perception/Survival, Arcana/Sleight of Hand, or Athletics/Acrobatics. Each failure deals 1d6 fire damage to one volunteer or costs five minutes. At two failures, the Wax Guardian awakens."}
];

ADVENTURE.monsters = [
  {name:"Paper Plate Mimic",rules:"Use the supplied illustrated monster card. Combat 1 ambusher; grapples whoever reaches for the cake and drags them beneath the table."},
  {name:"Animated Present",rules:"Use the supplied illustrated monster card. Combat 1 support creature; ribbons restrain or shove isolated heroes."},
  {name:"Wax Guardian",rules:"AC 14, HP 32, speed 20. Slam +4 to hit, 1d8+2 bludgeoning. On hit, target speed falls by 10 feet until its next turn; cold damage prevents this rider."},
  {name:"Piñata Mimic",rules:"Use the supplied illustrated monster card. Combat 3 centerpiece; grapples, shoves, and can be calmed with candy after it is bloodied."},
  {name:"Exploding Piñata",rules:"Use the supplied illustrated hazard card as an obvious environmental weapon in Combat 3. Always telegraph the glowing, sparking pull-string."},
  {name:"Sepulchral",rules:"Use both supplied illustrated cards. Three phases: combat to half HP, roleplay in the Empty Chair memory, then rebuild the Birthday Hero's wish through sincere contributions."}
];