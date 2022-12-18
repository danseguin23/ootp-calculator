<template>
  <div id="welcome">
    <h1>Introducing: Projection Lists!</h1>
    <p>Now, you can separate your projections into different lists.</p>
    <p>Maybe you want a list for free agents? A list for draft prospects?<br>Different lists for different saves? The world is your oyster!</p>
    <button class="button-submit" @click="$parent.closeWelcome()">Let's Go!</button>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style>
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