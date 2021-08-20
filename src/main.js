import {createApp} from 'vue';
import vuetify from './plugins/vuetify';
import App from './App.vue';
import {createRouter, createWebHistory} from 'vue-router';
import MainMenu from '../vue/views/MainMenu.vue';
import Doodle from '../doodle/Doodle.vue';
import NewGame from '../vue/views/NewGame.vue';

const routes = [
    {path: '/', name: 'home', component: MainMenu},
    {path: '/new', name: 'new_game', component: NewGame},
    {path: '/sandbox', name: 'sandbox', component: Doodle},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount('#app');