<template>
<!--<label for="input">{{label}}</label>
<br>-->
<div class="row-flex"><button class="button-help" type="button" @click="clickHelp()">Help</button></div>
<div id="help">
  <p>To import a batch of players, copy and paste tab-separated {{type}} ratings into the box below.</p>
  <ol>
    <li>In OOTP, find a list of players you want to import, and make sure you are on the "{{capitalized}} Ratings" view.</li>
    <li>Select "Report", then "Write report to disk". This will open the table in your browser.</li>
    <li>Select and copy the contents of the table.</li>
    <li>Paste in the box below, then submit.</li>
  </ol>
</div>
<textarea id="input" type="file" rows="15" v-model="input"></textarea>
</template>

<script>
import { Batter, Pitcher } from '../../data-classes';

const headers_batting = ['POS', '#', 'Name', 'Inf', 'Age', 'B', 'T', 'OVR', 'CON', 'GAP', 'POW', 'EYE', 'K\'s', 'CON vL', 'POW vL', 'CON vR', 'POW vR', 'BUN', 'BFH', 'SPE', 'STE', 'DEF', 'SctAcc'];
const headers_batting_potential = ['POS', '#', 'Name', 'Inf', 'Age', 'B', 'T', 'POT', 'CON P', 'GAP P', 'POW P', 'EYE P', 'K P', 'SPE', 'STE', 'RUN', 'DEF', 'SctAcc'];
const headers_pitching = ['POS', '#', 'Name', 'Inf', 'Age', 'B', 'T', 'OVR', 'STU', 'MOV', 'CON', 'STU vL', 'STU vR', 'VELO', 'STM', 'G/F', 'HLD', 'SctAcc'];
const headers_pitching_potential = ['POS', '#', 'Name', 'Inf', 'Age', 'B', 'T', 'POT', 'STU P', 'MOV P', 'CON P', 'VELO', 'STM', 'G/F', 'HLD', 'SctAcc'];

export default {
  name: 'InputBatch',
  props: {
    type: {
      type: String,  // 'batting' or 'pitching'
      required: true
    },
    scale: {
      type: String,
      required: true
    },
    teams: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      headers: [],
      headersPotential: [],
      players: [],
      input: '',
      showHelp: false,
      error: '',
      team: '-',
      model: null
    }
  },
  computed: {
    capitalized() {
      return this.type.substr(0, 1).toUpperCase() + this.type.substr(1);
    },
    label() {
      return `Select a team, then paste ${this.type} ratings below to import players.`;
    }
  },
  created() {
    if (this.type == 'batting') {
      this.headers = headers_batting;
      this.headersPotential = headers_batting_potential;
      this.model = Batter;
    } else if (this.type == 'pitching') {
      this.headers = headers_pitching;
      this.headersPotential = headers_pitching_potential;
      this.model = Pitcher;
    }
  },
  methods: {
    setTeam(team) {
      this.team = team;
    },

    submit() {
      this.players = [];
      let lines = this.input.trim().split('\n');
      // Remove leading tabs
      for (let i in lines) {
        let line = lines[i];
        lines[i] = line.trim();
      }
      if (lines[0] == '') {
        return { error: 'Input cannot be blank!' };
      }
      try {
        // Remove first line if irrelevant
        if (lines[0].indexOf('\t') < 0) {
          lines.shift();
        }
        if (lines.at(-1).indexOf('\t') < 0) {
          lines.pop();
        }
        this.$analytics.logEvent(this.$instance, `project-${this.type}-batch`);
      } catch (err) {
        return { error: 'Invalid input! Try the "help" button for tips.' };
      }
      // See if there's a header included, make sure it's valid
      let headers = lines.shift().replace(' ▾', '').split('\t');
      let compare;
      let potential;
      if (headers.length == this.headersPotential.length) {
        compare = this.headersPotential;
        potential = true;
      } else {
        compare = this.headers;
        potential = false;
      }
      if (lines[0].substr(0, 3) == 'POS') {
        let same = true;
        for (let i in headers) {
          if (headers[i].trim() != compare[i]) {
            same = false;
            break;
          }
        }
        if (!same) {
          return { error: `Invalid input! Make sure to copy from the "${this.capitalized} Ratings" view.` };
        }
      }
      try {
        this.mapPlayers(lines, potential);
        return { players: this.players };
      } catch (error) {
        if (error.indexOf('Error') >= 0) {
          error = 'Invalid input! Try the "help" button for tips.';
        }
        return { error };
      }
    },

    clear() {
      this.input = '';
    },

    mapPlayers(lines, potential) {
      for (let line of lines) {
        let player = new this.model(this.teams, this.scale, line, this.team, potential);
        this.players.push(player);
      }
    },

    clickHelp() {
      this.showHelp = !this.showHelp;
      let help = document.getElementById('help');
      if (this.showHelp) {
        help.style = 'max-height: 10rem;';
      } else {
        help.style = 'max-height: 0px; opacity: 0;';
      }
    },

    // Sets a brief timeout then displays an error
    raiseError(message='') {
      this.error = '';
      if (!message) {
        message = 'Invalid input! Try the "help" button for tips.'
      }
      setTimeout(() => {
        this.error = message;
      }, 100);
    }
  }
}
</script>

<style>
textarea {
  font-family: var(--font-mono);
  font-size: 8px !important;
}

#help {
  text-align: left;
  max-width: 42rem;
  margin: auto;
  transition: all 0.5s;
  transition-property: max-height, opacity;
  overflow: hidden;
  max-height: 0px;
}
</style>

<style scoped>
button {
  margin: 12px;
}

label {
  margin: 0px;
}

.form-select {
  max-width: 15rem;
  margin: auto;
  margin-bottom: 12px;
}
</style>