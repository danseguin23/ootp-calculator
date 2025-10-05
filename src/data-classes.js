import { convertRating, revertRating } from './util';

const FIELDS_BATTING = ['contact', 'gap', 'power', 'eye', 'avoidKs', 'speed', 'stealing', 'defense'];
const FIELDS_PITCHING = ['stuff', 'movement', 'control', 'stamina', 'hold'];
const FIELDS_FIELDING = ["catcherBlocking", "catcherFraming", "catcherArm", "infieldRng", "infieldErr", "infieldArm", "turnDP", "outfieldRng", "outfieldErr", "outfieldArm"];

// For defensive WAR, should probably be updated
const DWAR_SLOPES = [0.0225, 0.01125, 0.03, 0.01125, 0.045, 0.015, 0.03, 0.015];
const DWAR_INTERCEPTS = [-1.125, -2.0625, -3, -0.9375, -3.75, -2.5, -3, -2];

// Intermediate estimators for batting and pitching ratings
const INTERMEDIATE_ESTIMATORS = {
  babip: [1.4, -0.697, 29.7],  // BABIP = c0 * Contact + c1 * Avoid K's + c2
  aggressiveness: [0.4934, 0.541, -41.3],  // Stealing Aggressiveness = c0 * Speed + c1 * Stealing + c2
  pbabip: [0.379, 5.1, 51.9],  // PBABIP = c0 * Movement + c1 * Ground/Fly + c2
  hra: [1.07, -3.08, -0.0999],  // HRA = c0 * Movement + c1 * Ground/Fly + c2
}

// Formulas for batting ratings
const FORMULA_BATTING = {
  // Deprecated in favour of LOOKUP_BATTING
  babip: { slope: [0.000898, 0.000596], intercept: [0.203, 0.233] },  // xBABIP -> BABIP
  gap: { slope: [0.214, 0.148], intercept: [7.18, 13.7] },  // Gap ->  (2B + 3B) / AB * 550
  hr: { slope: [0.207, 0.24], intercept: [-2.65, -5.95] },  // Power -> HR / AB * 550
  bb: { slope: [0.618, 0.487], intercept: [-8.78, 4.25] },  // Discipline -> BB / AB * 550
  so: { slope: [-1.45, -0.787], intercept: [283, 218] },  // Avoid K's -> SO / AB * 550
  // Still in use, but using 1-250 ratings
  h3: { slope: [0.000844, 0.000567], intercept: [-0.00906, 0.0187] },  // Speed -> 3B / (2B + 3B)
  sba: { slope: [0.000947, 0.00145], intercept: [-0.00904, -0.0598] },  // xStealing Aggressiveness -> (SB + CS) / (1B + BB)
  sb: { slope: [0.00671, 0.00221], intercept: [-0.00988, 0.44] },  // Stealing -> SB / (SB + CS)
  zr: { slope: [0.24, 0.12], intercept: [-26, -14] }  // Defense -> ZR
}

// Mapping 1-600 rating to batting rates
// Between values are interpolated linearly
const LOOKUP_BATTING = {
  babip: [
    [0,	0.15],
    [150,	0.225],
    [300,	0.27],
    [400,	0.3],
    [500,	0.36],
    [600,	0.45],
  ],
  so: [
    [0, 350],
    [150, 200],
    [300, 155],
    [400, 110],
    [500, 50],
    [600, 20]
  ],
  gap: [
    [0,	0],
    [150,	0.05],
    [300,	0.15],
    [400,	0.2],
    [500,	0.3],
    [600,	0.6],
  ],
  hr: [
    [0,	0],
    [150,	2],
    [300,	8],
    [400,	15],
    [500,	35],
    [600,	75]
  ],
  bb: [
    [0,	5],
    [150,	10],
    [300,	30],
    [400,	50],
    [500,	85],
    [600,	175]
  ]
}

const LOOKUP_PITCHING = {
  so: [
    [0, 5],
    [150, 35],
    [300, 85],
    [400, 110],
    [500, 155],
    [600, 245],
  ],
  bb: [
    [0, 175],
    [150, 100],
    [300, 70],
    [400, 45],
    [500, 25],
    [600, 5],
  ],
  hr: [
    [0, 50],
    [150, 35],
    [300, 25],
    [400, 15],
    [500, 7.5],
    [600, 1],
  ],
  babip: [
    [0, 0.32],
    [100, 0.3],
    [150, 0.29],
    [250, 0.275]
  ]
}

// Formulas for pitching ratings
const FORMULA_PITCHING = {
  // Deprecated in favour of LOOKUP_PITCHING
  so: { slope: [0.954, 0.678], intercept: [41.9, 69.5] },  // Stuff -> SO / AB * 550
  hr: { slope: [-0.25, -0.102], intercept: [42, 27.3] },  // xHRA -> HR / AB * 550
  babip: { slope: [-0.000168, -0.000168], intercept: [0.3, 0.3] },  // xPBABIP -> (H - HR) / (AB - HR - SO)
  bb: { slope: [-0.77, -0.25], intercept: [124, 72.3] },  // Control -> BB / AB * 550
  // Still in use, but using 1-250 ratings
  gssp: { slope: [0.01, 0], intercept: [0, 1]},  // Stamina -> GS / (G + GS)
  gsrp: { slope: [0, 0.005], intercept: [0, -0.5]},  // Stamina -> GS / (G + GS)
  absp: { slope: [0.0275, 0.0216], intercept: [7.32, 7.91] },  // Stamina -> AB / (G + GS)
  abrp: { slope: [0.0339, 0.0339], intercept: [3.27, 3.27] },  // Stamina -> AB / (G + GS)
  wsb: { slope: [-0.012, -0.006], intercept: [1.2, 0.6] },  // Hold -> wSB
}

// BABIP lookup for pitchers
const LOOKUP_GROUND_FLY = {
  'EX GB':	0,
  'GB':	1,
  'NEU':	2,
  'FB':	3,
  'EX FB': 4
}

// Position lookup for position  players
const LOOKUP_POS = {
  'SP':	-14,
  'RP':	-14,
  'CL':	-14,
  'DH':	-14,
  'C':	10,
  '1B':	-10,
  '2B':	2,
  '3B':	2,
  'SS':	6,
  'LF':	-6,
  'CF':	2,
  'RF':	-6
}

const LEAGUE_TOTALS = {
  atBats: 163687,
  hits: 39823,
  doubles: 7771,
  triples: 697,
  homeRuns: 5453,
  walks: 14929,
  hitByPitches: 2020,
  strikeouts: 41197
}

const LEAGUE_AVERAGES = {
  babip: (LEAGUE_TOTALS.hits - LEAGUE_TOTALS.homeRuns) / (LEAGUE_TOTALS.atBats - LEAGUE_TOTALS.homeRuns - LEAGUE_TOTALS.strikeouts),
  so: LEAGUE_TOTALS.strikeouts / LEAGUE_TOTALS.atBats * 550,
  gap: (LEAGUE_TOTALS.doubles + LEAGUE_TOTALS.triples) / (LEAGUE_TOTALS.hits - LEAGUE_TOTALS.homeRuns),
  hr: LEAGUE_TOTALS.homeRuns / LEAGUE_TOTALS.atBats * 550,
  bb: LEAGUE_TOTALS.walks / LEAGUE_TOTALS.atBats * 550,
  // For OPS+
  obp: (LEAGUE_TOTALS.hits + LEAGUE_TOTALS.walks + LEAGUE_TOTALS.hitByPitches) / (LEAGUE_TOTALS.atBats + LEAGUE_TOTALS.walks + LEAGUE_TOTALS.hitByPitches),
  slg: (LEAGUE_TOTALS.hits + LEAGUE_TOTALS.doubles + 2 * LEAGUE_TOTALS.triples + 3 * LEAGUE_TOTALS.homeRuns) / LEAGUE_TOTALS.atBats
}

// For WAR calculations
const run_pa = 0.118;  
const run_sb = 0.2;
const run_cs = -0.425;
const run_ob = -0.0072;
const war_pa = 0.003135;
// Pitchers
const rs_factor = 1.235;  // Multiply by AVG for RS% (maybe use wOBA or OBP?)
const add_outs = 10;  // Add to outs for innings calculation
const lg_era = 4.08;
const lg_ra9 = 4.45;
const c_fip = 3.16;
const war_ip = 0.0048;  // Add to WAR (multiplied by innings)

export class Batter {
  list;
  // Player Info
  team;
  position;
  jersey;
  name;
  info;
  age;
  bats;
  throws;
  overall;
  // 1-250 Ratings
  contact;
  gap;
  power;
  eye;
  avoidKs;
  contactLeft;
  powerLeft;
  contactRight;
  powerRight;
  bunt;
  buntForHit;
  speed;
  stealing;
  defense;
  scoutAccuracy;
  // Projected stats
  gp;
  pa;
  ab;
  h;
  h2;
  h3;
  hr;
  bb;
  so;
  avg;
  obp;
  slg;
  iso;
  ops;
  opsp;
  babip;
  war;
  sb;
  cs;

  constructor(teams, scale, player, team, potential) {
    // Construct from tab-separated line
    if (player && team) {
      let index = {
        speed: 19,
        stealing: 20,
        defense: 21
      }
      if (potential) {
        index.speed = 13;
        index.stealing = 14;
        index.defense = 16;
      }
      this.team = team;
      let split = player.split('\t');
      this.position = String(split[0]).trim();
      this.jersey = Number(split[1]);
      this.name = String(split[2]).trim();
      this.info = String(split[3]).trim();
      this.age = Number(split[4]);
      this.bats = String(split[5]).trim();
      this.throws = String(split[6]).trim();
      this.overall = Number(split[7].replace(' Stars', ''));
      this.contact = convertRating(scale, split[8]);
      this.gap = convertRating(scale, split[9]);
      this.power = convertRating(scale, split[10]);
      this.eye = convertRating(scale, split[11]);
      this.avoidKs = convertRating(scale, split[12]);
      // this.contactLeft = convertRating(scale, split[13]);
      // this.powerLeft = convertRating(scale, split[14]);
      // this.contactRight = convertRating(scale, split[15]);
      // this.powerRight = convertRating(scale, split[16]);
      // this.bunt = convertRating(scale, split[17]);
      // this.buntForHit = convertRating(scale, split[18]);
      this.speed = convertRating(scale, split[index.speed]);
      this.stealing = convertRating(scale, split[index.stealing]);
      this.defense = convertRating(scale, split[index.defense]);
      // this.scoutAccuracy = String(split[22]).trim();
      for (let key of FIELDS_BATTING) {
        if (this[key] == NaN || this[key] == 'undefined') {
          throw 'Invalid input! Try the "help" button for tips.'
        }
      }
    }
    // Construct from partial object
    else if (player) {
      if (!player.name) {
        throw 'Invalid input! Name cannot be left blank.'
      }
      if (player.position == '-') {
        throw 'Invalid input! Position cannot be left blank.'
      }
      for (let field of FIELDS_BATTING) {
        let value = player[field];
        if (!value) {
          throw 'Invalid input! Ratings cannot be left blank.'
        }
      }
      this.list = String(player.list);
      this.name = String(player.name);
      this.position = String(player.position);
      this.team = String(player.team);
      this.bats = String(player.bats);
      this.contact = convertRating(scale, player.contact);
      this.gap = convertRating(scale, player.gap);
      this.power = convertRating(scale, player.power);
      this.eye = convertRating(scale, player.eye);
      this.avoidKs = convertRating(scale, player.avoidKs);
      this.speed = convertRating(scale, player.speed);
      this.stealing = convertRating(scale, player.stealing);
      this.defense = convertRating(scale, player.defense);
    } 
    // For copying purposes
    else if (!scale) {
      return;
    }
    this.calculateStats(teams);
  }

  calculateStats(teams) {
    // Park factors
    let park = teams.find(p => p.abbr == this.team);
    let parkAvg;
    let parkHr;
    if (this.bats == 'R') {
      parkAvg = park.avg_rhb;
      parkHr = park.hr_rhb;
    } else if (this.bats == 'L') {
      parkAvg = park.avg_lhb;
      parkHr = park.hr_lhb;
    } else if (this.bats == 'S') {
      parkAvg = (2 * park.avg_lhb + park.avg_rhb) / 3;
      parkHr = (2 * park.hr_lhb + park.hr_rhb) / 3;
    } else {
      parkAvg = park.avg_overall;
      parkHr = park.hr_overall;
    }
    // Estimated grades
    let xbabip = Math.max((this.contact * INTERMEDIATE_ESTIMATORS.babip[0] + this.avoidKs * INTERMEDIATE_ESTIMATORS.babip[1] + INTERMEDIATE_ESTIMATORS.babip[2]), 0);
    let xagg = Math.max((this.speed * INTERMEDIATE_ESTIMATORS.aggressiveness[0] + this.stealing * INTERMEDIATE_ESTIMATORS.aggressiveness[1] + INTERMEDIATE_ESTIMATORS.aggressiveness[2]), 0);
    // Indexes (1 for ratings > 100, 0 for ratings <= 100)
    let h3Index = +(this.speed > 100);
    let sbIndex = +(this.stealing > 100);
    let sbaIndex = +(xagg > 100);
    let zrIndex = +(this.defense > 100);
    // Adjusted rates before park factor adjustment
    let babipAdj = getAdjustedRate(xbabip, LEAGUE_AVERAGES.babip, LOOKUP_BATTING.babip);
    let soAdj = getAdjustedRate(this.avoidKs, LEAGUE_AVERAGES.so, LOOKUP_BATTING.so, true);
    let gapAdj = getAdjustedRate(this.gap, LEAGUE_AVERAGES.gap, LOOKUP_BATTING.gap);
    let hrAdj = getAdjustedRate(this.power, LEAGUE_AVERAGES.hr, LOOKUP_BATTING.hr, true);
    let bbAdj = getAdjustedRate(this.eye, LEAGUE_AVERAGES.bb, LOOKUP_BATTING.bb, true);
    console.log(`BABIP: ${babipAdj}, SO: ${soAdj}, Gap: ${gapAdj}, HR: ${hrAdj}, BB: ${bbAdj}`);
    // Adjusted rates
    // Middle men / helpers / whatever
    let h3Pct = (this.speed * FORMULA_BATTING.h3.slope[h3Index] + FORMULA_BATTING.h3.intercept[h3Index]);
    let sbaPct = Math.max((xagg * FORMULA_BATTING.sba.slope[sbaIndex] + FORMULA_BATTING.sba.intercept[sbaIndex]), 0);
    let sbPct = Math.max((this.stealing * FORMULA_BATTING.sb.slope[sbIndex] + FORMULA_BATTING.sb.intercept[sbIndex]), 0);
    let babip = babipAdj;
    let hr = hrAdj * 550 * parkHr;
    let bb = bbAdj * 550;
    let so = soAdj * 550;
    let zr =  (this.defense * FORMULA_BATTING.zr.slope[zrIndex] + FORMULA_BATTING.zr.intercept[zrIndex]);

    let h = (babip * (550 - hr - so) + hr) * parkAvg;
    let gap = gapAdj * (h - hr);
    let h2 = gap * (1 - h3Pct) * park.doubles;
    let h3 = gap * h3Pct * park.triples;
    let sba = sbaPct * (h - h2 - h3 - hr + bb);
    let sb = sba * sbPct;
    let cs = sba * (1 - sbPct);
    let hbp = LEAGUE_TOTALS.hitByPitches / LEAGUE_TOTALS.atBats * 550;
    let pa = 550 + bb + hbp;
    // Rates
    let avg = h / 550
    let obp = (h + bb + hbp) / pa;
    let slg = (h + h2 + 2 * h3 + 3 * hr) / 550;
    let iso = slg - avg;
    let ops = obp + slg;
    let opsp = (obp / LEAGUE_AVERAGES.obp / park.obp + slg / LEAGUE_AVERAGES.slg / park.slg - 1) * 100;
    // Value
    let bat = run_pa * (opsp / 100 - 1) * pa;
    let bsr = run_sb * sb + run_cs * cs + run_ob * (h - h2 - h3 - hr + bb);
    let def = zr + LOOKUP_POS[this.position];
    let war = (bat + bsr + def) / 10 + war_pa * pa;
    // Projected stats
    this.gp = 150;
    this.pa = 4 * this.gp;
    this.ab = this.pa / pa * 550;
    this.h = h / 550 * this.ab;
    this.h2 = h2 / 550 * this.ab;
    this.h3 = h3 / 550 * this.ab;
    this.hr = hr / 550 * this.ab;
    this.bb = bb / 550 * this.ab;
    this.so = so / 550 * this.ab;
    this.sb = sb / 550 * this.ab;
    this.cs = cs / 550 * this.ab;
    this.avg = avg;
    this.obp = obp;
    this.slg = slg;
    this.iso = iso;
    this.ops = ops;
    this.opsp = opsp;
    this.babip = babip;
    this.war = war / 550 * this.ab;
  }

  revertRatings(scale) {
    for (let field of FIELDS_BATTING) {
      this[field] = revertRating(scale, this[field]);
    }
  }
}

export class Pitcher {
  list;
  // Player Info
  team;
  position;
  jersey;
  name;
  info;
  age;
  bats;
  throws;
  overall;
  // 1-250 ratings
  stuff;
  movement;
  control;
  stuffLeft;
  stuffRight;
  velocity;
  stamina;
  groundFly;
  hold;
  scoutAccuracy;
  // Projected stats
  gp;
  gs;
  ip;
  h;
  hr;
  r;
  er;
  bb;
  so;
  era;
  avg;
  babip;
  whip;
  hr9;
  bb9;
  k9;
  kbb;
  erap;
  fip;
  war;

  constructor(teams, scale, player, team, potential) {
    // Construct from tab-separated line
    if (player && team) {
      let index = {
        stamina: 14,
        groundFly: 15,
        hold: 16
      }
      if (potential) {
        index.stamina = 12;
        index.groundFly = 13;
        index.hold = 14;
      }
      this.team = team;
      let split = player.split('\t');
      this.position = String(split[0]).trim();
      this.jersey = Number(split[1]);
      this.name = String(split[2]).trim();
      this.info = String(split[3]).trim();
      this.age = Number(split[4]);
      this.bats = String(split[5]).trim();
      this.throws = String(split[6]).trim();
      this.overall = Number(split[7].replace(' Stars', ''));
      this.stuff = convertRating(scale, split[8], false, true);
      this.movement = convertRating(scale, split[9]);
      this.control = convertRating(scale, split[10]);
      // this.stuffLeft = convertRating(scale, split[11], false, true);
      // this.stuffRight = convertRating(scale, split[12], false, true);
      // this.velocity = String(split[13]).trim();
      this.stamina = convertRating(scale, split[index.stamina]);
      this.groundFly = String(split[index.groundFly]).trim();
      this.hold = convertRating(scale, split[index.hold]);
      // this.scoutAccuracy = String(split[17]).trim();
      for (let key of FIELDS_PITCHING) {
        if (this[key] == NaN || this[key] == 'undefined') {
          throw 'Invalid input! Try the "help" button for tips.'
        }
      }
    }
    // Construct from partial object
    else if (player) {
      if (!player.name) {
        throw 'Invalid input! Name cannot be left blank.'
      }
      if (player.position == '-') {
        throw 'Invalid input! Position cannot be left blank.'
      }
      for (let field of FIELDS_PITCHING) {
        let value = player[field];
        if (!value) {
          throw 'Invalid input! Ratings cannot be left blank.'
        }
      }
      this.list = String(player.list);
      this.name = String(player.name);
      this.position = String(player.position);
      this.team = String(player.team);
      this.stuff = convertRating(scale, player.stuff, false, true);
      this.movement = convertRating(scale, player.movement);
      this.control = convertRating(scale, player.control);
      this.stamina = convertRating(scale, player.stamina);
      this.groundFly = player.groundFly;
      this.hold = convertRating(scale, player.hold);
    } 
    // For copying purposes
    else if (!scale) {
      return;
    }
    this.calculateStats(teams);
  }

  calculateStats(teams) {
    // Park
    let park = teams.find(p => p.abbr == this.team);
    // Estimated grades
    let xbabip = Math.max((this.movement * INTERMEDIATE_ESTIMATORS.pbabip[0] + LOOKUP_GROUND_FLY[this.groundFly] * INTERMEDIATE_ESTIMATORS.pbabip[1] + INTERMEDIATE_ESTIMATORS.pbabip[2]), 0);
    let xhra = Math.max((this.movement * INTERMEDIATE_ESTIMATORS.hra[0] + LOOKUP_GROUND_FLY[this.groundFly] * INTERMEDIATE_ESTIMATORS.hra[1] + INTERMEDIATE_ESTIMATORS.hra[2]), 0);
    console.log('Movement:', this.movement, 'GF:', LOOKUP_GROUND_FLY[this.groundFly]);
    console.log(`xBABIP: ${xbabip}, xHRA: ${xhra}`);
    // Adjusted rates before park factor adjustment
    let babipAdj = getAdjustedRate(xbabip, LEAGUE_AVERAGES.babip, LOOKUP_PITCHING.babip, false, true);
    console.log(`xBABIP: ${xbabip} -> BABIP: ${babipAdj}`);
    let hrAdj = getAdjustedRate(xhra, LEAGUE_AVERAGES.hr, LOOKUP_PITCHING.hr, true);
    let soAdj = getAdjustedRate(this.stuff, LEAGUE_AVERAGES.so, LOOKUP_PITCHING.so, true);
    let bbAdj = getAdjustedRate(this.control, LEAGUE_AVERAGES.bb, LOOKUP_PITCHING.bb, true);
    console.log(`PBABIP: ${babipAdj}, HRA: ${hrAdj}, SO: ${soAdj}, BB: ${bbAdj}`);
    // Indexes (1 for ratings > 100, 0 for ratings <= 100)
    let abIndex = +(this.stamina > 100);
    let wsbIndex = +(this.hold > 100);
    // Pitcher-specific
    let gs;
    let ab;
    if (this.position == 'SP') {
      ab = (this.stamina * FORMULA_PITCHING.absp.slope[abIndex] + FORMULA_PITCHING.absp.intercept[abIndex]);
      gs = (this.stamina * FORMULA_PITCHING.gssp.slope[abIndex] + FORMULA_PITCHING.gssp.intercept[abIndex]);
    } else {
      ab = (this.stamina * FORMULA_PITCHING.abrp.slope[abIndex] + FORMULA_PITCHING.abrp.intercept[abIndex]);
      gs = (this.stamina * FORMULA_PITCHING.gsrp.slope[abIndex] + FORMULA_PITCHING.gsrp.intercept[abIndex]);
    }
    let gp = 60 * (1 - gs / (1 + gs));
    ab = ab * 60;
    // Middle men / helpers / whatever
    let so = soAdj * 550;
    let hr = hrAdj * 550 * park.hr_overall;
    let bb = bbAdj * 550;
    let hbp = LEAGUE_TOTALS.hitByPitches / LEAGUE_TOTALS.atBats * 550;
    let babip = babipAdj;
    let wsb = (this.hold * FORMULA_PITCHING.wsb.slope[wsbIndex] + FORMULA_PITCHING.wsb.intercept[wsbIndex]);
    let h = babip * (550 - hr - so) + hr;
    let avg = h / 550;
    let ip = (550 - h + add_outs) / 3;
    let rs = avg * rs_factor;
    let r = rs * (h - hr + bb + hbp) + hr + wsb;
    let er = lg_era / lg_ra9 * r;
    let era = er / ip * 9;
    let whip = (bb + h) / ip;
    let hr9 = hr / ip * 9;
    let bb9 = bb / ip * 9;
    let k9 = so / ip * 9;
    let kbb = so / bb;
    let erap = lg_era / (era / park.era) * 100;
    let fip = (13 * hr + 3 * (bb + hbp) - 2 * so) / ip + c_fip;
    // Stats
    this.gp = gp;
    this.gs = 60 - this.gp;
    this.ip = ip / 550 * ab;
    this.h = h / 550 * ab;
    this.hr = hr / 550 * ab;
    this.r = r / 550 * ab;
    this.er = er / 550 * ab;
    this.bb = bb / 550 * ab;
    this.so = so / 550 * ab;
    this.era = era;
    this.avg = avg;
    this.babip = babip;
    this.whip = whip;
    this.hr9 = hr9;
    this.bb9 = bb9;
    this.k9 = k9;
    this.kbb = kbb;
    this.erap = erap;
    this.fip = fip;
    // Calculate WAR, FanGraphs style
    let fipr9 = fip / park.fip + (lg_ra9 - lg_era);
    let ipg = (this.ip / this.gp);
    let rpw = (((18 - ipg) * lg_ra9 + ipg * fipr9) / 18 + 2) * 1.5;
    let gspct = this.gs / this.gp;
    let repl = 0.03 * (1 - gspct) + 0.12 * gspct;
    this.war = ((lg_ra9 - fipr9) / rpw + repl) * this.ip / 9 + war_ip * this.ip;
  }

  revertRatings(scale) {
    for (let field of FIELDS_PITCHING) {
      this[field] = revertRating(scale, this[field]);
    }
  }
}


export class Fielder {
  // Player Info
  name;
  height;
  // 1-250 ratings
  catcherBlocking;
  catcherFraming;
  catcherArm;
  infieldRng;
  infieldErr;
  infieldArm;
  turnDP;
  outfieldRng;
  outfieldErr;
  outfieldArm;
  // Position ratings [C, 1B, 2B, 3B, SS, LF, CF, RF]
  ratings;
  // Position WAR [C, 1B, 2B, 3B, SS, LF, CF, RF]
  war;

  constructor(scale, player, save=false) {
    // Throw errahs
    if (save && !player.name) {
      throw 'Invalid input! Name cannot be left blank.'
    }
    let catcher = player.catcherBlocking && player.catcherFraming && player.catcherArm;
    let infield = player.infieldRng && player.infieldErr && player.infieldArm && player.turnDP;
    let outfield = player.outfieldRng && player.outfieldErr && player.outfieldArm;
    if (!catcher && !infield && !outfield) {
      throw 'Invalid input! At least one rating group must be filled out.'
    }
    // Assignments
    this.name = String(player.name);
    /* Nvm height should already be determined
    if (inches) {
      this.heght = Math.round(+player.height * 2.54);
    } else {
      this.height = +player.height;
    }
    */
    this.height = player.height;
    this.catcherBlocking = convertRating(scale, player.catcherBlocking, true);
    this.catcherFraming = convertRating(scale, player.catcherFraming, true);
    this.catcherArm = convertRating(scale, player.catcherArm, true);
    this.infieldRng = convertRating(scale, player.infieldRng, true);
    this.infieldErr = convertRating(scale, player.infieldErr, true);
    this.infieldArm = convertRating(scale, player.infieldArm, true);
    this.turnDP = convertRating(scale, player.turnDP, true);
    this.outfieldRng = convertRating(scale, player.outfieldRng, true);
    this.outfieldErr = convertRating(scale, player.outfieldErr, true);
    this.outfieldArm = convertRating(scale, player.outfieldArm, true);
    this.ratings = [];
    // Calculate ratings
    if (catcher) {
      let c = (this.catcherBlocking - 125) / 25 * 12.125 + (this.catcherFraming - 125) / 25 * 12.125 + (this.catcherArm - 125) / 25 * 10.375 + 118;
      this.ratings.push(c);
    } else {
      this.ratings.push(0);
    }
    if (infield) {
      if (this.height) {
        let range;
        let error;
        let arm;
        let turn;
        if (this.height > 215) {
          this.height = 215;
        }
        if (this.infieldRng < 90) {
          range = this.infieldRng / 3;
        } else {
          range = 30 + (this.infieldRng - 90) * 2 / 25;
        }

        if (this.infieldErr < 90) {
          error = this.infieldErr / 5;
        } else {
          error = 18 + (this.infieldErr - 90) / 25;
        }
        arm = this.infieldArm / 70;
        turn = this.turnDP / 70;
        let hfac = 1 + (this.height - 155) / 15;
        let first = hfac * (range + error + arm + turn);
        this.ratings.push(first)
      } else {
        this.ratings.push(0);
      }
      let second = (this.infieldRng - 125) / 25 * 21.5 + (this.infieldArm - 125) / 25 * 1.5 + (this.turnDP - 125) / 25 * 9 + (this.infieldErr - 125) / 25 * 8.25 + 129;
      let third = (this.infieldRng - 125) / 25 * 13 + (this.infieldArm - 125) / 25 * 17 + (this.turnDP - 125) / 25 * 3.25 + (this.infieldErr - 125) / 25 * 7.5 + 113.5;
      let short = (this.infieldRng - 125) / 25 * 25.5 + (this.infieldArm - 125) / 25 * 2 + (this.turnDP - 125) / 25 * 8 + (this.infieldErr - 125) / 25 * 7.5 + 93.75;
      this.ratings.push(second, third, short);
    } else {
      this.ratings.push(0, 0, 0, 0);
    }
    if (outfield) {
      let left = (this.outfieldRng - 125) / 25 * 29.5 + (this.outfieldArm - 125) / 25 * 5.75 + (this.outfieldErr - 125) / 25 * 4 + 149;
      let center = (this.outfieldRng - 125) / 25 * 43 + (this.outfieldArm - 125) / 25 * 1.75 + (this.outfieldErr - 125) / 25 * 3.5 + 78;
      let right = (this.outfieldRng - 125) / 25 * 25.5 + (this.outfieldArm - 125) / 25 * 11 + (this.outfieldErr - 125) / 25 * 4 + 129;
      this.ratings.push(left, center, right);
    } else {
      this.ratings.push(0, 0, 0);
    }
    // Calculate WAR
    this.war = [];
    for (let i in this.ratings) {
      this.war.push(DWAR_SLOPES[i] * this.ratings[i] + DWAR_INTERCEPTS[i]);
    }
  }

  // Convert to specified scale, colors, etc
  getDisplay(scale) {
    let display = [];
    for (let i in this.ratings) {
      let obj = { war: this.war[i] };
      obj.grade = revertRating(scale, this.ratings[i], true);
      obj.rating = this.ratings[i];
      // Surely there's a better way of doing this but ¯\_(ツ)_/¯
      let rating = this.ratings[i];
      let color;
      if (rating < 9)
        color = "#A40000";
      else if (rating < 25)
        color = "#CB0000";
      else if (rating < 42)
        color = "#FD0000";
      else if (rating < 59)
        color = "#FD6A00";
      else if (rating < 75)
        color = "#FDBC00";
      else if (rating < 92)
        color = "#EBDF08";
      else if (rating < 109)
        color = "#BBD500";
      else if (rating < 125)
        color = "#56D100";
      else if (rating < 142)
        color = "#57CF1F";
      else if (rating < 159)
        color = "#76D086";
      else if (rating < 179)
        color = "#00C4C6";
      else if (rating < 192)
        color = "#00C3E5";
      else
        color = "#0095FB";
      obj.color = color;
      display.push(obj);
    }
    return display;
  }

  revertRatings(scale, inches=false) {
    for (let field of FIELDS_FIELDING) {
      this[field] = revertRating(scale, this[field]);
    }
    if (inches) {
      this.height = Math.round(this.height / 2.54);
    }
  }
}

/**
 * Converts a value from 1-250 scale to 1-600 scale.
 * @param {*} value 
 * @returns 
 */
function convert250to600(value) {
  const scaleMap = [
    [0, 100],
    [100, 400],
    [200, 500],
    [250, 600]
  ]
  for (let i = 0; i < scaleMap.length - 1; i++) {
    let [x1, y1] = scaleMap[i];
    let [x2, y2] = scaleMap[i + 1];
    if (value >= x1 && value <= x2) {
      let slope = (y2 - y1) / (x2 - x1);
      let intercept = y1 - slope * x1;
      return intercept + slope * value;
    }
  }
  return value;
}

function getLookupValue(lookup, rating) {
  for (let i = 0; i < lookup.length - 1; i++) {
    let [x1, y1] = lookup[i];
    let [x2, y2] = lookup[i + 1];
    if (rating >= x1 && rating <= x2) {
      let slope = (y2 - y1) / (x2 - x1);
      let intercept = y1 - slope * x1;
      return intercept + slope * rating;
    }
  }
  return lookup[lookup.length - 1][1];
}

function getAdjustedRate(rate1to250, leagueAverage, lookup, per550=false, keepAs1to250=false) {
  let rate;
  let lookup50Grade;
  if (keepAs1to250) {
    rate = rate1to250;
    lookup50Grade = getLookupValue(lookup, 100);
  } else {
    rate = convert250to600(rate1to250);
    lookup50Grade = getLookupValue(lookup, 400);
  }
  let raw = getLookupValue(lookup, rate);
  if (per550) {
    raw = raw / 550;
    leagueAverage = leagueAverage / 550;
    lookup50Grade = lookup50Grade / 550;
  }
  let adjusted = (raw*leagueAverage*(1-lookup50Grade))/(raw*leagueAverage-lookup50Grade*raw-lookup50Grade*leagueAverage+lookup50Grade)
  return adjusted;
}