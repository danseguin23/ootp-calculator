<template>
<div class="table-responsive" id="table-projections">
  <table class="table-projections table-sortable">
    <thead>
      <tr>
        <th class="no-sort"><checkbox ref="checkHead" @click="clickAll($event)"/></th>
        <th v-for="(field, index) of fields[type]" :key="index" @click="sort(field.key, field.sort)">{{field.title}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="player in players" :key="player" @click="editPlayer(player)" :class="{ 'player-new': player.lastAdded, 'stale': player.stale }">
        <td><checkbox ref="checkbox" @click="clickCheckbox(player)" /></td>
        <td v-for="field in fields[type]" :key="field" :class="{ sorted: sortField == field.key }">{{field.display(player[field.key])}}</td>
      </tr>
      <tr v-if="players.length == 0" class="disabled">
        <td :colspan="fields[type].length + 1">No Players Added</td>
      </tr>
    </tbody>
  </table>
</div>
<button class="button-submit" type="button" @click="download()" :disabled="players.length == 0">Download CSV</button>
<button class="button-clear" type="button" @click="deleteSelected()" :disabled="players.length == 0">{{buttonLabel}}</button>
</template>

<script>
import Checkbox from '../Checkbox.vue';
import { fields } from '../../util';

export default {
  name: 'OutputTable',
  components: { Checkbox },
  props: {
    type: String,
    players: Array,  // Just players from selected list
    allPlayers: Array
  },
  data() {
    return {
      selected: [],
      clicked: false,
      fields,
      sortField: '',
      sortDirection: 1
    }
  },
  computed: {
    buttonLabel() {
      if (this.selected.length == 0) {
        return 'Delete All';
      } else {
        return 'Delete Selected'
      }
    }
  },
  // Add lastAdded property
  created() {
    for (let player of this.players) {
      player['lastAdded'] = false;
    }
  },
  mounted() {
    this.sort('war', -1);
  },
  watch: {
    players(to, from) {
      if (to.length == (from.length + 1)) {
        if (to[0].list == from[0].list) {
          let lastAdded;
          for (let player of to) {
            if (from.includes(player)) {
              player.lastAdded = false;
            } else {
              player.lastAdded = true;
              lastAdded = player;
            }
          }
          setTimeout(() => {
            lastAdded.stale = true;
          }, 100);
        }
      }
    }
  },
  methods: {
    clickAll() {
      if (this.selected.length == this.players.length) {
        for (let checkbox of this.$refs.checkbox) {
          checkbox.unselect();
        }
        this.selected = [];
      } else {
        for (let checkbox of this.$refs.checkbox) {
          checkbox.select();
        }
        this.selected = this.players.slice();
      }
    },
    clickCheckbox(player) {
      let index = this.selected.indexOf(player);
      if (index >= 0) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(player);
      }
      this.clicked = true;
    },
    editPlayer(player) {
      if (!this.clicked) {
        let index = this.selected.indexOf(player);
        if (index >= 0) {
          this.selected.splice(index, 1);
        }
        this.$parent.editPlayer(player);
      }
      this.clicked = false;
    },
    deleteSelected() {
      if (this.selected.length == 0) {
        this.selected = this.players.slice();
      }
      let conf = confirm('Are you sure you want to delete these players? This action cannot be undone!');
      if (conf) {
        this.$parent.deleteSelected(this.selected);
        this.selected = [];
      }
      this.selected = [];
      this.$refs.checkHead.unselect();
    },
    // Downloads saved players as a .csv
    download() {
      // Generate text
      let text = '';
      for (let field of this.fields[this.type]) {
        text += field.title + ',';
      }
      text = text.slice(0, -1) + '\n';
      for (let player of this.players) {
        for (let field of this.fields[this.type]) {
          text += player[field.key] + ',';
        }
        text = text.slice(0, -1) + '\n';
      }
      // Download
      let filename = this.type + '-projections.csv';
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    // Sorts the table
    sort(field, direction) {
      if (field == this.sortField) {
        this.sortDirection = -this.sortDirection;
      } else {
        this.sortDirection = direction;
      }
      this.sortField = field;
      const sortArray = (array) => {
        array.sort((a, b) => {
          if (a[field] > b[field]) {
            return this.sortDirection;
          } else if (b[field] > a[field]) {
            return -this.sortDirection;
          } else {
            return 0;
          }
        });
      }
      sortArray(this.players);
      sortArray(this.allPlayers);
    },
    reSort() {
      setTimeout(() => {
        this.sort(this.sortField, 1);
        this.sort(this.sortField, 1);
      }, 0);
    }
  }
}
</script>

<style>

.table-sortable {
  white-space: nowrap;
}

.table-sortable td {
  border-bottom: 1px solid var(--color-transparent);
}

.table-sortable tr.disabled {
  pointer-events: none;
}

.table-sortable tr.disabled td {
  font-style: italic;
}

/*
.table-sortable tr:nth-child(even) {
  background-color: var(--color-transparent);
}
*/

.table-sortable tbody tr:hover {
  cursor: pointer;
  background-color: var(--color-transparent);
}

.table-sortable th:hover:not(.no-sort) {
  background-image: var(--gradient-primary-hover);
  cursor: pointer;
}

.table-sortable td.sorted {
  background-color: var(--color-transparent);
}

.table-sortable th {
  position: sticky;
  top: 0;
}

.player-new {
  box-shadow: 0px 0px 4px #fff;
  transition: box-shadow 1s ease-in;
  transition-delay: .4s;
}

.player-new.stale {
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0);
}

#table-projections {
  max-height: max(55vh, 12rem);
  position: relative;
  box-shadow: inset 0 -20px 10px -10px rgba(0, 0, 0, 0.25);
}

</style>