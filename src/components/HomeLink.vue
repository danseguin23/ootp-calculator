<template>
  <router-link class="home-link" :id="id" :to="'/' + id">
    <h1>{{label}}</h1>
    <p>{{description}}</p>
    <img :src="imgSrc">
  </router-link>
</template>

<script>
export default {
  name: 'HomeLink',
  props: {
    id: String,
    label: String,
    description: String,
    imgSrc: String
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
  position: relative;
}

.home-link:hover {
  background-image: var(--gradient-primary-hover);
}

.home-link img {
  position: absolute;
  height: 100%;
  top: 0;
  right: 0;
  pointer-events: none;
}

.home-link h1 {
  margin-bottom: 0.25rem;
}

.home-link p {
  margin-bottom: 0.5rem;
}
</style>