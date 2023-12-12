/* 2022 Chelsea and Rachel Co. chelseaandrachel.com */

class CnRDeferredDOMAction {
    constructor(condition,callback,attempts=50,timeout=500) {
        this.condition = condition;
        this.callback = callback;
        this.max_attempts = attempts;
        this.attempts = 0;
        this.interval_id = window.setInterval(()=>{
            if (this.condition()) {
                this.callback();
                this.bailout();
            } else {
                this.attempts++;
                if (this.attempts>=this.max_attempts) {
                    this.bailout();
                }
            }
        },timeout);
    }
    bailout() {
        window.clearInterval(this.interval_id);
    }
}