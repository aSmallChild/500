export async function jsonRequest(request) {
    if (request.method != 'POST') {
        return [null, jsonResponse({message: 'bad method'}, 405)];
    }
    try {
        return [await request.json()];
    } catch (err) {
        return [null, jsonResponse({message: 'bad json'}, 400)];
    }
}

export function jsonResponse(data, status = 200) {
    data.success = status >= 200 && status < 300;
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