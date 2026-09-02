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

/**
 * A UXP host application this plugin targets.
 *
 * Marketplace submissions require a single object. An array is allowed during
 * development (e.g. Adobe UXP Developer Tools).
 * @see https://developer.adobe.com/photoshop/uxp/guides/uxp_guide/uxp-misc/manifest-v4/#host
 */
export interface HostDefinition {
  app: string;
  minVersion: string;
  data?: {
    apiVersion?: number;
  };
}

export interface UxpManifest {
  id: string;
  name: string;
  version: string;
  main: string;
  manifestVersion: number;
  host: HostDefinition | HostDefinition[];
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
