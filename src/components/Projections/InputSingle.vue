<template>
<div>
  <table v-if="wide" class="table-projections table-input">
    <thead>
      <tr>
        <th>Name</th>
        <th>Team</th>
        <th>Position</th>
        <th v-if="type == 'batting'">Bats</th>
        <th v-if="type == 'pitching'">Ground/Fly</th>
        <th v-for="field of fields" :key="field.key">{{field.title}}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <input id="name" type="text" autocomplete="off" v-model="player.name">
        </td>
        <td>
          <select id="team" v-model="team">
            <option v-for="team in teams" :key="team.abbr" :value="team.abbr">{{team.abbr}}</option>
          </select>
        </td>
        <td>
          <select v-model="player.position">
            <option v-for="position in positions" :key="position" :value="position">{{position}}</option>
          </select>
        </td>
        <td v-if="type == 'batting'">
          <select v-model="player.bats">
            <option value="-">-</option>
            <option value="L">L</option>
            <option value="R">R</option>
            <option value="S">S</option>
          </select>
        </td>
        <td v-if="type == 'pitching'">
          <select v-model="player.groundFly">
            <option value="EX GB">EX GB</option>
            <option value="GB">GB</option>
            <option value="NEU">NEU</option>
            <option value="FB">FB</option>
            <option value="EX FB">EX FB</option>
          </select>
        </td>
        <td v-for="field in fields" :key="field.key">
          <input type="number" v-model="player[field.key]">
        </td>
      </tr>
    </tbody>
  </table>
  <table class="table-projections table-input table-vertical" v-if="!wide">
    <colgroup>
      <col class="bordered">
      <col>
    </colgroup>
    <tr>
      <th>Name</th>
      <input id="name" type="text" autocomplete="off" v-model="player.name">
    </tr>
    <tr>
      <th>Team</th>
      <td>
        <select v-model="team">
          <option v-for="team in teams" :key="team.abbr" :value="team.abbr">{{team.abbr}}</option>
        </select>
      </td>
    </tr>
    <tr>
      <th>Position</th>
      <td>
        <select v-model="player.position">
          <option v-for="position of positions" :key="position" :value="position">{{position}}</option>
        </select>
      </td>
    </tr>
    <tr>
      <th v-if="type == 'batting'">Bats</th>
      <th v-if="type == 'pitching'">Ground/Fly</th>
      <td v-if="type == 'batting'">
        <select v-model="player.bats">
          <option value="-">-</option>
          <option value="L">L</option>
          <option value="R">R</option>
          <option value="S">S</option>
        </select>
      </td>
      <td v-if="type == 'pitching'">
        <select v-model="player.groundFly">
          <option value="EX GB">EX GB</option>
          <option value="GB">GB</option>
          <option value="NEU">NEU</option>
          <option value="FB">FB</option>
          <option value="EX FB">EX FB</option>
        </select>
      </td>
    </tr>
    <tr v-for="field in fields" :key="field.key">
      <th>{{field.title}}</th>
      <td>
        <input type="number" v-model="player[field.key]">
      </td>
    </tr>
  </table>
</div>
</template>

<script>
import { Batter, Pitcher } from '../../data-classes';

const fields_batting = [
  { title: 'Contact', key: 'contact' },
  { title: 'Gap', key: 'gap' },
  { title: 'Power', key: 'power' },
  { title: 'Eye', key: 'eye' },
  { title: 'Avoid K\'s', key: 'avoidKs' },
  { title: 'Speed', key: 'speed' },
  { title: 'Stealing', key: 'stealing' },
  { title: 'Defense', key: 'defense' },
]
const fields_pitching = [
  { title: 'Stuff', key: 'stuff' },
  { title: 'Movement', key: 'movement' },
  { title: 'Control', key: 'control' },
  { title: 'Stamina', key: 'stamina' },
  { title: 'Hold', key: 'hold' }
]
const positions_batting = ['-', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
const positions_pitching = ['-', 'SP', 'RP', 'CL'];

export default {
  name: 'InputSingle',
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
    },
    list: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      player: {
        name: '',
        team: '-',
        position: '-',
        bats: '-',
        groundFly: 'NEU'
      },
      team: '-',
      fields: [],
      positions: [],
      model: null,
      editing: false,
      wide: true
    }
  },
  watch: {
    team(newTeam) {
      this.$parent.setTeam(newTeam);
    }
  },
  created() {
    this.team = localStorage.getItem('team') || '-';
    if (this.type == 'batting') {
      this.fields = fields_batting;
      this.positions = positions_batting;
      this.model = Batter;
    } else {
      this.fields = fields_pitching;
      this.positions = positions_pitching;
      this.model = Pitcher;
    }
    window.addEventListener('resize', this.checkWidth);
    this.checkWidth();
  },
  destroyed() {
    window.removeEventListener('resize', this.checkWidth);
  },
  methods: {
    submit() {
      if (this.type == 'batting') {
        delete this.player.groundFly;
      } else {
        delete this.player.bats;
      }
      let result;
      try {
        this.player.team = this.team;
        this.player.list = this.list;
        result = { players: [new this.model(this.teams, this.scale, this.player)]}; 
        if (this.editing) {
          this.$analytics.logEvent(this.$instance, `project-${this.type}-edit`);
        } else {
          this.$analytics.logEvent(this.$instance, `project-${this.type}-single`);
        }
      } catch (error) {
        result = { error };
      }
      this.editing = false;
      return result;
    },
    
    clear(del=false) {
      this.player = {
        name: '',
        team: '-',
        position: '-',
        bats: '-',
        groundFly: 'NEU'
      };
      this.editing = false;
      if (del) {
        this.$analytics.logEvent(this.$instance, `delete-${this.type}-single`);
      }
    },

    editPlayer(player) {
      this.team = player.team;
      this.player = Object.assign(new this.model(), player);
      this.player.revertRatings(this.scale);
      this.editing = true;
    },

    checkWidth() {
      const threshold = 960;
      this.wide = document.body.clientWidth >= threshold;
    }
  }
}
</script>

<style>

.table-input td {
  min-width: 4rem;
}

.table-projections:not(.table-vertical) {
  width: 100%;
}

.table-vertical {
  margin: auto;
}

.table-vertical th {
  min-width: 8rem;
}

.table-projections th {
  white-space: nowrap;
  text-transform: uppercase;
  padding: 2px 8px;
  color: white;
  background-image: var(--gradient-primary);
}

.table-projections.table-vertical th {
  background-image: var(--gradient-primary-vertical);
}

.table-projections td {
  color: var(--color-text);
  text-align: center;
}

.table-projections:not(.table-vertical) th {
  border-top: 2px solid var(--color-gray);
  border-bottom: 2px solid var(--color-gray);
}

.table-projections:not(.table-vertical) th:first-child {
  border-left: 2px solid var(--color-gray);
}

.table-projections:not(.table-vertical) th:last-child {
  border-right: 2px solid var(--color-gray);
}

.bordered {
  border: 2px solid var(--color-gray);
}

.table-projections:not(.table-vertical) {
  border-collapse: separate;
  border-spacing: 0;
}

.table-input input {
  width: 100%;
  height: 1.75rem;
  text-align: center;
  color: var(--color-text);
  /*
  color: var(--color-text);
  text-align: center;
  background-color: var(--color-transparent);
  */
}

.table-input select {
  width: 100%;
  height: 1.75rem;
  text-align: center;
  color: var(--color-text);
  /*
  border: 1px solid var(--color-gray);
  border-radius: 4px;
  transition: 0.5s;
  */
}

.table-input option {
  color: white;
}

.table-input td {
  margin: 2px;
}

.table-input #name {
  min-width: 8rem;
  text-align: left;
}

.table-input #team {
  min-width: 5rem;
}

.table-vertical input:not(#name) {
  width: 100%;
  justify-content: left;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>