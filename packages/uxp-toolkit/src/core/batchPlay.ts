import { action } from 'adobe:photoshop';

type P = Parameters<typeof action.batchPlay>;
export async function batchPlay(actions: P[0], options?: P[1]) {
  return action.batchPlay(actions, {
    ...options,
    modalBehavior: 'execute',
    dialogOptions: 'silent',
    synchronousExecution: false,
  });
}
