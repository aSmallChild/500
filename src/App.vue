<template>
    <v-app>
        <v-btn v-if="$router.currentRoute.value.fullPath !== '/'" color="secondary" @click="$router.push('/')">&lt; Back</v-btn>
        <v-main>
            <router-view/>
        </v-main>
    </v-app>
</template>
<style lang="scss">@use "css/base";</style>
