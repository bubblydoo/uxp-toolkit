/**
 * Includes useful information about the operating environment the plugin finds itself executing in.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Host%20Information/Host/
 */
interface Host {
  /**
   * Allows you to obtain the language and region used to render the user interface for the host application.
   * This property is useful in that it allows you to localize and internationalize your plugin's content to match
   * that of the host application.
   * @return The locale for the user interface. For example, en_US.
   */
  uiLocale: string;
  /**
   * Indicates the name of the hosting application.
   * This is useful if your plugin needs to adapt its behavior based upon the hosting application.
   * @return The name of the hosting application. For example, Photoshop.
   */
  name: string;
  /**
   * Indicates the version of the hosting application.
   * This is useful if your plugin needs to adapt its behavior depending upon the version of the host application.
   * This may be due to new APIs being introduced in a given version, or to work around a bug in a specific version.
   * @return The version of the hosting application. For example, 22.0.0.
   */
  version: string;
}

export const host: Host;
