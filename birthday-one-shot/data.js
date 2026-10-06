const ADVENTURE = {
  title: "Birthday One Shot",
  premise: "As the Birthday Hero draws breath to make their birthday wish, the candles die and a golden spark is torn from the cake. The wish is carried into the forgotten celebration halls beneath the inn. If it is not restored before midnight, it will be lost forever.",
  runtime: "3 hours",
  party: "4–6 level 3 heroes, using the 2014 rules",
  timeline: [
    ["0:00–0:20","The Wishing Cake Inn and the stolen wish"],
    ["0:20–0:45","Ruined Banquet Hall"],
    ["0:45–1:15","Gift-Wrapping Room"],
    ["1:15–1:45","Candle Maze"],
    ["1:45–2:15","Balloon Gallery"],
    ["2:15–2:50","Wish Circle and Sepulchral"],
    ["2:50–3:00","the Birthday Hero's wish and the pop-up dragon card"]
  ],
  rooms: [
    {
      id:"inn", title:"Scene 1: The Wishing Cake Inn", minutes:"20 minutes", theme:"Celebration",
      readAloud:"Warm lamplight spills across tables crowded with ribbons, flowers, and half-finished cups of cider. At the center of the common room waits a magnificent cake, its candles burning with tiny golden flames. As the Birthday Hero leans forward to make their wish, every flame bends toward them—then snaps out. A bright spark tears free from the cake, circles the Birthday Hero once, and streaks through the pantry door. Somewhere below, a clock begins to strike.",
      details:["Martha Bramblepot welcomes the party and makes certain the Birthday Hero is seated at the place of honor.","Boris Ironladle carries in the cake and loudly insists nobody touch the frosting before the wish.","Lute Merriweather begins a birthday song, forgetting the final verse.","At the instant the wish is stolen, three Animated Presents attack from the gift table."],
      checks:["DC 11 Arcana: the stolen spark is a real birthday wish, not an illusion.","DC 12 Investigation: frosting footprints and golden ash lead through the pantry.","DC 10 Persuasion: calm Pip, who saw a tall shadow pass beneath the inn."],
      birthdayHero:"The Birthday Hero alone hears a whisper from the fleeing spark: ‘Find me before the last candle dies.’",
      dialogue:["Martha: ‘That was not merely a cake. Something has taken the wish they had not yet spoken.’","Boris: ‘Nobody steals a wish from my kitchen and lives to complain about the crust!’"],
      transition:"The pantry floor opens around an old brass key hanging at Martha's neck, revealing stairs descending into forgotten celebration halls."
    },
    {
      id:"banquet", title:"Room 1: The Ruined Banquet Hall", minutes:"25 minutes", theme:"Memory",
      readAloud:"A banquet table stretches through a silent hall. Crystal goblets remain full, chairs stand neatly pushed back, and streamers hang without stirring. At the table's center sits one perfect slice of warm cake upon a spotless paper plate. Frosting footprints cross the floor and vanish beneath the tablecloth.",
      details:["The Paper Plate Mimic attacks when the cake slice is touched or closely inspected.","A frightened sugar sprite named Tilly hides beneath a serving cart.","Six painted birthday portraits line the walls; one portrait of the Birthday Hero is dark and unfinished."],
      checks:["Passive Perception 13: the central plate appears to blink.","DC 12 Investigation: the cake slice has no crumbs and appeared magically.","DC 13 Perception: tiny bite marks mark the streamers above the mimic."],
      trap:"Confetti Choke: pulling the wrong table bell releases a 10-foot cloud. DC 12 Constitution save or blinded until the end of the creature's next turn. A character can identify the stuffed bell with DC 12 Investigation.",
      puzzle:"Forgotten Candles: six unlit candles stand beneath the portraits. A candle lights when a hero speaks one sincere reason that person deserves to be remembered. The Birthday Hero's candle lights last, revealing the words: YOUR WISH STILL KNOWS YOU.",
      tactics:"The mimic grapples the first creature to touch the cake, then drags the target beneath the table. At half hit points it flees toward the pantry passage.",
      birthdayHero:"When the Birthday Hero lights the final candle, they see a brief memory of friends gathering around them—proof the wish is tied to the people present, not treasure or power.",
      transition:"A door of hardened frosting softens and opens when all six candles burn."
    },
    {
      id:"gifts", title:"Room 2: The Chamber of Unopened Gifts", minutes:"30 minutes", theme:"Generosity",
      readAloud:"Presents rise in colorful towers from floor to ceiling. Ribbons slither lazily across the floor, bows turn as though watching, and somewhere inside the stacks something scratches against cardboard. A silver plaque reads: A GIFT KEPT IS ONLY AN OBJECT. A GIFT GIVEN BECOMES A MEMORY.",
      details:["Several boxes are Animated Presents; use two for four heroes and three for five or six heroes.","Three safe gifts contain the Ribbon of Rescue, Frosting of Mending, and Party Horn of Heroism.","Opening boxes selfishly awakens monsters; willingly giving a chosen box to another hero opens it safely."],
      checks:["DC 12 Insight: the inscription emphasizes giving, not guessing.","DC 13 Investigation: animated boxes have ribbons knotted inward like clenched fists.","Mage Hand, familiars, or clever tools can test boxes without triggering them, but do not reveal their contents."],
      trap:"Wrapping-Paper Snare: crossing the center without exchanging a gift causes enchanted paper to coil around one creature. DC 13 Dexterity save or restrained. Escape DC 12 Strength or Dexterity; fire destroys the paper but deals 1 fire damage to the captive.",
      puzzle:"Each hero selects one box, then gives it to another hero. When every chosen gift has been offered freely, the silver door unlocks. No die roll is required.",
      birthdayHero:"One box bears the Birthday Hero's name. It cannot be opened by the Birthday Hero, but opens immediately when they give it to another companion. Inside is the first Wish Fragment: ‘NOT FOR ME ALONE…’",
      transition:"The opened gifts release glowing ribbon that forms a safe path into the Candle Maze."
    },
    {
      id:"candles", title:"Room 3: The Candle Maze", minutes:"30 minutes", theme:"Perseverance",
      readAloud:"Hundreds of birthday candles rise from the floor like a glowing garden. Narrow paths wind between pools of hot wax. Each time the distant clock ticks, another flame goes dark. Far ahead, a golden spark flickers inside a glass lantern.",
      details:["Treat the maze as three group checks rather than mapping every turn.","The safe route is marked by candles whose wax runs toward the Birthday Hero rather than away from them.","After two failures, a Waxling forms and attacks; use a Magma Mephit stat block without Death Burst, dealing bludgeoning instead of fire with its claws."],
      checks:["Navigate: DC 12 Survival or Perception.","Protect the flames: DC 12 Arcana, Sleight of Hand, or a suitable spell.","Cross the wax: DC 12 Athletics or Acrobatics."],
      trap:"Candlefall: a pressure tile tips a rack of burning candles. DC 13 Dexterity save; 2d6 fire damage on a failure, half on success. DC 13 Investigation spots wax pooled around the tile. The rack can be jammed with an iron spike.",
      puzzle:"Six pedestal candles are labeled Courage, Kindness, Laughter, Friendship, Love, and Hope. Hope will not light directly. Lighting any three of the other five causes Hope to ignite, teaching that hope is sustained by other virtues.",
      birthdayHero:"Only the Birthday Hero can lift the lantern containing the second fragment. It whispers: ‘…BUT FOR ONE MORE ADVENTURE…’",
      transition:"The lantern's flame becomes a floating balloon and drifts through the next doorway."
    },
    {
      id:"balloons", title:"Room 4: The Balloon Gallery", minutes:"30 minutes", theme:"Joy",
      readAloud:"Balloons crowd the chamber from floor to ceiling, each glowing with a moving image: a shared meal, a ridiculous joke, a hard-won victory, a quiet kindness. Some images belong to the Birthday Hero. Others belong to people they have never met. Three black balloons drift among them, their strings ending in tiny sparking fuses.",
      details:["The Piñata Mimic hides among hanging decorations and attacks after the first black balloon is disturbed.","The existing Exploding Piñata hazard can be placed beside the central memory balloon.","Tilly warns that memories must be protected, not collected."],
      checks:["DC 12 Perception: black balloons cast shadows in the wrong direction.","DC 13 Investigation: three genuine Birthday Hero memories share a gold dragon emblem.","DC 12 Performance or Persuasion: recounting a joyful table memory causes a correct balloon to descend safely."],
      trap:"Balloon Lift: cutting a silver string triggers six balloons that seize a creature and lift it 20 feet. DC 13 Dexterity save avoids capture. A captured creature can cut free, taking 2d6 falling damage unless caught; allies may shoot balloons to lower it five feet per balloon.",
      puzzle:"Recover three gold-dragon memory balloons without popping them. Each is lowered by telling a true or invented-in-character memory about the Birthday Hero's courage, kindness, or humor. Popping one releases harmless glitter but advances the midnight clock by five minutes.",
      tactics:"The Piñata Mimic uses the balloons as concealment and attempts to shove heroes toward the Exploding Piñata. At half hit points it can be distracted with candy or calmed by returning one protected memory.",
      birthdayHero:"Joining the three memory balloons reveals the final fragment: ‘…TOGETHER.’ The full shape of the wish is near, but the Birthday Hero still chooses its meaning at the finale.",
      transition:"The three balloons become golden lights and open the doors to the Wish Circle."
    },
    {
      id:"finale", title:"Room 5: The Wish Circle", minutes:"35 minutes", theme:"Hope",
      readAloud:"A circular chamber opens beneath a sky that cannot exist underground. Thousands of candles float above a black stone floor. the Birthday Hero's birthday cake hangs inside a ring of silver runes, and within it struggles a small golden light. A pale figure stands beside the circle, one hand raised toward the fading wish. ‘You call it hope,’ he says softly. ‘I call it the beginning of disappointment.’",
      details:["Sepulchral is the Keeper of Forgotten Wishes. His own wish failed centuries ago, and he now steals wishes to spare others pain.","Use the supplied Sepulchral and Wish Circle monster cards.","The ritual advances at initiative count 20. At three advances the wish fades unless the party has completed three objectives."],
      objectives:["Erase one rune: adjacent action, DC 13 Arcana, Religion, or thieves' tools.","Relight one extinguished candle: adjacent action, DC 12 Performance, Persuasion, or use of a flame spell.","Protect the cake: a hero adjacent to it may use a reaction to take damage meant for the cake.","Reach Sepulchral: reduce him below half hit points or succeed on three total social successes against DC 13."],
      dialogue:["Sepulchral: ‘Every candle goes dark. Every song ends. Why teach them to hope?’","Martha, if present: ‘Because darkness does not make the light a lie.’","Sepulchral, bloodied: ‘And if their wish fails?’"],
      birthdayHero:"When the ritual breaks, the Birthday Hero chooses the final answer: make a wish for themselves, make a wish that includes others, or offer Sepulchral a place at the celebration. Any sincere answer restores the wish.",
      ending:"The golden wish circles every hero, then settles before the Birthday Hero. Return to the inn. Martha says, ‘I believe this has been waiting for you.’ Hand the Birthday Hero the real pop-up dragon card. Allow silence. Then let the group celebrate."
    }
  ],
  npcs:[
    {name:"Martha Bramblepot",role:"Innkeeper and emotional anchor",voice:"Warm, grandmotherly, calls everyone ‘my dear.’",goal:"Return the Birthday Hero's wish and keep hope alive.",secret:"She witnessed a wish theft forty years ago.",lines:["No one celebrates alone under my roof.","That wish belongs to the Birthday Hero. We are bringing it home."]},
    {name:"Boris Ironladle",role:"Dwarven baker and comic relief",voice:"Thunderous volume, tender heart.",goal:"Protect his cake and absolve his guilt.",secret:"He forgot the traditional final blessing.",lines:["WHO STOLE MY CAKE? ...Sorry. Indoor voice.","I kneaded that dough for six hours!"]},
    {name:"Pip Underbough",role:"Nervous stable hand",voice:"Quick, apologetic, easily startled.",goal:"Prove he can be useful.",secret:"He fell asleep and saw the thief only after waking.",lines:["I wasn't asleep. I was... listening with my eyes closed.","The footprints glowed. I swear it."]},
    {name:"Lute Merriweather",role:"Traveling bard and hint system",voice:"Dramatic and compulsively rhyming.",goal:"Finish the Birthday Hero's birthday song.",secret:"The forgotten halls use his lyrics to reveal clues.",lines:["A wish in flight, a candle's light... oh, that's actually useful.","Every ending deserves a final verse."]},
    {name:"Tilly",role:"Sugar sprite guide",voice:"Tiny, breathless, sincere.",goal:"Undo the harm she helped cause.",secret:"She showed Sepulchral how to enter the inn.",lines:["He doesn't hate birthdays. He hates what happens after.","Please save the wish. Please save him too, if you can."]},
    {name:"Sepulchral",role:"Keeper of Forgotten Wishes",voice:"Quiet, ancient, never shouts.",goal:"Destroy the Birthday Hero's wish before it can disappoint them.",secret:"His childhood wish was for someone who never returned.",lines:["I do not steal wishes. I prevent wounds.","What becomes of hope when the world says no?"]}
  ],
  items:[
    {name:"Ribbon of Rescue",rules:"Once, as a reaction, pull a willing ally within 20 feet up to 10 feet without provoking opportunity attacks."},
    {name:"Frosting of Mending",rules:"As an action, eat or feed it to a creature. The creature regains 2d4+2 hit points."},
    {name:"Party Horn of Heroism",rules:"Once, as a bonus action, one ally within 30 feet gains advantage on its next attack roll or saving throw."},
    {name:"Birthday Candle of Courage",rules:"Once, light the candle as a bonus action. One creature within 30 feet gains 5 temporary hit points and ends the frightened condition."}
  ],
  pregens:[] // Full SRD 5.1 pregens are defined in player-data.js (loaded after this file).
};
