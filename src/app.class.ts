/**
 * User Settings
 */
export class Config {
  version = 1;
  source: ImageSource = ImageSource.unsplash;
  count = 10;
  search: SearchEngine = SearchEngine.google;
  history = false;
  size: ImageSize = ImageSize.regular;
  keyword = 'sakura'
  shortcuts: Shortcut[] = [];
}

export enum ImageSource {
  unsplash,
  bing,
  local
}

export enum SearchEngine {
  google,
  bing
}

export enum ImageSize {
  raw,
  full,
  regular,
  small
}

/**
 * Shortcut Button
 */
export class Shortcut {
  title = '';
  link = '';
  img = '';
}

/**
 * Image Information
 */
export class ImageInfo {
  title?: string;
  url?: string;
  raw?: string;
  full?: string;
  regular?: string;
  small?: string;
  color?: string;
  location?: string;
  author?: string;
  link?: string;
  brief?: string;
}
