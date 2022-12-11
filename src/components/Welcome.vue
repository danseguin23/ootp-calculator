<template>
  <div id="welcome">
    <h1>Welcome to the new OOTP Calculator!</h1>
    <p>In addition to a visual overhaul, I've updated formulas and added some new features. Most notably: batch projections! Be sure to try that out!</p>
    <p>If you find any issues with the site or have any comments you want to share, please reach out! Contact info is in the site footer.</p>
    <button class="button-submit" @click="$parent.closeWelcome()">Let's Go!</button>
  </div>
</template>

<script>
export default {
}
</script>

<style>
#welcome {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1;
  padding-top: min(162px, 25vh);
}

#welcome p {
  max-width: 30rem;
  margin: auto;
  margin-bottom: 16px;
}
</style>