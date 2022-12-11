<template>
  <div class="checkbox" :class="{ selected, table }" @click="click()">&check;</div>
</template>

<script>
export default {
  name: 'Checkbox',
  props: {
    player: Object,
    table: Boolean
  },
  data() {
    return {
      selected: false
    }
  },
  methods: {
    click() {
      this.selected = !this.selected;
    },
    select() {
      this.selected = true;
    },
    unselect() {
      this.selected = false;
    },
    getPlayer() {
      return this.player;
    }
  }
}
</script>

<style>
.checkbox {
  height: 1.25rem;
  width: 1.25rem;
  border: 1px solid var(--color-gray);
  border-radius: 4px;
  margin: auto;
  cursor: default;
  background-color: var(--color-background);
  line-height: calc(1.25rem - 2px);
  font-weight: normal;
  color: transparent;
  user-select: none;
}

.checkbox:hover {
  border: 2px solid white;
  line-height: calc(1.25rem - 4px);
}

.checkbox.selected {
  background-color: var(--color-gray);
  color: black;
}

.checkbox.table {
  margin: 2px 8px 2px 24px;
}

.checkbox.table.selected {
  background-color: var(--color-secondary);
}
</style>