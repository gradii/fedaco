/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Cursor } from './cursor';

export interface CursorOrderColumn {
  /** Unqualified attribute name on the model, e.g. `id` (used to read item values). */
  column: string;
  /** Direction taken into account when building keyset predicates. */
  direction: 'asc' | 'desc';
}

/**
 * Result of `FedacoBuilder.cursorPaginate(...)`. Mirrors Laravel's
 * `CursorPaginator` surface enough to drive `?cursor=` style pagination.
 */
export class CursorPaginator<T = any> {
  constructor(
    public items: T[],
    public pageSize: number,
    public cursor: Cursor | null,
    public cursorName: string,
    protected _orderColumns: CursorOrderColumn[],
    public hasMorePages: boolean,
  ) {}

  /** True when there is no previous page (caller is on the first page). */
  get onFirstPage(): boolean {
    return this.previousCursor() === null;
  }

  /** Cursor for the next page, or null if no next page exists. */
  nextCursor(): Cursor | null {
    if (this.cursor !== null && this.cursor.pointsToPreviousItems() && !this.hasMorePages) {
      return null;
    }
    if (this.cursor === null && !this.hasMorePages) {
      return null;
    }
    return this._cursorFromItem(this.items[this.items.length - 1], true);
  }

  /** Cursor for the previous page, or null if no previous page exists. */
  previousCursor(): Cursor | null {
    if (this.cursor === null) {
      return null;
    }
    if (this.cursor.pointsToPreviousItems() && !this.hasMorePages) {
      return null;
    }
    return this._cursorFromItem(this.items[0], false);
  }

  /** Encoded cursor string suitable for a `?cursor=` query parameter. */
  nextPageCursor(): string | null {
    return this.nextCursor()?.encode() ?? null;
  }

  /** Encoded cursor string for the previous page's `?cursor=` parameter. */
  previousPageCursor(): string | null {
    return this.previousCursor()?.encode() ?? null;
  }

  /** `cursor=<encoded>` query string fragment, or null if there is no next page. */
  nextPageQuery(): string | null {
    const enc = this.nextPageCursor();
    return enc === null ? null : `${this.cursorName}=${enc}`;
  }

  previousPageQuery(): string | null {
    const enc = this.previousPageCursor();
    return enc === null ? null : `${this.cursorName}=${enc}`;
  }

  protected _cursorFromItem(item: T | undefined, pointsToNext: boolean): Cursor | null {
    if (!item || this._orderColumns.length === 0) {
      return null;
    }
    const params: Record<string, any> = {};
    for (const { column } of this._orderColumns) {
      params[column] = (item as any)[column];
    }
    return new Cursor(params, pointsToNext);
  }
}
