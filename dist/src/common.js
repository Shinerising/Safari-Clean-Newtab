var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ImageSource, ImageSize, ImageInfo } from './app.class.js';
export class Util {
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    ;
    static isURL(query) {
        const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?$/ig;
        return query.length < 2083 && urlRegex.test(query);
    }
    ;
}
/**
 * DOM API
 */
export class DOM {
    /**
     * Load common nodes
     */
    static load() {
        this.textBox = document.querySelector('#textInput');
        this.siteBox = document.querySelector('#sites');
        this.bottomBar = document.querySelector('#bottomBar');
        this.settingIcon = document.querySelector('#settingIcon');
        this.settingPanel = document.querySelector('#settingPanel');
        this.settingClose = document.querySelector('#settingClose');
        this.cover = document.querySelector('#cover');
    }
    /**
     * Select one node
     * @param  {string} selector Selector
     * @return {HTMLElement} DOM element
     */
    static query(selector) {
        return document.querySelector(selector);
    }
    /**
     * Select multiple nodes
     * @param  {string} selector Selector
     * @return {NodeListOf<HTMLElement>} DOM Elements
     */
    static queryAll(selector) {
        return document.querySelectorAll(selector);
    }
}
/**
 * Fetch image resources from web
 */
export class ImageFetcher {
    static fetch(source, size, keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.requestImage(source, keyword);
            return this.resolveData(source, data);
        });
    }
    static refresh(image) {
        DOM.cover.append(image);
    }
    static writeInfo(image) {
        console.log(image);
        DOM.query('#imageLink').setAttribute('href', image.url || '');
        DOM.query('#authorLink').setAttribute('href', image.link || '');
        DOM.query('#authorLink').innerText = image.author || '';
        DOM.query('#imageTitle').innerText = image.title || '';
        DOM.query('#model').innerText = image.brief || '';
        DOM.query('#location').innerText = image.location || '';
        DOM.query('#infoText').style.display = 'block';
    }
    static loadImage(image, size) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.src = this.getUrl(image, size) || '';
                img.addClass('coverImage');
                img.addEventListener('load', () => {
                    resolve(img);
                });
            });
        });
    }
    static getUrl(image, size) {
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
    static requestImage(source, keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (source == ImageSource.unsplash) {
                let url = `https://api.unsplash.com/photos/random?client_id=${this.unsplashID}&orientation=landscape`;
                if (keyword) {
                    url += '&query=' + keyword;
                }
                return yield fetch(url, { mode: 'cors' }).then((res) => res.json());
            }
            else if (source == ImageSource.bing) {
                const url = `https://cors-anywhere.herokuapp.com/https://www.bing.com/HPImageArchive.aspx?format=js&idx=${Math.floor(Math.random() * 7)}&n=1`;
                return yield fetch(url, {
                    mode: 'cors',
                    headers: {
                        'X-Requested-With': '',
                    },
                }).then((res) => res.json());
            }
        });
    }
    static resolveData(source, data) {
        if (source == ImageSource.unsplash) {
            return this.resolveUnsplashData(data);
        }
        else if (source == ImageSource.bing) {
            return this.resolveBingData(data);
        }
        return new ImageInfo();
    }
    static resolveUnsplashData(data) {
        const image = new ImageInfo();
        let node;
        if (data && data.results && data.results.length) {
            node = data.results[0];
        }
        else if (data) {
            node = data;
        }
        else {
            return image;
        }
        image.title = '';
        image.raw = node.urls.raw;
        image.full = node.urls.full;
        image.regular = node.urls.regular;
        image.small = node.urls.small;
        return image;
    }
    static resolveBingData(data) {
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
    static getIconImageList(term) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const url = `https://itunes.apple.com/search?term=${term}&limit=10&media=software`;
                fetch(url)
                    .then((res) => res.json())
                    .then((data) => {
                    if (data.results) {
                        resolve(data.results.map((item) => item.artworkUrl60));
                    }
                    else {
                        resolve([]);
                    }
                });
            });
        });
    }
}
ImageFetcher.unsplashID = '691b20a234f612603711b9eabd89df4729a06478f16d7e89cd8526340897b18d';
export class Storage {
    static initialize() {
        try {
            localStorage;
        }
        catch (e) {
            this.storageEnabled = false;
            DOM.settingIcon.remove();
        }
    }
    static getItem(key) {
        if (!this.storageEnabled) {
            return undefined;
        }
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
        return undefined;
    }
    static setItem(key, item) {
        if (!this.storageEnabled) {
            return;
        }
        localStorage.setItem(key, JSON.stringify(item));
    }
}
Storage.storageEnabled = true;
export class QueryDB {
    static initialize() {
        try {
            const request = window.indexedDB.open(QueryDB.dbName, QueryDB.dbVersion);
            request.onupgradeneeded = (e) => {
                var _a;
                QueryDB.db = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
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
            request.onsuccess = (e) => {
                var _a;
                QueryDB.db = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                this.dbEnabled = true;
            };
        }
        catch (e) {
            this.dbEnabled = false;
        }
    }
    static updateQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
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
                    }
                    else {
                        store.add({
                            query,
                            visit,
                        });
                    }
                    resolve(true);
                };
                request.onerror = () => {
                    reject();
                };
            });
        });
    }
    ;
    static getQuery(query) {
        return new Promise((resolve, reject) => {
            if (!QueryDB.dbEnabled) {
                return resolve({});
            }
            const request = QueryDB.db.transaction("queries")
                .objectStore("queries")
                .openCursor(window.IDBKeyRange.bound(query, query + "\uffff"), "prev");
            request.onsuccess = (e) => {
                var _a;
                resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
            };
            request.onerror = () => {
                reject();
            };
        });
    }
    ;
}
QueryDB.dbEnabled = false;
QueryDB.dbName = "safari_homepage";
QueryDB.dbVersion = 2;
