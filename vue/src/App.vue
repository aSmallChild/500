<template>
    <n-config-provider :theme="darkTheme" :theme-overrides="darkThemeOverrides">
        <n-theme-editor>
            <router-link to="/" v-if="$router.currentRoute.value.fullPath !== '/'">
                <n-button style="position: absolute; margin: 16px;">Menu</n-button>
            </router-link>
            <router-view/>
        </n-theme-editor>
        <n-global-style/>
    </n-config-provider>
</template>

<script setup>
import {NButton, NConfigProvider, NThemeEditor, NGlobalStyle} from 'naive-ui';
import {darkTheme} from 'naive-ui';
import darkThemeOverrides from './theme/dark.json';
</script>

<style lang="scss">
@use "css/base";
</style>