// superBoolean.js

class SuperBoolean {
    constructor(value) {
        this.value = !!value;
    }

    and(other) {
        this.value = this.value && !!other;
        return this;
    }

    or(other) {
        this.value = this.value || !!other;
        return this;
    }

    not() {
        this.value = !this.value;
        return this;
    }

    is(other) {
        this.value = this.value === !!other;
        return this;
    }

    isnt(other) {
        this.value = this.value !== !!other;
        return this;
    }

    getValue() {
        return this.value;
    }

    PleaseJustGiveMeTheValue() {
        return this.value;
    }

    toString() {
        return this.value.toString();
    }
}

module.exports = SuperBoolean;