<template>
    <div></div>
</template>

<script>
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import ClientChannel from '../../src/client/ClientChannel.js';

// connects to the server, and displays the current stage of the game
export default {
    setup() {
        const router = useRouter();
        const route = useRoute();
        const name = ref(route.params.id);

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const redirectBack = () => router.push('/');

        (async () => {
            try {
                const [channel, response] = await ClientChannel.reconnect(channelKey);
                if (!response.success) {
                    console.error(response);
                    redirectBack();
                    return;
                }
                name.value = channel.name;
                channel.on('game:stage', stage => {
                    console.log(`current stage: ${stage}`);
                });

                channel.join();
            } catch (err) {
                console.error(err);
                redirectBack();
            }
        })();

        return {name};
    },
};
</script>

<style scoped>

</style>