/*eslint arrow-parens: ["error", "always"]*/
/*eslint quotes: ["error", "double"]*/
/*eslint-env es6*/

let nInterId, focusTick = 0;
let isGoogleEnabled = true;
let dbName = "safari_homepage";
let dbVersion = 2;
let db;
let updateQuery, getQuery;
let suggestion = "";
let lastKey;
let storageEnabled = true;
let mouseIn = false;

$(document).ready(() => {

    $("#textInput").focus();

    $("#textInput").bind("keydown", {}, enterSearch);

    $("#textInput").bind("input", {}, textChange);

    $(document).keydown((e) => {
        if ((e.which == 17 || e.which == 91) && mouseIn && storageEnabled) {
            $("#sites").addClass("editing");
        }
    });

    $(document).keyup((e) => {
        if (e.which == 17 || e.which == 91) {
            $("#sites").removeClass("editing");
        }
    });

    $("#bottomBar").mouseenter((e) => {
        mouseIn = true;
    });

    $("#bottomBar").mouseleave((e) => {
        mouseIn = false;
    });

    $("#settingIcon").click(() => {
        $(".settingPanel.shortcut").removeClass("show");
        $(".settingPanel.config").toggleClass("show");
    });

    $(".settingClose:not(.shortcut)").click(() => {
        $(".settingPanel").removeClass("show");
    });

    $(".settingClose.shortcut").click(() => {
        $(".settingPanel.shortcut").removeClass("show");
    });

    $(".settingButton.cancel").click(() => {
        $(".settingPanel").removeClass("show");
    });

    $(".settingButton.leave").click(() => {
        $(".settingPanel.shortcut").removeClass("show");
    });

    $(".settingButton.submit").click(() => {
        window.config.local = $("[data-key='local']").val() == "true";
        window.config.count = $("[data-key='count']").val();
        window.config.search = $("[data-key='search']").val();
        window.config.history = $("[data-key='history']").val() == "true";
        window.config.size = $("[data-key='size']").val();
        window.config.keyword = $("[data-key='keyword']").val();

        if (storageEnabled) {
            localStorage.setItem("config", JSON.stringify(window.config));
        }

        $(".settingPanel").removeClass("show");
    });

    $(".settingButton.add").click(() => {
        let element = {};
        element.title = $("[data-key='shortcutTitle']").val();
        element.link = $("[data-key='shortcutLink']").val();
        element.img = $("[data-key='shortcutImage']").val();
        let node = $(`<a href="${element.link}" class="siteButton"><i></i><img src="${element.img}" class="siteIcon">
                    <div class="siteTitle">${element.title}</div></a>`);
        node.click((e) => {
            if (e.target.nodeName == "I") {
                let index = $(e.currentTarget).index(".siteButton:not(.hide)");
                window.config.shortcuts = window.config.shortcuts.filter((element, idx) => {
                    return idx != index;
                });
                if (storageEnabled) {
                    localStorage.setItem("config", JSON.stringify(window.config));
                }
                $(e.currentTarget).addClass("hide");
                e.preventDefault();
            } else {
                $(".siteButton").removeClass("click");
                $(this).addClass("click");
            }
        });
        node.addClass("hide");
        node.insertBefore(".siteButton.add");
        window.requestAnimationFrame(() => {
            node.removeClass("hide");
        });
        window.config.shortcuts.push(element);
        if (storageEnabled) {
            localStorage.setItem("config", JSON.stringify(window.config));
        }
        $(".settingPanel.shortcut").removeClass("show");
    });

    try {
        localStorage;
    } catch (e) {
        storageEnabled = false;
        $("#settingIcon").hide();
    }

    if (storageEnabled && localStorage.getItem("config")) {
        let data = localStorage.getItem("config");
        let localConfig = JSON.parse(data);
        if (localConfig.version && localConfig.version == window.config.version) {
            window.config = localConfig;
        } else {
            localStorage.setItem("config", JSON.stringify(window.config));
        }
    }

    if (window.config.shortcuts) {
        let parent = $("#sites");
        window.config.shortcuts.map((element) => {
            let template = `<a href="${element.link}" class="siteButton"><i></i><img src="${element.img}" class="siteIcon">
                        <div class="siteTitle">${element.title}</div></a>`;
            parent.append(template);
        });
        parent.append(`<a href="#AddShortcut" class="siteButton add"><div class="siteIcon"></div>
                        <div class="siteTitle">Add Shortcut</div></a>`);
    }

    $(".siteButton").click((e) => {
        if (e.target.nodeName == "I") {
            let index = $(e.currentTarget).index(".siteButton:not(.hide)");
            window.config.shortcuts = window.config.shortcuts.filter((element, idx) => {
                return idx != index;
            });
            if (storageEnabled) {
                localStorage.setItem("config", JSON.stringify(window.config));
            }
            $(e.currentTarget).addClass("hide");
            e.preventDefault();
        } else if ($(e.currentTarget).hasClass("add")) {
            $(".settingPanel.config").removeClass("show");
            $(".settingPanel.shortcut").toggleClass("show");
            e.preventDefault();
        } else {
            $(".siteButton").removeClass("click");
            $(this).addClass("click");
        }
    });

    $("[data-key='local']").val(window.config.local.toString());
    $("[data-key='count']").val(window.config.count);
    $("[data-key='search']").val(window.config.search);
    $("[data-key='history']").val((window.config.history || false).toString());
    $("[data-key='size']").val(window.config.size);
    $("[data-key='keyword']").val(window.config.keyword);

    if (window.config.search === "bing") {
        isGoogleEnabled = false;
    }
    if (window.config.local) {
        let id = Math.floor(Math.random() * window.config.count) + 1;
        showImage("background/" + (id < 10 ? "0" : "") + id + ".jpg");
    } else {
        if (storageEnabled && localStorage.getItem("imageInfo")) {
            let data = localStorage.getItem("imageInfo");
            data = JSON.parse(data);
            if (data && data.urls) {
                showImage(data);
            }
            requestImage((data) => {
                if (data && data.urls) {
                    localStorage.setItem("imageInfo", JSON.stringify(data));
                }
            });
        } else {
            requestImage((data) => {
                if (data && data.urls) {
                    showImage(data);
                    if (storageEnabled) {
                        localStorage.setItem("imageInfo", JSON.stringify(data));
                    }
                }
            });
        }
    }

    if (window.config.history && window.indexedDB) {
        let request = window.indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            let objectStore = db.createObjectStore("queries", {
                keyPath: "query"
            });
            objectStore.createIndex("visit", "visit", {
                unique: false
            });
            objectStore.add({
                query: "test",
                visit: 1
            });
        }

        request.onsuccess = (event) => {
            db = event.target.result;
        };

        updateQuery = (query) => {
            if (!db) {
                return;
            }
            let store = db.transaction("queries", "readwrite").objectStore("queries");
            let request = store.get(query);
            request.onsuccess = () => {
                let visit = 1;
                if (request.result) {
                    visit = request.result.visit + 1;
                    store.put({
                        query,
                        visit
                    });
                } else {
                    store.add({
                        query,
                        visit
                    });
                }
            };
        };
        getQuery = (query, callback) => {
            if (!db) {
                return;
            }
            db.transaction("queries")
                .objectStore("queries")
                .openCursor(window.IDBKeyRange.bound(query, query + "\uffff"), "prev")
                .onsuccess = (event) => {
                    callback(event.target.result);
                };
        };
    }
});

let requestImage = (callback) => {
    let url = "https://api.unsplash.com/photos/random?client_id=691b20a234f612603711b9eabd89df4729a06478f16d7e89cd8526340897b18d&orientation=landscape";
    if (window.config.keyword) {
        url += "&query=" + window.config.keyword
    }
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            if (window.config.keyword && data && data.results && data.results.length) {
                callback(data.results[0]);
            } else {
                callback(data);
            }
        });
}

let showImage = (data) => {
    let url = "";
    if (typeof (data) === "string") {
        url = data;
    } else if (window.config.size === "raw") {
        url = data.urls.raw;
    } else if (window.config.size === "full") {
        url = data.urls.full;
    } else if (window.config.size === "small") {
        url = data.urls.small;
    } else {
        url = data.urls.regular;
    }

    if (typeof (data) === "string") {
        let img = $("<img />", {
            class: "coverImage",
            src: url,
            alt: "none"
        });
        $(".coverImage").fadeOut(500);
        img.load(() => {
            $(".coverImage").remove();
            img.appendTo($("#cover")).hide().fadeIn(500);
        });
    } else {
        $("#cover").css("background", data.color);
        let img = $("<img />", {
            class: "coverImage",
            src: url,
            alt: "none"
        });
        $(".coverImage").fadeOut(500);
        img.load(() => {
            $(".coverImage").remove();
            // There are only 3 Clickable links: Image Page(Head to Unsplash but NOT to Image File), 
            //                                   User Profile, and Unsplash Homepage(static link).
            $("#imageLink").attr("href", data.links.html);
            $("#authorLink").attr("href", data.user.links.html);
            $("#authorLink").text(data.user.name);
            $("#model").text(data.exif ? data.exif.model : "");
            $("#location").text(data.location ? data.location.title : "");
            $("#infoText").show();
            img.appendTo($("#cover")).hide().fadeIn(500);
        });
    }
}

let textChange = (e) => {
    let obj = e.target;
    if (focusTick == 0) {
        $("#searchBar").addClass("searchBarFocused");
        focusTick = 5;
        nInterId = window.setInterval(inputFocused, 1000);
    } else focusTick = 5;

    let query = $(obj).val().toLocaleLowerCase();
    if (query.length === suggestion.length - 1 || query.length < 1 || lastKey === 8) {
        return;
    }
    getQuery(query, (data) => {
        if (data && data.value) {
            suggestion = data.value.query;
            let str = $(obj).val() + suggestion.slice(query.length);
            $(obj).val(str);
            obj.selectionStart = query.length;
            obj.selectionEnd = suggestion.length;
        }
    });
}

let inputFocused = () => {
    if (focusTick < 0) {
        focusTick = 0;
        window.clearInterval(nInterId);
        $("#searchBar").removeClass("searchBarFocused");
    } else focusTick = focusTick - 1;
}

let enterSearch = (e) => {
    let code = (e.KeyCode ? e.KeyCode : e.which);
    lastKey = code;
    if (code == 13 && $("#textInput").val()) {
        if (updateQuery) {
            let query = $("#textInput").val().toLocaleLowerCase();
            updateQuery(query);
        }
        if (isURL($("#textInput").val())) {
            if ($("#textInput").val().indexOf("http") == 0) {
                document.location = $("#textInput").val();
            } else {
                document.location = "http://" + $("#textInput").val();
            }
        } else {
            if (isGoogleEnabled) document.location = "https://www.google.com/search?q=" + $("#textInput").val();
            else document.location = "https://bing.com/search?q=" + $("#textInput").val();
        }
    }
}

let isURL = (str) => {
    let urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?$/ig;
    return str.length < 2083 && urlRegex.test(str);
}
