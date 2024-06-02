import { convertRating, revertRating } from './util';

const fields_batting = ['contact', 'gap', 'power', 'eye', 'avoidKs', 'speed', 'stealing', 'defense'];
const fields_pitching = ['stuff', 'movement', 'control', 'stamina', 'hold'];
const fields_fielding = ["catcherAbil", "catcherArm", "infieldRng", "infieldErr", "infieldArm", "turnDP", "outfieldRng", "outfieldErr", "outfieldArm"];

// For defensive WAR, should probably be re-considered
const slopes = [0.003, 0.009, 0.018, 0.015, 0.024, 0.009, 0.015, 0.009];
const intercepts = [1.1, -1.75, -1.5, -1.05, -1.8, -1.3, -1.15, -1.25];

// Formulas for batting ratings
const formula_batting = {
  avg: { slope: [0.0009, 0.0009], intercept: [0.145, 0.145] },  // Contact -> AVG
  gap: { slope: [0.18, 0.18], intercept: [11, 11] },  // Gap ->  (2B + 3B) / AB * 550
  hr: { slope: [0.15, 0.3], intercept: [3, -12] },  // Power -> HR / AB * 550
  bb: { slope: [0.3, 0.6], intercept: [20, -10] },  // Discipline -> BB / AB * 550
  so: { slope: [-1.2, -1.2], intercept: [270, 270] },  // Avoid K's -> SO / AB * 550
  h3: { slope: [0.0006, 0.0009], intercept: [0.02, -0.01] },  // Speed -> 3B / (2B + 3B)
  sba: { slope: [0.0009, 0.0009], intercept: [0.015, 0.015] },  // Speed -> (SB + CS) / (1B + BB + HBP)
  sb: { slope: [0.003, 0.003], intercept: [0.3, 0.3] },  // Stealing -> SB / (SB + CS)
  zr: { slope: [0.12, 0.12], intercept: [-14, -14] }  // Defense -> ZR
}

// Formulas for pitching ratings
const formula_pitching = {
  so: { slope: [0.6, 0.9], intercept: [65, 40] },  // Stuff -> SO / AB * 550
  hr: { slope: [-0.24, -0.24], intercept: [46, 46] },  // Movement -> HR / AB * 550
  bb: { slope: [-0.72, -0.36], intercept: [128, 92] },  // Control -> BB / AB * 550
  gssp: { slope: [0.01, 0], intercept: [0, 1]},  // Stamina -> GS / (G + GS)
  gsrp: { slope: [0, 0.005], intercept: [0, -0.5]},  // Stamina -> GS / (G + GS)
  absp: { slope: [0.12, 0.06], intercept: [8, 14] },  // Stamina -> AB / G
  abrp: { slope: [0.03, 0.09], intercept: [3.5, -2.5] },  // Stamina -> AB / G
  wsb: { slope: [-0.012, -0.006], intercept: [1.2, 0.6] },  // Hold -> wSB
}

// BABIP lookup for pitchers
const lookup_babip = {
  'EX GB':	0.3,
  'GB':	0.295,
  'NEU':	0.29,
  'FB':	0.285,
  'EX FB':	0.28
}

// Position lookup for position  players
const lookup_pos = {
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

  constructor(parks, scale, player, team, potential) {
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
      for (let key of fields_batting) {
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
      for (let field of fields_batting) {
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
    this.calculateStats(parks);
  }

  calculateStats(parks) {
    // For ops and war and shit
    const lg_obp = 0.312;
    const lg_slg = 0.409;
    const run_pa = 0.121;  
    const run_sb = 0.23;
    const run_cs = -0.5;
    const run_ob = -0.003;
    const war_pa = 0.0032;
    // Park factors
    let park = parks.find(p => p.abbr == this.team);
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
    // Indexes (1 for ratings > 100, 0 for ratings <= 100)
    let avgIndex = +(this.contact > 100);
    let gapIndex = +(this.gap > 100);
    let hrIndex = +(this.power > 100);
    let bbIndex = +(this.eye > 100);
    let soIndex = +(this.avoidKs > 100);
    let h3Index = +(this.speed > 100);
    let sbIndex = +(this.stealing > 100);
    let zrIndex = +(this.defense > 100);
    // Middle men / helpers / whatever
    let h3Pct = (this.speed * formula_batting.h3.slope[h3Index] + formula_batting.h3.intercept[h3Index]);
    let sbaPct = (this.speed * formula_batting.sba.slope[h3Index] + formula_batting.sba.intercept[h3Index]);
    let sbPct = (this.stealing * formula_batting.sb.slope[sbIndex] + formula_batting.sb.intercept[sbIndex]);
    let avg = (this.contact * formula_batting.avg.slope[avgIndex] + formula_batting.avg.intercept[avgIndex]) * parkAvg;
    let gap = Math.max((this.gap * formula_batting.gap.slope[gapIndex] + formula_batting.gap.intercept[gapIndex]), 0);
    let hr = Math.max((this.power * formula_batting.hr.slope[hrIndex] + formula_batting.hr.intercept[hrIndex]) * parkHr, 0);
    let bb = Math.max((this.eye * formula_batting.bb.slope[bbIndex] + formula_batting.bb.intercept[bbIndex]), 0);
    let so = Math.max((this.avoidKs * formula_batting.so.slope[soIndex] + formula_batting.so.intercept[soIndex]), 0);
    let zr =  (this.defense * formula_batting.zr.slope[zrIndex] + formula_batting.zr.intercept[zrIndex]);
    let h = Math.max(avg * 550, 0);
    let h2 = Math.max(gap * (1 - h3Pct) * park.doubles, 0);
    let h3 = Math.max(gap * h3Pct * park.triples, 0);
    let sba = Math.max(sbaPct * (h - h2 - h3 - hr + bb), 0);
    let sb = Math.max(sba * sbPct, 0);
    let cs = Math.max(sba * (1 - sbPct), 0);
    let pa = Math.max(550 + bb, 0);
    // Rates
    let obp = (h + bb) / pa;
    let slg = (h + h2 + 2 * h3 + 3 * hr) / 550;
    let iso = slg - avg;
    let ops = obp + slg;
    let opsp = (obp / lg_obp / park.obp + slg / lg_slg / park.slg - 1) * 100;
    let babip = (h - hr) / (550 - hr - so);
    // Value
    let bat = run_pa * (opsp / 100 - 1) * pa;
    let bsr = run_sb * sb + run_cs * cs + run_ob * (h - h2 - h3 - hr + bb);
    let def = zr + lookup_pos[this.position];
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
    for (let field of fields_batting) {
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

  constructor(parks, scale, player, team, potential) {
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
      for (let key of fields_pitching) {
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
      for (let field of fields_pitching) {
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
    this.calculateStats(parks);
  }

  calculateStats(parks) {
    // Constants, subject to change ig
    const er_pct = 0.93;  // Earned runs per run
    const rs_factor = 1.3;  // Multiply by AVG for RS% (maybe use wOBA or OBP?)
    const lg_era = 4.24;
    const lg_ra9 = 4.56;
    const c_fip = 3.38;
    const war_ip = 0.01;  // Multiply by innings for replacement
    // Park
    let park = parks.find(p => p.abbr == this.team);
    // Indexes (1 for ratings > 100, 0 for ratings <= 100)
    let soIndex = +(this.stuff > 100);
    let hrIndex = +(this.movement > 100);
    let bbIndex = +(this.control > 100);
    let abIndex = +(this.stamina > 100);
    let wsbIndex = +(this.hold > 100);
    // Pitcher-specific
    let gs;
    let ab;
    if (this.position == 'SP') {
      ab = (this.stamina * formula_pitching.absp.slope[abIndex] + formula_pitching.absp.intercept[abIndex]);
      gs = (this.stamina * formula_pitching.gssp.slope[abIndex] + formula_pitching.gssp.intercept[abIndex]);
    } else {
      ab = (this.stamina * formula_pitching.abrp.slope[abIndex] + formula_pitching.abrp.intercept[abIndex]);
      gs = (this.stamina * formula_pitching.gsrp.slope[abIndex] + formula_pitching.gsrp.intercept[abIndex]);
    }
    let gp = 60 * (1 - gs / (1 + gs));
    ab = ab * gp;
    // Middle men / helpers / whatever
    let so = Math.max((this.stuff * formula_pitching.so.slope[soIndex] + formula_pitching.so.intercept[soIndex]), 0);
    let hr = Math.max((this.movement * formula_pitching.hr.slope[hrIndex] + formula_pitching.hr.intercept[hrIndex]) * park.hr_overall, 0);
    let bb = Math.max((this.control * formula_pitching.bb.slope[bbIndex] + formula_pitching.bb.intercept[bbIndex]), 0);
    let wsb = (this.hold * formula_pitching.wsb.slope[wsbIndex] + formula_pitching.wsb.intercept[wsbIndex]);
    let babip = lookup_babip[this.groundFly] * park.avg_overall;
    let h = Math.max(babip * (550 - hr - so) + hr, 0);
    let avg = h / 550;
    let ip = Math.max((550 - h) / 3, 0);
    let rs = Math.max(avg * rs_factor, 0);
    let r = Math.max(rs * (h - hr + bb) + hr + wsb, 0);
    let er = Math.max(er_pct * r, 0);
    let era = er / ip * 9;
    let whip = (bb + h) / ip;
    let hr9 = hr / ip * 9;
    let bb9 = bb / ip * 9;
    let k9 = so / ip * 9;
    let kbb = so / bb;
    let erap = lg_era / (era / park.era) * 100;
    let fip = (13 * hr + 3 * bb - 2 * so) / ip + c_fip;
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
    this.war = ((lg_ra9 - fipr9) / rpw + repl) * this.ip / 9;
  }

  revertRatings(scale) {
    for (let field of fields_pitching) {
      this[field] = revertRating(scale, this[field]);
    }
  }
}


export class Fielder {
  // Player Info
  name;
  height;
  // 1-250 ratings
  catcherAbil;
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
    let catcher = player.catcherAbil && player.catcherArm;
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
    this.catcherAbil = convertRating(scale, player.catcherAbil, true);
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
      let c = (this.catcherAbil - 125) / 25 * 19.5 + (this.catcherArm - 125) / 25 * 19.5 + 133;
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
      this.war.push(slopes[i] * this.ratings[i] + intercepts[i]);
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
    for (let field of fields_fielding) {
      this[field] = revertRating(scale, this[field]);
    }
    if (inches) {
      this.height = Math.round(this.height / 2.54);
    }
  }
}
