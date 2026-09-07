const assert = require('node:assert/strict');

global.window = {};
require('../src/amazon-schedule.js');

const schedule = window.amazonSchedule;
const referenceTime = new Date('2026-09-07T10:20:00.000Z');
const upcoming = schedule.getUpcomingEvents(referenceTime, 8);

assert.equal(schedule.meta.edition, 'Amazon / Steam');
assert.equal(schedule.meta.region, 'EU');
assert.equal(upcoming[0].name, 'Ascended Pakilo Naru / Ascended Nirma');
assert.equal(new Date(upcoming[0].time).toISOString(), '2026-09-07T11:00:00.000Z');
assert.ok(upcoming.some((event) => event.type === 'gigantrite'));
assert.ok(upcoming.some((event) => event.type === 'war'));
assert.equal(upcoming.find((event) => event.type === 'boss').category, 'boss');
assert.equal(upcoming.find((event) => event.type === 'gigantrite').category, 'event');

const world = schedule.getWorldStatus(referenceTime.getTime());
assert.equal(typeof world.dayNight.isDay, 'boolean');
assert.ok(world.dayNight.remaining > 0);
assert.ok(world.laslan.remaining > 0);
assert.ok(world.talandre.remaining > 0);

console.log('Amazon EU schedule tests passed.');
