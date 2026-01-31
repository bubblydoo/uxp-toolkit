/**
 * To get an instance: require("uxp").shell.
 * These APIs require UXP Manifest v5 configurations.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/shell/Shell/
 */
interface Shell {
  /**
   * Opens the given file or folder path in the system default application.
   *
   * Note: UWP can access only files in the UWP App sandbox.
   *
   * @param path String representing the path to open.
   * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
   * Message should be localised in current host UI locale.
   * @returns Promise that resolves with "" if succeeded or String containing the error message if failed.
   *
   * @example
   * ```js
   * // for MacOS
   * shell.openPath("/Users/[username]/Downloads");
   * shell.openPath("/Users/[username]/sample.txt");
   * // for Windows
   * shell.openPath("C:\\Users\\[username]\\Downloads");
   * shell.openPath("C:\\Users\\[username]\\AppData\\Local\\...\\sample.txt");
   * ```
   */
  openPath: (path: string, developerText?: string) => Promise<string>;

  /**
   * Opens the url in the dedicated system applications for the scheme.
   *
   * Note: File scheme is not allowed for openExternal. Use openPath for those cases.
   *
   * @param url String representing the URL to open.
   * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
   * Message should be localised in current host UI locale.
   * @returns Promise that resolves with "" if succeeded or String containing the error message if failed.
   *
   * @example
   * ```js
   * shell.openExternal("https://www.adobe.com/");
   * shell.openExternal("https://www.adobe.com/", "develop message for the user consent dialog");
   * ```
   *
   * @example
   * ```js
   * shell.openExternal("maps://?address=345+Park+Ave+San+Jose"); // for MacOS
   * shell.openExternal("bingmaps:?q=345+Park+Ave+San+Jose, +95110"); // for Windows
   * ```
   */
  openExternal: (url: string | URL, developerText?: string) => void;
}

export const shell: Shell;
