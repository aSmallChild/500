<template>
    <v-app>
        <v-main>
            <v-btn v-if="$router.currentRoute.value.fullPath !== '/'"
                   color="secondary" @click="$router.push('/')"
                   style="position: absolute; margin: 16px;">
                Menu
            </v-btn>
            <router-view/>
        </v-main>
    </v-app>
</template>
<style lang="scss">
@use "css/base";

html {
    overflow-y: auto; // something in vuetify is setting this to scroll which forces the scrollbar to show
}
</style>
