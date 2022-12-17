<template>
  <MoreOptions ref="moreOptions"/>
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
    <input-single v-if="option == 'option-single'" :type="type" :scale="scale.selected" :teams="teams" :list="currentList" ref="single" />
    <input-batch v-if="option == 'option-batch'" :type="type" :scale="scale.selected" :teams="teams" :list="currentList" ref="batch" />
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
          <input v-else type="text" id="list-edit-input" :value="list || 'NEW LIST'">
        </div>
        <!--
        <button class="button-option button-list" :id="{'list-edit-button': list == editingList}" type="button" @click="changeList(list)" :class="{selected: list == currentList}">
          <div v-if="list != editingList">
            {{list}}
            <button type="button" @click="listOptions()">
              <img src="/img/more.svg" alt="..." width="24" height="24">
            </button>
          </div>
          <input v-else type="text" id="list-edit-input" :placeholder="list">
        </button>
        -->
      </div>
      <button class="new-list" type="button" @click="newList()"><img src="/img/add.svg" alt="+" width="24"></button>
    </div>
    <projection-table ref="table" v-if="players.length > 0 && loaded" :type="type" :players="currentPlayers" :allPlayers="players"/>
  </form>
</template>

<script>
import RatingsScale from '@/components/Projections/RatingsScale.vue';
import InputBatch from '@/components/Projections/InputBatch.vue';
import InputSingle from '@/components/Projections/InputSingle.vue';
import ProjectionTable from '@/components/Projections/ProjectionTable.vue';
import MoreOptions from './MoreOptions.vue';
import { getTeams } from '../data-manager';

export default {
  name: 'Projections',
  components: { RatingsScale, InputBatch, InputSingle, ProjectionTable, MoreOptions },
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
      currentPlayers: [],
      editing: null,
      teams: [],
      team: '-',
      loaded: false,
      moreOptions: null
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
    this.populateLists();
    getTeams().then(teams => {
      this.teams = teams;
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

    savePlayers() {
      localStorage.setItem(this.type, JSON.stringify(this.players));
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
      this.$analytics.logEvent(this.$instance, `delete-${this.type}-multiple`);
    },

    listOptions(list) {
      console.log('List options');
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
      localStorage.setItem('list', list);
    },

    newList() {
      this.lists.push('');
      let newList = this.renameList('', true);
    },

    renameList(list, isNew=false) {
      // Get list index
      if (!list) {
        list = this.optionList;
      }
      let foundIndex = this.lists.findIndex(l => l == list);
      if (foundIndex < 0) {
        return '';
      }
      // Helpers/event listeners
      const doneEditing = (event) => {
        event.preventDefault();
        event.target.blur();
        this.editingList = '';
        // Only do this if valid list, otherwize delete
        let newValue = event.target.value.toUpperCase();
        this.lists[foundIndex] = newValue;
        let listPlayers = this.players.filter(p => p.list == list);
        for (let player of listPlayers) {
          player.list = newValue;
        }
        this.savePlayers();
        if (isNew || list == this.currentList) {
          this.changeList(newValue);
        }
      }
      const cancelEditing = (event) => {
        event.target.blur();
        if (isNew) {
          this.lists.splice(foundIndex, 1);
        }
      }
      const keyListener = (event) => {
        if (event.code == 'Space') {
          event.preventDefault();
          // event.code = 'Space';
          event.target.value = event.target.value + ' ';
        }
        if (event.code == 'Enter') {
          event.preventDefault();
          doneEditing(event);
        }
        if (event.code == 'Escape') {
          cancelEditing(event);
        }
      }
      // 
      this.editingList = list;
      setTimeout(() => {
        let input = document.getElementById('list-edit-input');
        input.addEventListener('keydown', keyListener);
        input.addEventListener('blur', doneEditing);
        input.focus();
        input.select();
      }, 100);
      // Rename list in player objects, update localStorage
      let newList = this.lists[foundIndex];
      return newList;
    },

    deleteList() {
      let foundIndex = this.lists.findIndex(l => l == this.optionList);
      if (foundIndex < 0) {
        return;
      }
      let conf = confirm('Are you sure you want to delete this list? This action cannot be undone!');
      if (conf) {
        this.lists.splice(foundIndex, 1);
      }
      // TODO: Remove players, update localStorage

    },

    showMoreOptions(event, list) {
      this.optionList = list;
      this.moreOptions.show(event.pageX, event.pageY);
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
      this.lists = this.players.map(p => p.list).filter((value, index, self) => self.indexOf(value) === index);
      // Select last list
      this.currentList = localStorage.getItem('list') || defaultList;
      this.changeList(this.currentList);
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
  background: inherit;
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