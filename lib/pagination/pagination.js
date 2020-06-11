"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var rxjs_1 = require("rxjs");
function BuildPagination() {
    return function Pagination(url, headers, forceHttps, paramConfig) {
        var sub = new rxjs_1.Subject();
        setTimeout(function () {
            return loop(sub, url, headers, true, forceHttps, paramConfig);
        });
        return sub;
    };
}
exports.BuildPagination = BuildPagination;
function loop(sub, url, headers, first, forceHttps, paramConfig) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (sub.observers.length >= 1 || first) {
                if (!first && forceHttps) {
                    url = url.replace("http://", "https://");
                }
                request({
                    url: url,
                    headers: headers,
                    qs: paramConfig ? paramConfig.params : {}
                }, function (err, res, body) {
                    if (err) {
                        console.error("Error with request");
                        console.log(err);
                        sub.complete();
                        return;
                    }
                    try {
                        var parsedBody = JSON.parse(body);
                        sub.next(parsedBody);
                        if (paramConfig) {
                            var checkProp = paramConfig.checkProp, nextProp = paramConfig.nextProp;
                            if (!nextProp || !checkProp) {
                                throw new Error("Missing Param Config");
                            }
                            var hasMore = parsedBody[checkProp];
                            var nextValue = parsedBody[nextProp];
                            if (hasMore && nextValue) {
                                if (!paramConfig.params) {
                                    paramConfig.params = {};
                                }
                                paramConfig.params[nextProp] = nextValue;
                                loop(sub, url, headers, false, forceHttps, paramConfig);
                            }
                            else {
                                sub.complete();
                                return;
                            }
                        }
                        else {
                            var nextHeaders = parseNextHeaders(res.headers);
                            if (!nextHeaders) {
                                throw new Error("Not a paginated api");
                            }
                            if (nextHeaders.next) {
                                loop(sub, nextHeaders.next, headers, false, forceHttps);
                            }
                            else {
                                sub.complete();
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                        sub.complete();
                        return;
                    }
                });
            }
            return [2];
        });
    });
}
function parseNextHeaders(headers) {
    var link = headers.link;
    if (!link) {
        return;
    }
    var nextHeaders = {
        next: undefined,
        prev: undefined
    };
    var relArray = link.split(", ");
    relArray.forEach(function (item) {
        var split = item.split("; ");
        var url = split[0].replace("<", "").replace(">", "");
        if (split[1].includes("next")) {
            nextHeaders.next = url;
        }
        else if (split[1].includes("prev")) {
            nextHeaders.prev = url;
        }
    });
    return nextHeaders;
}
