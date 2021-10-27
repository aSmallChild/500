export default class Player {
    constructor(name, client) {
        this.client = client;
        this.name = name;
        this.position = null;
        this.isAdmin = false;
        this.partner = null; // todo should be team
    }

    get id() {
        return this.client.id;
    }

    emit(actionName, actionData) {
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

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            clientId: this.client.id,
            position: this.position,
            isAdmin: this.isAdmin,
            partner: this.partner?.position
        };
    }
}