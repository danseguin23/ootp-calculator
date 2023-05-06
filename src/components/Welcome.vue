<template>
  <div id="welcome">
    <h1>New Year, New Me!</h1>
    <p>Okay, okay, I know it's May. But thanks to updated formulas and a fresh coat of paint, the OOTP Calculator is now ready to take on OOTP 24 saves.</p>
    <button class="button-submit welcome-submit" @click="$parent.closeWelcome()">Let's Go!</button>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style scoped>
#welcome {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-translucent-dark);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 20;
  padding-top: min(162px, 25vh);
  left: 0;
  top: 0;
}

#welcome p {
  max-width: 30rem;
  margin: auto;
  margin-bottom: 16px;
}
</style>