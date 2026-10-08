const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

let store = {};
const sandbox = {
  localStorage: {
    getItem: k => Object.prototype.hasOwnProperty.call(store,k) ? store[k] : null,
    setItem: (k,v) => { store[k] = String(v); }
  },
  window: {
    dispatchEvent: () => {},
    addEventListener: () => {}
  },
  CustomEvent: function(name, init) { this.name=name; this.detail=init && init.detail; },
  Date, JSON, Math, String, Number, Object, Array, RegExp, console
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("nori-core.js","utf8"), sandbox);

const n = sandbox.window.NoriEngine;
assert(n && n.version === "2.0.0-handbook");
let planned = n.plan([{task:"Math U4",subject:"Math",duration:45},{task:"Instagram",subject:""}]);
assert.strictEqual(planned[0].task, "Math U4");
assert(n.startBlock(planned[0].id));
assert(n.endBlock(planned[0].id,{completed:true}));
assert(n.snapshot().merit >= 2);

const investigation = n.recommendConsequence("I opened Instagram during my study block");
assert.strictEqual(investigation.cause, "distraction");
assert.strictEqual(investigation.degreeChange, 0);
assert.strictEqual(investigation.humanOverrideAvailable, true);

const recovery = n.recover("too tired to study safely");
assert.strictEqual(recovery.active, true);
assert.strictEqual(n.snapshot().degree, 0);

console.log("Nori Mentor Engine smoke test: PASS");
