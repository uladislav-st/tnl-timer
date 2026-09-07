(function () {
  const MINUTE = 60 * 1000;
  const DAY = 24 * 60 * MINUTE;
  const REGION_TIME_ZONE = 'Europe/Berlin';

  const meta = {
    edition: 'Amazon / Steam', region: 'EU', timeZone: REGION_TIME_ZONE,
    verifiedAt: '2026-09-07', provider: 'Встроенное расписание T4'
  };

  const bossNames = {
    thuban: 'Thuban', porfos: 'Porfos', adentus_asc: 'Ascended Adentus',
    pakilo_naru_asc: 'Ascended Pakilo Naru', nirma_asc: 'Ascended Nirma',
    daigon_asc: 'Ascended Daigon', ahzreil_asc: 'Ascended Ahzreil',
    leviathan_asc: 'Ascended Leviathan', excavator9_asc: 'Ascended Excavator-9',
    manticus_asc: 'Ascended Manticus', minezerok_asc: 'Ascended Minezerok',
    junobote_asc: 'Ascended Junobote', morokai_asc: 'Ascended Morokai',
    cornelius_asc: 'Ascended Cornelius', chernobog_asc: 'Ascended Chernobog',
    aridus_asc: 'Ascended Aridus', kowazan_asc: 'Ascended Kowazan',
    malakar_asc: 'Ascended Malakar', talus_asc: 'Ascended Talus',
    grand_aelon_asc: 'Ascended Grand Aelon', whale: 'Gigantrite',
    gigantrite: 'Gigantrite', boonstone: 'Boonstone', riftstone: 'Riftstone',
    'best way': 'Best Way to Prevent the Worst', peipor: 'Peipor Harvest Festival',
    tree: 'Passage Ceremony of the Great Tree', obsidian: 'Obsidian Acquisition Operation',
    blizzard: 'Blizzard Seal'
  };

  const fallbackData = {
    _bossIds: Object.fromEntries(Object.entries(bossNames).map(([id, name]) => [name, id])),
    rotationSchedule: {
      t4Start: '2026-06-25',
      t4Anchors: [
        { effectiveDate: '2026-06-25', cycleDay: 1 },
        { effectiveDate: '2026-07-30', cycleDay: 1 },
        { effectiveDate: '2026-08-13', cycleDay: 1 }
      ],
      tiers: {
        t4: {
          cycleDays: 14,
          slots: {
            ct_0000: '00:00', ct_0100: '01:00', ct_0200: '02:00', ct_0300: '03:00',
            ct_0500: '05:00', ct_0600: '06:00', ct_0800: '08:00', ct_0900: '09:00',
            ct_1100: '11:00', ct_1200: '12:00', ct_1300: '13:00', ct_1400: '14:00',
            ct_1500: '15:00', ct_1600: '16:00', ct_1700: '17:00', ct_1900: '19:00',
            ct_2000: '20:00', ct_2030: '20:30', ct_2100: '21:00', ct_2200: '22:00',
            ct_2300: '23:00', ct_2330: '23:30'
          },
          days: {
            1: { ct_1300: 'thuban | adentus_asc', ct_1600: 'pakilo_naru_asc | nirma_asc', ct_2000: 'daigon_asc | ahzreil_asc', ct_2030: 'daigon_asc !gpvp', ct_2300: 'leviathan_asc | excavator9_asc', ct_2330: 'leviathan_asc !gpvp', ct_0100: 'manticus_asc | minezerok_asc' },
            2: { ct_1300: 'porfos | junobote_asc', ct_1600: 'pakilo_naru_asc | morokai_asc', ct_2030: 'manticus_asc !gpvp', ct_2200: 'manticus_asc | cornelius_asc', ct_2300: 'thuban | adentus_asc', ct_2330: 'thuban !gpvp', ct_0100: 'porfos | chernobog_asc' },
            3: { ct_1300: 'leviathan_asc | ahzreil_asc', ct_1600: 'thuban | aridus_asc', ct_2030: 'daigon_asc !gpvp', ct_2200: 'daigon_asc | malakar_asc', ct_2300: 'porfos | kowazan_asc', ct_2330: 'porfos !gpvp', ct_0100: 'thuban | talus_asc' },
            4: { ct_1300: 'daigon_asc | grand_aelon_asc', ct_1600: 'porfos | adentus_asc', ct_2000: 'pakilo_naru_asc | nirma_asc', ct_2030: 'pakilo_naru_asc !gpvp', ct_2300: 'thuban | ahzreil_asc', ct_2330: 'thuban !gpvp', ct_0100: 'daigon_asc | excavator9_asc' },
            5: { ct_1300: 'pakilo_naru_asc | minezerok_asc', ct_1600: 'leviathan_asc | junobote_asc', ct_2000: 'manticus_asc | morokai_asc', ct_2030: 'manticus_asc !gpvp', ct_2300: 'daigon_asc | cornelius_asc', ct_2330: 'daigon_asc !gpvp', ct_0100: 'pakilo_naru_asc | adentus_asc' },
            6: { ct_1300: 'porfos | chernobog_asc', ct_1600: 'daigon_asc | ahzreil_asc', ct_2030: 'leviathan_asc !gpvp', ct_2200: 'leviathan_asc | aridus_asc', ct_2300: 'thuban | malakar_asc', ct_2330: 'thuban !gpvp', ct_0100: 'pakilo_naru_asc | kowazan_asc' },
            7: { ct_1300: 'manticus_asc | talus_asc', ct_1600: 'leviathan_asc | grand_aelon_asc', ct_2030: 'manticus_asc !gpvp', ct_2200: 'manticus_asc | adentus_asc', ct_2300: 'pakilo_naru_asc | nirma_asc', ct_2330: 'pakilo_naru_asc !gpvp', ct_0100: 'porfos | ahzreil_asc' },
            8: { ct_1300: 'pakilo_naru_asc | excavator9_asc', ct_1600: 'manticus_asc | minezerok_asc', ct_2000: 'leviathan_asc | junobote_asc', ct_2030: 'leviathan_asc !gpvp', ct_2300: 'daigon_asc | morokai_asc', ct_2330: 'daigon_asc !gpvp', ct_0100: 'manticus_asc | cornelius_asc' },
            9: { ct_1300: 'thuban | adentus_asc', ct_1600: 'leviathan_asc | chernobog_asc', ct_2030: 'pakilo_naru_asc !gpvp', ct_2200: 'pakilo_naru_asc | ahzreil_asc', ct_2300: 'porfos | aridus_asc', ct_2330: 'porfos !gpvp', ct_0100: 'thuban | malakar_asc' },
            10: { ct_1300: 'daigon_asc | kowazan_asc', ct_1600: 'porfos | talus_asc', ct_2030: 'manticus_asc !gpvp', ct_2200: 'manticus_asc | grand_aelon_asc', ct_2300: 'thuban | adentus_asc', ct_2330: 'thuban !gpvp', ct_0100: 'porfos | nirma_asc' },
            11: { ct_1300: 'daigon_asc | ahzreil_asc', ct_1600: 'thuban | excavator9_asc', ct_2000: 'leviathan_asc | minezerok_asc', ct_2030: 'manticus_asc !gpvp', ct_2300: 'porfos | junobote_asc', ct_2330: 'porfos !gpvp', ct_0100: 'daigon_asc | adentus_asc' },
            12: { ct_1300: 'pakilo_naru_asc | nirma_asc', ct_1600: 'leviathan_asc | ahzreil_asc', ct_2000: 'daigon_asc | excavator9_asc', ct_2030: 'daigon_asc !gpvp', ct_2300: 'manticus_asc | minezerok_asc', ct_2330: 'manticus_asc !gpvp', ct_0100: 'leviathan_asc | junobote_asc' },
            13: { ct_1300: 'thuban | morokai_asc', ct_1600: 'daigon_asc | cornelius_asc', ct_2030: 'pakilo_naru_asc !gpvp', ct_2200: 'pakilo_naru_asc | adentus_asc', ct_2300: 'porfos | chernobog_asc', ct_2330: 'porfos !gpvp', ct_0100: 'manticus_asc | ahzreil_asc' },
            14: { ct_1300: 'leviathan_asc | aridus_asc', ct_1600: 'manticus_asc | malakar_asc', ct_2030: 'pakilo_naru_asc !gpvp', ct_2200: 'pakilo_naru_asc | kowazan_asc', ct_2300: 'leviathan_asc | talus_asc', ct_2330: 'leviathan_asc !gpvp', ct_0100: 'manticus_asc | grand_aelon_asc' }
          },
          extras: {},
          daily: { ct_0200: 'gigantrite', ct_0500: 'gigantrite', ct_0800: 'gigantrite', ct_1100: 'gigantrite', ct_1400: 'gigantrite', ct_1700: 'gigantrite' }
        }
      },
      dateExtras: {}
    }
  };

  const rainStarts = {
    default: [30, 60, 120, 180, 270, 360, 390, 420, 510, 570, 600, 660, 690, 780, 810, 870, 930, 960, 990, 1110, 1170, 1290, 1350, 1380, 1500, 1590, 1650, 1710, 1860, 1890, 1920, 2190, 2250, 2280, 2370, 2610, 2640, 2790, 2820, 2880, 3000, 3030, 3090, 3300, 3330, 3510, 3630, 3690, 3720, 3810, 3840, 3870, 3930, 3990, 4020, 4080, 4170, 4260, 4350, 4440],
    talandre: [90, 390, 750, 1020, 1050, 1170, 1320, 1590, 1650, 2220, 2790, 2910, 2970, 3030, 3240, 3690, 4050, 4140, 4230, 4260, 4410]
  };
  const rainAnchor = Date.parse('2024-09-30T09:45:00.000Z');
  const rainCycleDuration = 4500 * MINUTE;
  let scheduleData = fallbackData;
  let idToName = { ...bossNames };

  function mod(value, divider) { return ((value % divider) + divider) % divider; }
  function dateNumber(parts) { return Date.UTC(parts.year, parts.month - 1, parts.day); }
  function dateKey(parts) { return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`; }

  function zonedParts(date) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: REGION_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const result = {};
    for (const part of parts) if (part.type !== 'literal') result[part.type] = Number(part.value);
    return result;
  }

  function zonedTimeToUtc(year, month, day, hour, minute) {
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    let guess = wanted;
    for (let index = 0; index < 2; index += 1) {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: REGION_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(guess));
      const values = {};
      for (const part of parts) if (part.type !== 'literal') values[part.type] = Number(part.value);
      guess += wanted - Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute);
    }
    return guess;
  }

  function dateAtOffset(baseDay, offset) {
    const value = new Date(baseDay + offset * DAY);
    return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
  }

  function cycleDay(parts) {
    const rotation = scheduleData.rotationSchedule;
    const anchors = (rotation.t4Anchors || [{ effectiveDate: rotation.t4Start, cycleDay: 1 }]).filter((anchor) => anchor.effectiveDate <= dateKey(parts));
    const anchor = anchors.at(-1) || { effectiveDate: rotation.t4Start, cycleDay: 1 };
    const [year, month, day] = anchor.effectiveDate.split('-').map(Number);
    const elapsed = Math.floor((dateNumber(parts) - Date.UTC(year, month - 1, day)) / DAY);
    const total = rotation.tiers.t4.cycleDays || 14;
    return mod(anchor.cycleDay - 1 + elapsed, total) + 1;
  }

  function resolveName(token) {
    const clean = token.replace(/!gpvp.*$/i, '').replace(/!dpvp.*$/i, '').trim();
    return idToName[clean] || clean.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function parseItems(raw) { return raw.split('|').map(resolveName).filter(Boolean).join(' / '); }

  function appendRows(events, rows, slots, displayDate, now, source, estimated = false) {
    if (!rows) return;
    for (const [slot, raw] of Object.entries(rows)) {
      const time = slots[slot];
      if (!time || !raw) continue;
      const [hour, minute] = time.split(':').map(Number);
      const timestamp = zonedTimeToUtc(displayDate.year, displayDate.month, displayDate.day, hour, minute);
      if (timestamp <= now.getTime()) continue;
      const isPvp = /!gpvp|!dpvp/i.test(raw);
      events.push({
        id: `${source}-${timestamp}-${slot}`, name: parseItems(raw), time: timestamp,
        type: isPvp ? 'war' : (raw.includes('gigantrite') || raw.includes('whale') ? 'gigantrite' : source === 'amazon-extra' ? 'dynamic' : 'boss'),
        source: 'amazon', estimated
      });
    }
  }

  function getUpcomingEvents(now = new Date(), limit = 20) {
    const rotation = scheduleData.rotationSchedule;
    const tier = rotation.tiers.t4;
    const currentParts = zonedParts(now);
    const baseDay = dateNumber(currentParts);
    const events = [];

    for (let offset = 0; offset < 9; offset += 1) {
      const displayDate = dateAtOffset(baseDay, offset);
      const previous = dateAtOffset(dateNumber(displayDate), -1);
      const currentDay = cycleDay(displayDate);
      const previousDay = cycleDay(previous);
      const bossRows = {};
      const eventRows = {};

      for (const [slot, raw] of Object.entries(tier.days[currentDay] || {})) {
        if (Number(tier.slots[slot]?.slice(0, 2)) >= 3) bossRows[slot] = raw;
      }
      for (const [slot, raw] of Object.entries(tier.days[previousDay] || {})) {
        if (Number(tier.slots[slot]?.slice(0, 2)) < 3) bossRows[slot] = raw;
      }
      for (const [slot, raw] of Object.entries(tier.extras?.[currentDay] || {})) {
        if (Number(tier.slots[slot]?.slice(0, 2)) >= 3) eventRows[slot] = raw;
      }
      for (const [slot, raw] of Object.entries(tier.extras?.[previousDay] || {})) {
        if (Number(tier.slots[slot]?.slice(0, 2)) < 3) eventRows[slot] = raw;
      }

      appendRows(events, bossRows, tier.slots, displayDate, now, 'amazon-boss');
      appendRows(events, tier.daily, tier.slots, displayDate, now, 'amazon-daily');
      appendRows(events, eventRows, tier.slots, displayDate, now, 'amazon-extra', true);

      const exactRows = rotation.dateExtras?.[dateKey(displayDate)] || [];
      for (const [index, row] of exactRows.entries()) {
        const [hour, minute] = row.time.split(':').map(Number);
        const timestamp = zonedTimeToUtc(displayDate.year, displayDate.month, displayDate.day, hour, minute);
        if (timestamp > now.getTime()) {
          const isPvp = /!gpvp|!dpvp/i.test(row.items);
          events.push({ id: `amazon-exact-${timestamp}-${index}`, name: parseItems(row.items), time: timestamp, type: isPvp ? 'war' : 'archboss', source: 'amazon' });
        }
      }
    }

    const unique = new Map();
    for (const event of events) unique.set(`${event.time}:${event.name}:${event.type}`, event);
    return [...unique.values()].sort((left, right) => left.time - right.time).slice(0, limit);
  }

  function updateSchedule(data, syncedAt) {
    if (!data?.rotationSchedule?.tiers?.t4?.days) return false;
    scheduleData = data;
    const mappedNames = {};
    for (const [name, id] of Object.entries(data._bossIds || {})) mappedNames[id] = name;
    idToName = { ...bossNames, ...mappedNames };
    meta.verifiedAt = new Date(syncedAt || Date.now()).toISOString().slice(0, 10);
    meta.provider = 'Онлайн-расписание Amazon T4';
    return true;
  }

  function getRainStatus(scheduleType, now = Date.now()) {
    const starts = rainStarts[scheduleType];
    const cycle = Math.floor((now - rainAnchor) / rainCycleDuration);
    let next = null;
    for (let cycleOffset = -1; cycleOffset <= 2; cycleOffset += 1) {
      const cycleStart = rainAnchor + (cycle + cycleOffset) * rainCycleDuration;
      for (const offset of starts) {
        const start = cycleStart + offset * MINUTE;
        const end = start + 15 * MINUTE;
        if (now >= start && now < end) return { raining: true, remaining: end - now, startsAt: start };
        if (start > now && (!next || start < next)) next = start;
      }
    }
    return { raining: false, remaining: next - now, startsAt: next };
  }

  function getDayNightStatus(now = Date.now()) {
    const cycleDuration = 150 * MINUTE;
    const dayDuration = 120 * MINUTE;
    const position = mod(now + 60 * MINUTE, cycleDuration);
    const isDay = position < dayDuration;
    return { isDay, remaining: isDay ? dayDuration - position : cycleDuration - position };
  }

  function getWorldStatus(now = Date.now()) {
    return { dayNight: getDayNightStatus(now), laslan: getRainStatus('default', now), talandre: getRainStatus('talandre', now) };
  }

  window.amazonSchedule = { meta, getUpcomingEvents, getWorldStatus, updateSchedule };
})();
