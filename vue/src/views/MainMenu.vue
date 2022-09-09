<script setup>
import {useRoute, useRouter} from 'vue-router';
import {NButton, NH1, NSpace} from 'naive-ui';

const router = useRouter();
const route = useRoute();
const pathNotFound = route.params.pathNotFound || null;
const menuItems = [];
for (const route of router.getRoutes()) {
  if (!route.meta?.menuOrder) continue;
  menuItems.push([route.meta.menuOrder, {name: route.name}, route.meta.title]);
}
menuItems.sort(([a], [b]) => a > b);
</script>

<template>
  <n-space justify="center" align="center" vertical class="main-menu full-height">
    <n-h1 strong>{{ pathNotFound ? 404 : 500 }}</n-h1>
    <router-link v-for="[order, route, title] of menuItems" :key="order" :to="route" custom v-slot="{ navigate }">
      <n-button block strong type="primary" @click="navigate" size="large">{{ title }}</n-button>
    </router-link>
  </n-space>
</template>

<style lang="scss">
.main-menu {
  text-align: center;

  & > * {
    width: 12rem;
  }
}
</style>