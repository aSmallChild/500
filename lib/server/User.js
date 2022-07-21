import SessionCollection from './SessionCollection.js';

export default class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.sessions = new SessionCollection();
    }

    get id() {
        return this.username.toLowerCase();
    }

    get connectionCount() {
        return this.sessions ? this.sessions.size : 0;
    }

    checkPassword(submittedPassword) {
        if (!this.password) {
            return true;
        }
        return this.password === submittedPassword;
    }

    add(session) {
        this.sessions.add(session);
    }

    close(...args) {
        this.username = null;
        this.password = null;
        for (const session of this.sessions) {
            try {
                session.close(...args);
            } catch (e) {
                console.error(e);
            }
        }
        this.sessions = null;
    }

    emit(...args) {
        this.sessions.emit(...args);
    }

    toJSON() {
        return {
            userId: this.id,
            username: this.username,
            connectionCount: this.connectionCount,
        };
    }
}