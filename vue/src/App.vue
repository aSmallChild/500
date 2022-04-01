<template>
    <n-config-provider :theme="darkTheme">
        <n-theme-editor>
            <n-button v-if="$router.currentRoute.value.fullPath !== '/'"
                      type="secondary" @click="$router.push('/')"
                      style="position: absolute; margin: 16px;">
                Menu
            </n-button>
            <router-view/>
            <n-global-style/>
        </n-theme-editor>
    </n-config-provider>
</template>

<script setup>
import {NButton, NConfigProvider, NThemeEditor} from 'naive-ui';
import {darkTheme} from 'naive-ui';
</script>

<style lang="scss">
@use "css/base";
</style>