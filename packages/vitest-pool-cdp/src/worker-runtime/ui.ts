/* eslint-disable vars-on-top */
import type { File, Task } from '@vitest/runner';

export type UxpRunnerTaskStatus = 'collected' | 'run' | 'pass' | 'fail' | 'skip' | 'todo' | 'unknown';

export interface UxpRunnerTaskState {
  id: string;
  name: string;
  type: 'test' | 'suite';
  filePath: string;
  status: UxpRunnerTaskStatus;
  durationMs?: number;
}

export interface UxpRunnerSummary {
  total: number;
  running: number;
  passed: number;
  failed: number;
  skipped: number;
  todo: number;
}

export type VitestUiState
  = | {
    type: 'collected';
    tasks: UxpRunnerTaskState[];
    summary: UxpRunnerSummary;
  }
  | {
    type: 'task-update';
    tasks: UxpRunnerTaskState[];
    summary: UxpRunnerSummary;
  };

declare global {
  var __vitestUiUpdate: ((event: VitestUiState) => void) | undefined;
  var __vitestUiState: VitestUiState | undefined;
}

export interface UiBridge {
  setProjectRoot: (root: string) => void;
  onCollected: (files: File[]) => void;
  onTaskUpdate: (packs: unknown[]) => void;
}

function normalizeStatus(state: unknown): UxpRunnerTaskStatus {
  switch (state) {
    case 'run':
    case 'pending':
      return 'run';
    case 'pass':
      return 'pass';
    case 'fail':
      return 'fail';
    case 'skip':
    case 'skipped':
      return 'skip';
    case 'todo':
      return 'todo';
    default:
      return 'unknown';
  }
}

function getInitialStatusFromTask(task: Task): UxpRunnerTaskStatus {
  const mode = (task as { mode?: unknown }).mode;
  const fromMode = normalizeStatus(mode);
  return fromMode === 'unknown' ? 'collected' : fromMode;
}

export function createUiBridge(): UiBridge {
  const tasks = new Map<string, UxpRunnerTaskState>();
  let projectRoot = '';

  const notify = (payload: VitestUiState): void => {
    try {
      globalThis.__vitestUiState = payload;
      if (typeof globalThis.__vitestUiUpdate === 'function') {
        globalThis.__vitestUiUpdate(payload);
      }
    }
    catch {
      // Ignore panel update errors to avoid affecting test execution.
    }
  };

  const normalizePath = (value: string): string => value.replaceAll('\\', '/');

  const toDisplayPath = (filePath: string): string => {
    const normalizedFile = normalizePath(filePath);
    const normalizedRoot = normalizePath(projectRoot);
    if (!normalizedRoot) {
      return normalizedFile;
    }
    const rootWithSlash = normalizedRoot.endsWith('/') ? normalizedRoot : `${normalizedRoot}/`;
    if (normalizedFile.startsWith(rootWithSlash)) {
      return normalizedFile.slice(rootWithSlash.length);
    }
    if (normalizedFile === normalizedRoot) {
      return '';
    }
    return normalizedFile;
  };

  const collectTaskState = (task: Task, filePath: string): void => {
    const taskType = task.type === 'suite' ? 'suite' : 'test';
    tasks.set(task.id, {
      id: task.id,
      name: task.name,
      type: taskType,
      filePath: toDisplayPath(filePath),
      status: getInitialStatusFromTask(task),
      durationMs: undefined,
    });

    if ('tasks' in task && task.tasks) {
      for (const nestedTask of task.tasks) {
        collectTaskState(nestedTask, filePath);
      }
    }
  };

  const summarize = (): UxpRunnerSummary => {
    let total = 0;
    let running = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let todo = 0;

    for (const task of tasks.values()) {
      if (task.type !== 'test') {
        continue;
      }
      total++;
      if (task.status === 'run') {
        running++;
      }
      else if (task.status === 'pass') {
        passed++;
      }
      else if (task.status === 'fail') {
        failed++;
      }
      else if (task.status === 'skip') {
        skipped++;
      }
      else if (task.status === 'todo') {
        todo++;
      }
    }

    return { total, running, passed, failed, skipped, todo };
  };

  return {
    setProjectRoot(root) {
      projectRoot = root;
    },
    onCollected(files) {
      tasks.clear();
      for (const file of files) {
        for (const task of file.tasks) {
          collectTaskState(task, file.filepath);
        }
      }

      notify({
        type: 'collected',
        tasks: [...tasks.values()],
        summary: summarize(),
      });
    },

    onTaskUpdate(packs) {
      const updatedTasks: UxpRunnerTaskState[] = [];
      for (const pack of packs) {
        if (!Array.isArray(pack) || pack.length < 2) {
          continue;
        }

        const taskId = pack[0];
        const result = pack[1] as { state?: unknown; duration?: unknown } | null | undefined;
        const meta = (pack.length >= 3 ? pack[2] : undefined) as { state?: unknown } | null | undefined;
        if (typeof taskId !== 'string') {
          continue;
        }

        const existing = tasks.get(taskId);
        if (!existing) {
          continue;
        }

        const resultStatus = normalizeStatus(result?.state);
        const status = resultStatus !== 'unknown' ? resultStatus : normalizeStatus(meta?.state);
        if (status !== 'unknown') {
          existing.status = status;
        }
        const durationValue = result?.duration;
        if (typeof durationValue === 'number' && Number.isFinite(durationValue)) {
          existing.durationMs = durationValue;
        }
        updatedTasks.push({ ...existing });
      }

      if (updatedTasks.length > 0) {
        notify({
          type: 'task-update',
          tasks: updatedTasks,
          summary: summarize(),
        });
      }
    },
  };
}
