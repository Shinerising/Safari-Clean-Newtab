export class Config {
    constructor() {
        this.version = 1;
        this.source = ImageSource.unsplash;
        this.count = 10;
        this.search = SearchEngine.google;
        this.history = false;
        this.size = ImageSize.regular;
        this.keyword = "sakura";
        this.shortcuts = [];
    }
}
export var ImageSource;
(function (ImageSource) {
    ImageSource[ImageSource["unsplash"] = 0] = "unsplash";
    ImageSource[ImageSource["bing"] = 1] = "bing";
    ImageSource[ImageSource["local"] = 2] = "local";
})(ImageSource || (ImageSource = {}));
export var SearchEngine;
(function (SearchEngine) {
    SearchEngine[SearchEngine["google"] = 0] = "google";
    SearchEngine[SearchEngine["bing"] = 1] = "bing";
})(SearchEngine || (SearchEngine = {}));
export var ImageSize;
(function (ImageSize) {
    ImageSize[ImageSize["raw"] = 0] = "raw";
    ImageSize[ImageSize["full"] = 1] = "full";
    ImageSize[ImageSize["regular"] = 2] = "regular";
    ImageSize[ImageSize["small"] = 3] = "small";
})(ImageSize || (ImageSize = {}));
export class Shortcut {
    constructor() {
        this.title = "";
        this.link = "";
        this.img = "";
    }
}
