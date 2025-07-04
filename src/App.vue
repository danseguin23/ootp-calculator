<template>
  <!--<Donate v-if="1" />-->
  <Donate v-if="welcome" />
  <div id="header">
    <router-link to="/">OOTP CALCULATOR</router-link>
  </div>
  <navbar v-if="!home"/>
  <div class="container content">
    <router-view/>
  </div>
  <AppFooter />
</template>
<script>
import Navbar from './components/Navbar.vue';
import Donate from './components/Donate.vue';
import AppFooter from './components/AppFooter.vue';
import Welcome from './components/Welcome.vue';

export default {
  name: 'App',
  components: { Navbar, Donate, AppFooter, Welcome },
  data() {
    return {
      welcome: false
    }
  },
  computed: {
    home() {
      return this.$route.path == '/';
    }
  },
  created() {
    let today = new Date();
    let expire = new Date('2024-06-31');
    let donate = localStorage.getItem('fresh-25') === 'true';
    let welcome = false;
    if (welcome && !donate && today < expire) {
      this.welcome = true;
    } else {
      this.welcome = false;
    }
    document.body.className = 'theme-dark';
  },
  methods: {
    closeWelcome() {
      this.welcome = false;
      localStorage.setItem('fresh-25', 'true');
    }
  }
}
</script>
<style>

/* For themes */

body {
  position: relative;
  --font-sans: 'Barlow Condensed', 'Tahoma', sans-serif;
  --font-mono: 'Source Code Pro', monospace;
  --color-primary: #1d6a7b;
  --color-secondary: #b62e3a;
  --color-primary-lighter: #1d8b92;
  --color-primary-darker: #1d556c;
  --color-secondary-lighter: #f1414f;
  --color-secondary-darker: #9c0720;
  --color-contrast: #c41230;
  --color-gray: #ccc;
  --color-dark: #010609;
  --color-translucent: rgba(12, 12, 20, 0.8);
  --color-translucent-dark: rgba(12, 12, 20, 0.8);

  --gradient-primary: linear-gradient(var(--color-primary-lighter), var(--color-primary));
  --gradient-primary-vertical: linear-gradient(var(--color-primary), var(--color-primary));
  --gradient-primary-hover: linear-gradient(var(--color-primary-darker), var(--color-primary));
  --gradient-secondary: linear-gradient(var(--color-secondary-lighter), var(--color-secondary));
  --gradient-secondary-hover: linear-gradient(var(--color-secondary-darker), var(--color-secondary));
  --gradient-tertiary: linear-gradient(#d1d1d1, #bfbfbf);
  --gradient-tertiary-hover: linear-gradient(#ababab, #bfbfbf);
}

/*
body.theme-light {
  --color-background: #fff;
  --color-text: var(--color-dark);
  --color-primary-text: var(--color-primary);
  --color-secondary-text: var(--color-secondary);
  --color-transparent: rgba(0, 0, 0, 0.081);
  --color-opaque: #949494;
  --color-highlight: #233142;
  --color-red: #E91639;
}
*/

body.theme-dark {
  --color-text: #fff;
  --color-text-secondary: #fff;
  --color-highlight: #d7d7d7;
  --color-opaque: #949494;
  /*
  --color-background: var(--color-dark);
  --color-primary-text: #347AB7;
  --color-secondary-text: #E91639;
  --color-transparent: rgba(255, 255, 255, 0.064);
  --color-red: #EC3251;
  */
  /*
  --color-primary: #488ECB;
  --color-secondary: #EF4E68;
  */
  background-image: url('/img/background-26.png');
  background-attachment: fixed;
  background-position-x: center;
  background-position-y: top;
}

body {
  background-color: #01080a;
  color: var(--color-text);
}

#app {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 1.125rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#footer {
  background-color: var(--color-translucent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 12px;
  margin-bottom: 36px;
  text-align: center;
}

#footer h4 {
  font-size: 18px;
}

#contact {
  display: flex;
  justify-content: center;
}

#contact a {
  margin: 0px 12px;
}

.content {
  /*max-width: 1080px;*/
  max-width: 67.5rem;
  margin: auto;
  margin-bottom: 3rem;
}

h1, h2, h3 {
  text-transform: uppercase;
  font-weight: 600;
}

input, select, textarea {
  border: 1px solid var(--color-opaque);
  border-radius: 4px;
  color: var(--color-text);
  background-color: var(--color-translucent);
  padding: 0px 8px;
  transition: background-color 0.5s;
}

textarea {
  width: 100%;
}

option {
  color: white;
  font-size: 1rem;
}

/* Buttons */

.button-submit, .button-help, .button-clear {
  font-weight: 600;
  border: none;
  padding: 2px 10px;
  margin: 8px 4px !important;
  transition: .1s;
  border-radius: 5px;
  text-transform: uppercase;
  transition: background-image .2s;
  border: 2px solid black;
}

.welcome-submit {
  background-image: var(--gradient-primary) !important;
  color: white !important;
}

.welcome-submit:hover {
  background-image: var(--gradient-primary-hover) !important;
}

.button-help {
  color: white;
  /*background-color: var(--color-primary);*/
  background-image: var(--gradient-primary);
}

.button-help:hover {
  background-image: var(--gradient-primary-hover);
}

.button-submit {
  color: var(--color-text-secondary);
  background-image: var(--gradient-secondary);
}

/*
.button-submit:hover {
  background-image: var(--gradient-secondary-hover);
}
*/

.button-submit:disabled, .button-clear:disabled {
  opacity: 0.5;
}

.button-submit:hover:not(:disabled) {
  background-image: var(--gradient-secondary-hover);
}

.button-clear {
  color: black;
  background-image: var(--gradient-tertiary);
}

.button-clear:hover:not(:disabled) {
  background-image: var(--gradient-tertiary-hover);
}

/* Other stuff */

.error {
  color: var(--color-red);
  margin-top: -12px;
  font-weight: 500;
}


</style>

<style scoped>
#header {
  background-color: var(--color-translucent);
  padding: 6px 0;
}

#header a {
  padding: 12px 48px;
  font-weight: bold;
  color: white;
  font-style: italic;
  text-decoration: none;
  font-size: 2.5rem;
  text-shadow: 1px 1px #4a4a4a;
}

#header a:hover {
  background-image: var(--gradient-primary-hover);
}

.h4 {
  margin-bottom: .25rem;
}

</style>