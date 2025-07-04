<template>
  <MoreOptions ref="moreOptions"/>
  <!--<Welcome v-if="welcome"/>-->
  <h1>OOTP {{ title }} Projections</h1>
  <div id="overview">
    <p>By entering current player ratings, the projection calculator will determine projected full-season stats for the player.</p>
    <p>The current edition of the projection calculator is best suited for 2024 MLB saves.</p>
  </div>
  <div class="row-flex">
    <button class="button-option" id="option-single" @click="changeOption()">Single Input</button>
    <button class="button-option" id="option-batch" @click="changeOption()">Batch Input</button>
  </div>
  <form @submit="submit($event)">
    <div id="options">
      <div class="column">
        <label>Target List</label>
        <select v-model="targetList">
          <option v-for="list of lists" :label="proper(list)">{{list}}</option>
        </select>
      </div>
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
    <input-single v-if="option == 'option-single'" :type="type" :scale="scale.selected" :teams="teams" :list="targetList" ref="single" />
    <input-batch v-if="option == 'option-batch'" :type="type" :scale="scale.selected" :teams="teams" :list="targetList" ref="batch" />
    <div class="row-flex">
      <button class="button-submit" type="submit"> {{ editing ? 'Save' : 'Submit' }}</button>
      <button class="button-clear" type="button" @click="clear()" v-if="!editing">Clear</button>
      <button class="button-clear" type="button" @click="deletePlayer()" v-if="editing">Delete</button>
      <button class="button-help" type="button" @click="submit($event, true)" v-if="editing">Duplicate Player</button>
    </div>
    <p class="error">{{error}}</p>
    <div class="projection-lists table-responsive">
      <div v-for="list of lists">
        <div class="button-option list-option" :class="{'selected': currentList == list}">
          <template v-if="list != editingList">
            <button type="button" class="button-list" @click="changeList(list)">{{list}}</button>
            <button type="button" class="list-more" @click="showMoreOptions($event, list)"><img src="/img/more.svg" alt="..." width="24"></button>
          </template> 
          <input v-else type="text" id="list-edit-input" autocomplete="off" :value="list || 'NEW LIST'">
        </div>
      </div>
      <button class="new-list" type="button" @click="newList()"><img src="/img/add.svg" alt="+" width="24"></button>
    </div>
    <projection-table ref="table" v-if="loaded" :type="type" :players="currentPlayers" :allPlayers="players"/>
  </form>
</template>

<script>
import RatingsScale from '@/components/Projections/RatingsScale.vue';
import InputBatch from '@/components/Projections/InputBatch.vue';
import InputSingle from '@/components/Projections/InputSingle.vue';
import ProjectionTable from '@/components/Projections/ProjectionTable.vue';
import MoreOptions from '@/components/MoreOptions.vue';
import Welcome from '@/components/Welcome.vue';
import { getTeams } from '../data-manager';
import { Batter, Pitcher } from '../data-classes';

export default {
  name: 'Projections',
  components: { RatingsScale, InputBatch, InputSingle, ProjectionTable, MoreOptions, Welcome },
  props: {
    type: String
  },
  data() {
    return {
      option: 'option-single',
      scale: { selected: '20 to 80' },
      error: '\xa0',
      players: [],
      lists: [],
      currentList: '',
      editingList: '',
      optionList: '',
      targetList: '',
      currentPlayers: [],
      editing: null,
      teams: [],
      team: '-',
      loaded: false,
      moreOptions: null,
      welcome: false
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
    getTeams().then(teams => {
      this.teams = teams;
      this.loadPlayers();
      this.populateLists();
      this.loaded = true;
    });
  },
  mounted() {
    this.scale = this.$refs.scale;
    this.moreOptions = this.$refs.moreOptions;
    this.option = 'option-single';
    document.getElementById(this.option).classList.add('selected');
  },
  methods: {
    proper(list) {
      if (list == '') {
        return '';
      }
      let split = list.split(' ');
      let proper = ''
      for (let segment of split) {
        proper += ' ' + segment[0].toUpperCase() + segment.slice(1).toLowerCase();
      }
      return proper.slice(1);
    },

    setTeam(newTeam) {
      this.team = newTeam;
    },

    changeOption() {
      if (this.editing) {
        this.currentPlayers.push(this.editing);
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

    savePlayers() {
      for (let player of this.players) {
        delete player.lastAdded;
        delete player.stale;
      }
      localStorage.setItem(this.type, JSON.stringify(this.players));
      this.saveLists();
    },

    saveLists() {
      localStorage.setItem(`lists-${this.type}`, JSON.stringify(this.lists));
    },

    loadLists() {
      let item = localStorage.getItem(`lists-${this.type}`);
      if (item) {
        return JSON.parse(item);
      } else {
        return []
      }
    },

    loadPlayers() {
      this.team = localStorage.getItem('team') || '-';
      let players = localStorage.getItem(this.type);
      if (!players || players == undefined) {
        this.players = [];
        return;
      }
      let objPlayers = JSON.parse(players);
      let model;
      if (this.type == 'batting') {
        model = Batter;
      } else {
        model = Pitcher;
      }
      for (let player of objPlayers) {
        let classPlayer = Object.assign(new model(), player);
        classPlayer.calculateStats(this.teams);
        this.players.push(classPlayer);
      }
    },

    raiseError(error) {
      this.error = '\xa0';
      setTimeout(() => this.error = error, 100);
    },

    clearError() {
      this.error = '\xa0';
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
        this.raiseError(result.error);
      } else {
        if (this.targetList != this.currentList) {
          this.changeList(this.targetList);
        }
        this.players = this.players.concat(result.players);
        setTimeout(() => {
          this.$refs.table.reSort();
        }, 0);
        this.savePlayers();
        if (!duplicate) this.clear();
        if (this.option == 'option-batch') {
          this.changeOption();
        }
        // Scroll to table
        // document.getElementById('table-projections').scrollIntoView(false);
        // Filter player
        this.currentPlayers = this.players.filter(p => p.list == this.currentList);
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
      this.clearError();
      this.editing = null;
      // Scroll down to the projection output
    },

    editPlayer(player) {
      this.option = 'option-single';
      this.team = player.team;
      setTimeout(() => {
        if (this.editing) {
          this.currentPlayers.push(this.editing);
          this.$refs.table.reSort();
        }
        this.editing = player;
        let index = this.currentPlayers.indexOf(player);
        if (index >= 0) {
          this.currentPlayers.splice(index, 1);
        }
        let allIndex = this.players.indexOf(player);
        if (allIndex >= 0) {
          this.players.splice(allIndex, 1);
        }
        this.$refs.single.editPlayer(player);
      }, 1);
    },

    deletePlayer() {
      this.savePlayers();
      this.clear(true);
    },

    deleteSelected(selected) {
      for (let player of selected) {
        let index = this.players.indexOf(player);
        if (index >= 0) {
          this.players.splice(index, 1);
        }
      }
      this.savePlayers();
      this.currentPlayers = this.players.filter(p => p.list == this.currentList);
      this.$analytics.logEvent(this.$instance, `delete-${this.type}-multiple`);
    },

    changeList(list) {
      // Select list in HTML
      this.currentList = list;
      this.currentPlayers = this.players.filter(p => p.list == list);
      /*
      if (this.$refs.table) {
        this.$refs.table.reSort();
      }
      */
      localStorage.setItem(`list-${this.type}`, list);
      this.editingList = '';
      this.targetList = list;
    },

    newList() {
      this.lists.push('');
      this.renameList(true);
    },

    renameList(isNew) {
      let oldList;
      if (isNew) {
        oldList = '';
      } else {
        oldList = this.optionList;
      }
      this.editingList = oldList;
      let cancelled = false;
      let oldIndex = this.lists.findIndex(l => l == oldList);
      // Helpers
      const saveList = (event) => {
        let newList = event.target.value.toUpperCase();
        let newIndex = this.lists.findIndex(l => l == newList);
        let error = '';
        if (newList == '__') {
          error = 'AAAAHHHHH!!!!';
        } else if (newList == '') {
          error = 'List name cannot be left blank!'
        } else if (newIndex >= 0 && oldIndex != newIndex) {
          error = `"${newList}" already exists! Pick a different name.`
        }
        if (error) {
          this.raiseError(error);
          setTimeout(() => {
            event.target.focus();
          }, 100);
        } else {
          // Only if valid
          this.clearError();
          this.lists[oldIndex] = newList;
          this.editingList = '';
          let players = this.players.filter(p => p.list == oldList);
          for (let player of players) {
            player.list = newList;
          }
          this.savePlayers()
          if (isNew || this.currentList == oldList) {
            this.changeList(newList);
          }
          if (isNew) {
            this.$analytics.logEvent(this.$instance, 'list-new');
          } else {
            this.$analytics.logEvent(this.$instance, 'list-rename');
          }
        }
      }
      const cancelList = (event) => {
        if (isNew) {
          this.lists.splice(oldIndex, 1);
        }
        this.clearError();
        this.editingList = '';
      }
      // Event listeners
      const inputKeydown = (event) => {
        if (event.code == 'Enter') {
          event.preventDefault();
          cancelled = false;
          event.target.blur();
        } else if (event.code == 'Escape') {
          event.preventDefault();
          cancelled = true;
          event.target.blur();
        }
      }
      const inputFocus = (event) => {
        event.target.select();
      }
      const inputBlur = (event) => {
        if (cancelled) {
          cancelList(event);
        } else {
          saveList(event);
        }
      }
      // Focus & select input
      setTimeout(() => {
        let input = document.getElementById('list-edit-input');
        input.addEventListener('keydown', inputKeydown)
        input.addEventListener('focus', inputFocus)
        input.addEventListener('blur', inputBlur)
        input.focus();
      }, 100);
    },

    deleteList() {
      let foundIndex = this.lists.findIndex(l => l == this.optionList);
      if (foundIndex < 0) {
        return;
      }
      let found = this.players.filter(p => p.list == this.optionList);
      let conf = found.length == 0;
      if (!conf) {
        conf = confirm('Are you sure you want to delete this list? This action cannot be undone!');
      }
      if (conf) {
        this.lists.splice(foundIndex, 1);
        this.$analytics.logEvent(this.$instance, 'list-delete');
      }
      // TODO: Remove players, update localStorage
      this.players = this.players.filter(p => p.list != this.optionList);
      this.savePlayers();
      // Change list
      if (this.optionList == this.currentList) {
        if (foundIndex >= 1) {
          this.changeList(this.lists[foundIndex - 1]);
        } else {
          this.changeList(this.lists[0]);
        }
      }
    },

    showMoreOptions(event, list) {
      this.optionList = list;
      this.moreOptions.show(event.pageX, event.pageY, this.lists.length <= 1);
      event.target.parentElement.addEventListener('blur', () => {
        setTimeout(() => {
          this.moreOptions.hide();
        }, 100);
      });
    },

    populateLists() {
      const defaultList = 'DEFAULT LIST';
      // Make sure there aren't any empty lists
      let empty = this.players.filter(p => !p.list);
      for (let player of empty) {
        player.list = defaultList;
      }
      // Get unique lists
      this.currentList = localStorage.getItem(`list-${this.type}`) || defaultList;
      this.lists = this.loadLists();
      if (this.lists.length == 0) {
        this.lists = this.players.map(p => p.list).filter((value, index, self) => self.indexOf(value) === index);
        this.saveLists();
        let welcome = Boolean(localStorage.getItem('welcome-lists'));
        if (this.players && !welcome) {
          this.welcome = true;
        }
      }
      // Select last list
      this.changeList(this.currentList);
    },

    closeWelcome() {
      localStorage.setItem('welcome-lists', 'true');
      this.welcome = false;
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

.projections {
  position: relative;
}

.button-option {
  padding: 4px 12px;
  border: none;
  font-weight: 600;
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
  width: 10rem;
}

#options .column label {
  font-weight: 600;
  text-transform: uppercase;
}

.projection-lists {
  display: flex;
  align-items: flex-end;
  overflow-y: hidden;
}

.list-option {
  margin-bottom: -2px;
  margin-right: -2px;
  cursor: pointer;
  position: relative;
  padding: 4px 48px 4px 16px !important;
}

.list-option.selected {
  padding: 8px 48px 8px 16px !important;
  background-image: var(--gradient-primary-hover);
  border: 2px solid white;
  pointer-events: all;
  cursor: default;
}

.list-option.selected .button-list {
  cursor: default;
}

.list-option, .button-list {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.list-option button {
  background-color: transparent;
  border: 0;
  font-weight: inherit;
  color: inherit;
  text-transform: inherit;
}

.list-more {
  position: absolute;
  z-index: 2;
  right: 0;
  padding: 0 4px 2px 4px;
  margin-right: 10px;
  border-radius: 16px;
}

.list-more:hover {
  background-image: var(--gradient-primary);
}

button.new-list {
  background: none;
  border: 0;
  padding: 8px 16px;
}

.projection-lists .button-option {
  padding: 4px 16px;
}


.list-option input {  
  text-transform: uppercase;
  font-weight: inherit;
  text-align: inherit;
  width: 8rem;
}

</style>