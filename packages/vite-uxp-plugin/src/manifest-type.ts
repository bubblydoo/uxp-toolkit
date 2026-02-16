export interface UxpCommand {
  type: string;
  id: string;
  label: {
    default: string;
  };
}

export interface UxpIcon {
  width?: number;
  height?: number;
  path?: string;
  scale?: number[];
  theme?: string[];
  species?: string[];
}

export interface UxpPanel {
  type: string;
  id: string;
  label: {
    default: string;
  };
  hostUIContext?: {
    hideFromMenu?: boolean;
    hideFromPluginsPanel?: boolean;
  };
  minimumSize?: {
    width: number;
    height: number;
  };
  maximumSize?: {
    width: number;
    height: number;
  };
  preferredDockedSize?: {
    width: number;
    height: number;
  };
  preferredFloatingSize?: {
    width: number;
    height: number;
  };
  icons?: UxpIcon[];
}

export interface UxpManifest {
  id: string;
  name: string;
  version: string;
  main: string;
  manifestVersion: number;
  host: {
    app: string;
    minVersion: string;
    data?: {
      apiVersion?: number;
    };
  }[];
  entrypoints: Array<UxpPanel | UxpCommand>;
  featureFlags?: {
    enableAlerts?: boolean;
    enableSWCSupport?: boolean;
    enableFillAsCustomAttribute?: boolean;
  };
  requiredPermissions?: {
    localFileSystem?: string;
    launchProcess?: {
      schemes?: string[];
      extensions?: string[];
    };
    network?: {
      domains?: 'all' | string[];
    };
    clipboard?: string;
    webview?: {
      allow?: string;
      allowLocalRendering?: string;
      domains?: string[] | 'all';
      enableMessageBridge?: 'localAndRemote' | 'localOnly' | 'no';
    };
    ipc?: {
      enablePluginCommunication?: boolean;
    };
    allowCodeGenerationFromStrings?: boolean;
    enableAddon?: boolean;
  };
  addon?: {
    name?: string;
  };
  icons?: UxpIcon[];
}
