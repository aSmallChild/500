import {createApp} from 'vue';
import App from './App.vue';
import {createRouter, createWebHistory} from 'vue-router';
import MainMenu from './views/MainMenu.vue';
import JoinGame from './views/JoinGame.vue';
import Game from './views/Game.vue';

const routes = [
    {path: '/', name: 'home', component: MainMenu, meta: {menuOrder: false}},
    {path: '/new', name: 'game_new', component: JoinGame, props: {newGame: true}, meta: {menuOrder: 10, title: 'New'}},
    {path: '/join/:id?', name: 'game_join', component: JoinGame, meta: {menuOrder: 20, title: 'Join'}},
    {path: '/game/:id', name: 'game', component: Game},
    {path: '/circles', name: 'circles', component: () => import('./views/doodle/tablelayout.vue'), meta: {menuOrder: 30, title: 'Circles'}},
    {path: '/animation', name: 'animation', component: () => import('./views/doodle/animation.vue'), meta: {menuOrder: 30, title: 'Animations'}},
    {path: '/:pathNotFound(.*)*', name: 'not_found', component: MainMenu},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App).use(router).mount('div');