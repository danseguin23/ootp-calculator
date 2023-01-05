<template>
  <div id="donate">
    <h1>Hey you!</h1>
    <p>The OOTP Calculator domain is up for its yearly renewal, so I am once again asking for your financial support.</p>
    <p>To date, I've been funding the site mostly from my own pocket, so I'm hoping you could spare a few bucks. Every little bit is greatly appreciated!</p>
    <p>Cheers,<br>Dan</p>
    <a @click="$parent.closeWelcome()" class="button-donate" href="https://www.paypal.com/donate/?business=VF3BSSQ62ULEU&no_recurring=0&item_name=Your+donation+helps+me+keep+the+OOTP+Calculator+up+and+running.+Thanks%21&currency_code=USD" target="_blank">Donate</a>
    <div class="sorry-container">
      <button @click="$parent.closeWelcome()" class="sorry">Sorry, I'm broke too</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style scoped>
#donate {
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

#donate p {
  max-width: 456px;
  margin: auto;
  margin-bottom: 16px;
}

.button-donate {
  margin: auto;
  padding: 10px 30px;
  margin-top: 12px;
  background: #FFD301;
  font-size: 18px;
  font-family: PayPalSansSmall-Regular,Helvetica Neue,Arial,sans-serif;
  font-weight: 700;
  line-height: 24px;
  -webkit-font-smoothing: antialiased;
  color: #000;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border-radius: 24px;
  border: 2px solid #FFD301;
  box-sizing: border-box;
  display: inline-block;
  width: min(456px, 90vw);
}

.button-donate:hover {
  background: #E6BF00;
  color: #000;
}

.sorry-container {
  width: 100%;
  margin: 0;
}

.sorry {
  display: inline-block;
  margin: auto;
  color: white;
  text-decoration: underline;
  margin-top: 10px;
  background: none;
  border: 0;
  font-size: 1rem;
}

.sorry:hover {
  color: lightgray;
  cursor: pointer;
}
</style>