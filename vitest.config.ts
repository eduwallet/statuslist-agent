import { defineConfig } from 'vitest/config';

// Pin the timezone: the status list test vectors parse local dates
// (new Date('2020-01-01 01:02:03')) and assume CET/CEST, while CI runners run
// in UTC. Set here (before workers spawn) so each test worker inherits it.
process.env.TZ = 'Europe/Amsterdam';

export default defineConfig({});
