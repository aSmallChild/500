import {Response} from 'node-fetch';

export function jsonResponse(data, status = 200) {
    data.success = status >= 200 && status < 300;
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}