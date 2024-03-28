import crypto from 'node:crypto';

import { TestDb } from './types.js';

export const buildUser = (): TestDb['user'] => ({
  id: crypto.randomInt(1000, 9000),
  name: `Someone ${crypto.randomInt(1000, 9000)}`,
  email: `random-${crypto.randomUUID()}@email.com`,
});

export const buildProfile = (user: { id: number }): TestDb['profile'] => ({
  bio: 'Example',
  name: 'John Doe',
  user_id: user.id,
  id: crypto.randomUUID(),
});

export const buildPost = (user: { id: number }) => ({
  id: crypto.randomInt(1000, 9000),
  title: 'Example',
  content: 'Example content',
  some_json: { key: 'value' },
  status: 'ACTIVE',
  author_id: user.id,
  published: false,
});
