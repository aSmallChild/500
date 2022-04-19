export default class SessionCollection {
    #sessions;

    constructor() {
        this.#sessions = new Set();
    }

    [Symbol.iterator]() {
        return this.sessions[Symbol.iterator]();
    }

    get size() {
        return this.#sessions.size;
    }

    emit(...args) {
        for (const session of this.#sessions) {
            session.emit(...args);
        }
    }

    #addSingle(session) {
        if (this.#sessions.has(session)) return false;
        this.#sessions.add(session);
        session.onClose(() => this.#sessions.delete(session));
        return true;
    }

    #addMultiple(sessions) {
        for (const session of sessions) {
            this.#addSingle(session);
        }
        return true;
    }

    add(session) {
        if (session instanceof this.constructor) return this.#addMultiple(session.#sessions)
        if (session instanceof Set || session instanceof Array) return this.#addMultiple(session);
        return this.#addSingle(session);
    }
}