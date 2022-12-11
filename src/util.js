const display = x => x.toString();
const displayInt = x => Math.round(x).toString();
const displayDecimal = x => x.toFixed(1);
const displayDecimals = x => x.toFixed(2);
const displayRate = x => {
  if (x < 1) return x.toFixed(3).slice(1);
  return x.toFixed(3);
};
const displayIP = x => {
  let int = Math.floor(x);
  let outs = Math.floor((x - int) * 10 / 3);
  return int + '.' + outs;
}

export const fields = {
  batting: [
    { key: 'name', title: 'Name', sort: 1, display },
    { key: 'team', title: 'Team', sort: 1, display },
    { key: 'position', title: 'Pos', sort: 1, display },
    { key: 'bats', title: 'Bats', sort: 1, display },
    { key: 'gp', title: 'G', sort: -1, display: displayInt },
    { key: 'pa', title: 'PA', sort: -1, display: displayInt },
    { key: 'ab', title: 'AB', sort: -1, display: displayInt },
    { key: 'h', title: 'H', sort: -1, display: displayInt },
    { key: 'h2', title: '2B', sort: -1, display: displayInt },
    { key: 'h3', title: '3B', sort: -1, display: displayInt },
    { key: 'hr', title: 'HR', sort: -1, display: displayInt },
    { key: 'bb', title: 'BB', sort: -1, display: displayInt },
    { key: 'so', title: 'SO', sort: 1, display: displayInt },
    { key: 'avg', title: 'AVG', sort: -1, display: displayRate },
    { key: 'obp', title: 'OBP', sort: -1, display: displayRate },
    { key: 'slg', title: 'SLG', sort: -1, display: displayRate },
    { key: 'iso', title: 'ISO', sort: -1, display: displayRate },
    { key: 'ops', title: 'OPS', sort: -1, display: displayRate },
    { key: 'opsp', title: 'OPS+', sort: -1, display: displayInt },
    { key: 'babip', title: 'BABIP', sort: -1, display: displayRate },
    { key: 'war', title: 'WAR', sort: -1, display: displayDecimal },
    { key: 'sb', title: 'SB', sort: -1, display: displayInt },
    { key: 'cs', title: 'CS', sort: -1, display: displayInt },
  ],
  pitching: [
    { key: 'name', title: 'Name', sort: 1, display },
    { key: 'team', title: 'Team', sort: 1, display },
    { key: 'position', title: 'Pos', sort: 1, display },
    { key: 'gp', title: 'G', sort: -1, display: displayInt },
    { key: 'gs', title: 'GS', sort: -1, display: displayInt },
    { key: 'ip', title: 'IP', sort: -1, display: displayIP },
    { key: 'h', title: 'HA', sort: 1, display: displayInt },
    { key: 'hr', title: 'HR', sort: 1, display: displayInt },
    { key: 'r', title: 'R', sort: 1, display: displayInt },
    { key: 'er', title: 'ER', sort: 1, display: displayInt },
    { key: 'bb', title: 'BB', sort: 1, display: displayInt },
    { key: 'so', title: 'K', sort: -1, display: displayInt },
    { key: 'era', title: 'ERA', sort: 1, display: displayDecimals },
    { key: 'avg', title: 'AVG', sort: 1, display: displayRate },
    { key: 'babip', title: 'BABIP', sort: 1, display: displayRate },
    { key: 'whip', title: 'WHIP', sort: 1, display: displayDecimals },
    { key: 'hr9', title: 'HR/9', sort: 1, display: displayDecimal },
    { key: 'bb9', title: 'BB/9', sort: 1, display: displayDecimal },
    { key: 'k9', title: 'K/9', sort: -1, display: displayDecimal },
    { key: 'kbb', title: 'K/BB', sort: -1, display: displayDecimal },
    { key: 'erap', title: 'ERA+', sort: -1, display: displayInt },
    { key: 'fip', title: 'FIP', sort: 1, display: displayDecimals },
    { key: 'war', title: 'WAR', sort: -1, display: displayDecimal },
  ]
}

// Convert to 1-250 scale
export function convertRating(scale, rating, nullable=false, stuff=false) {
  if (!Number(rating) && rating != '- ') {
    if (nullable) return rating;
    throw 'Invalid input! Try the "help" button for tips.';
  }
  if (scale == '20 to 80' && rating % 5 != 0 && rating != '- ') {
    throw 'Invalid input! 20-80 ratings must be a multiple of 5.';
  }
  let split = scale.split(' to ');
  let min = parseInt(split[0]);
  let max = parseInt(split[1]);
  if (rating == '- ') {
    rating = min;
  }
  let converted = (rating - min) * 200 / (max - min);
  if (converted < 0 || (converted > 250 && !stuff) || converted > 350) {
    throw 'Invalid input! Ratings must be within range of selected scale.';
  }
  return Math.round(converted);
}

// Convert from 1-250 scale
export function revertRating(scale, rating, roundUp=false) {
  let split = scale.split(' to ');
  let min = parseInt(split[0]);
  let max = parseInt(split[1]);
  let reverted = (max - min) / 200 * rating + min;
  if (min == 20 && max == 80) {
    if (roundUp) {
      return Math.floor(reverted / 5 + 1) * 5;
    }
    return Math.round(reverted / 5) * 5;
  }
  if (roundUp) {
    return Math.floor(reverted + 1);
  }
  return Math.round(reverted);
}