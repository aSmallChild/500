<template>
    <div></div>
</template>

<script>
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import Client from '../../src/client/Client.js';

class GameChannel {

    setLastPassword(password) {
        return window.localStorage.setItem('last_game_password', password);
    }

    getLastPassword() {
        return window.localStorage.getItem('last_game_password');
    }

    async reconnect(channelName, channelKey) {
        const client = Client.client;
        const wasConnected = client.isConnected();
        const channel = client.getChannel(channelKey, channelName);
        if (!wasConnected) {
            const response = await channel.login(this.getLastPassword());
            if (!response.success) {
                return null;
            }
        }
        return channel;
    }
}

// connects to the server, and displays the current stage of the game
export default {
    setup() {
        const router = useRouter();
        const route = useRoute();
        const name = ref(route.params.id);
        const gameChannel = new GameChannel();

        const channelName = route.params.id;
        const channelKey = `game:${channelName}`;

        const redirectToJoin = () => {
            router.push('/join');
        };

        (async () => {
            try {
                const channel = await gameChannel.reconnect(channelName, channelKey);
                if (!channel) {
                    redirectToJoin();
                    return;
                }
                channel.on('game:stage', stage => {
                    console.log(`current stage: ${stage}`);
                });

                channel.join();
            } catch (err) {
                console.error(err);
                redirectToJoin();
            }
        })();

        return {name};
    },
};
</script>

<style scoped>

</style>