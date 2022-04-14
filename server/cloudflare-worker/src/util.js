export function jsonRequest(request) {
    if (request.method != 'POST') {
        return [null, new Response('bad method', {status: 405})];
    }
    try {
        return [JSON.parse(request.body)];
    } catch (err) {
        return [null, new Response('bad json', 400)];
    }
}

export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}

export function getRandomLetters(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}