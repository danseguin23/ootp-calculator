<template>
  <div class="home">
    <h1>Welcome to the OOTP Calculator!</h1>
    <p>This is the new and improved site, version 2.0 if you will. I hope you like it!</p>
    <h2>Position Calculator</h2>
    <p>You can use the <router-link to="/position-calculator">position calculator</router-link> to determine exactly how good your players could be at any position. This hasn't been updated since the old calculator, but new features will be coming soon!</p>
    <h2>Projections</h2>
    <p>The projection calculator is able to project full-season stats based on a batter or pitcher's current ratings.</p>
    <p>By popular demand, I have added batch projections! That means you can copy and paste ratings from the game, rather than typing them out one player at a time. You're welcome!</p>
    <p>Find batter projections <router-link to="/position-calculator">here</router-link>, or pitcher projections <router-link to="/position-calculator">here</router-link>.</p>
    <h2>Contact</h2>
    <p>If you have any issues with the site, have any suggestions, or just want to chat, feel free to reach out!</p>
    <p>You can shoot me an email, or find me on Twitter or Reddit. Links below!</p>
    <h2>Disclaimer</h2>
    <p>I am in no way affiliated with OOTP Developments. This website is by no means official - just a personal project of mine. I'm guessing I'm not infringing on any copyrights, but I'm really not sure. After all, I'm a programmer, not a lawyer.</p>
    <p>Markus, if you're reading this, please don't sue me. Also, hi.</p>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: { },
  created() {
    document.title = 'OOTP Calculator';
  }
}
</script>

<style>
h1 {
  margin-bottom: 16px;
}

h2 {
  margin-bottom: 12px;
}
</style>

<style scoped>
p {
  margin-bottom: 0.75rem !important;
  max-width: 36rem;
  margin: auto;
  font-size: 1rem;
}

h2 {
  margin-top: 1.5rem;
}

a {
  color: var(--color-secondary);
}

</style>