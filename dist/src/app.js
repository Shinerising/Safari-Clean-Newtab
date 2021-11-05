var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Shortcut } from './app.class.js';
import { ImageSource, ImageSize, SearchEngine } from './app.class.js';
import { DOM, ImageFetcher, Storage, QueryDB, Util } from './common.js';
import { DefaultConfig } from './config.js';
HTMLElement.prototype.addClass = function (className) {
    if (!this.classList.contains(className)) {
        this.classList.add(className);
    }
};
HTMLElement.prototype.removeClass = function (className) {
    if (this.classList.contains(className)) {
        this.classList.remove(className);
    }
};
HTMLElement.prototype.toggleClass = function (className) {
    if (!this.classList.contains(className)) {
        this.classList.add(className);
    }
    else {
        this.classList.remove(className);
    }
};
HTMLElement.prototype.val = function (value) {
    if (value) {
        this.value = value;
    }
    return this.value;
};
export class App {
    constructor() {
        this.currentConfig = DefaultConfig;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitDocumentReady();
            Storage.initialize();
            QueryDB.initialize();
            this.loadConfig();
            DOM.load();
            DOM.textBox.focus();
            this.applyShortcuts();
            this.addListener();
            this.initialSettings();
            yield this.refreshWallpaper();
        });
    }
    loadConfig() {
        const config = Storage.getItem('config');
        if (config) {
            this.currentConfig = config;
        }
        else {
            Storage.setItem('config', this.currentConfig);
        }
    }
    refreshWallpaper() {
        return __awaiter(this, void 0, void 0, function* () {
            let image = Storage.getItem('imageinfo');
            if (!image) {
                image = yield ImageFetcher.fetch(this.currentConfig.source, this.currentConfig.size, this.currentConfig.keyword);
            }
            if (image) {
                const img = yield ImageFetcher.loadImage(image, this.currentConfig.size);
                ImageFetcher.refresh(img);
                ImageFetcher.writeInfo(image);
                window.requestAnimationFrame(() => {
                    img.addClass('show');
                });
            }
            image = yield ImageFetcher.fetch(this.currentConfig.source, this.currentConfig.size, this.currentConfig.keyword);
            if (image) {
                const img = yield ImageFetcher.loadImage(image, this.currentConfig.size);
                img.remove();
                Storage.setItem('imageinfo', image);
            }
        });
    }
    addListener() {
        DOM.textBox.addEventListener('keydown', (e) => {
            const element = e.target;
            const code = (e.keyCode ? e.keyCode : e.which);
            element.setAttribute('lastkey', code.toString());
            const query = DOM.query("#textInput").val();
            if (code == 13 && query) {
                let url = '';
                if (Util.isURL(query)) {
                    if (query.indexOf("http") == 0) {
                        url = query;
                    }
                    else {
                        url = "http://" + query;
                    }
                }
                else {
                    if (this.currentConfig.search == SearchEngine.google) {
                        url = `https://www.google.com/search?q=${query}`;
                    }
                    else {
                        url = `https://bing.com/search?q=${query}`;
                    }
                }
                document.location = url;
            }
        });
        DOM.textBox.addEventListener('input', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const element = e.target;
            if (element) {
                const query = ((_a = element.val()) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) || '';
                let suggestion = element.getAttribute('suggestion') || '';
                if (query.length > 1 && query.length !== suggestion.length - 1 && element.getAttribute('lastkey') !== '8') {
                    let data = yield QueryDB.getQuery(query);
                    if (data && data.value && data.value.query) {
                        suggestion = data.value.query;
                        const text = element.val() + suggestion.slice(query.length);
                        element.val(text);
                        element.setAttribute('suggestion', suggestion);
                        element.selectionStart = query.length;
                        element.selectionEnd = suggestion.length;
                    }
                }
            }
            DOM.query("#searchBar").addClass("searchBarFocused");
            Util.debounce(() => {
                DOM.query("#searchBar").removeClass("searchBarFocused");
            }, 5000)();
        }));
        DOM.bottomBar.addEventListener('mouseenter', () => DOM.siteBox.addClass('mousein'));
        DOM.bottomBar.addEventListener('mouseleave', () => DOM.siteBox.removeClass('mousein'));
        DOM.settingIcon.addEventListener('click', () => {
            DOM.settingPanel.toggleClass('show');
        });
        DOM.settingClose.addEventListener('click', () => {
            DOM.settingPanel.removeClass('show');
        });
        document.addEventListener('keydown', (e) => {
            if ((e.which == 17 || e.which == 91) && DOM.siteBox.classList.contains('mousein')) {
                DOM.siteBox.addClass('editing');
            }
        });
        document.addEventListener('keyup', (e) => {
            if ((e.which == 17 || e.which == 91)) {
                DOM.siteBox.removeClass('editing');
            }
        });
        DOM.query('.settingButton.cancel').addEventListener('click', () => {
            DOM.settingPanel.removeClass('show');
        });
        DOM.query('.settingButton.submit').addEventListener('click', () => {
            this.currentConfig.source = ImageSource[DOM.query('[data-key=\'source\']').val()];
            this.currentConfig.count = parseInt(DOM.query('[data-key=\'count\']').val() || '');
            this.currentConfig.search = SearchEngine[DOM.query('[data-key=\'search\']').val()];
            this.currentConfig.history = DOM.query('[data-key=\'history\']').val() == 'true';
            this.currentConfig.size = ImageSize[DOM.query('[data-key=\'size\']').val()];
            this.currentConfig.keyword = DOM.query('[data-key=\'keyword\']').val() || '';
            Storage.setItem('config', this.currentConfig);
            DOM.settingPanel.removeClass('show');
        });
        DOM.query('.settingButton.add').addEventListener('click', () => {
            const shortcut = new Shortcut();
            shortcut.title = DOM.query('[data-key=\'shortcutTitle\']').val() || '';
            shortcut.link = DOM.query('[data-key=\'shortcutLink\']').val() || '';
            shortcut.img = DOM.query('[data-key=\'shortcutImage\']').val() || '';
            const node = document.createElement('a');
            node.href = shortcut.link;
            node.title = shortcut.title;
            node.className = 'siteButton';
            node.innerHTML = `
        <i></i><img src="${shortcut.img}" class="siteIcon">
        <div class="siteTitle">${shortcut.title}</div>`.trim();
            this.addShortcutListener(node);
            node.addClass('hide');
            DOM.siteBox.insertBefore(node, DOM.query('.siteButton.add'));
            window.requestAnimationFrame(() => {
                node.removeClass('hide');
            });
            this.currentConfig.shortcuts.push(shortcut);
            Storage.setItem('config', this.currentConfig);
            DOM.query('.settingPanel.shortcut').removeClass('show');
        });
        DOM.query('.settingButton.leave').addEventListener('click', () => {
            DOM.query('.settingPanel.shortcut').removeClass('show');
        });
        DOM.query('.settingButton.image').addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            const term = DOM.query('[data-key=\'shortcutTitle\']').val();
            if (!term || term.length === 0) {
                return;
            }
            DOM.query('.settingButton.image').addClass('disabled');
            let content = '';
            (yield ImageFetcher.getIconImageList(term)).forEach((item, idx) => {
                if (idx >= 5) {
                    return;
                }
                content += `<img src="${item}" alt="${term}">`;
            });
            DOM.query('.settingItem.full.image').innerHTML = content;
            DOM.query('.settingButton.image').removeClass('disabled');
        }));
        DOM.query('.settingItem.full.image').addEventListener('click', (e) => {
            var _a;
            if (e.target.nodeName == 'IMG') {
                DOM.query('[data-key=\'shortcutImage\']').val((_a = e.target.getAttribute('src')) === null || _a === void 0 ? void 0 : _a.replace('60x60bb', '256x256bb'));
            }
        });
        document.body.addEventListener('mousemove', (e) => {
            const button = DOM.query('.siteButton.dragging');
            if (button) {
                button.style.left = (e.pageX - DOM.siteBox.getBoundingClientRect().left - parseInt(button.getAttribute('ox') || '')) + 'px';
                button.style.top = (e.pageY - DOM.siteBox.getBoundingClientRect().top - parseInt(button.getAttribute('oy') || '')) + 'px';
                let index = -1;
                DOM.queryAll('.siteButton:not(.hide)').forEach((element, idx) => {
                    if (element === button) {
                        index = idx;
                    }
                });
                DOM.queryAll('.siteButton:not(.add)').forEach((element, idx) => {
                    if (index == -1) {
                        return;
                    }
                    if (idx < index && element.offsetLeft > button.offsetLeft - button.offsetWidth / 2) {
                        element.addClass('moveRight');
                    }
                    else if (idx > index && element.offsetLeft < button.offsetLeft + button.offsetWidth / 2) {
                        element.addClass('moveLeft');
                    }
                    else {
                        element.removeClass('moveLeft');
                        element.removeClass('moveRight');
                    }
                });
            }
        });
    }
    addShortcutListener(node) {
        node.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const button = e.currentTarget;
            if (button.classList.contains('add')) {
                return;
            }
            else if (!DOM.siteBox.classList.contains('editing')) {
                return;
            }
            else if (e.target.nodeName == 'I') {
                return;
            }
            button.addClass('dragging');
            button.setAttribute('ox', (e.pageX - DOM.siteBox.getBoundingClientRect().left).toString());
            button.setAttribute('oy', (e.pageY - DOM.siteBox.getBoundingClientRect().top).toString());
        });
        node.addEventListener('mouseup', (e) => {
            e.preventDefault();
            const button = e.currentTarget;
            if (button.classList.contains('add')) {
                return;
            }
            else if (!button.classList.contains('dragging')) {
                return;
            }
            else if (e.target.nodeName == 'I') {
                return;
            }
            const left = button.getBoundingClientRect().left;
            const top = button.getBoundingClientRect().top;
            let index = -1;
            DOM.queryAll('.siteButton:not(.hide)').forEach((element, idx) => {
                if (element === button) {
                    index = idx;
                }
            });
            const offset = DOM.queryAll('.siteButton.moveLeft').length - DOM.queryAll('.siteButton.moveRight').length;
            const shortcut = this.currentConfig.shortcuts[index];
            this.currentConfig.shortcuts.splice(index, 1);
            this.currentConfig.shortcuts.splice(index + offset, 0, shortcut);
            Storage.setItem('config', this.currentConfig);
            this.applyShortcuts();
            DOM.queryAll('.siteButton:not(.hide)').forEach((element, idx) => {
                if (idx === index + offset) {
                    element.style.transform = `translate(${left - element.getBoundingClientRect().left}px,${top - element.getBoundingClientRect().top}px)`;
                    element.style.transition = 'none';
                    window.requestAnimationFrame(() => {
                        element.style.removeProperty('transform');
                        element.style.removeProperty('transition');
                    });
                }
            });
        });
        node.addEventListener('click', (e) => {
            var _a;
            const button = e.currentTarget;
            if (e.target.nodeName == 'I') {
                let index = -1;
                DOM.queryAll('.siteButton:not(.hide)').forEach((element, idx) => {
                    if (element === button) {
                        index = idx;
                    }
                });
                if (index !== -1) {
                    this.currentConfig.shortcuts = this.currentConfig.shortcuts.filter((element, idx) => {
                        return idx != index;
                    });
                    Storage.setItem('config', this.currentConfig);
                }
                (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.addClass('hide');
                e.preventDefault();
            }
            else if (button.classList.contains('add')) {
                DOM.query('[data-key=\'shortcutTitle\']').val('');
                DOM.query('[data-key=\'shortcutLink\']').val('');
                DOM.query('[data-key=\'shortcutImage\']').val('');
                DOM.query('.settingItem.full.image').innerHTML = '';
                DOM.query('.settingPanel.config').removeClass('show');
                DOM.query('.settingPanel.shortcut').toggleClass('show');
                e.preventDefault();
            }
            else if (button.classList.contains('dragging')) {
                e.preventDefault();
            }
            else if (!DOM.query('#sites').classList.contains('editing')) {
                DOM.query('.siteButton').removeClass('click');
                button.addClass('click');
            }
        });
    }
    applyShortcuts() {
        if (this.currentConfig) {
            let content = '';
            this.currentConfig.shortcuts.map((element) => {
                const template = `
<a href="${element.link}" title="${element.title}" class="siteButton">
<i></i>
<img src="${element.img}" class="siteIcon">
<div class="siteTitle">${element.title}</div>
</a>`;
                content += template.trim();
            });
            content += `
<a href="#AddShortcut" title="Add Shortcut" class="siteButton add">
<div class="siteIcon"></div>
<div class="siteTitle">Add Shortcut</div>
</a>`.trim();
            DOM.siteBox.innerHTML = content;
            DOM.queryAll('.siteButton').forEach((node, idx) => this.addShortcutListener(node));
        }
    }
    waitDocumentReady() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    resolve(true);
                }
                else {
                    const callback = () => {
                        document.removeEventListener('DOMContentLoaded', callback);
                        resolve(true);
                    };
                    document.addEventListener('DOMContentLoaded', callback);
                }
            });
        });
    }
    initialSettings() {
        DOM.query('[data-key=\'source\']').val(ImageSource[this.currentConfig.source]);
        DOM.query('[data-key=\'count\']').val(this.currentConfig.count.toString());
        DOM.query('[data-key=\'search\']').val(SearchEngine[this.currentConfig.search]);
        DOM.query('[data-key=\'history\']').val((this.currentConfig.history || false).toString());
        DOM.query('[data-key=\'size\']').val(ImageSize[this.currentConfig.size]);
        DOM.query('[data-key=\'keyword\']').val(this.currentConfig.keyword);
    }
}
