export default class Timer {
    constructor() {
        this.reset();
    }

    start() {
        this.startTime = Date.now();
        this.endTime = null;
    }

    stop() {
        this.endTime = Date.now();
        return this.getDurationMs();
    }

    reset() {
        this.startTime = null;
        this.endTime = null;
    }

    resume() {
        if (!this.startTime) return this.start();
        this.endTime = null;
    }

    getDurationMs() {
        if (!this.startTime) return 0;
        return (this.endTime || Date.now()) - this.startTime;
    }
}