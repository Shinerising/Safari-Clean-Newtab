# Clean Newtab Page for Safari and Chrome

![Safari](https://img.shields.io/badge/safari-3F7EE3?style=for-the-badge&logo=safari)
![TypeScript](https://img.shields.io/badge/typescript-D8E4F7?style=for-the-badge&logo=typescript)
![CSS](https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3)
![Unsplash](https://img.shields.io/badge/unsplash-000000?style=for-the-badge&logo=unsplash)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FShinerising%2FSafari-Clean-Newtab%2Fbadge&style=for-the-badge)](https://actions-badge.atrox.dev/Shinerising/Safari-Clean-Newtab/goto)

> See Demo at https://safari.awayne.me/

![Webpage Preview](./image/preview.jpg)

## Features

- Beautiful Newtab Page For Your Browser

- Quick Visit Icons & Search Bar

- Change The Background Wallpaper Automatically

- Set Your Favorite Website Icons Easily

- You Can Use Your Awesome Images As Well!

## Usage

Download this repo, then set your homepage of browser to the local repo folder as below:

![Browser Setting Panel](./image/setting.jpg)

## Custom Options

You can change settings by modifying the `config.js` script.

To enable quick option panel, you must disable Local File Restrictions (Safari Only):

- Enable Develop menu in Advanced panel of Safari Preferences
- Click on the Develop menu
- Select Disable Local File Restrictions

Then you could refresh the page and click the gear icon at right bottom side to open option panel like this:

<img src="./image/option.jpg" width="400">

To modify icons of quick visit websites, move your mouse cursor above the bottom bar and press <kbd>command</kbd> or <kbd>control</kbd>, then you'll know what to do next.

> **Update: Now you can drag the icons to sort them in edit mode!**

<img src="./image/add.jpg" width="320">

Type text in Shortcut Title box then click Search Icon button, you will get five recommend icons, click the image to enter the url automatically.

## Option Items

- Local Images

Use local images as wallpaper or not. Default value is False.

> **You can use your local images as wallpaper, only need to copy them to the background folder and rename as 01.jpg, 02.jpg, 03.jpg ...**

- Images Count (Available for Local Images)

When using local images, you must set the count of looping images.

- Search Engine

Select search engine between Google and Bing.

- Enable History

If enable search history and autocomplete functions.

- Image Size (Available for Network Images)

Select image resolution for wallpaper, high resolution may cost more network data.

- Image Keywords (Available for Network Images)

Enter the image keywords which could be used to search wallpapers from image library.

## API Statement

This project uses the image search and storage API from https://unsplash.com , which is a perfect Hi-res image sharing website. Please visit https://unsplash.com/developers for more details.

This project uses the iTunes search API from https://itunes.apple.com to fetch icon images. Please visit https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/ for more details.

## Donation

If you think this project is helpful to your development, you could just give me a cup of coffee. Thank you! ❤️

[![Donate with Paypal](https://apollowayne.me/donate_paypal.svg)](https://www.paypal.me/WSapollo/5USD)
[![Donate with Alipay](https://apollowayne.me/donate_alipay.svg)](https://apollowayne.me/alipay.html?amount=20.00&url=https://qr.alipay.com/fkx03883k0k6zcocuduxn70)
[![Donate with BitCoin](https://apollowayne.me/donate_bitcoin.svg)](https://apollowayne.me/bitcoin.html?address=1JHN5EsUiym81q9u7CchLECA4ZnbPGvpDW)
