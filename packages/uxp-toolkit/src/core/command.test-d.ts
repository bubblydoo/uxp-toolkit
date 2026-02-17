/* eslint-disable unused-imports/no-unused-vars */
import type { UTCommandResult } from './command';
import { describe, expectTypeOf, test } from 'vitest';
import { z } from 'zod';
import { createCommand } from './command';

describe('UTCommandResult type tests', () => {
  test('extracts result type from non-modifying command', () => {
    const command = createCommand({
      descriptor: { _obj: 'get' },
      schema: z.object({
        name: z.string(),
        count: z.number(),
      }),
      modifying: false,
    });

    type Result = UTCommandResult<typeof command>;

    expectTypeOf<Result>().toEqualTypeOf<{
      name: string;
      count: number;
    }>();
  });
});
