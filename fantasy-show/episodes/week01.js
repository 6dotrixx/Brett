/* ============================================================
   GRIDIRON EGOS — Episode 1 · Week 1 · “Won by a Foot”
   Final cut assembled from the three writers'-room drafts.
   ============================================================ */
window.EPISODE = {
  series: 'Gridiron Egos',
  episode: 1,
  week: 1,
  title: 'Won by a Foot',
  tagline: 'A 201-point statement win. By three. They will describe it as a massacre.',
  nextWeekTease: 'Week 2: a fresh victim, the Price-vs-Gibbs footrace heats up, and Aubrey has laminated a brand-new list. Drop in the Week 2 box score and the cameras roll again.',

  result: {
    us: 201, them: 198,
    teamName: 'The Gridiron Egos', teamAbbr: 'EGO',
    rivalName: "Craig's List Legends", rivalAbbr: 'CRG',
  },

  roster: [
    { id: 'ALLEN',    name: 'Josh Allen',       short: 'JOSH ALLEN', pos: 'QB',   pts: 29 },
    { id: 'GIBBS',    name: 'Jahmyr Gibbs',     short: 'GIBBS',      pos: 'RB1',  pts: 33, badge: 'WEEK HIGH' },
    { id: 'GAINWELL', name: 'Kenneth Gainwell', short: 'GAINWELL',   pos: 'RB2',  pts: 19 },
    { id: 'ADAMS',    name: 'Davante Adams',    short: 'ADAMS',      pos: 'WR1',  pts: 20 },
    { id: 'COLLINS',  name: 'Nico Collins',     short: 'NICO',       pos: 'WR2',  pts: 18 },
    { id: 'FANNIN',   name: 'Harold Fannin Jr.',short: 'FANNIN',     pos: 'TE',   pts: 16 },
    { id: 'PRICE',    name: 'Jadarian Price',   short: 'PRICE',      pos: 'FLEX', pts: 30, badge: 'FLEX STEAL' },
    { id: 'AUBREY',   name: 'Brandon Aubrey',   short: 'AUBREY',     pos: 'K',    pts: 22, badge: 'GAME WINNER' },
    { id: 'BRONCOS',  name: 'Broncos D/ST',     short: 'THE HIVE',   pos: 'DEF',  pts: 14 },
  ],

  scenes: [
    /* ---------------- 1 · cold open ---------------- */
    {
      setting: 'scoreboard', title: 'FINAL: 201–198', overlay: 'finalScore',
      lines: [
        { s: 'NARRATOR', t: 'FINAL SCORE: 201 to 198! The greatest three-point blowout in the history of organized numbers!', m: 'hype' },
        { s: 'ALLEN',    t: 'Two hundred and one points, baby. Hang a banner. Hang two.', m: 'hype' },
        { s: 'GIBBS',    t: 'Thirty-three of those are mine. I AM the banner.', m: 'brag' },
        { s: 'NARRATOR', t: "Their opponent, Craig's List Legends, scored 198. Which is a lot. Nobody tell them.", m: 'deadpan' },
        { s: 'PRICE',    t: "Craig listed his team online. We hit 'buy now.'", m: 'smack' },
        { s: 'AUBREY',   t: "Margin of victory: three points. Field goals are worth: three points. I'll wait.", m: 'brag' },
        { s: 'BRONCOS',  t: 'WE ARE MANY. WE ARE... FOURTEEN.', m: 'hype' },
        { s: 'NARRATOR', t: 'They won by a single field goal. They are about to celebrate like it was a coronation. This is their story. Unfortunately.', m: 'deadpan' },
      ],
    },

    /* ---------------- 2 · locker room rally ---------------- */
    {
      setting: 'locker_room', title: 'STATE OF THE BLOWOUT', overlay: 'statBoard',
      lines: [
        { s: 'ALLEN',    t: 'Gentlemen! 201 points! Best fantasy squad of the YEAR!', m: 'hype' },
        { s: 'ADAMS',    t: 'Year? Try decade. I ran routes so pretty the cornerback apologized.', m: 'brag' },
        { s: 'PRICE',    t: "Thirty points. From the FLEX spot. I'm basically a starter paying rent in the guest room.", m: 'angry' },
        { s: 'GIBBS',    t: 'Cute, rook. I had 33. The number one stays number one.', m: 'smack' },
        { s: 'PRICE',    t: "Three points, Gibbs. That's one juke and a stiff breeze.", m: 'smack' },
        { s: 'GAINWELL', t: "I had 19 and blocked for both of y'all. Anybody? No? Cool.", m: 'deadpan' },
        { s: 'FANNIN',   t: '16 points in my first week! Did I do good? Vets? Did I do good?', m: 'hype' },
        { s: 'ADAMS',    t: 'The rookie is asking for a grade. Give him a B-minus and a juice box.', m: 'deadpan' },
        { s: 'FANNIN',   t: 'Sitting down. Still happy, though.', m: 'laugh' },
        { s: 'COLLINS',  t: '18 points on barely any targets. Imagine my numbers if the ball knew my name.', m: 'humble' },
        { s: 'BRONCOS',  t: 'WE SACK. WE FEAST. WE SHARE ONE BRAIN AND IT IS FURIOUS.', m: 'hype' },
      ],
    },

    /* ---------------- 3 · the kicker does math ---------------- */
    {
      setting: 'press_room', title: 'THE KICKER HAS ENTERED THE CHAT',
      lines: [
        { s: 'NARRATOR', t: 'The post-game press conference. Nobody requested one. They held it anyway.', m: 'deadpan' },
        { s: 'AUBREY',   t: 'Aubrey: 22. Adams: 20. Gainwell: 19. Collins: 18. Fannin: 16. Any questions?', m: 'brag' },
        { s: 'ADAMS',    t: 'I run routes so beautiful they belong in a museum. You kick a ball off a tee, Roomba.', m: 'smack' },
        { s: 'AUBREY',   t: 'A museum where you scored 20, Davante. The kicker exhibit scored 22.', m: 'smack' },
        { s: 'COLLINS',  t: "I'm not salty. I'm seasoned. There's a difference.", m: 'deadpan' },
        { s: 'AUBREY',   t: "Seasoned at 18, Nico. I don't even need hands.", m: 'smack' },
        { s: 'GAINWELL', t: 'The KICKER outscored me. And he will not stop doing finger guns at me.', m: 'angry' },
        { s: 'AUBREY',   t: 'Finger guns. Boop.', m: 'deadpan' },
        { s: 'FANNIN',   t: "He's got a list! Am I on the list? Wait. I don't want to be on the list.", m: 'nervous' },
        { s: 'AUBREY',   t: "You're on the list, rookie. It's laminated.", m: 'deadpan' },
      ],
    },

    /* ---------------- 4 · film room ---------------- */
    {
      setting: 'film_room', title: "THE TAPE DON'T LIE",
      lines: [
        { s: 'NARRATOR', t: 'Monday. Film review. Where legends are made, and one field goal gets watched forty-seven times.', m: 'deadpan' },
        { s: 'ALLEN',    t: 'Watch this throw. Triple coverage, no fear, all arm. 29 points of pure faith.', m: 'brag' },
        { s: 'ADAMS',    t: 'That was a prayer with a spiral, and you know it.', m: 'deadpan' },
        { s: 'ALLEN',    t: "Prayers get ANSWERED when you throw them seventy yards. Scoreboard doesn't ask questions.", m: 'laugh' },
        { s: 'COLLINS',  t: 'Pause it. See me right there? Wide open? For three hours? Just checking.', m: 'deadpan' },
        { s: 'ALLEN',    t: 'I saw you, Nico. I simply chose chaos instead.', m: 'laugh' },
        { s: 'ADAMS',    t: "Roll my route at the eight-minute mark. That's not football. That's ballet with malice.", m: 'brag' },
        { s: 'BRONCOS',  t: 'ROLL OUR TAPE! THE QUARTERBACK RAN. WE RAN FASTER.', m: 'hype' },
        { s: 'GIBBS',    t: "A whole defense, one brain, fourteen points. That's like a quarter point per guy.", m: 'smack' },
        { s: 'BRONCOS',  t: 'THE HIVE HEARD THAT, JAHMYR.', m: 'angry' },
        { s: 'AUBREY',   t: 'Now the good part: my kick. Frame by frame. Zoom in on the leg.', m: 'brag' },
        { s: 'GAINWELL', t: 'We are NOT watching the kicker montage again.', m: 'angry' },
        { s: 'AUBREY',   t: 'Wind: irrelevant. Pressure: irrelevant. Doink probability: zero point zero. Boop. Three points.', m: 'deadpan' },
      ],
    },

    /* ---------------- 5 · the seventeen situation ---------------- */
    {
      setting: 'hallway', title: 'THE SEVENTEEN SITUATION',
      lines: [
        { s: 'FANNIN',   t: 'Quick question! Why do THREE of you wear number seventeen?', m: 'nervous' },
        { s: 'ALLEN',    t: "Seventeen is a quarterback number. It's a leadership thing.", m: 'brag' },
        { s: 'ADAMS',    t: 'I wore 17 before your beard came in, Josh.', m: 'smack' },
        { s: 'AUBREY',   t: '17 is a kicker number now. Highest score of us three. Facts don\'t care about your beards.', m: 'deadpan' },
        { s: 'ADAMS',    t: 'Say it one more time. ONE more time.', m: 'angry' },
        { s: 'AUBREY',   t: 'Twenty-two beats twenty. Math wears seventeen too.', m: 'smack' },
        { s: 'FANNIN',   t: "I'm gonna go stand somewhere else now.", m: 'nervous' },
        { s: 'NARRATOR', t: 'No one won the argument. Everyone kept the number. This is leadership.', m: 'deadpan' },
      ],
    },

    /* ---------------- 6 · a message for craig ---------------- */
    {
      setting: 'locker_room', title: 'A MESSAGE FOR CRAIG',
      lines: [
        { s: 'NARRATOR', t: 'The squad now records a formal message for their fallen opponent. This is not sportsmanlike.', m: 'deadpan' },
        { s: 'ADAMS',    t: "Craig, baby. 198 points and an L. That's the saddest sentence in fantasy football.", m: 'smack' },
        { s: 'GIBBS',    t: "Tell Craig's autodraft I said thanks for the cardio.", m: 'smack' },
        { s: 'PRICE',    t: 'Your bench outscored your feelings, Craig. And we STILL got you.', m: 'smack' },
        { s: 'ALLEN',    t: 'Also, Craig — three of us wear number 17. You lost to the same jersey three times.', m: 'laugh' },
        { s: 'COLLINS',  t: "198 from a team nobody is steering. Nobody laugh. That's actually terrifying.", m: 'deadpan' },
        { s: 'FANNIN',   t: 'Wait. What happens if Craig ever actually TRIES?', m: 'nervous' },
        { s: 'BRONCOS',  t: 'THE HIVE HAS THOUGHT ABOUT THIS. THE HIVE DOES NOT SLEEP ANYMORE.', m: 'nervous' },
        { s: 'ALLEN',    t: 'Then we score 202! Next problem!', m: 'hype' },
      ],
    },

    /* ---------------- 7 · the three-point talk ---------------- */
    {
      setting: 'field', title: 'THE THREE-POINT TALK',
      lines: [
        { s: 'GAINWELL', t: "Everybody huddle up. Real talk: we won by THREE. That's one Craig hiccup from a loss.", m: 'deadpan' },
        { s: 'ALLEN',    t: "He's right. 201 sounds immortal. 198 was breathing on our neck all night.", m: 'humble' },
        { s: 'GIBBS',    t: "Fine, I'll say it once: even the fastest guy checks his mirrors. Once.", m: 'humble' },
        { s: 'PRICE',    t: "And I'm just a rookie in the flex. A LOUD rookie. But hungry.", m: 'humble' },
        { s: 'AUBREY',   t: 'Was the win all me? I was going to be humble here. It was all me.', m: 'humble' },
        { s: 'BRONCOS',  t: 'THE HIVE ACKNOWLEDGES... FOURTEEN IS NOT ENOUGH. THE HIVE WILL LIFT WEIGHTS.', m: 'humble' },
        { s: 'FANNIN',   t: 'So we stay hungry?! I LOVE staying hungry! I brought orange slices!', m: 'hype' },
        { s: 'ADAMS',    t: 'Humility check complete. It lasted forty seconds. A franchise record.', m: 'deadpan' },
        { s: 'ALLEN',    t: "Hands in! 'Best squad of the year' on three! Humbly! ONE, TWO, THREE—", m: 'hype' },
      ],
    },

    /* ---------------- 8 · next week tease ---------------- */
    {
      setting: 'field', title: 'WEEK 2 COMETH',
      lines: [
        { s: 'NARRATOR', t: 'Sunday approaches again. As it does. Weekly. The predictions are already flowing.', m: 'deadpan' },
        { s: 'GIBBS',    t: 'Week 2 forecast: fast. Dangerously fast.', m: 'brag' },
        { s: 'PRICE',    t: 'Week 2 forecast: the flex outscores the RB1. I can see your brake lights, Jahmyr.', m: 'smack' },
        { s: 'GIBBS',    t: 'Prediction: no.', m: 'deadpan' },
        { s: 'GAINWELL', t: "Week 2 forecast: 19 points and zero credit. I've made peace.", m: 'deadpan' },
        { s: 'AUBREY',   t: 'Week 2 forecast: three points whenever I feel like it. Which is always. Boop.', m: 'brag' },
        { s: 'BRONCOS',  t: 'FORECAST: SACKS. HEAVY SACKS. BRING A JACKET.', m: 'hype' },
        { s: 'ALLEN',    t: '201 was the FLOOR, boys! Coach, we ride at dawn!', m: 'hype' },
        { s: 'NARRATOR', t: 'They won by three. Tune in next week, when they will have learned absolutely nothing.', m: 'deadpan' },
      ],
    },
  ],
};
