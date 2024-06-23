<template>
  <h1>OOTP Position Calculator</h1>
  <div id="overview">
    <p>By entering a player's defensive ratings, the position calculator will tell you how good they could be at any position.</p>
    <p>Height must be entered to generate a 1B rating. Left-handed throwers cannot play C, 2B, 3B, or SS.</p>
  </div>
  <form @submit="submit($event)">
  <div class="row-flex row-container">
    <div class="column-split">
      <div class="row-flex checks">
        <!--
        <checkbox ref="checkSaveEntry" @click="clickSaveEntry()" :table="true"/>
        <label>Save Entry</label>
        -->
        <checkbox ref="checkCentimetres" @click="clickCentimetres()" :table="true"/>
        <label>Use Centimetres</label>
      </div>
      <table class="table-projections table-input table-vertical">
        <colgroup>
          <col class="bordered">
          <col>
        </colgroup>
        <tr>
          <th>Ratings Scale</th>
          <td><ratings-scale ref="scale" /></td>
        </tr>
        <tr :class="{ hidden: !saveEntry }">
          <th>
            <div class="collapsible">Name</div>
          </th>
          <td>
            <div class="collapsible"><input type="text" id="name" v-model="player.name"></div>
          </td>
        </tr>
        <tr>
          <th>Height</th>
          <td v-if="centimetres"><input type="number" v-model="htCm" placeholder="centimetres"></td>
          <td v-if="!centimetres">
            <div class="cell-double">
              <div><input type="number" v-model="htFt" placeholder="feet"></div>
              <div><input type="number" v-model="htIn" placeholder="inches"></div>
            </div>
          </td>
        </tr>
        <tr><th class="empty"></th></tr>
        <tr>
          <th>Catcher Blocking</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.catcherBlocking"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Catcher Framing</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.catcherFraming"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Catcher Arm</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.catcherArm"></div>
            </div>
          </td>
        </tr>
        <tr><th class="empty"></th></tr>
        <tr>
          <th>Infield Rng</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.infieldRng"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Infield Err</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.infieldErr"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Infield Arm</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.infieldArm"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Turn DP</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.turnDP"></div>
            </div>
          </td>
        </tr>
        <tr><th class="empty"></th></tr>
        <tr>
          <th>Outfield Rng</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.outfieldRng"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Outfield Err</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.outfieldErr"></div>
            </div>
          </td>
        </tr>
        <tr>
          <th>Outfield Arm</th>
          <td>
            <div class="cell-double">
              <div><input type="number" v-model="player.outfieldArm"></div>
            </div>
          </td>
        </tr>
      </table>
      <div class="row-flex">
      <button class="button-submit" type="submit"> {{ editing ? 'Save' : 'Submit' }}</button>
      <button class="button-clear" type="button" @click="clear()" v-if="!editing">Clear</button>
      <button class="button-clear" type="button" @click="deletePlayer()" v-if="editing">Delete</button>
    </div>
    <p class="error">{{error}}</p>
    </div>
    <div class="column-split">
      <div class="row-flex checks">&nbsp;</div>
      <table class="table-projections" id="table-output">
        <thead>
          <tr>
            <th>Position</th>
            <th>Rating</th>
            <th>WAR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(position, index) in positions">
            <td>{{position}}</td>
            <td :style="`color: ${getColor(index)};`">{{getRating(index)}}</td>
            <td>{{getWAR(index)}}</td>
          </tr>
        </tbody>
      </table>
      <div class="notes">
        <h3>Notes</h3>
        <p><strong>Height</strong> only affects First Base rating.</p>
        <p><strong>Lefties</strong> will not generate ratings at C, 2B, 3B, or SS.</p>
        <p><strong>Rating</strong> is the player's maximum possible defensive rating for the given position.</p>
        <p><strong>WAR</strong> is the player's <i>estimated</i> full-season defensive WAR for the given position.</p>
      </div>
    </div>
  </div>
</form>

</template>

<script>
import RatingsScale from '@/components/Projections/RatingsScale.vue';
import Checkbox from '@/components/Checkbox.vue';
import { Fielder } from '../data-classes';

export default {
  name: 'PositionCalculator',
  components: { RatingsScale, Checkbox },
  data() {
    return {
      centimetres: false,
      saveEntry: false,
      htFt: '',
      htIn: '',
      htCm: '',
      player: { name: '', height: '' },
      display: [],
      players: [],
      error: '\xa0',
      editing: false,
      scale: {selected: '20 to 80'},
      positions: ['Catcher', 'First Base', 'Second Base', 'Third Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field']
    }
  },
  created() {
    document.title = 'Position Calculator | OOTP Calculator';
    let players = localStorage.getItem('fielding');
    if (players && players != 'undefined') {
      this.players = JSON.parse(players);
    }
  },
  mounted() {
    this.scale = this.$refs.scale;
    if (localStorage.getItem('use-centimetres') == 'true') {
      this.centimetres = true;
      this.$refs.checkCentimetres.select();
    }
    /*
    if (localStorage.getItem('save-entry') == 'true') {
      this.saveEntry = true;
      this.$refs.checkSaveEntry.select();
    }
    */
  },
  methods: {
    submit(event) {
      event.preventDefault();
      try {
        if ((this.htFt || this.htFt === 0) && (this.htIn || this.htIn === 0)) {
          this.player.height = 2.54 * (12 * this.htFt + +this.htIn);
        } else if (this.htCm) {
          this.player.height = +this.htCm;
        }
        let result = new Fielder(this.scale.selected, this.player, this.saveEntry);
        this.display = result.getDisplay(this.scale.selected);
        // this.clear();
        this.error = '\xa0';
        this.$analytics.logEvent(this.$instance, 'calculate-position');
      } catch (error) {
        this.error = '\xa0';
        setTimeout(() => this.error = error, 100);
      }
    },

    clear() {
      this.htFt = '';
      this.htIn = '';
      this.htCm = '';
      this.player = { name: '', height: '' };
      this.display = [];
      this.error = '\xa0';
    },

    clickCentimetres() {
      this.centimetres = !this.centimetres;
      localStorage.setItem('use-centimetres', this.centimetres.toString());
      this.$analytics.logEvent(this.$instance, `change-units`);
      let units = this.centimetres ? 'cm' : 'in';
      this.$analytics.logEvent(this.$instance, `units-${units}`);
    },

    clickSaveEntry() {
      this.saveEntry = !this.saveEntry;
      localStorage.setItem('save-entry', this.saveEntry.toString());
    },

    getRating(index) {
      let min = +(this.scale.selected.split(' to ')[0]);
      let display = this.display[index];
      if (display) {
        if (display.rating == 0) {
          return '-'
        }
        return Math.max(display.grade, min);
      }
      return '-';
    },

    getWAR(index) {
      let display = this.display[index];
      if (display) {
        if (display.rating == 0) {
          return '-'
        }
        return display.war.toFixed(1);
      }
      return '-';
    },

    getColor(index) {
      let display = this.display[index];
      if (display) {
        if (display.rating == 0) {
          return '-'
        }
        return display.color;
      }
      return '-';
    }
  }
}
</script>

<style>

.notes h3 {
  font-size: 1.25rem;
}

.notes p {
  font-size: .75rem;
  margin-bottom: 0;
  margin-top: .5rem;
}


</style>

<style scoped>

label {
  margin-top: -2px;
}

.notes {
  text-align: left;
  margin: auto;
  padding: 32px;
  max-width: 25rem;
}

td {
  width: 10rem;
}

.cell-double {
  display: flex;
}

.cell-double div {
  width: 50%;
}

.cell-double div input {
  width: 100% !important;
}

.collapsible {
  transition: all .2s;
  transition-property: max-height, opacity;
  max-height: 2rem;
  overflow: hidden;
}

.hidden .collapsible {
  max-height: 0;
  opacity: 0;
}

.hidden td, .hidden th {
  padding: 0;
  margin: 0;
}


th.empty {
  padding: 8px;
}

.column-split {
  width: 50%;
  padding: 0.5rem;
}

@media (max-width: 40rem) {
  .column-split {
    width: 100%; 
  }
  .row-flex.row-container {
    flex-direction: column;
  }
}

#table-output {
  max-width: 25rem;
  margin: auto;
}

#table-output td {
  padding: 5px 10px;
}

#table-output tr {
  border-bottom: 1px solid var(--color-transparent);
}

/*
#table-output tbody tr {
  background-color: rgba(0, 20, 41, 0.8);
}

#table-output tr:nth-child(even) {
  background-color: rgba(10, 30, 62, 0.7);
}
*/

</style>