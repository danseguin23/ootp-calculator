<template>
  <h1>OOTP {{ title }} Projections</h1>
  <div id="overview">
    <p>By entering current player ratings, the projection calculator will determine projected full-season stats for the player.</p>
    <p>The current edition of the projection calculator is best suited for 2022 MLB saves.</p>
  </div>
  <div class="row-flex">
    <button class="button-option" id="option-single" @click="changeOption()">Single Input</button>
    <button class="button-option" id="option-batch" @click="changeOption()">Batch Input</button>
  </div>
  <form @submit="submit($event)">
    <div id="options">
      <div class="column">
        <label>Ratings Scale</label>
        <ratings-scale ref="scale" />
      </div>
      <div class="column" :style="option == 'option-single' ? 'width: 0; opacity: 0' : 'width: 10rem;'">
        <label>Team</label>
        <select v-model="team" style="width: 100%">
          <option v-for="team in teams" :key="team.abbr" :value="team.abbr">{{team.name}}</option>
        </select>
      </div>
    </div>
    <input-single v-if="option == 'option-single'" :type="type" :scale="scale.selected" :teams="teams" ref="single" />
    <input-batch v-if="option == 'option-batch'" :type="type" :scale="scale.selected" :teams="teams" ref="batch" />
    <div class="row-flex">
      <button class="button-submit" type="submit"> {{ editing ? 'Save' : 'Submit' }}</button>
      <button class="button-clear" type="button" @click="clear()" v-if="!editing">Clear</button>
      <button class="button-clear" type="button" @click="deletePlayer()" v-if="editing">Delete</button>
      <button class="button-help" type="button" @click="submit($event, true)" v-if="editing">Duplicate Player</button>
    </div>
    <p class="error">{{error}}</p>
    <div class="projection-lists">
      <div v-for="list of lists">
        <button class="button-option button-list" type="button" @click="changeList(list)" :class="{selected: list == currentList}">{{list}}</button>
      </div>
      <button class="new-list" type="button" @click="newList()"><img src="/img/add.svg" alt="+" width="24"></button>
    </div>
    <projection-table ref="table" v-if="players.length > 0 && loaded" :type="type" :players="players" />
  </form>
</template>

<script>
import RatingsScale from '@/components/Projections/RatingsScale.vue';
import InputBatch from '@/components/Projections/InputBatch.vue';
import InputSingle from '@/components/Projections/InputSingle.vue';
import ProjectionTable from '@/components/Projections/ProjectionTable.vue';
import { getTeams } from '../data-manager';

export default {
  name: 'Projections',
  components: { RatingsScale, InputBatch, InputSingle, ProjectionTable },
  props: {
    type: String
  },
  data() {
    return {
      option: 'option-single',
      scale: { selected: '20 to 80' },
      error: '\xa0',
      players: [],
      lists: ['Default List'],
      currentList: '',
      currentPlayers: [],
      editing: null,
      teams: [],
      team: '-',
      loaded: false
    }
  },
  computed: {
    title() {
      if (this.type == 'pitching') {
        return 'Pitcher';
      }
      if (this.type == 'batting') {
        return 'Batter';
      }
      return '';
    }
  },
  watch: {
    team(newTeam) {
      localStorage.setItem('team', newTeam);
      this.$analytics.logEvent(this.$instance, `change-team`);
      this.$analytics.logEvent(this.$instance, `team-${newTeam}`);
      if (this.$refs.batch) {
        this.$refs.batch.setTeam(newTeam);
      }
    }
  },
  created() {
    this.team = localStorage.getItem('team') || '-';
    let players = localStorage.getItem(this.type);
    if (players && players != 'undefined') {
      this.players = JSON.parse(players);
    }
    getTeams().then(teams => {
      this.teams = teams;
      this.loaded = true;
    });
  },
  mounted() {
    this.scale = this.$refs.scale;
    this.option = 'option-single';
    document.getElementById(this.option).classList.add('selected');
  },
  methods: {
    setTeam(newTeam) {
      this.team = newTeam;
    },
    changeOption() {
      if (this.editing) {
        this.players.push(this.editing);
        this.$refs.table.reSort();
        this.editing = null;
      }
      let remove = this.option;
      if (this.option == 'option-single') {
        this.option = 'option-batch'
      } else {
        this.option = 'option-single';
      }
      document.getElementById(this.option).classList.add('selected');
      document.getElementById(remove).classList.remove('selected');
      // localStorage.setItem('option-input', this.option);
    },

    submit(event, duplicate=false) {
      event.preventDefault();
      let input;
      if (this.option == 'option-single') {
        input = this.$refs.single;
      } else {
        input = this.$refs.batch;
        this.$refs.batch.setTeam(this.team);
      }
      let result = input.submit();
      if (result.error) {
        this.error = '\xa0';
        setTimeout(() => this.error = result.error, 100);
      } else {
        this.players = this.players.concat(result.players);
        setTimeout(() => {
          this.$refs.table.reSort();
        }, 0);
        localStorage.setItem(this.type, JSON.stringify(this.players));
        if (!duplicate) this.clear();
        if (this.option == 'option-batch') {
          this.changeOption();
        }
        // Scroll to table
        // document.getElementById('table-projections').scrollIntoView(false);
      }
    },

    clear(del=false) {
      let input;
      if (this.option == 'option-single') {
        input = this.$refs.single;
      } else {
        input = this.$refs.batch;
      }
      input.clear(del);
      this.error = '\xa0';
      this.editing = null;
      // Scroll down to the projection output
    },

    editPlayer(player) {
      this.option = 'option-single';
      this.team = player.team;
      setTimeout(() => {
        if (this.editing) {
          this.players.push(this.editing);
          this.$refs.table.reSort();
        }
        this.editing = player;
        let index = this.players.indexOf(player);
        if (index >= 0) {
          this.players.splice(index, 1);
        }
        this.$refs.single.editPlayer(player);
      }, 1);
    },

    deletePlayer() {
      localStorage.setItem(this.type, JSON.stringify(this.players));
      this.clear(true);
    },

    deleteSelected(selected) {
      for (let player of selected) {
        let index = this.players.indexOf(player);
        if (index >= 0) {
          this.players.splice(index, 1);
        }
      }
      localStorage.setItem(this.type, JSON.stringify(this.players));
      this.$analytics.logEvent(this.$instance, `delete-${this.type}-multiple`);
    },

    changeList(list) {
      // Select list in HTML
      //let all = doc
      let button = document.getElementById(`button-list-${list}`);
      //button.
      this.currentList = list;
    },

    newList() {

    }
  }
}
</script>

<style>
.row-flex {
  display: flex;
  justify-content: center;
  margin: 16px;
}

#overview {
  margin: 0 24px 24px 24px;
}

#overview p {
  margin: 0;
}
</style>

<style scoped>

.button-option {
  padding: 4px 12px;
  border: none;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 1px;
}

.button-option:not(.selected) {
  color: white;
  background-image: var(--gradient-primary);
  border: 2px solid #ddd;
}

.button-option:hover {
  background-image: var(--gradient-primary-hover);
}

.button-option.selected {
  pointer-events: none;
  background: rgba(0, 0, 0, 0);
  color: white;
}

.container-input {
  overflow: hidden;
  transition: height 0.3s ease-out;
  height: auto;
}

select {
  height: 1.75rem;
  text-align: center;
}

#options {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.column {
  display: flex;
  flex-direction: column;
  transition: all 0.5s;
  transition-property: width, opacity;
  overflow: hidden;
}

#options .column label {
  font-weight: 700;
  text-transform: uppercase;
}

.projection-lists {
  display: flex;
  align-items: flex-end;
}

.projection-lists button {
  margin-bottom: -2px;
  margin-right: -2px;
}

button.new-list {
  background: none;
  border: 0;
  padding: 0 0 8px 16px;
}

.projection-lists .button-option {
  padding: 4px 16px;
}

.projection-lists .button-option.selected {
  padding: 8px 16px;
  background-image: var(--gradient-primary-hover);
  border: 2px solid white;
}

</style>