/**
 * To get an instance: require("uxp").shell.
 * These APIs require UXP Manifest v5 configurations.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/shell/Shell/
 */
interface Shell {
  /**
   * Opens the given file or folder path in the system default application.
   * NOTE: UWP can access only files in the UWP App sandbox.
   * @param path
   * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
   * Message should be localised in current host UI locale.
   */
  openPath: (path: string, developerText?: string) => Promise<string>;

  /**
   * Opens the url in the dedicated system applications for the scheme.
   * NOTE: File scheme is not allowed for openExternal. Use openPath for those cases.
   * @param url
   * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
   * Message should be localised in current host UI locale.
   */
  openExternal: (url: string | URL, developerText?: string) => void;
}

export const shell: Shell;
