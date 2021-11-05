import { Config, ImageInfo, Shortcut } from './app.class';
import { ImageSource, ImageSize, SearchEngine } from './app.class';
import { DOM, ImageFetcher, Storage, QueryDB, Util } from './common';
import { DefaultConfig } from './config';

HTMLElement.prototype.addClass = function(className: string) {
  if (!this.classList.contains(className)) {
    this.classList.add(className);
  }
};

HTMLElement.prototype.removeClass = function(className: string) {
  if (this.classList.contains(className)) {
    this.classList.remove(className);
  }
};
HTMLElement.prototype.toggleClass = function(className: string) {
  if (!this.classList.contains(className)) {
    this.classList.add(className);
  } else {
    this.classList.remove(className);
  }
};
HTMLElement.prototype.val = function(value?: string) {
  if (value) {
    (<HTMLInputElement>this).value = value;
  }
  return (<HTMLInputElement>this).value;
};


export class App {
  private currentConfig: Config = DefaultConfig;

  public async start() {
    await this.waitDocumentReady();

    Storage.initialize();

    QueryDB.initialize();

    this.loadConfig();

    DOM.load();
    DOM.textBox.focus();

    this.applyShortcuts();

    this.addListener();

    this.initialSettings();

    await this.refreshWallpaper();
  }

  private loadConfig() {
    const config = Storage.getItem<Config>('config');
    if (config) {
      this.currentConfig = config;
    } else {
      Storage.setItem('config', this.currentConfig);
    }
  }

  private async refreshWallpaper() {
    let image = Storage.getItem<ImageInfo>('imageinfo');

    if (!image) {
      image = await ImageFetcher.fetch(this.currentConfig.source, this.currentConfig.size, this.currentConfig.keyword);
    }

    if (image) {
      const img = await ImageFetcher.loadImage(image, this.currentConfig.size);
      ImageFetcher.refresh(img);
      ImageFetcher.writeInfo(image);
      window.requestAnimationFrame(() => {
        img.addClass('show');
      });
    }

    image = await ImageFetcher.fetch(this.currentConfig.source, this.currentConfig.size, this.currentConfig.keyword);
    if (image) {
      const img = await ImageFetcher.loadImage(image, this.currentConfig.size);
      img.remove();
      Storage.setItem('imageinfo', image);
    }
  }

  private addListener() {
    DOM.textBox.addEventListener('keydown', async (e: KeyboardEvent) => {
      const element = e.target as HTMLInputElement;
      const code = (e.keyCode ? e.keyCode : e.which);
      element.setAttribute('lastkey', code.toString());
      const query = DOM.query("#textInput").val();
      if (code == 13 && query) {
        if (this.currentConfig.history) {
          await QueryDB.updateQuery(query.toLocaleLowerCase());
        }
        let url = '';
        if (Util.isURL(query)) {
          if (query.indexOf("http") == 0) {
            url = query;
          } else {
            url = "http://" + query;
          }
        } else {
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
    DOM.textBox.addEventListener('input', async (e: Event) => {
      const element = e.target as HTMLInputElement;
      if (element) {
        const query = element.val()?.toLocaleLowerCase() || '';
        let suggestion = element.getAttribute('suggestion') || '';
        if (this.currentConfig.history && query.length > 1 && query.length !== suggestion.length && element.getAttribute('lastkey') !== '8') {
          const data: IDBCursorWithValue = await QueryDB.getQuery(query);
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
    });

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
      this.currentConfig.source = ImageSource[<keyof typeof ImageSource>DOM.query('[data-key=\'source\']').val()];
      this.currentConfig.count = parseInt(DOM.query('[data-key=\'count\']').val() || '');
      this.currentConfig.search = SearchEngine[<keyof typeof SearchEngine>DOM.query('[data-key=\'search\']').val()];
      this.currentConfig.history = DOM.query('[data-key=\'history\']').val() == 'true';
      this.currentConfig.size = ImageSize[<keyof typeof ImageSize>DOM.query('[data-key=\'size\']').val()];
      this.currentConfig.keyword = DOM.query('[data-key=\'keyword\']').val() || '';

      Storage.setItem('config', this.currentConfig);

      DOM.settingPanel.removeClass('show');
    });

    DOM.query('.settingButton.add').addEventListener('click', () => {
      const shortcut: Shortcut = new Shortcut();
      shortcut.title = DOM.query('[data-key=\'shortcutTitle\']').val() || '';
      shortcut.link = DOM.query('[data-key=\'shortcutLink\']').val() || '';
      shortcut.img = DOM.query('[data-key=\'shortcutImage\']').val() || '';
      const node = document.createElement('a');
      node.href = shortcut.link;
      node.title = shortcut.title;
      node.className = 'siteButton';
      node.innerHTML = `
        <img src="${shortcut.img}" class="siteIcon"><i></i>
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

    DOM.query('.settingButton.image').addEventListener('click', async () => {
      const term = DOM.query('[data-key=\'shortcutTitle\']').val();
      if (!term || term.length === 0) {
        return;
      }
      DOM.query('.settingButton.image').addClass('disabled');
      let content = '';
      (await ImageFetcher.getIconImageList(term)).forEach((item, idx) => {
        if (idx >= 5) {
          return;
        }
        content += `<img src="${item}" alt="${term}">`;
      });
      DOM.query('.settingItem.full.image').innerHTML = content;
      DOM.query('.settingButton.image').removeClass('disabled');
    });

    DOM.query('.settingItem.full.image').addEventListener('click', (e: MouseEvent) => {
      if ((<HTMLElement>e.target).nodeName == 'IMG') {
        DOM.query('[data-key=\'shortcutImage\']').val((<HTMLElement>e.target).getAttribute('src')?.replace('60x60bb', '256x256bb'));
      }
    });

    document.body.addEventListener('mousemove', (e: MouseEvent) => {
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
          } else if (idx > index && element.offsetLeft < button.offsetLeft + button.offsetWidth / 2) {
            element.addClass('moveLeft');
          } else {
            element.removeClass('moveLeft');
            element.removeClass('moveRight');
          }
        });
      }
    });

    let observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target == DOM.bottomBar) {
          const width = entry.contentRect.width / entry.contentRect.height * 200;
          const mask = `url('data:image/svg+xml;utf8,<svg preserveAspectRatio="none" viewBox="0 0 ${width} 200" xmlns="http://www.w3.org/2000/svg"><path d="M 100 0 c -90 0 -100 10 -100 100 c 0 90 10 100 100 100 l ${width - 200} 0 c 90 0, 100 -10, 100 -100 c 0 -90, -10 -100, -100 -100Z" fill="white"></path></svg>')`;
          DOM.bottomGlass.style.mask = mask;
          DOM.bottomGlass.style.webkitMaskImage = mask;
        } else if (entry.target == DOM.searchBar) {
          const width = entry.contentRect.width / entry.contentRect.height * 200;
          const mask = `url('data:image/svg+xml;utf8,<svg preserveAspectRatio="none" viewBox="0 0 ${width} 200" xmlns="http://www.w3.org/2000/svg"><path d="M 100 0 l -30 0 c -45 0 -70 25 -70 70 l 0 60 c 0 45 25 70 70 70 l 30 0 l ${width - 200} 0 l 30 0 c 45 0, 70 -25, 70 -70 l 0 -60 c 0 -45, -25 -70, -70 -70Z" fill="white"></path></svg>')`;
          DOM.searchGlass.style.mask = mask;
          DOM.searchGlass.style.webkitMaskImage = mask;
        }
      }
    })
    observer.observe(DOM.bottomBar);
    observer.observe(DOM.searchBar);
  }

  private addShortcutListener(node: HTMLElement) {
    node.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      const button = e.currentTarget as HTMLElement;
      if (button.classList.contains('add')) {
        return;
      } else if (!DOM.siteBox.classList.contains('editing')) {
        return;
      } else if ((<HTMLElement>e.target).nodeName == 'I') {
        return;
      }
      button.addClass('dragging');
      button.setAttribute('ox', (e.pageX - DOM.siteBox.getBoundingClientRect().left).toString());
      button.setAttribute('oy', (e.pageY - DOM.siteBox.getBoundingClientRect().top).toString());
    });

    node.addEventListener('mouseup', (e: MouseEvent) => {
      e.preventDefault();
      const button = e.currentTarget as HTMLElement;
      if (button.classList.contains('add')) {
        return;
      } else if (!button.classList.contains('dragging')) {
        return;
      } else if ((<HTMLElement>e.target).nodeName == 'I') {
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

    node.addEventListener('click', (e: MouseEvent) => {
      const button = e.currentTarget as HTMLElement;
      if ((<HTMLElement>e.target).nodeName == 'I') {
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
        (<HTMLElement>e.currentTarget)?.addClass('hide');
        e.preventDefault();
      } else if (button.classList.contains('add')) {
        DOM.query('[data-key=\'shortcutTitle\']').val('');
        DOM.query('[data-key=\'shortcutLink\']').val('');
        DOM.query('[data-key=\'shortcutImage\']').val('');
        DOM.query('.settingItem.full.image').innerHTML = '';
        DOM.query('.settingPanel.config').removeClass('show');
        DOM.query('.settingPanel.shortcut').toggleClass('show');
        e.preventDefault();
      } else if (button.classList.contains('dragging')) {
        e.preventDefault();
      } else if (!DOM.query('#sites').classList.contains('editing')) {
        DOM.query('.siteButton').removeClass('click');
        button.addClass('click');
      }
    });
  }

  private applyShortcuts() {
    if (this.currentConfig) {
      let content = '';
      this.currentConfig.shortcuts.map((element) => {
        const template = `
<a href="${element.link}" title="${element.title}" class="siteButton">
<img src="${element.img}" class="siteIcon">
<i></i>
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

      DOM.queryAll('.siteButton').forEach((node: HTMLElement) => this.addShortcutListener(node));
    }
  }

  private waitDocumentReady() {
    return new Promise<boolean>((resolve, reject) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve(true);
      } else {
        const callback = () => {
          document.removeEventListener('DOMContentLoaded', callback);
          resolve(true);
        };
        document.addEventListener('DOMContentLoaded', callback);
      }
    });
  }

  private initialSettings() {
    DOM.query('[data-key=\'source\']').val(ImageSource[this.currentConfig.source]);
    DOM.query('[data-key=\'count\']').val(this.currentConfig.count.toString());
    DOM.query('[data-key=\'search\']').val(SearchEngine[this.currentConfig.search]);
    DOM.query('[data-key=\'history\']').val((this.currentConfig.history || false).toString());
    DOM.query('[data-key=\'size\']').val(ImageSize[this.currentConfig.size]);
    DOM.query('[data-key=\'keyword\']').val(this.currentConfig.keyword);
  }
}

