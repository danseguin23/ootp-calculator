import * as axios from 'axios';

export function getTeams() {
  return new Promise((resolve, reject) => {
    const url = '/teams.json';
    axios.get(url).then(response => {
      resolve(response.data);
    }).catch(err => {
      reject(err);
    });
  });
}