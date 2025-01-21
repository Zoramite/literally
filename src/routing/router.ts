// String param in the trie.
export interface RouteTrieNodeParamString {
  // Name of the param that is available at this node of the trie.
  name: string;
  value: string;
}

// Boolean param in the trie.
export interface RouteTrieNodeParamBoolean {
  // Name of the param that is available at this node of the trie.
  name: string;
  value: boolean;
}

// Number param in the trie.
export interface RouteTrieNodeParamNumber {
  // Name of the param that is available at this node of the trie.
  name: string;
  value: number;
}

// Wildcard param in the trie.
export interface RouteTrieNodeParamWildcard {
  // Name of the param that is a wildcard.
  name: string;
  value: string;
}

// Supported route trie params values.
export type RouteTrieNodeParamValue =
  | RouteTrieNodeParamString
  | RouteTrieNodeParamBoolean
  | RouteTrieNodeParamNumber
  | RouteTrieNodeParamWildcard;

export type RouteTrieParamValue = string | boolean | number;

export interface RouteTrieMatchValue<Type> {
  path: string;
  routeParts: string[];
  // The route value is a template result that gets rendered.
  value?: Type;
  params?: Record<string, RouteTrieParamValue>;
  get: (paramKey: string) => RouteTrieParamValue | undefined;
}

export type RouteUpdateCallback<Type> = (path: string, value?: Type) => void;

const PARAM_REGEX = /^{(?<param>[^:}]+)[:]?(?<type>[^}]*)}$/i;

/**
 * Route trie for controlling the available routes for navigation within a
 * system.
 *
 * Allows for path navigation and param values to be pulled from a path.
 *
 * Example: `/foo/{bar}` -> `/foo/fighters` => `params: {bar: 'fighters'}`
 *
 * Order of route resolution:
 *
 *  - Constant value
 *    - Direct match in sub nodes (ex: `/foo`)
 *    - May fail if sub node matching fails (ex: `/foo/bar`)
 *  - Param matching
 *    - Allows for variable values at node placement. (ex: '/foo/{bar}`)
 *    - May fail if sub node matching (ex: '/foo/{bar}/baz`)
 *  - Wildcard matching
 *    - Allows for the remaining path to be a variable. (ex: `/foo/{bar:*}`)
 */
export class RouteTrie<Type> {
  root: RouteTrieNode<Type>;
  callbacks: RouteUpdateCallback<Type>[] = [];

  constructor(
    public pathSeparator = '/',
    public paramSeparator = ':',
    public wildcardIndicator = '*',
  ) {
    this.root = new RouteTrieNode(
      this.pathSeparator,
      this.paramSeparator,
      this.wildcardIndicator,
    );
  }

  /**
   * Add a new path to the trie, not allowing route conflicts.
   */
  add(path: string, value: Type) {
    this.root.add(path, value);
    this.triggerCallbacks(path, value);
  }

  /**
   * Add a callback for when a route is added or updated.
   */
  addCallback(callback: RouteUpdateCallback<Type>) {
    this.callbacks.push(callback);
  }

  /**
   * Given a path, find the matching value and params in the route trie.
   */
  match(path: string): undefined | RouteTrieMatchValue<Type> {
    return this.root.match(path);
  }

  /**
   * Remove a callback for when a route is added or updated.
   */
  removeCallback(callback: RouteUpdateCallback<Type>) {
    this.callbacks = this.callbacks.filter((item) => item !== callback);
  }

  /**
   * Overwrite a path with a new value or add to the routes if does not exist.
   */
  set(path: string, value: Type) {
    // Add, but overwrite the existing value.
    this.root.add(path, value, true);
    this.triggerCallbacks(path, value);
  }

  /**
   * Triggers all the callbacks for when a route is changed.
   */
  triggerCallbacks(path: string, value?: Type) {
    for (const callback of this.callbacks) {
      callback(path, value);
    }
  }
}

export class RouteTrieNode<Type> {
  nodes: Record<string, RouteTrieNode<Type>> = {};
  value?: Type;

  constructor(
    public pathSeparator = '/',
    public paramSeparator = ':',
    public wildcardIndicator = '*',
  ) {}

  add(path: string, value: Type, allowOverwrite = false) {
    const parts = this.normalizePath(path).split(this.pathSeparator);
    const currentPart = parts.shift();
    const remainder = parts.join(this.pathSeparator);

    // If we cannot go farther, store the value.
    if (!currentPart) {
      if (this.value !== undefined && !allowOverwrite) {
        throw new Error(`Node value already exists: ${this.value} => ${value}`);
      }

      this.value = value;
      return;
    }

    // Create a new node if there is not one already defined for the current
    // part.
    if (!this.nodes[currentPart]) {
      this.nodes[currentPart] = new RouteTrieNode(
        this.pathSeparator,
        this.paramSeparator,
        this.wildcardIndicator,
      );
    }

    // Go deeper into the trie.
    this.nodes[currentPart].add(remainder, value);
  }

  /**
   * Given a path, find the matching value and params in the route node.
   */
  match(path: string): undefined | RouteTrieMatchValue<Type> {
    const matchValue: RouteTrieMatch<Type> = new RouteTrieMatch<Type>(path);

    const parts = this.normalizePath(path).split(this.pathSeparator);
    const currentPart = parts.shift();
    const remainder = parts.join(this.pathSeparator);

    // Can go no deeper, use the known value if available.
    if (!currentPart) {
      // If there is not value, then just return undefined since we do not have
      // any path that directly matches the searched path.
      if (this.value === undefined) {
        return undefined;
      }

      // Update to the current node value and return as a match.
      matchValue.value = this.value;
      return matchValue;
    }

    // Check first for a direct match of the current part with known nodes.
    if (this.nodes[currentPart]) {
      const directMatch = this.nodes[currentPart].match(remainder);
      if (directMatch?.value !== undefined) {
        // Add the matched part.
        matchValue.routeParts.push(currentPart);
        matchValue.collapse(directMatch);
        return matchValue;
      }
    }

    // Check for a normal param within the known nodes.
    for (const key of Object.keys(this.nodes)) {
      // Is the node key a param?
      const keyParam = key.match(PARAM_REGEX);

      // Ignore non-param keys.
      if (!keyParam) {
        continue;
      }

      if (keyParam.groups?.type === this.wildcardIndicator) {
        continue;
      }

      // Check for normal param match.
      const paramMatch = this.nodes[key].match(remainder);
      if (paramMatch?.value !== undefined) {
        matchValue.routeParts.push(key);
        matchValue.addParam(
          keyParam.groups!.param,
          this.valueForParam(currentPart, keyParam.groups?.type),
        );
        matchValue.collapse(paramMatch);
        return matchValue;
      }
    }

    // Check for a wildcard fallback within the known nodes.
    for (const key of Object.keys(this.nodes)) {
      // Is the node key a param?
      const keyParam = key.match(PARAM_REGEX);

      // Ignore non-param keys.
      if (!keyParam) {
        continue;
      }

      // Ignore the any non-wildcard params.
      if (keyParam.groups?.type !== this.wildcardIndicator) {
        continue;
      }

      // Wildcard is always a match.
      const wildMatch = new RouteTrieMatch<Type>(remainder);
      wildMatch.value = this.nodes[key].value;

      if (wildMatch?.value !== undefined) {
        matchValue.routeParts.push(key);

        // If there is no remainder, just return the current part.
        const wildcardRemainder = remainder
          ? [currentPart, remainder].join(this.pathSeparator)
          : currentPart;

        matchValue.addParam(keyParam.groups!.param, wildcardRemainder);
        matchValue.collapse(wildMatch);
        return matchValue;
      }
    }

    return undefined;
  }

  /**
   * Cleanup a path by remove extraneous starting and ending characters.
   */
  normalizePath(path: string) {
    // Remove starting whitespace.
    path = path.replace(/^\s+/, '');

    // Remove trailing whitespace.
    path = path.replace(/\s+$/, '');

    // Remove starting separators.
    const startSeparators = new RegExp(
      `^[${escapeRegex(this.pathSeparator)}]+`,
    );
    path = path.replace(startSeparators, '');

    // Remove trailing separators.
    const endSeparators = new RegExp(`[${escapeRegex(this.pathSeparator)}]+$`);
    path = path.replace(endSeparators, '');

    return path;
  }

  /**
   * Convert a value for a normal param using the optional types available
   * in the param definition. ex: `{foo:number}`
   */
  valueForParam(pathPart: string, type?: string): RouteTrieParamValue {
    if (type === 'number') {
      return Number(pathPart);
    }

    if (type === 'boolean') {
      return pathPart === 'true' || pathPart === '1';
    }

    return pathPart;
  }
}

class RouteTrieMatch<Type> implements RouteTrieMatchValue<Type> {
  constructor(
    public path: string,
    public routeParts: string[] = [],
    public value: Type | undefined = undefined,
    public params: Record<string, RouteTrieParamValue> = {},
  ) {}

  addParam(key: string, value: RouteTrieParamValue) {
    if (this.params[key]) {
      throw new Error(
        `${key} param already exists in the matched route, cannot duplicate param names in a route path`,
      );
    }

    this.params[key] = value;
  }

  /**
   * Combine parts of a downstream match with the current level of match.
   *
   * This allows for the recursive search to append things on the way back up
   * the call stack.
   */
  collapse(downstreamMatch: RouteTrieMatchValue<Type>) {
    // Add params from downstream, avoiding collisions.
    for (const key of Object.keys(downstreamMatch.params ?? {})) {
      // New param value, add it to the known params.
      this.params[key] = downstreamMatch.params![key];
    }

    // Add downstream parts to the current match parts.
    this.routeParts = this.routeParts.concat(downstreamMatch.routeParts);

    this.value = downstreamMatch.value;
  }

  /**
   * retrieve the value of a param or undefined if it does not exist.
   */
  get(paramKey: string): RouteTrieParamValue | undefined {
    return this.params[paramKey];
  }
}

export function escapeRegex(value: string) {
  return value.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
