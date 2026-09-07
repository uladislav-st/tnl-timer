(function () {
  const MINUTE = 60 * 1000;
  const DAY = 24 * 60 * MINUTE;

  const meta = {
    edition: 'Amazon / Steam',
    region: 'EU',
    timeZone: 'Europe/Berlin',
    verifiedAt: '2026-09-07',
    bossCycleAnchor: '2025-01-19'
  };

  const bossTimes = ['01:00', '13:00', '16:00', '20:00', '23:00'];
  const rotations = {
    T3: {
      '01:00': ['Adentus', 'Junobote', 'Ahzreil', 'Grand Aelon', 'Minezerok', 'Chernobog', 'Talus', 'Excavator-9', 'Adentus', 'Kowazan', 'Ahzreil', 'Cornelius', 'Malakar', 'Nirma'],
      '13:00': ['Ahzreil', 'Nirma', 'Morokai', 'Aridus', 'Adentus', 'Junobote', 'Ahzreil', 'Grand Aelon', 'Minezerok', 'Chernobog', 'Talus', 'Excavator-9', 'Adentus', 'Kowazan'],
      '16:00': ['Excavator-9', 'Ahzreil', 'Cornelius', 'Malakar', 'Nirma', 'Morokai', 'Aridus', 'Adentus', 'Junobote', 'Ahzreil', 'Grand Aelon', 'Minezerok', 'Chernobog', 'Talus'],
      '20:00': ['Minezerok', 'Excavator-9', 'Adentus', 'Kowazan', 'Ahzreil', 'Cornelius', 'Malakar', 'Nirma', 'Morokai', 'Aridus', 'Adentus', 'Junobote', 'Ahzreil', 'Grand Aelon'],
      '23:00': ['Junobote', 'Minezerok', 'Chernobog', 'Talus', 'Excavator-9', 'Adentus', 'Kowazan', 'Ahzreil', 'Cornelius', 'Malakar', 'Nirma', 'Morokai', 'Aridus', 'Adentus']
    },
    T2: {
      '01:00': ['Daigon', 'Leviathan', 'Manticus', 'Manticus', 'Manticus', 'Daigon', 'Leviathan', 'Daigon', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Manticus', 'Pakilo Naru'],
      '13:00': ['Leviathan', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Leviathan', 'Manticus', 'Manticus', 'Manticus', 'Daigon', 'Leviathan', 'Daigon', 'Pakilo Naru', 'Pakilo Naru'],
      '16:00': ['Daigon', 'Leviathan', 'Daigon', 'Manticus', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Leviathan', 'Manticus', 'Manticus', 'Manticus', 'Daigon', 'Leviathan'],
      '20:00': ['Manticus', 'Daigon', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Manticus', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Leviathan', 'Manticus', 'Manticus'],
      '23:00': ['Leviathan', 'Manticus', 'Daigon', 'Leviathan', 'Daigon', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon', 'Manticus', 'Pakilo Naru', 'Pakilo Naru', 'Leviathan', 'Daigon']
    }
  };

  const dynamicEventTimes = ['02:00', '05:00', '08:00', '11:00', '15:00', '18:00', '20:00', '23:00'];
  const rainStarts = {
    default: [30, 60, 120, 180, 270, 360, 390, 420, 510, 570, 600, 660, 690, 780, 810, 870, 930, 960, 990, 1110, 1170, 1290, 1350, 1380, 1500, 1590, 1650, 1710, 1860, 1890, 1920, 2190, 2250, 2280, 2370, 2610, 2640, 2790, 2820, 2880, 3000, 3030, 3090, 3300, 3330, 3510, 3630, 3690, 3720, 3810, 3840, 3870, 3930, 3990, 4020, 4080, 4170, 4260, 4350, 4440],
    talandre: [90, 390, 750, 1020, 1050, 1170, 1320, 1590, 1650, 2220, 2790, 2910, 2970, 3030, 3240, 3690, 4050, 4140, 4230, 4260, 4410]
  };
  const rainAnchor = Date.parse('2024-09-30T09:45:00.000Z');
  const rainCycleDuration = 4500 * MINUTE;

  function mod(value, divider) {
    return ((value % divider) + divider) % divider;
  }

  function zonedParts(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: meta.timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const result = {};
    for (const part of parts) if (part.type !== 'literal') result[part.type] = Number(part.value);
    return result;
  }

  function zonedTimeToUtc(year, month, day, hour, minute) {
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    let guess = wanted;
    for (let index = 0; index < 2; index += 1) {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: meta.timeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date(guess));
      const values = {};
      for (const part of parts) if (part.type !== 'literal') values[part.type] = Number(part.value);
      const represented = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute);
      guess += wanted - represented;
    }
    return guess;
  }

  function dateAtOffset(baseDay, offset) {
    const value = new Date(baseDay + offset * DAY);
    return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
  }

  function dayIndex(parts) {
    const anchor = Date.UTC(2025, 0, 19);
    const current = Date.UTC(parts.year, parts.month - 1, parts.day);
    return mod(Math.floor((current - anchor) / DAY), 14);
  }

  function weekday(timestamp) {
    return new Intl.DateTimeFormat('en-US', { timeZone: meta.timeZone, weekday: 'short' })
      .format(new Date(timestamp)).toLowerCase();
  }

  function getUpcomingEvents(now = new Date(), limit = 16) {
    const currentParts = zonedParts(now);
    const baseDay = Date.UTC(currentParts.year, currentParts.month - 1, currentParts.day);
    const events = [];

    for (let offset = 0; offset < 8; offset += 1) {
      const date = dateAtOffset(baseDay, offset);
      for (const time of bossTimes) {
        const [hour, minute] = time.split(':').map(Number);
        const timestamp = zonedTimeToUtc(date.year, date.month, date.day, hour, minute);
        if (timestamp <= now.getTime()) continue;
        let rotationIndex = dayIndex(date);
        if (time === '01:00') rotationIndex = mod(rotationIndex - 1, 14);
        events.push({
          id: `amazon-boss-${timestamp}`,
          name: `T3 ${rotations.T3[time][rotationIndex]} / T2 ${rotations.T2[time][rotationIndex]}`,
          time: timestamp,
          type: 'boss',
          source: 'amazon'
        });
      }

      for (const time of dynamicEventTimes) {
        const [hour, minute] = time.split(':').map(Number);
        const timestamp = zonedTimeToUtc(date.year, date.month, date.day, hour, minute);
        if (timestamp > now.getTime()) {
          events.push({ id: `amazon-dynamic-${timestamp}`, name: 'Dynamic Events', time: timestamp, type: 'dynamic', source: 'amazon' });
        }
      }

      const archbossTimestamp = zonedTimeToUtc(date.year, date.month, date.day, 16, 0);
      if (archbossTimestamp > now.getTime() && ['wed', 'sat'].includes(weekday(archbossTimestamp))) {
        events.push({ id: `amazon-archboss-${archbossTimestamp}`, name: 'Archboss — окно появления', time: archbossTimestamp, type: 'archboss', source: 'amazon' });
      }
    }

    return events.sort((left, right) => left.time - right.time).slice(0, limit);
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
    const regionShift = 60 * MINUTE;
    const position = mod(now + regionShift, cycleDuration);
    const isDay = position < dayDuration;
    return {
      isDay,
      remaining: isDay ? dayDuration - position : cycleDuration - position
    };
  }

  function getWorldStatus(now = Date.now()) {
    return {
      dayNight: getDayNightStatus(now),
      laslan: getRainStatus('default', now),
      talandre: getRainStatus('talandre', now)
    };
  }

  window.amazonSchedule = { meta, getUpcomingEvents, getWorldStatus };
})();
