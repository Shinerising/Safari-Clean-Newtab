import {Config, ImageSource, ImageSize, SearchEngine} from './app.class';

export const DefaultConfig : Config = {
  'version': 2,

  'source': ImageSource.unsplash,
  'count': 10,
  'search': SearchEngine.google,
  'history': false,

  'size': ImageSize.regular,
  'keyword': 'Sakura',
  'shortcuts': [
    {
      'title': 'Google',
      'link': 'https://google.com',
      'img': 'icons/google.png',
    },
    {
      'title': 'Twitter',
      'link': 'https://twitter.com',
      'img': 'icons/twitter.png',
    },
    {
      'title': 'Apple',
      'link': 'https://apple.com',
      'img': 'icons/applestore.png',
    },
    {
      'title': 'Instagram',
      'link': 'https://instagram.com',
      'img': 'icons/instagram.png',
    },
    {
      'title': 'YouTube',
      'link': 'https://youtube.com',
      'img': 'icons/youtube.png',
    },
    {
      'title': 'Amazon',
      'link': 'https://amazon.co.jp',
      'img': 'icons/amazon.png',
    },
    {
      'title': 'GitHub',
      'link': 'https://github.com',
      'img': 'icons/github.png',
    },
    {
      'title': 'Google Translate',
      'link': 'https://translate.google.com',
      'img': 'icons/translate.png',
    },
  ],
};
