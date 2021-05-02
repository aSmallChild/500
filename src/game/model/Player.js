export default class Player {
    constructor(name, client) {
        this.setClient(client);
        this.name = name.toLowerCase();
        this.position = null;
        this.isAdmin = false;
        this.partner = null;
    }

    setClient(client) {
        if (!client) return this.client = null;
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

    setPartner(partner) {
        if (partner === this) return;
        this.clearPartner();
        partner.partner = this;
        this.partner = partner;
    }

    clearPartner() {
        if (this.partner) {
            this.partner.partner = null;
        }
        this.partner = null;
    }
}