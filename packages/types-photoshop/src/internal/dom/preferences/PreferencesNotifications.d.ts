export class PreferencesNotifications extends PreferencesBase {
  /**
   * @ignore
   */
  constructor();
  /**
   * The class name of the referenced object: *"PreferencesNotifications"*.
   *
   * @minVersion 27.2
   */
  get typename(): 'PreferencesNotifications';
  /**
   * Enables or disables Quiet Mode, which limits in-app messages and notifications.  When Quiet Mode is enabled, certain notification preferences become read-only and cannot be modified until Quiet Mode is disabled.
   *
   * @minVersion 26.11
   */
  get quietMode(): boolean;
  set quietMode(enabled: boolean);
  /**
   * If true, feature introduction notifications are shown.  Note: This preference will be locked when Quiet Mode is enabled.
   *
   * @minVersion 26.11
   */
  get showFeatureOnboarding(): boolean;
  set showFeatureOnboarding(enabled: boolean);
  /**
   * If true, pop-up definitions or descriptions are displayed on mouseover.
   *
   * @minVersion 26.11
   */
  get showToolTips(): boolean;
  set showToolTips(enabled: boolean);
  /**
   * If true, &quot;What&#x27;s New&quot; update notifications are shown.  Note: This preference will be locked when Quiet Mode is enabled.
   *
   * @minVersion 26.11
   */
  get showWhatsNew(): boolean;
  set showWhatsNew(enabled: boolean);
  /**
   * If true, enhanced tooltip displays are shown.  Note: This preference will be locked when Quiet Mode is enabled.
   *
   * @minVersion 26.11
   */
  get useRichToolTips(): boolean;
  set useRichToolTips(enabled: boolean);
}
