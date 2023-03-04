"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var puppeteer_1 = require("puppeteer");
var REDDIT_USER = process.env.REDDIT_USER;
var collectPermalinks = function (nextPageUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, links, nextUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer_1["default"].launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.pages()];
            case 2:
                page = (_a.sent())[0];
                return [4 /*yield*/, page.goto(nextPageUrl, { waitUntil: 'networkidle0' })];
            case 3:
                _a.sent();
                links = [];
                return [4 /*yield*/, page.evaluate(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    window.scrollBy(0, document.body.clientHeight);
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, Array.from(document.querySelectorAll('.entry > ul.flat-list.buttons > li.first > .bylink'))
                                            .map(function (el) { return el.getAttribute('href'); })];
                            }
                        });
                    }); })];
            case 4:
                links = _a.sent();
                return [4 /*yield*/, page.evaluate(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, Array.from(document.querySelectorAll('.nav-buttons > .nextprev > .next-button > a'))
                                    .map(function (el) {
                                    console.log(el);
                                    return el.getAttribute('href');
                                })];
                        });
                    }); })];
            case 5:
                nextUrl = _a.sent();
                console.log(nextUrl);
                browser.close();
                return [2 /*return*/, {
                        'links': links,
                        'nextPageUrl': nextUrl[0]
                    }];
        }
    });
}); };
var getScreenshotsFromPage = function (links) { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, _i, links_1, link, path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer_1["default"].launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.pages()];
            case 2:
                page = (_a.sent())[0];
                _i = 0, links_1 = links;
                _a.label = 3;
            case 3:
                if (!(_i < links_1.length)) return [3 /*break*/, 7];
                link = links_1[_i];
                if (!link) return [3 /*break*/, 6];
                return [4 /*yield*/, page.goto(link, { waitUntil: 'networkidle0', timeout: 10000 })];
            case 4:
                _a.sent();
                path = "screenshots/screenshot-".concat((Math.random() + 1).toString(36).substring(7), ".png");
                return [4 /*yield*/, page.screenshot({ path: path, fullPage: true })];
            case 5:
                _a.sent();
                console.log("All done, check the screenshot: ".concat(path, " \u2728"));
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 3];
            case 7: return [2 /*return*/];
        }
    });
}); };
// While next button URL is not empty or undefined,
// get screenshots and next page and recurse
var recursivelyGoToNextPage = function (pagePermalinksAndNextPage) { return __awaiter(void 0, void 0, void 0, function () {
    var pagePermlinksAndNextPage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Moving onto page: ".concat(pagePermalinksAndNextPage.nextPageUrl));
                //  await getScreenshotsFromPage(pagePermalinksAndNextPage.links);
                if (!pagePermalinksAndNextPage.nextPageUrl)
                    return [2 /*return*/];
                return [4 /*yield*/, collectPermalinks(pagePermalinksAndNextPage.nextPageUrl)];
            case 1:
                pagePermlinksAndNextPage = _a.sent();
                if (pagePermlinksAndNextPage)
                    recursivelyGoToNextPage(pagePermalinksAndNextPage);
                return [2 /*return*/];
        }
    });
}); };
var start = {
    'links': [],
    'nextPageUrl': "https://old.reddit.com/user/".concat(REDDIT_USER, "/comments/")
};
await recursivelyGoToNextPage(start);
