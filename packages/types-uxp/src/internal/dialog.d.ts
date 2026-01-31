/**
 * FIXME: Is this namespace documented anywhere?
 */
export const dialog = {
  showOpenDialog: (options: {
    openFile?: boolean;
    openDirectory?: boolean;
    defaultPath?: string;
    multipleSelections?: boolean;
    title?: string;
    buttonLabel?: string;
    filters?: string[];
    showHiddenFiles?: boolean;
    initialLocation?: string;
  }) => Promise<URL>,

  showSaveDialog: (options: {
    defaultPath?: string;
    title?: string;
    buttonLabel?: string;
    filters: string[];
    showHiddenFiles?: boolean;
    suggestedName?: string;
    initialLocation?: string;
  }) => Promise<URL>,
};
