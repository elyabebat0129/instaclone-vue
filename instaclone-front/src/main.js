import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'
import router from './router'
import './assets/styles/theme.css'

const app = createApp(App)

// A aplicacao nasce em App.vue e recebe os plugins que todas as telas usam.
// Pinia cuida dos estados globais; Router cuida da navegacao entre views.
app.use(createPinia())
app.use(router)

// O Vue assume o controle da div #app que existe no index.html.
app.mount('#app')
