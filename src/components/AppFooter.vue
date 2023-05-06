<template>
  <div id="footer">
    <!--<h4>Contact</h4>-->
    <div id="contact">
      <a href="mailto:danielseguin23@gmail.com?subject=OOTP Calculator" target="_blank"><img src="/img/mail.svg" alt="Email" width="24"></a>
      <a href="https://twitter.com/danseguin23" target="_blank"><img src="/img/twitter.svg" alt="Twitter" width="24"></a>
      <!--<a href="https://www.reddit.com/message/compose?to=dangraphs&subject=OOTP%20Calculator" target="_blank"><img src="/img/reddit.svg" alt="Reddit" width="24"></a>-->
      <!--<a href="https://discord.com/users/dangraphs#0191" target="_blank"><img src="/img/discord.svg" alt="Discord" width="24"></a>-->
      <a href="https://github.com/danseguin23/ootp-calculator" target="_blank"><img src="/img/github.svg" alt="GitHub" width="24"></a>
    </div>
    <div class="container-donate">
      <a class="button-donate" href="https://www.paypal.com/donate/?business=VF3BSSQ62ULEU&no_recurring=0&item_name=Your+donation+helps+me+keep+the+OOTP+Calculator+up+and+running.+Thanks%21&currency_code=USD" target="_blank">Support This Site</a>
    </div>
  </div>
  <div id="copy">
    &copy; 2023 Daniel C. Seguin
  </div>
</template>

<script>

export default {
  name: 'AppFooter'
}

</script>

<style scoped>

#contact {
  margin-top: 8px;
}
.container-donate {
  margin-top: 18px;
}

.button-donate {
  margin: auto;
  padding: 3px 16px 4px 16px;
  margin-bottom: 0;
  margin-top: 120px !important;
  background: #FFD301;
  font-size: 0.875rem;
  font-family: PayPalSansSmall-Regular,Helvetica Neue,Arial,sans-serif;
  font-weight: 700;
  line-height: 22px;
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
}

#copy {
  background-color: var(--color-translucent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 6px 0;
  position: fixed;
  bottom: 0px;
  width: 100%;
  font-size: 16px;
}
</style>