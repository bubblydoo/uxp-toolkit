import { action } from "photoshop";

type P = Parameters<typeof action.batchPlay>;

export type CorrectBatchPlayOptions = P[1] & {
  immediateRedraw?: boolean;
};

export async function batchPlay(actions: P[0], options?: CorrectBatchPlayOptions) {
  return action.batchPlay(actions, {
    ...options,
    modalBehavior: "execute",
    dialogOptions: "silent",
    synchronousExecution: false,
  });
}
