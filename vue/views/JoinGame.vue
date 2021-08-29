<template>
    <v-container class="menu">
        <v-row align="center" justify="center">
            <v-col>
                <div class="menu-buttons">
                    <!-- waiting for vuetify to be finished so v-text-field is available -->
                    <label class="wrapper">
                        <span>Game</span>
                        <input>
                    </label>
                    <label class="wrapper">
                        <span>Name</span>
                        <input>
                    </label>
                    <v-btn color="secondary">Join</v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<!--<script>-->
<!--import {ref} from 'vue';-->

<!--export default {-->
<!--    setup() {-->
<!--        const dog = ref('arara');-->

<!--        return {dog};-->
<!--    },-->
<!--};-->
<!--</script>-->

<style lang="scss" scoped>

label {
    display: block;
}

.wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 400px;
    font-size: 24px;
}

span, input {
    min-width: 100px;
    padding: 0 0.5rem;
}

span {
    text-align: center;
}

input {
    background: grey;
    flex: 1;
}

.menu {
    height: 100%;
    display: flex;
}

.menu-buttons {
    & > h1 {
        text-align: center;
    }

    & > * {
        margin: 10px auto;
        min-width: 200px;
        max-width: 300px;
        width: 50%;
    }

    & > .v-btn {
        display: block;
    }
}
</style>