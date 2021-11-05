import { ImageSource, ImageSize, ImageInfo } from './app.class';

export class Util {
  public static debounce(func: any, wait: number) {
    let timeout: any;

    return (...args: any[]) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  public static isURL(query: string) {
    // eslint-disable-next-line
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?$/ig;
    return query.length < 2083 && urlRegex.test(query);
  }
}

/**
 * DOM API
 */
export class DOM {
  public static textBox: HTMLElement;
  public static siteBox: HTMLElement;
  public static searchBar: HTMLElement;
  public static searchGlass: HTMLElement;
  public static bottomBar: HTMLElement;
  public static bottomGlass: HTMLElement;
  public static settingIcon: HTMLElement;
  public static settingPanel: HTMLElement;
  public static settingClose: HTMLElement;
  public static cover: HTMLElement;

  /**
   * Load common nodes
   */
  public static load() {
    this.textBox = document.querySelector('#textInput') as HTMLElement;
    this.siteBox = document.querySelector('#sites') as HTMLElement;
    this.searchBar = document.querySelector('#searchBar') as HTMLElement;
    this.searchGlass = document.querySelector('#searchBar>.backglass') as HTMLElement;
    this.bottomBar = document.querySelector('#bottomBar') as HTMLElement;
    this.bottomGlass = document.querySelector('#bottomBar>.backglass') as HTMLElement;
    this.settingIcon = document.querySelector('#settingIcon') as HTMLElement;
    this.settingPanel = document.querySelector('#settingPanel') as HTMLElement;
    this.settingClose = document.querySelector('#settingClose') as HTMLElement;
    this.cover = document.querySelector('#cover') as HTMLElement;
  }

  /**
   * Select one node
   * @param  {string} selector Selector
   * @return {HTMLElement} DOM element
   */
  public static query(selector: string): HTMLElement {
    return document.querySelector(selector) as HTMLElement;
  }

  /**
   * Select multiple nodes
   * @param  {string} selector Selector
   * @return {NodeListOf<HTMLElement>} DOM Elements
   */
  public static queryAll(selector: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(selector);
  }
}

/**
 * Fetch image resources from web
 */
export class ImageFetcher {
  private static unsplashID
    = '691b20a234f612603711b9eabd89df4729a06478f16d7e89cd8526340897b18d';

  public static async fetch(source: ImageSource, size: ImageSize, keyword: string) {
    const data = await this.requestImage(source, keyword);
    return this.resolveData(source, data);
  }

  public static refresh(image: HTMLElement) {
    DOM.cover.append(image);
  }

  public static writeInfo(image: ImageInfo) {
    DOM.query('#imageLink').setAttribute('href', image.url || '');
    DOM.query('#authorLink').setAttribute('href', image.link || '');
    DOM.query('#authorLink').innerText = image.author || '';
    DOM.query('#imageTitle').innerText = image.title || '';
    DOM.query('#model').innerText = image.brief || '';
    DOM.query('#location').innerText = image.location || '';
    DOM.query('#infoText').style.display = 'block';
    if (image.color) {
      DOM.query("#cover").style.background = image.color;
      DOM.query("meta[name='theme-color']").setAttribute('content', image.color)
    }
  }

  public static loadImage(image: ImageInfo, size: ImageSize) {
    return new Promise<HTMLElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.src = this.getUrl(image, size) || '';
      img.addClass('coverImage');
      img.addEventListener('load', () => {
        resolve(img);
      });
    });
  }
  private static getUrl(image: ImageInfo, size: ImageSize): string | undefined {
    switch (size) {
      case ImageSize.raw:
        return image.raw;
      case ImageSize.full:
        return image.full;
      case ImageSize.regular:
        return image.regular;
      default:
        return image.small;
    }
  }

  private static async requestImage(source: ImageSource, keyword: string) {
    if (source == ImageSource.unsplash) {
      let url = `https://api.unsplash.com/photos/random?client_id=${this.unsplashID}&orientation=landscape`;
      if (keyword) {
        url += '&query=' + keyword;
      }
      return await fetch(url, { mode: 'cors' }).then((res) => res.json());
    } else if (source == ImageSource.bing) {
      const url =
        `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${Math.floor(Math.random() * 7)}&n=1`;
      return await fetch(url, {
        mode: 'cors',
        headers: {
          'X-Requested-With': '',
        },
      }).then((res) => res.json());
    }
  }

  private static resolveData(source: ImageSource, data: any): ImageInfo {
    if (source == ImageSource.unsplash) {
      return this.resolveUnsplashData(data);
    } else if (source == ImageSource.bing) {
      return this.resolveBingData(data);
    }
    return new ImageInfo();
  }
  private static resolveUnsplashData(data: any): ImageInfo {
    const image = new ImageInfo();
    let node;
    if (data && data.results && data.results.length) {
      node = data.results[0];
    } else if (data) {
      node = data;
    } else {
      return image;
    }

    image.raw = node.urls.raw;
    image.full = node.urls.full;
    image.regular = node.urls.regular;
    image.small = node.urls.small;
    image.title = '';
    image.url = node.links.html;
    image.author = '© Unsplash ' + node.user.name;
    image.link = node.user.links.html;
    image.brief = node.exif.name;
    image.location = node.location.title;
    image.color = node.color;

    return image;
  }
  private static resolveBingData(data: any): ImageInfo {
    const image = new ImageInfo();
    if (data && data.images && data.images.length > 0) {
      const node = data.images[0];
      const info = /(.*?)[,|，](.*)\((.*)\)/.exec(node.copyright);
      image.raw = 'https://www.bing.com/' + node.url.replace('1920x1080', 'UHD');
      image.full = 'https://www.bing.com/' + node.url.replace('1920x1080', 'UHD');
      image.regular = 'https://www.bing.com/' + node.url;
      image.small = 'https://www.bing.com/' + node.url.replace('1920x1080', '1366x768');
      image.url = node.copyrightlink;
      if (info) {
        image.title = info[1];
        image.location = info[2];
        image.author = info[3];
      }
    }
    return image;
  }

  public static getIconImageList(term: string) {
    return new Promise<string[]>((resolve, reject) => {
      const url =
        `https://itunes.apple.com/search?term=${term}&limit=10&media=software`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            resolve(data.results.map((item: any) => item.artworkUrl60));
          } else {
            resolve([]);
          }
        });
    });
  }
}

export class Storage {
  private static storageEnabled = true;
  public static initialize() {
    try {
      localStorage;
    } catch (e) {
      this.storageEnabled = false;
      DOM.settingIcon.remove();
    }
  }

  public static getItem<T>(key: string): T | undefined {
    if (!this.storageEnabled) {
      return undefined;
    }
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return undefined;
  }

  public static setItem<T>(key: string, item: T) {
    if (!this.storageEnabled) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(item));
  }
}

export class QueryDB {
  private static dbEnabled = false;
  private static dbName = "safari_homepage";
  private static dbVersion = 2;
  private static db: any;
  public static initialize() {
    try {
      const request = window.indexedDB.open(QueryDB.dbName, QueryDB.dbVersion);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        QueryDB.db = (<IDBRequest>e.target)?.result;
        const objectStore = QueryDB.db.createObjectStore("queries", {
          keyPath: "query",
        });
        objectStore.createIndex("visit", "visit", {
          unique: false,
        });
        objectStore.add({
          query: "test",
          visit: 1,
        });
      };

      request.onsuccess = (e: Event) => {
        QueryDB.db = (<IDBRequest>e.target)?.result;
        this.dbEnabled = true;
      };
    } catch (e) {
      this.dbEnabled = false;
    }
  }
  public static updateQuery(query: string) {
    return new Promise<boolean>((resolve, reject) => {
      if (!QueryDB.dbEnabled) {
        return resolve(false);
      }
      const store = QueryDB.db.transaction("queries", "readwrite").objectStore("queries");
      const request = store.get(query);
      request.onsuccess = () => {
        let visit = 1;
        if (request.result) {
          visit = request.result.visit + 1;
          store.put({
            query,
            visit,
          });
        } else {
          store.add({
            query,
            visit,
          });
        }
        resolve(true);
      };
      request.onerror = () => {
        reject();
      }
    });
  }
  public static getQuery(query: string) {
    return new Promise<IDBCursorWithValue>((resolve, reject) => {
      if (!QueryDB.dbEnabled) {
        return resolve(<IDBCursorWithValue>{});
      }
      const request = QueryDB.db.transaction("queries")
        .objectStore("queries")
        .openCursor(window.IDBKeyRange.bound(query, query + "\uffff"), "prev");
      request.onsuccess = (e: Event) => {
        resolve((<IDBRequest>e.target)?.result);
      };
      request.onerror = () => {
        reject();
      }
    });
  }

}
