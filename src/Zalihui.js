"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Zalihui = void 0;
var tezcatl_cli_1 = require("@makechtec/tezcatl-cli");
var fs = require("node:fs");
var Zalihui = /** @class */ (function () {
    function Zalihui() {
    }
    Zalihui.prototype.run = function () {
        var targetFile = this.read();
        var matchesAll = this.extractImportMatches(targetFile);
        var matchesNoRepeat = this.removeRepeat(matchesAll);
        var targetFileWithoutImports = this.removeAllImports(targetFile, matchesAll);
        var importsAdded = this.appendImports(targetFileWithoutImports, matchesNoRepeat);
        var withoutExportDefaults = this.removeAllExportDefaults(importsAdded);
        tezcatl_cli_1.Writter.writeFile(tezcatl_cli_1.CLI.getArgumentValue("target").value, withoutExportDefaults);
    };
    Zalihui.prototype.removeAllExportDefaults = function (text) {
        var regE = new RegExp(EXPORT_DEFAULT_STATEMENT, "g");
        return text.replace(regE, "export ");
    };
    Zalihui.prototype.appendImports = function (text, imports) {
        var firstString = imports.reduce(function (prev, current) {
            return prev + current.content;
        }, "");
        return firstString + text;
    };
    Zalihui.prototype.removeAllImports = function (text, imports) {
        imports.forEach(function (imp) {
            text = text.replace(imp.content, "");
        });
        return text;
    };
    Zalihui.prototype.removeRepeat = function (matchesAll) {
        var matchesNoRepeat = __spreadArray([], __read(matchesAll), false);
        var temp = __spreadArray([], __read(matchesAll), false);
        var indexRepeateds = [];
        matchesAll.forEach(function (match1) {
            temp.splice(temp.indexOf(match1), 1);
            temp.forEach(function (match2) {
                if (match1.content === match2.content) {
                    indexRepeateds.push(matchesAll.indexOf(match2));
                }
            });
        });
        indexRepeateds.forEach(function (index) {
            matchesNoRepeat.splice(index, 1);
        });
        return matchesNoRepeat;
    };
    Zalihui.prototype.extractImportMatches = function (targetFile) {
        var startRegex = new RegExp(IMPORT_STATEMENT, "g");
        var result;
        var matchesAll = [];
        while ((result = startRegex.exec(targetFile)) !== null) {
            var pointer = new Pointer();
            pointer.startIndex = result.index;
            pointer.endIndex = startRegex.lastIndex;
            pointer.content = result[0];
            matchesAll.push(pointer);
        }
        return matchesAll;
    };
    Zalihui.prototype.read = function () {
        var bigFile = "";
        var target = tezcatl_cli_1.CLI.getArgumentValue("target");
        var sources = tezcatl_cli_1.CLI.getArgumentsGroup("source");
        sources.forEach(function (source) {
            bigFile += fs.readFileSync(source.value, "utf8") + "\n";
        });
        return bigFile;
    };
    return Zalihui;
}());
exports.Zalihui = Zalihui;
var Pointer = /** @class */ (function () {
    function Pointer() {
    }
    return Pointer;
}());
var IMPORT_STATEMENT = "import\s*(.*)\s*from\s*(.*)\s*;\s*\n";
var EXPORT_DEFAULT_STATEMENT = "export {1,}default ";
