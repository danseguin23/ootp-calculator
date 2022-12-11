<template>
<div id="nav">
  <!--<router-link to="/">Home</router-link>-->
  <router-link to="/position-calculator">Position&nbsp;Calculator</router-link>
  <router-link to="/batter-projections">Batter&nbsp;Projections</router-link>
  <router-link to="/pitcher-projections">Pitcher&nbsp;Projections</router-link>
  <!--<a @click="changeTheme">Theme</a>-->
</div>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      scrollY: 0,
    }
  },
  methods: {
    changeTheme() {
      document.body.style.transition = '0.5s';
      let theme = localStorage.getItem('theme');
      if (theme == 'theme-light') {
        document.body.className = 'theme-dark';
        localStorage.setItem('theme', 'theme-dark');
      } else {
        document.body.className = "theme-light";
        localStorage.setItem('theme', 'theme-light');
      }
    }
  }
}
</script>

<style>

#nav {
  top: 0px;
  left: 0px;
  width: 100%;
  padding-top: 16px;
  margin-bottom: 16px;
  margin-top: 0px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

#nav a {
  font-weight: bold;
  padding: 8px 16px;
  text-decoration: none;
  font-size: 1.25rem;
  margin: 4px 4px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 1px;
  /*width: 12rem;*/
}

#nav a:not(.router-link-exact-active) {
  color: white;
  background-image: var(--gradient-primary);
  border: 2px solid var(--color-gray);
}

#nav a:hover {
  background-image: var(--gradient-primary-hover);
}

#nav a.router-link-exact-active {
  /*background-image: var(--gradient-primary-hover);*/
  color: white;
  pointer-events: none;
}

@media (max-width: 640px) {
  #nav a {
    width: 75%;
  }
}

</style>