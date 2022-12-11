<template>
  <projections type="pitching" />
</template>

<script>
import Projections from '@/components/Projections.vue';

export default {
  name: 'PitcherProjections',
  components: { Projections },
  created() {
    document.title = 'Pitcher Projections | OOTP Calculator';
  }
}
</script>

<style>

</style>