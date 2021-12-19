import {createApp} from 'vue';
import vuetify from './plugins/vuetify';
import App from './App.vue';
import {createRouter, createWebHistory} from 'vue-router';
import MainMenu from '../vue/views/MainMenu.vue';
import Doodle from '../doodle/Doodle.vue';
import JoinGame from '../vue/views/JoinGame.vue';
import Game from '../vue/views/Game.vue';

const routes = [
    {path: '/', name: 'home', component: MainMenu},
    {path: '/new', name: 'game_new', component: JoinGame, props: {newGame: true}},
    {path: '/join/:id?', name: 'game_join', component: JoinGame},
    {path: '/game/:id', name: 'game', component: Game},
    {path: '/sandbox/:id?', name: 'sandbox', component: Doodle},
    {path: '/:pathNotFound(.*)*', name: 'not_found', component: MainMenu},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount('#app');