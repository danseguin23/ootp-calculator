<template>
  <div id="more-options" class="more-options" @blur="hide()">
    <div class="more-options-item" @click="edit()">
      <h3>Rename</h3>
      <img src="/img/edit.svg" alt="" width="12">
    </div>
    <div class="more-options-item options-delete" @click="remove()" :class="{ disabled: lastList }">
      <h3>Delete</h3>
      <img src="/img/delete.svg" alt="" width="12">
    </div>
  </div>
</template>

<script>
export default {
  name: 'MoreOptions',
  data() {
    return {
      options: null,
      lastList: false
    }
  },
  mounted() {
    this.options = document.getElementById('more-options');
    this.options.style.display = 'none';
    // this.show(0, 0);
  },
  methods: {
    show(x, y, lastList) {
      this.lastList = lastList;
      this.options.style.display = 'block';
      this.options.style.left = x + 'px';
      this.options.style.top = y + 'px';
    },

    hide() {
      this.options.style.display = 'none';
    },

    edit() {
      this.$parent.renameList();
    },

    remove() {
      this.$parent.deleteList();
    }
  }
}
</script>

<style scoped>
.more-options {
  position: absolute;
  background-color: var(--color-translucent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 8px;
  border: 1px solid black;
  z-index: 10;
}

.more-options-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.more-options-item:first-child {
  padding-top: 8px;
}
.more-options-item:last-child {
  padding-bottom: 8px;
}

.more-options-item:hover {
  background-color: var(--color-transparent);
}

.more-options-item h3 {
  font-size: 16px;
  margin: 0;
  padding-right: 16px;
}

.options-delete {
  color: var(--color-red);
}

.options-delete.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>