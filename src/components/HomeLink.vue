<template>
  <router-link class="home-link" :id="id" :to="'/' + id">
    <h1>{{label}}</h1>
    <p>{{description}}</p>
  </router-link>
</template>

<script>
export default {
  name: 'HomeLink',
  props: {
    id: String,
    label: String,
    description: String
  }
}
</script>

<style scoped>
.home-link {
  /* height: 90px; */
  color: white;
  text-decoration: none;
  border-radius: 1px;
  background-position: right;
  background-size: cover;
  padding: 8px 16px;
  text-align: left;
  width: 100%;
  max-width: 600px;
  border: 2px solid var(--color-gray);
  cursor: pointer;
  background-image: var(--gradient-primary);
  margin-top: 16px;
}

.home-link h1 {
  margin-bottom: 0.25rem;
}

.home-link p {
  margin-bottom: 0.5rem;
}

.home-link:hover {
  background-image: var(--gradient-primary-hover);
}

.home-link#batter-projections {
  background-image: url('/img/banner-batter-projections.svg');
}

.home-link#batter-projections:hover {
  background-image: url('/img/banner-batter-projections-hover.svg');
}

.home-link#position-calculator {
  background-image: url('/img/banner-position-calculator.svg');
}

.home-link#position-calculator:hover {
  background-image: url('/img/banner-position-calculator-hover.svg');
}
.home-link#pitcher-projections {
  background-image: url('/img/banner-pitcher-projections.svg');
}

.home-link#pitcher-projections:hover {
  background-image: url('/img/banner-pitcher-projections-hover.svg');
}

.home-link#about {
  background-image: url('/img/banner-about.svg');
}

.home-link#about:hover {
  background-image: url('/img/banner-about-hover.svg');
}
</style>