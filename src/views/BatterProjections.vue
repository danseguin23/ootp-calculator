<template>
  <projections type="batting" />
</template>

<script>
import Projections from '@/components/Projections.vue';

export default {
  name: 'BatterProjections',
  components: { Projections },
  created() {
    document.title = 'Batter Projections | OOTP Calculator';
  }
}
</script>

<style>

</style>