import { ThrowStmt } from "@angular/compiler";
import { CookieService } from "ngx-cookie-service";

// Constants
const lg_obp = 0.317366582;  // League average OBP
const lg_slg = 0.424479901;  // League average slugging
const rs_scale = 1.25;  // Multiply by AVG for RS%
const er_pct = 0.94;  // ER per RA
const lg_era = 4.425;  // League ERA
const lg_ra9 = 4.70;
const avg_scale = 1.034;  // Display pitcher AVG/BABIP multiplier
const run_sb = 0.23;
const run_cs = -0.5;
const run_fb = -0.003;
const run_pa = 0.025;
const c_fip = 3.32;
const warip = 0.000867;  // WAR adjustment for pitchers
const rppa = 0.125;  // League runs per PA
const rpw = 10.0;  // Runs per win
const positions = {
    "-": 0,
    "DH": 1,
    "C": 2,
    "1B": 3,
    "2B": 4,
    "3B": 5,
    "SS": 6,
    "LF": 7,
    "CF": 8,
    "RF": 9
}
// Park factors
const parks = {'-': {'League': 'AL', 'AVG': {'-': 1.0, 'L': 1.0, 'R': 1.0, 'S': 1.0}, 'Doubles': 1.0, 'Triples': 1.0, 'HR': {'-': 1.0, 'L': 1.0, 'R': 1.0, 'S': 1.0}, 'OPS': 1.0, 'ERA': 1.0, 'FIP': 1.0}, 'ARI': {'League': 'NL', 'AVG': {'-': 1.011, 'L': 1.03, 'R': 1.0, 'S': 1.023}, 'Doubles': 1.045, 'Triples': 1.335, 'HR': {'-': 0.995, 'L': 1.005, 'R': 0.99, 'S': 1.001}, 'OPS': 1.025, 'ERA': 1.025, 'FIP': 0.998}, 'ATL': {'League': 'NL', 'AVG': {'-': 1.008, 'L': 1.005, 'R': 1.01, 'S': 1.006}, 'Doubles': 1.025, 'Triples': 0.925, 'HR': {'-': 0.964, 'L': 0.99, 'R': 0.95, 'S': 0.98}, 'OPS': 1.002, 'ERA': 1.002, 'FIP': 0.984}, 'BAL': {'League': 'AL', 'AVG': {'-': 1.007, 'L': 1.02, 'R': 1.0, 'S': 1.015}, 'Doubles': 0.99, 'Triples': 0.915, 'HR': {'-': 1.098, 'L': 1.065, 'R': 1.115, 'S': 1.078}, 'OPS': 1.032, 'ERA': 1.032, 'FIP': 1.042}, 'BOS': {'League': 'AL', 'AVG': {'-': 1.024, 'L': 1.03, 'R': 1.01, 'S': 1.025}, 'Doubles': 1.12, 'Triples': 1.025, 'HR': {'-': 0.947, 'L': 0.905, 'R': 0.97, 'S': 0.921}, 'OPS': 1.032, 'ERA': 1.032, 'FIP': 0.977}, 'CHC': {'League': 'NL', 'AVG': {'-': 1.011, 'L': 1.02, 'R': 1.005, 'S': 1.016}, 'Doubles': 1.01, 'Triples': 1.175, 'HR': {'-': 0.992, 'L': 0.93, 'R': 1.025, 'S': 0.954}, 'OPS': 1.017, 'ERA': 1.017, 'FIP': 0.997}, 'CIN': {'League': 'NL', 'AVG': {'-': 0.993, 'L': 0.99, 'R': 0.995, 'S': 0.991}, 'Doubles': 1.025, 'Triples': 0.97, 'HR': {'-': 0.59, 'L': 1.09, 'R': 1.09, 'S': 1.09}, 'OPS': 0.885, 'ERA': 0.885, 'FIP': 0.822}, 'CLE': {'League': 'AL', 'AVG': {'-': 0.999, 'L': 1.015, 'R': 0.99, 'S': 1.009}, 'Doubles': 1.0, 'Triples': 0.865, 'HR': {'-': 1.006, 'L': 1.045, 'R': 0.985, 'S': 1.03}, 'OPS': 0.997, 'ERA': 0.997, 'FIP': 1.003}, 'COL': {'League': 'NL', 'AVG': {'-': 1.09, 'L': 1.1, 'R': 1.085, 'S': 1.096}, 'Doubles': 1.135, 'Triples': 1.47, 'HR': {'-': 1.109, 'L': 1.115, 'R': 1.105, 'S': 1.113}, 'OPS': 1.174, 'ERA': 1.174, 'FIP': 1.047}, 'CWS': {'League': 'AL', 'AVG': {'-': 0.982, 'L': 0.965, 'R': 0.99, 'S': 0.971}, 'Doubles': 0.95, 'Triples': 0.875, 'HR': {'-': 1.063, 'L': 0.615, 'R': 1.035, 'S': 0.72}, 'OPS': 0.983, 'ERA': 0.983, 'FIP': 1.027}, 'DET': {'League': 'AL', 'AVG': {'-': 1.021, 'L': 0.995, 'R': 1.035, 'S': 1.005}, 'Doubles': 1.005, 'Triples': 0.725, 'HR': {'-': 1.006, 'L': 0.96, 'R': 1.03, 'S': 0.978}, 'OPS': 1.024, 'ERA': 1.024, 'FIP': 1.002}, 'HOU': {'League': 'AL', 'AVG': {'-': 0.988, 'L': 0.985, 'R': 0.99, 'S': 0.986}, 'Doubles': 0.945, 'Triples': 0.935, 'HR': {'-': 1.053, 'L': 1.03, 'R': 1.065, 'S': 1.039}, 'OPS': 0.99, 'ERA': 0.99, 'FIP': 1.023}, 'KC': {'League': 'AL', 'AVG': {'-': 1.009, 'L': 1.035, 'R': 0.995, 'S': 1.025}, 'Doubles': 1.065, 'Triples': 1.12, 'HR': {'-': 0.904, 'L': 0.92, 'R': 0.895, 'S': 0.914}, 'OPS': 0.997, 'ERA': 0.997, 'FIP': 0.958}, 'LAA': {'League': 'AL', 'AVG': {'-': 0.982, 'L': 0.985, 'R': 0.98, 'S': 0.984}, 'Doubles': 0.98, 'Triples': 0.855, 'HR': {'-': 1.031, 'L': 1.06, 'R': 1.015, 'S': 1.049}, 'OPS': 0.979, 'ERA': 0.979, 'FIP': 1.013}, 'LAD': {'League': 'NL', 'AVG': {'-': 0.984, 'L': 0.99, 'R': 0.98, 'S': 0.988}, 'Doubles': 1.0, 'Triples': 0.79, 'HR': {'-': 1.044, 'L': 1.06, 'R': 1.035, 'S': 1.054}, 'OPS': 0.985, 'ERA': 0.985, 'FIP': 1.019}, 'MIA': {'League': 'NL', 'AVG': {'-': 0.978, 'L': 0.945, 'R': 0.995, 'S': 0.958}, 'Doubles': 0.935, 'Triples': 1.07, 'HR': {'-': 0.882, 'L': 0.905, 'R': 0.87, 'S': 0.896}, 'OPS': 0.933, 'ERA': 0.933, 'FIP': 0.949}, 'MIL': {'League': 'NL', 'AVG': {'-': 0.987, 'L': 0.99, 'R': 0.985, 'S': 0.989}, 'Doubles': 1.0, 'Triples': 0.945, 'HR': {'-': 1.039, 'L': 1.045, 'R': 1.035, 'S': 1.043}, 'OPS': 0.991, 'ERA': 0.991, 'FIP': 1.017}, 'MIN': {'League': 'AL', 'AVG': {'-': 1.015, 'L': 1.015, 'R': 1.015, 'S': 1.015}, 'Doubles': 1.075, 'Triples': 1.025, 'HR': {'-': 0.978, 'L': 0.975, 'R': 0.98, 'S': 0.976}, 'OPS': 1.024, 'ERA': 1.024, 'FIP': 0.99}, 'NYM': {'League': 'NL', 'AVG': {'-': 0.947, 'L': 0.96, 'R': 0.94, 'S': 0.955}, 'Doubles': 0.925, 'Triples': 0.98, 'HR': {'-': 0.968, 'L': 0.945, 'R': 0.98, 'S': 0.954}, 'OPS': 0.912, 'ERA': 0.912, 'FIP': 0.986}, 'NYY': {'League': 'AL', 'AVG': {'-': 0.995, 'L': 0.995, 'R': 0.995, 'S': 0.995}, 'Doubles': 0.93, 'Triples': 0.97, 'HR': {'-': 1.046, 'L': 1.085, 'R': 1.025, 'S': 1.07}, 'OPS': 0.996, 'ERA': 0.996, 'FIP': 1.02}, 'OAK': {'League': 'AL', 'AVG': {'-': 0.985, 'L': 0.965, 'R': 0.995, 'S': 0.973}, 'Doubles': 1.05, 'Triples': 1.05, 'HR': {'-': 0.942, 'L': 0.925, 'R': 0.95, 'S': 0.931}, 'OPS': 0.971, 'ERA': 0.971, 'FIP': 0.975}, 'PHI': {'League': 'NL', 'AVG': {'-': 0.997, 'L': 1.0, 'R': 0.995, 'S': 0.999}, 'Doubles': 1.0, 'Triples': 1.0, 'HR': {'-': 1.125, 'L': 1.105, 'R': 1.135, 'S': 1.113}, 'OPS': 1.028, 'ERA': 1.028, 'FIP': 1.054}, 'PIT': {'League': 'NL', 'AVG': {'-': 0.997, 'L': 1.005, 'R': 0.993, 'S': 1.002}, 'Doubles': 1.065, 'Triples': 0.92, 'HR': {'-': 0.925, 'L': 0.98, 'R': 0.895, 'S': 0.959}, 'OPS': 0.982, 'ERA': 0.982, 'FIP': 0.967}, 'SD': {'League': 'NL', 'AVG': {'-': 0.975, 'L': 0.985, 'R': 0.97, 'S': 0.981}, 'Doubles': 0.975, 'Triples': 0.95, 'HR': {'-': 0.938, 'L': 0.905, 'R': 0.955, 'S': 0.918}, 'OPS': 0.946, 'ERA': 0.946, 'FIP': 0.973}, 'SEA': {'League': 'AL', 'AVG': {'-': 0.973, 'L': 0.97, 'R': 0.975, 'S': 0.971}, 'Doubles': 0.925, 'Triples': 0.93, 'HR': {'-': 0.981, 'L': 0.955, 'R': 0.995, 'S': 0.965}, 'OPS': 0.949, 'ERA': 0.949, 'FIP': 0.992}, 'SF': {'League': 'NL', 'AVG': {'-': 0.98, 'L': 0.97, 'R': 0.985, 'S': 0.974}, 'Doubles': 0.985, 'Triples': 1.1, 'HR': {'-': 0.844, 'L': 0.79, 'R': 0.87, 'S': 0.81}, 'OPS': 0.932, 'ERA': 0.932, 'FIP': 0.932}, 'STL': {'League': 'NL', 'AVG': {'-': 0.99, 'L': 0.99, 'R': 0.99, 'S': 0.99}, 'Doubles': 0.997, 'Triples': 0.975, 'HR': {'-': 0.932, 'L': 0.98, 'R': 0.905, 'S': 0.961}, 'OPS': 0.968, 'ERA': 0.968, 'FIP': 0.97}, 'TB': {'League': 'AL', 'AVG': {'-': 0.98, 'L': 0.97, 'R': 0.985, 'S': 0.974}, 'Doubles': 0.965, 'Triples': 1.105, 'HR': {'-': 0.96, 'L': 0.94, 'R': 0.97, 'S': 0.948}, 'OPS': 0.96, 'ERA': 0.96, 'FIP': 0.982}, 'TEX': {'League': 'AL', 'AVG': {'-': 1.002, 'L': 0.999, 'R': 1.003, 'S': 1.0}, 'Doubles': 1.027, 'Triples': 1.032, 'HR': {'-': 0.986, 'L': 0.992, 'R': 0.983, 'S': 0.99}, 'OPS': 1.002, 'ERA': 1.002, 'FIP': 0.994}, 'TOR': {'League': 'AL', 'AVG': {'-': 0.993, 'L': 0.99, 'R': 0.995, 'S': 0.991}, 'Doubles': 1.015, 'Triples': 0.965, 'HR': {'-': 1.062, 'L': 1.055, 'R': 1.065, 'S': 1.058}, 'OPS': 1.008, 'ERA': 1.008, 'FIP': 1.027}, 'WSH': {'League': 'NL', 'AVG': {'-': 1.041, 'L': 1.055, 'R': 1.035, 'S': 1.05}, 'Doubles': 1.075, 'Triples': 0.905, 'HR': {'-': 1.07, 'L': 1.06, 'R': 1.075, 'S': 1.064}, 'OPS': 1.079, 'ERA': 1.079, 'FIP': 1.03}};
// League factors (pitchers)
const leagues = {'AL': {'BABIP': 1.0, 'HR': 1.0, 'SO': 1.0, 'BB': 1.0, 'ERA': 1.0}, 'NL': {'BABIP': 1.0, 'HR': 0.925, 'SO': 1.025, 'BB': 1.015, 'ERA': 0.955}};

export class Batter {
    // Properties
    id: string;  // Batter's unique ID
    name: string;  // Batter's name
    team: string;  // Batter's team
    pos: string;  // Player's position
    bats: string;  // L, R or S
    contact: number;  // Contact rating
    gap: number;  // Gap rating
    power: number;  // Power rating
    eye: number;  // Eye/discipline rating
    avoid: number;  // Avoid K's rating
    speed: number;  // Speed rating
    stealing: number;  // Steal rating
    defense: number;  // Defense rating

    // Construst with just name
    constructor(name: string, team: string, pos: string, bats: string) {
        this.id = "batter-" + name;
        this.name = name;
        this.team = team;
        this.pos = pos;
        this.bats = bats;
    }
}

export class BatterStats {
    gp: string;
    pa: string;
    ab: string;
    h: string;
    h2: string;
    h3: string;
    hr: string;
    bb: string;
    so: string;
    avg: string;
    obp: string;
    slg: string;
    iso: string;
    ops: string;
    opsp: string;
    babip: string;
    war: string;
    sb: string;
    cs: string;

    constructor(batter: Batter) {
        // Calculate stats
        var mlo = [0.0009, 0.18, 0.18, 0.48, -1.2, 0.0006, 0.0009, 0.003];
        var blo = [0.16, 11, 0, 2, 260, 0.04, 0, 0.35];
        var mhi = [0.0006, 0.18, 0.3, 0.72, -0.9, 0.0003, 0.0018, 0.0018];
        var bhi = [0.19, 11, -12, -22, 230, 0.07, -0.09, 0.47];
        var mpos = [0, 0, 0.003, 0.009, 0.018, 0.015, 0.024, 0.009, 0.015, 0.009];
        var bpos = [0.5, -0.9, 1.1, -1.75, -1.5, -1.05, -1.8, -1.3, -1.15, -1.25];
        // Park factors
        var park = parks[batter.team];
        // Non-adjusted rates
        var rates = [batter.contact, batter.gap, batter.power, batter.eye, batter.avoid, batter.speed, batter.speed, batter.stealing];
        var stats = [];
        var rate;
        for (var i = 0; i < rates.length; ++i) {
            rate = rates[i];
            if (rate < 100) {
                stats.push(rate * mlo[i] + blo[i]);
            } else {
                stats.push(rate * mhi[i] + bhi[i]);
            }
        }
        var gp = 150;
        var pa = 600;
        var mult = pa / (550 + stats[3]);
        var bb = stats[3] * mult;
        var ab = pa - bb;
        var avg = stats[0] * park["AVG"][batter.bats];
        var h = avg * ab;
        var h2 = stats[1] * (1 - stats[5]) * park["Doubles"] * mult;
        var h3 = stats[1] * (stats[5]) * park["Triples"] * mult;
        var hr = Math.max(stats[2], 1) * park["HR"][batter.bats] * mult;
        var so = stats[4] * mult;
        var obp = (h + bb) / pa;
        var slg = (h + h2 + 2 * h3 + 3 * hr) / ab;
        var iso = slg - avg;
        var ops = obp + slg;
        var opsp = (obp / lg_obp + slg / lg_slg - 1) * 100 / park["OPS"];
        var babip = (h - hr) / (ab - hr - so);
        var fb = h - h2 - h3 - hr + bb
        var sba = stats[6] * fb;
        var sb = stats[7] * sba;
        var cs = sba - sb;
        var bat = (opsp / 100 - 1) * rppa * pa;
        var bsr = run_sb * sb + run_cs * cs + run_fb * fb;
        var pos = positions[batter.pos]
        var dwar = batter.defense * mpos[pos] + bpos[pos];
        var war = dwar + (bat + bsr + pa * run_pa) / rpw;

        this.gp = gp.toFixed(0);
        this.pa = pa.toFixed(0);String(pa);
        this.ab = ab.toFixed(0);
        this.h = h.toFixed(0);
        this.h2 = h2.toFixed(0);
        this.h3 = h3.toFixed(0);
        this.hr = hr.toFixed(0);
        this.bb = bb.toFixed(0);
        this.so = so.toFixed(0);
        this.avg = "." + String(Math.round(avg * 1000));
        this.obp = "." + String(Math.round(obp * 1000));
        this.slg = "." + String(Math.round(slg * 1000));
        if (iso < 0.1) {
            this.iso = ".0" + String(Math.round(iso * 1000));
        } else {
            this.iso = "." + String(Math.round(iso * 1000));
        }
        if (ops < 1) {
            this.ops = "." + String(Math.round(ops * 1000));
        } else {
            this.ops = ops.toFixed(3);
        }
        this.opsp = opsp.toFixed(0);
        this.babip = "." + String(Math.round(babip * 1000));
        this.war = war.toFixed(1);
        this.sb = sb.toFixed(0);
        this.cs = cs.toFixed(0);
    }
}

export class Pitcher {
    // Properties
    id: string;
    name: string;
    team: string;
    pos: string;
    gbfb: string;
    stuff: number;
    movement: number;
    control: number;
    stamina: number;
    hold: number;

    // Construst with info
    constructor(name: string, team: string, pos: string) {
        this.id = "pitcher-" + name;
        this.name = name;
        this.team = team;
        this.pos = pos;
    }
}

export class PitcherStats {
    gp: string;
    gs: string;
    ip: string;
    ha: string;
    hr: string;
    er: string;
    bb: string;
    k: string;
    era: string;
    avg: string;
    babip: string;
    whip: string;
    hr9: string;
    bb9: string;
    k9: string;
    kbb: string;
    erap: string;
    fip: string;
    war: string;

    constructor(pitcher: Pitcher) {
        // Ballpark
        var park = parks[pitcher.team];
        var league = leagues[park["League"]];
        // Non-adjusted stats: BABIP, SO/550, HR/550, BB/550, AB/G, wSB/550
        var stats = [];
        // Ground/Fly -> BABIP
        if (pitcher.gbfb == "EX GB") {
            stats.push(0.28);
        } else if (pitcher.gbfb == "GB") {
            stats.push(0.285);
        } else if (pitcher.gbfb == "FB") {
            stats.push(0.295);
        } else if (pitcher.gbfb == "EX FB") {
            stats.push(0.3);
        } else {
            stats.push(0.29);
        }
        // Stuff -> SO/550
        stats.push(0.9 * pitcher.stuff + 30);
        // Movement -> HR/550
        stats.push(Math.max(-0.12 * pitcher.movement + 32, 2));
        // Control -> BB/550
        if (pitcher.control < 100) {
            stats.push(-0.84 * pitcher.control + 140);
        } else {
            stats.push(Math.max(-0.42 * pitcher.control + 98, 7));
        }
        // Stamina -> AB/G
        if (pitcher.pos == "SP") {
            if (pitcher.stamina < 100) {
                stats.push(0.06 * pitcher.stamina + 15);
            } else {
                stats.push(0.03 * pitcher.stamina + 18);
            }
        } else {
            if (pitcher.stamina < 100) {
                stats.push(0.024 * pitcher.stamina + 3.6);
            } else {
                stats.push(0.03 * pitcher.stamina + 3);
            }
        }
        // Hold -> wSB/550
        if (pitcher.hold < 100) {
            stats.push(-0.012 * pitcher.hold + 1.2);
        } else {
            stats.push(-0.006 * pitcher.hold + 0.6);
        }

        // Calculate some shit
        var gp;
        var gs;
        if (pitcher.pos == "SP") {
            gp = 32;
            gs = 32;
        } else {
            gp = 64;
            gs = 0;
        }

        var ab = gp * stats[4];
        // AB multiplier
        var mult = ab / 550;
        var babip = stats[0] * league["BABIP"];
        var so = stats[1] * mult * league["SO"];
        var hr = stats[2] * mult * league["HR"] * park["HR"]["-"];
        var bb = stats[3] * mult * league["BB"];
        var ha = (babip * (550 - stats[1] - stats[2]) + stats[2]) * park["AVG"]["-"] * mult;
        var ip = (ab - ha) / 3;
        var avg = ha / ab;
        var rspct = rs_scale * avg;
        var ra = rspct * (ha - hr + bb) + hr + stats[5];
        var er = ra * er_pct * league["ERA"];
        var era = er / ip * 9;
        var davg = ha / ab * avg_scale * 1000;
        var dbabip = (ha - hr) / (ab - hr - so) * avg_scale * 1000;
        var whip = (ha + bb) / ip;
        var hr9 = hr / ip * 9;
        var bb9 = bb / ip * 9;
        var k9 = so / ip * 9;
        var kbb = so / bb;
        var erap = lg_era / (era) * 100 * league["ERA"] * park["ERA"]
        var fip = (13 * hr + 3 * bb - 2 * so) / ip + c_fip;
        var pfipr9 = (fip / park["FIP"] + (lg_ra9 - lg_era));
        var ippg : number = ip / gp;
        var drpw = ((((18 - ippg) * (lg_ra9 * league["ERA"]) + (ippg * pfipr9)) / 18) + 2) * 1.5;
        var repl = 0.03 * (1 - gs / gp) + 0.12 * (gs / gp);
        var war = ((lg_ra9 * league["ERA"] - pfipr9) / drpw + repl) * ip / 9 + warip * ip;

        var imod = ip % 1 / 0.3;
        if (imod > 2) {
            imod = 0;
        }

        this.gp = gp.toFixed(0);
        this.gs = gs.toFixed(0);
        this.ip = ip.toFixed(0) + "." + imod.toFixed(0);
        this.ha = ha.toFixed(0);
        this.hr = hr.toFixed(0);
        this.er = er.toFixed(0);
        this.bb = bb.toFixed(0);
        this.k = so.toFixed(0);
        this.era = era.toFixed(2);
        this.avg = "." + davg.toFixed(0);
        this.babip = "." + dbabip.toFixed(0);
        this.whip = whip.toFixed(2);
        this.hr9 = hr9.toFixed(1);
        this.bb9 = bb9.toFixed(1);
        this.k9 = k9.toFixed(1);
        this.kbb = kbb.toFixed(1);
        this.erap = erap.toFixed(0);
        this.fip = fip.toFixed(2);
        this.war = war.toFixed(1);
    }
}