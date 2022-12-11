import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import * as firebase from "firebase/app";
import * as analytics from 'firebase/analytics';
    
const firebaseConfig = {
  apiKey: "AIzaSyDrFuW8lkEtL0IO3IDR5u8anmdNPHQte2w",
  authDomain: "ootp-calculator-v2.firebaseapp.com",
  projectId: "ootp-calculator-v2",
  storageBucket: "ootp-calculator-v2.appspot.com",
  messagingSenderId: "317534093513",
  appId: "1:317534093513:web:df2b4218859e7de0d1cd18",
  measurementId: "G-ZJQL4XVE8L"
};


let firebaseApp = firebase.initializeApp(firebaseConfig);
let analyticsInstance = analytics.initializeAnalytics(firebaseApp)

let app = createApp(App)
app.config.globalProperties.$analytics = analytics;
app.config.globalProperties.$instance = analyticsInstance;
app.use(router).mount('#app');
