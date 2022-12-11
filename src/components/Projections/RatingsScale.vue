<template>
  <select id="scale" v-model="selected" @change="changeScale()">
    <option v-for="scale in scales" :key="scale">{{ scale }}</option>
  </select>
</template>

<script>
export default {
  name: 'RatingsScale',
  data() {
    return {
      scales: [
        '1 to 5',
        '2 to 8',
        '1 to 10',
        '1 to 20',
        '20 to 80',
        '1 to 100'
      ],
      selected: ''
    }
  },
  created() {
    this.selected = localStorage.getItem('scale') || '20 to 80';
  },
  methods: {
    changeScale() {
      localStorage.setItem('scale', this.selected);
      this.$analytics.logEvent(this.$instance, `change-scale`);
      this.$analytics.logEvent(this.$instance, `scale-${this.selected}`);
    }
  }
}
</script>

<style scoped>
#scale {
  text-align: center;
  height: 1.75rem;
  min-width: 10rem;
}

</style>