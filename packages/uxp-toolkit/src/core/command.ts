import type { ActionDescriptor } from 'photoshop';
import type { z } from 'zod';
import { batchPlay } from './batchPlay';

export interface UTCommandBase<T> {
  descriptor: ActionDescriptor;
  schema: z.ZodSchema<T>;
}

export interface UTCommandModifying<T> extends UTCommandBase<T> {
  modifying: true;
}

export interface UTCommandNonModifying<T> extends UTCommandBase<T> {
  modifying: false;
}

export function createCommand<TReturn, TModifying extends boolean>(
  obj: {
    descriptor: ActionDescriptor;
    schema: z.ZodSchema<TReturn>;
    modifying: TModifying;
  },
): TModifying extends true ? UTCommandModifying<TReturn> : UTCommandNonModifying<TReturn> {
  return {
    modifying: obj.modifying,
    descriptor: obj.descriptor,
    schema: obj.schema,
  } as any;
}

export type UTCommandResult<C> = C extends UTCommandBase<infer T> ? T : never;

type BatchPlayOptions = Parameters<typeof batchPlay>[1];

async function batchPlayCommandBase<T>(command: UTCommandBase<T>, options?: BatchPlayOptions) {
  const [result] = await batchPlay([command.descriptor], options);
  if (result?._obj === 'error') {
    throw new Error('Batch play command failed', { cause: result });
  }
  return command.schema.parse(result);
}

async function batchPlayCommandsBase<TCommands extends Array<UTCommandBase<any>>>(
  commands: readonly [...TCommands],
  options?: BatchPlayOptions,
): Promise<{
  [K in keyof TCommands]: UTCommandResult<TCommands[K]>;
}> {
  const results = await batchPlay(commands.map(command => command.descriptor), options);
  if (results[0]?._obj === 'error') {
    throw new Error('Batch play command failed', { cause: results[0] });
  }
  return commands.map((command, index) => command.schema.parse(results[index])) as any;
}

export function batchPlayCommand<T>(command: UTCommandNonModifying<T>, options?: BatchPlayOptions) {
  return batchPlayCommandBase(command, options);
}

export function batchPlayCommands<TCommands extends Array<UTCommandNonModifying<any>>>(commands: readonly [...TCommands], options?: BatchPlayOptions) {
  return batchPlayCommandsBase(commands, options);
}

export function createModifyingBatchPlayContext() {
  return {
    batchPlayCommand: batchPlayCommandBase,
    batchPlayCommands: batchPlayCommandsBase,
  };
}
// some examples:

// const x = await batchPlay([{
//   _obj: "get",
//   _target: [
//     { _ref: "layer", _id: 1 },
//   ],
// }])

// const command = createCommand({
//   modifying: true,
//   descriptor: {
//     _obj: "get",
//     _target: [
//       { _ref: "layer", _id: 1 },
//     ],
//   },
//   schema: z.unknown()
// })

// const result = await batchPlayCommand(command);

// executeAsModal(async (ctx) => {
//   await ctx.batchPlayCommand(command);
// }, {
//   commandName: "test"
// })

// const x = await batchPlayCommands([
//   {
//     modifying: false,
//     descriptor: {
//       _obj: "get"
//     },
//     schema: z.object({
//       name: z.string(),
//     })
//   },
//   {
//     modifying: false,
//     descriptor: {
//       _obj: "put"
//     },
//     schema: z.object({
//       value: z.string(),
//     })
//   }
// ])

// const y = createCommand({
//   descriptor: {
//     _obj: "get"
//   },
//   schema: z.object({
//     name: z.string(),
//   })
// })
