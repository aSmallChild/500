<script setup>
import {darkTheme, NButton, NConfigProvider, NGlobalStyle} from 'naive-ui';
import darkThemeOverrides from './theme/dark.json';
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="darkThemeOverrides">
    <router-link to="/" v-if="$router.currentRoute.value.fullPath !== '/'" custom v-slot="{navigate}">
      <n-button style="position: absolute; margin: 16px;" @click="navigate">Menu</n-button>
    </router-link>
    <router-view/>
    <n-global-style/>
  </n-config-provider>
</template>

<style lang="scss">
@use "css/base";
</style>