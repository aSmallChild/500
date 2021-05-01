export default class Player {
    constructor(name, client) {
        this.setClient(client);
        this.name = name;
        this.position = null;
        this.isAdmin = false;
    }

    setClient(client) {
        this.client = client;
        client.onDisconnect(() => this.client = null);
    }

    isConnected() {
        return !!this.client;
    }

    emit(actionName, actionData) {
        if (!this.isConnected()) return;
        this.client.emit(actionName, actionData);
    }
}