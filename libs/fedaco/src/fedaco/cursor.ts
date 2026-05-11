/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * Opaque cursor used by `cursorPaginate`. It carries:
 *   - `parameters`: the column → value map captured at a page boundary
 *   - `pointsToNextItems`: whether the next page should be in forward
 *     direction (true) or backward (false, i.e. caller hit the "previous" link)
 *
 * Encoded form is base64url(JSON({...parameters, _pointsToNextItems})) so it can
 * be passed through a `?cursor=...` query parameter.
 */
export class Cursor {
  constructor(
    public parameters: Record<string, any>,
    public pointsToNextItems = true,
  ) {}

  parameter(name: string): any {
    return Object.prototype.hasOwnProperty.call(this.parameters, name) ? this.parameters[name] : null;
  }

  pointsToPreviousItems(): boolean {
    return !this.pointsToNextItems;
  }

  toArray(): Record<string, any> {
    return { ...this.parameters, _pointsToNextItems: this.pointsToNextItems };
  }

  /** base64url(json) without padding, matching Laravel's `Cursor::encode()`. */
  encode(): string {
    const json = JSON.stringify(this.toArray());
    return Buffer.from(json, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  static fromEncoded(encoded: string | Cursor | null | undefined): Cursor | null {
    if (encoded == null) {
      return null;
    }
    if (encoded instanceof Cursor) {
      return encoded;
    }
    try {
      const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(b64, 'base64').toString('utf8');
      const parsed = JSON.parse(json) as Record<string, any>;
      const pointsToNextItems = parsed._pointsToNextItems !== false;
      delete parsed._pointsToNextItems;
      return new Cursor(parsed, pointsToNextItems);
    } catch {
      return null;
    }
  }
}
