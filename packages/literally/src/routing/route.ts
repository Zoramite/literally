import { type TemplateResult } from 'lit';

export interface DefaultPageOptions {
  // Title of the page used to update the browser title.
  title?: string;
}

export interface PageDetails {
  pageOptions?: DefaultPageOptions;
  template: TemplateResult;
}

export interface PageRoute {
  // If no permissions provided it is considered looking for a public page.
  // If no result it is considered a permission error.
  content: (
    permissions?: Record<string, boolean> | null,
  ) => PageDetails | undefined;
}

/**
 * Public route, simple pass through with no permission checking.
 */
export class PublicRoute implements PageRoute {
  constructor(public value: PageDetails) {}

  content(
    _permissions?: Record<string, boolean> | null,
  ): PageDetails | undefined {
    return this.value;
  }
}
