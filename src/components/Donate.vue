<template>
  <div id="donate">
    <h1>We are so back!</h1>
    <p>OOTP Calculator is back for OOTP 25! In addition to updating the site's visual appeal, I've also updated projection formulas.</p>
    <p>The OOTP Calculator is completely community funded! If you'd like to contribute, please consider donating below.</p>
    <p>Hope you enjoy the calculator! <br>- Dan</p>
    <br>
    <a @click="closeDonate(true)" class="button-donate" href="https://www.paypal.com/donate/?business=VF3BSSQ62ULEU&no_recurring=0&item_name=Your+donation+helps+me+keep+the+OOTP+Calculator+up+and+running.+Thanks%21&currency_code=USD" target="_blank">Support This Site!</a>
    <div class="sorry-container">
      <button @click="closeDonate(false)" class="sorry">Nah, just take me to the calculator</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  methods: {
    closeDonate(isDonate) {
      if (isDonate) {
        this.$analytics.logEvent(this.$instance, `donate-true`);
      } else {
        this.$analytics.logEvent(this.$instance, `donate-false`);
      }
      this.$parent.closeWelcome();
    }
  }
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
  max-width: 400px;
  margin: auto;
  margin-bottom: 16px;
}

/*
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
*/

.button-donate {
  margin: auto;
  padding: 7px 32px 8px 32px;
  margin-bottom: 0;
  margin-top: 120px !important;
  background: #FFD301;
  font-size: 1rem;
  font-family: PayPalSansSmall-Regular,Helvetica Neue,Arial,sans-serif;
  font-weight: 700;
  -webkit-font-smoothing: antialiased;
  color: #000;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border-radius: 25px;
  border: none;
  box-sizing: border-box;
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
  font-size: .875rem;
}

.sorry:hover {
  color: lightgray;
  cursor: pointer;
}
</style>