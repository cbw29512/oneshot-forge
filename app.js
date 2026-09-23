const ADVENTURE_PACKS = {
  "the-lantern-below": "data/adventures/the-lantern-below.oneshot.json",
  "the-well-that-would-not-dry": "data/adventures/the-well-that-would-not-dry.oneshot.json",
  "the-watch-that-did-not-come-back": "data/adventures/the-watch-that-did-not-come-back.oneshot.json"
};
const DEFAULT_ADVENTURE = ADVENTURE_PACKS["the-lantern-below"];
const PACKAGE_PREFIX = "oneshot-forge:package:";
const STATE_PREFIX = "oneshot-forge:state:";
const LIBRARY_KEY = "oneshot-forge:library";
const LAST_ADVENTURE_KEY = "oneshot-forge:last-adventure";

let adventure = null;
let state = null;
let currentAdventureKey = "";
let selectedNpcId = null;
let rulesetPregens = null;

const el = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));

function safeGet(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function safeSet(key, value) {