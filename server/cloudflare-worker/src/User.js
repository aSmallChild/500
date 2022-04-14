export default class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.sessions = new Set();
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
        session.onClose(() => this.remove(session));
    }

    remove(session) {
        if (!this.sessions) return;
        this.sessions.delete(session);
    }

    close() {
        this.username = null;
        this.password = null;
        for (const session of this.sessions) {
            try {
                session.close();
            } catch (e) {
                console.error(e);
            }
        }
        this.sessions.clear();
        this.sessions = null;
    }

    emit(...args) {
        for (const session of this.sessions) {
            try {
                session.emit(...args);
            } catch (e) {
                console.error('User session failed to send message', e);
                this.sessions.delete(session);
            }
        }
    }

    toJSON() {
        return {
            userId: this.id,
            username: this.username,
            sessionCount: this.sessions.size,
        };
    }
}