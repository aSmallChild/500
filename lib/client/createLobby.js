export default async function createLobby(host, lobbyType, lobbyPassword, username, userPassword) {
    const response = await fetch(host + '/lobby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lobby: {
                type: lobbyType,
                password: lobbyPassword,
            },
            user: {
                username: username,
                password: userPassword,
            },
        }),
    });
    return await response.json();
}