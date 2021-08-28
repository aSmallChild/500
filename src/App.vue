<template>
    <v-app>
        <v-main>
            <v-btn v-if="$router.currentRoute.value.fullPath !== '/'" color="secondary" @click="$router.push('/')">&lt; Back</v-btn>
            <router-view/>
        </v-main>
    </v-app>
</template>
<style lang="scss">@use "css/base";</style>
