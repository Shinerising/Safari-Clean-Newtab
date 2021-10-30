/* eslint-env es6*/

window.config = {
  'version': 2, // Config Version, modify it when you need to overwrite settings in local storage

  'source': 'unsplash', // Image Source, Select from unsplash, bing, or local
  'count': 10, // Local image count
  'search': 'google', // Choose google or bing
  'history': false, // Save search history or not

  'size': 'regular', // Change it to raw, full, regular, small
  'keyword': 'Sakura', // Change it to cat, soccer, flower, etc. Or make it false to load random image

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
