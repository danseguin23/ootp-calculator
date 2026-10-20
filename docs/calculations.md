# Fórmulas, escalas e apresentação

Fonte autoritativa: [data-classes.js](../src/data-classes.js) e [util.js](../src/util.js). Esta referência descreve a implementação existente, não uma validação científica. As tabelas e trechos abaixo são transcrições do código ativo; alterações futuras devem atualizar este documento junto com exemplos de regressão. Constantes antigas marcadas deprecated não devem substituir os lookups ativos.

## Escalas e limites

RatingsScale oferece 1 to 5, 2 to 8, 1 to 10, 1 to 20, 20 to 80 e 1 to 100. Padrão 20 to 80, compartilhado por localStorage.

Conversão interna: `round((rating - mínimo) × 200 / (máximo - mínimo))`. Apesar do nome “1–250” nos comentários, o mínimo nominal converte para **0** e o máximo nominal para **200**. O teto aceito é 250, ou 350 para Stuff; logo a implementação permite entradas acima do máximo nominal, conforme a escala. Negativos normalizados e valores acima do teto são rejeitados. Em 20–80, números precisam ser múltiplos de 5, salvo conversões internas que passam ignore2080. Zero/NaN não passam na entrada comum; nullable retorna entradas falsy antes da conversão. O token especial `- ` retorna 100, mas a importação opcional converte `-`/branco para null.

Exemplos: 20–80: 20 → 0, 50 → 100, 60 → 133, 80 → 200. Na volta: `(máximo-mínimo)/200 × interno + mínimo`; arredondamento comum é inteiro ou múltiplo de 5. Para nota defensiva, roundUp usa `floor(valor/5+1)×5` em 20–80, inclusive subindo uma nota já exata; outras escalas usam `floor(valor+1)`. A tela defensiva aplica piso no mínimo da escala.

## Interpolação e ajuste à liga

Conversão 250→600 interpola segmentos (0,100), (100,400), (200,500), (250,600); fora deles devolve a entrada. Os lookups interpolam linearmente entre pontos; fora dos intervalos devolvem a última taxa, inclusive abaixo do mínimo (limitação conhecida).

Cada taxa é calibrada à média de liga: sejam `r` a taxa de lookup do jogador, `l` a média observada e `b` a taxa de lookup do rating médio da liga; ajuste = `(r*l*(1-b))/(r*l-b*r-b*l+b)`. Nas taxas por 550 AB, r/l/b são divididos por 550 antes do ajuste. BABIP de pitcher usa rating 1–250 diretamente; demais lookups usam a conversão 600.

As médias por rating não são todas 50; os valores exatos e os totais de referência estão abaixo. Overrides opcionais substituem estimadores antes do lookup, não os resultados estatísticos.

## Constantes e tabelas ativas

Comentários originais em inglês foram mantidos neste extrato técnico para correspondência direta com a implementação.

```javascript
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
  // Coeficientes ativos em ratings normalizados
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
    [0, 60],
    [150, 35],
    [300, 20],
    [400, 12],
    [500, 6],
    [600, 2],
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
  // Coeficientes ativos em ratings normalizados
  gssp: { slope: [0.01, 0], intercept: [0, 1]},  // Stamina -> GS / (G + GS)
  gsrp: { slope: [0, 0.005], intercept: [0, -0.5]},  // Stamina -> GS / (G + GS)
  absp: { slope: [0.0275, 0.0216], intercept: [7.32, 7.91] },  // Stamina -> AB / (G + GS)
  abrp: { slope: [0.0339, 0.0339], intercept: [3.27, 3.27] },  // Stamina -> AB / (G + GS)
  wsb: { slope: [-0.012, -0.006], intercept: [1.2, 0.6] },  // Hold -> wSB
}

// League average 20-80 ratings aren't always 50
const AVERAGE_20_80_PITCHING = {
  stuff: 48,
  babip: 50,
  hra: 48,
  control: 50
}

const AVERAGE_20_80_BATTING = {
  avoidKs: 51,
  babip: 52,
  gap: 51,
  power: 51,
  eye: 49,
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
  atBats: 163664,
  hits: 40138,
  doubles: 7745,
  triples: 628,
  homeRuns: 5650,
  walks: 14823,
  hitByPitches: 1928,
  strikeouts: 40645
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
const run_cs = -0.41;
const run_ob = -0.0072;
const war_pa = 0.0034;
// Pitchers
const rs_factor = 1.235;  // Multiply by AVG for RS% (maybe use wOBA or OBP?)
const add_outs = 10;  // Add to outs for innings calculation
const lg_era = 4.15;
const lg_ra9 = 4.45;
const c_fip = 3.13;
const war_ip = 0.004;  // Add to WAR (multiplied by innings)

```

## Interpretação das projeções

Batter estima BABIP de Contact/Avoid K’s e agressividade de Speed/Stealing quando overrides estão ausentes. Calcula taxas-base de 550 AB, aplica parque, estima hits, extra bases, roubos, AVG/OBP/SLG/ISO/OPS/OPS+ e valor ofensivo/defensivo. WAR inclui ajuste posicional, ZR opcional, baserunning e reposição. Por fim redimensiona contagens para 150 jogos/600 PA. Defense ausente zera ZR, mas mantém ajuste posicional. HBP é estimado de totais de liga, sem entrada própria.

Pitcher estima BABIP/HRA de Movement e Ground/Fly (EX GB=0 a EX FB=4), salvo overrides. Stuff/Control determinam K/BB; Stamina controla volume e proporção de starts, posição diferencia SP de RP/CL, Hold contribui para corridas. As contagens são dimensionadas pelo volume calculado; ERA+ e WAR incorporam parque. WAR é descrito no código como estilo FanGraphs, sem equivalência externa verificada.

## Algoritmo de Batter

Trecho ativo de `calculateStats`, preservado como referência exata dos passos e coeficientes. Os ratings já estão normalizados.

```javascript
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
    let xbabip = this.babipInput != null
      ? this.babipInput
      : Math.max((this.contact * INTERMEDIATE_ESTIMATORS.babip[0] + this.avoidKs * INTERMEDIATE_ESTIMATORS.babip[1] + INTERMEDIATE_ESTIMATORS.babip[2]), 0);
    let xagg = this.stealTendency != null
      ? this.stealTendency
      : Math.max((this.speed * INTERMEDIATE_ESTIMATORS.aggressiveness[0] + this.stealing * INTERMEDIATE_ESTIMATORS.aggressiveness[1] + INTERMEDIATE_ESTIMATORS.aggressiveness[2]), 0);
    // Indexes (1 for ratings > 100, 0 for ratings <= 100)
    let h3Index = +(this.speed > 100);
    let sbIndex = +(this.stealing > 100);
    let sbaIndex = +(xagg > 100);
    const hasDefense = this.defense !== null && this.defense !== undefined;
    let zrIndex = hasDefense ? +(this.defense > 100) : 0;
    // Adjusted rates before park factor adjustment
    let babipAdj = getAdjustedRate(xbabip, AVERAGE_20_80_BATTING.babip, LEAGUE_AVERAGES.babip, LOOKUP_BATTING.babip);
    let soAdj = getAdjustedRate(this.avoidKs, AVERAGE_20_80_BATTING.avoidKs, LEAGUE_AVERAGES.so, LOOKUP_BATTING.so, true);
    let gapAdj = getAdjustedRate(this.gap, AVERAGE_20_80_BATTING.gap, LEAGUE_AVERAGES.gap, LOOKUP_BATTING.gap);
    let hrAdj = getAdjustedRate(this.power, AVERAGE_20_80_BATTING.power, LEAGUE_AVERAGES.hr, LOOKUP_BATTING.hr, true);
    let bbAdj = getAdjustedRate(this.eye, AVERAGE_20_80_BATTING.eye, LEAGUE_AVERAGES.bb, LOOKUP_BATTING.bb, true);
    // Adjusted rates
    // Middle men / helpers / whatever
    let h3Pct = (this.speed * FORMULA_BATTING.h3.slope[h3Index] + FORMULA_BATTING.h3.intercept[h3Index]);
    let sbaPct = Math.max((xagg * FORMULA_BATTING.sba.slope[sbaIndex] + FORMULA_BATTING.sba.intercept[sbaIndex]), 0);
    let sbPct = Math.max((this.stealing * FORMULA_BATTING.sb.slope[sbIndex] + FORMULA_BATTING.sb.intercept[sbIndex]), 0);
    let babip = babipAdj;
    let hr = hrAdj * 550 * parkHr;
    let bb = bbAdj * 550;
    let so = soAdj * 550;
    let zr = hasDefense
      ? (this.defense * FORMULA_BATTING.zr.slope[zrIndex] + FORMULA_BATTING.zr.intercept[zrIndex])
      : 0;

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

```
## Algoritmo de Pitcher

Trecho ativo de `calculateStats`, preservado como referência exata dos passos e coeficientes. Os ratings já estão normalizados.

```javascript
  calculateStats(teams) {
    // Park
    let park = teams.find(p => p.abbr == this.team);
    // Estimated grades
    let xbabip = this.babipInput != null
      ? this.babipInput
      : Math.max((this.movement * INTERMEDIATE_ESTIMATORS.pbabip[0] + LOOKUP_GROUND_FLY[this.groundFly] * INTERMEDIATE_ESTIMATORS.pbabip[1] + INTERMEDIATE_ESTIMATORS.pbabip[2]), 0);
    let xhra = this.hraInput != null
      ? this.hraInput
      : Math.max((this.movement * INTERMEDIATE_ESTIMATORS.hra[0] + LOOKUP_GROUND_FLY[this.groundFly] * INTERMEDIATE_ESTIMATORS.hra[1] + INTERMEDIATE_ESTIMATORS.hra[2]), 0);
    // Adjusted rates before park factor adjustment
    let babipAdj = getAdjustedRate(xbabip, AVERAGE_20_80_PITCHING.babip, LEAGUE_AVERAGES.babip, LOOKUP_PITCHING.babip, false, true);
    let hrAdj = getAdjustedRate(xhra, AVERAGE_20_80_PITCHING.hra, LEAGUE_AVERAGES.hr, LOOKUP_PITCHING.hr, true);
    let soAdj = getAdjustedRate(this.stuff, AVERAGE_20_80_PITCHING.stuff, LEAGUE_AVERAGES.so, LOOKUP_PITCHING.so, true);
    let bbAdj = getAdjustedRate(this.control, AVERAGE_20_80_PITCHING.control, LEAGUE_AVERAGES.bb, LOOKUP_PITCHING.bb, true);
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

```
## Algoritmo defensivo

Depois de conversão e validação dos grupos, os passos exatos são os seguintes. Altura é cm e só participa de 1B, limitada acima a 215. `ratings` segue C,1B,2B,3B,SS,LF,CF,RF. Cada WAR é `slope[i] × rating[i] + intercept[i]`. Campos não calculados têm rating zero e são ocultados como `-` na apresentação.

```javascript
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

```

## Implementação da interpolação

```javascript
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

function getAdjustedRate(rate1to250, leagueRate20to80, leagueAverage, lookup, per550=false, keepAs1to250=false) {
  let rate;
  let lookup50Grade;
  const leagueRate1to250 = convertRating('20 to 80', leagueRate20to80, false, false, true);
  if (keepAs1to250) {
    rate = rate1to250;
    lookup50Grade = getLookupValue(lookup, leagueRate1to250);
  } else {
    rate = convert250to600(rate1to250);
    lookup50Grade = getLookupValue(lookup, convert250to600(leagueRate1to250));
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

```

## Arredondamento e cores

Apenas apresentação arredonda contagens (`Math.round`), taxas (3 casas, removendo zero inicial abaixo de 1), WAR/HR9/BB9/K9/KBB (1 casa), ERA/FIP/WHIP (2 casas). IP usa `floor(IP)` e `floor((IP-floor(IP))*10/3)` como dígito de outs. CSV usa números brutos.

Fielder.getDisplay aplica cores por limiares internos 9,25,42,59,75,92,109,125,142,159,179,192, variando de vermelho a azul; cor não modifica cálculo. Valor zero é exibido como ausência, inclusive em WAR. Não há restrição de lateralidade aplicada.

O [exemplo defensivo](features/positions.md#exemplo-verificado) foi reproduzido no navegador. Exemplos adicionais de projeções e limites estão em [testes](testing.md). A precisão preditiva contra o jogo permanece não verificada.
