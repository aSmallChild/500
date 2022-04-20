export default async function createUser(host, lobbyId, lobbyPassword, username, userPassword) {
    const response = await fetch([host, 'lobby', lobbyId].join('/'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lobby: {
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