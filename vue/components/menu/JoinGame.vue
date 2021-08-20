<template>
    <div class="wrapper">
        <!--        <v-text-field label="Code"></v-text-field>-->
        <input type="text" placeholder="Code" class="v-btn--size-default"/>
        <v-btn color="secondary">Join</v-btn>
    </div>
</template>

<script>
export default {
    name: 'JoinGame',
};
</script>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
}

input {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background: grey;
    flex: 1;
    min-width: 100px;
    padding: 0 1em;
}

.v-btn {
    width: 100px;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
}
</style>