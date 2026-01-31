/**
 * Photoshop Actions
 *
 * Handles the content in Actions panel.
 * Actions panel will have a hierarchy of Action Sets that contain a list of Actions
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/}
 *
 * @example
 * ```js
 * // Play all actions in a set
 * const actionSet = app.actionTree[0]; // Get first action set
 * await actionSet.play();
 * ```
 *
 * @example
 * ```js
 * // Duplicate an action set
 * const actionSet = app.actionTree[0];
 * const copiedSet = actionSet.duplicate();
 * console.log(copiedSet.name); // Copy of [original name]
 * ```
 */
export class ActionSet {
  /**
   * The class name of the referenced object: *"ActionSet"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#typename}
   * @minVersion 23.0
   */
  get typename(): 'ActionSet';
  /**
   * Zero-based index of this Action Set in the Actions palette
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#index}
   * @minVersion 22.1
   */
  get index(): number;
  /**
   * The internal ID of this Action Set
   * Can be used for batchPlay calls, used internally
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#id}
   * @minVersion 22.1
   */
  get id(): number;
  /**
   * The name of this Action Set, displayed in the panel
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#name}
   * @minVersion 22.1
   */
  get name(): string;
  /**
   * Renames the Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#name}
   * @minVersion 22.1
   */
  set name(name: string);
  /**
   * List of Actions in this Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#actions}
   * @minVersion 22.1
   */
  get actions(): Action[];
  /**
   * @ignore
   */
  constructor(id: any);
  /**
   * Deletes this Action Set from the Actions panel
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#delete}
   *
   * @example
   * ```js
   * const actionSet = app.actionTree[0];
   * actionSet.delete(); // Removes from Actions panel
   * ```
   *
   * @minVersion 22.1
   */
  delete(): void;
  /**
   * Creates a copy of this Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#duplicate}
   *
   * @example
   * ```js
   * const actionSet = app.actionTree[0];
   * const copy = actionSet.duplicate();
   * ```
   *
   * @minVersion 22.1
   */
  duplicate(): ActionSet;
  /**
   * Plays all Actions in this set one by one
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/actionset/#play}
   *
   * @example
   * ```js
   * const actionSet = app.actionTree[0];
   * await actionSet.play(); // Plays all actions in sequence
   * ```
   *
   * @async
   * @minVersion 22.1
   */
  play(): Promise<void>;
}
/**
 * Represents an Action in the Actions palette.
 * Actions are series of commands that can be recorded by user, and can be replayed at a later time
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/}
 *
 * @example
 * ```js
 * // Access and play an action
 * const actionSet = app.actionTree[0];
 * const action = actionSet.actions[0];
 * await action.play();
 * ```
 *
 * @example
 * ```js
 * // Rename and duplicate an action
 * const action = app.actionTree[0].actions[0];
 * action.name = "My Custom Action";
 * const copy = action.duplicate();
 * ```
 */
export class Action {
  /**
   * The class name of the referenced object: *"Action"*.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#typename}
   * @minVersion 23.0
   */
  get typename(): 'Action';
  /**
   * The internal ID of this Action
   * Can be used for batchPlay calls, used internally
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#id}
   * @minVersion 22.1
   */
  get id(): number;
  /**
   * Zero-based index of this Action in it's parent Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#index}
   * @minVersion 22.1
   */
  get index(): number;
  /**
   * The name of this Action, displayed in the panel
   * Cannot be changed
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#name}
   * @minVersion 22.1
   */
  get name(): string;
  /**
   * Renames the Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#name}
   * @minVersion 22.1
   */
  set name(name: string);
  /**
   * The Action Set this Action belongs to
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#parent}
   * @minVersion 22.1
   */
  get parent(): ActionSet;
  /**
   * @ignore
   */
  constructor(id: number);
  /**
   * Deletes this Action from the Actions panel
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#delete}
   *
   * @example
   * ```js
   * const action = app.actionTree[0].actions[0];
   * action.delete(); // Removes from Actions panel
   * ```
   *
   * @minVersion 22.1
   */
  delete(): void;
  /**
   * Plays this Action
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#play}
   *
   * @example
   * ```js
   * const action = app.actionTree[0].actions[0];
   * await action.play(); // Executes the action
   * ```
   *
   * @async
   * @minVersion 22.1
   */
  play(): Promise<void>;
  /**
   * Creates a copy of this Action, placing it in the same Action Set
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/ps_reference/classes/action/#duplicate}
   *
   * @example
   * ```js
   * const action = app.actionTree[0].actions[0];
   * const copy = action.duplicate();
   * ```
   *
   * @minVersion 22.1
   */
  duplicate(): Action;
}
