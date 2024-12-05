var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("@scom/scom-dapp-container/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EVENT = void 0;
    var EVENT;
    (function (EVENT) {
        EVENT["UPDATE_TAG"] = "UPDATE_TAG";
    })(EVENT || (EVENT = {}));
    exports.EVENT = EVENT;
    ;
});
define("@scom/scom-dapp-container/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    const spin = components_1.Styles.keyframes({
        "to": {
            "-webkit-transform": "rotate(360deg)"
        }
    });
    exports.default = components_1.Styles.style({
        $nest: {
            '.spinner': {
                display: "inline-block",
                width: "50px",
                height: "50px",
                border: "3px solid rgba(255,255,255,.3)",
                borderRadius: "50%",
                borderTopColor: Theme.colors.primary.main,
                "animation": `${spin} 1s ease-in-out infinite`,
                "-webkit-animation": `${spin} 1s ease-in-out infinite`
            }
        }
    });
});
define("@scom/scom-dapp-container/body.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerBody = void 0;
    let DappContainerBody = class DappContainerBody extends components_2.Module {
        constructor() {
            super(...arguments);
            this.isLoading = false;
            this.isInited = false;
        }
        clear() {
            this.pnlModule.clearInnerHTML();
            this.module = null;
        }
        getModule() {
            return this.module;
        }
        setModule(module) {
            this.module = module;
            if (!this.pnlModule)
                return;
            this.module.parent = this.pnlModule;
            this.pnlModule.append(this.module);
        }
        init() {
            super.init();
            this.isInited = true;
        }
        render() {
            return (this.$render("i-panel", { id: "pnlModule" }));
        }
    };
    DappContainerBody = __decorate([
        (0, components_2.customElements)('dapp-container-body')
    ], DappContainerBody);
    exports.DappContainerBody = DappContainerBody;
});
///<amd-module name='@scom/scom-dapp-container/utils/pathToRegexp.ts'/> 
/*---------------------------------------------------------------------------------------------
  *  Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com)
  *  Licensed under the MIT License.
  *  https://github.com/pillarjs/path-to-regexp/blob/1cbb9f3d9c3bff97298ec45b1bb2b0beb879babf/LICENSE
  *--------------------------------------------------------------------------------------------*/
define("@scom/scom-dapp-container/utils/pathToRegexp.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pathToRegexp = exports.tokensToRegexp = exports.regexpToFunction = exports.match = exports.tokensToFunction = exports.compile = exports.parse = void 0;
    /**
     * Tokenize input string.
     */
    function lexer(str) {
        const tokens = [];
        let i = 0;
        while (i < str.length) {
            const char = str[i];
            if (char === "*" || char === "+" || char === "?") {
                tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
                continue;
            }
            if (char === "\\") {
                tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
                continue;
            }
            if (char === "{") {
                tokens.push({ type: "OPEN", index: i, value: str[i++] });
                continue;
            }
            if (char === "}") {
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
                continue;
            }
            if (char === ":") {
                let name = "";
                let j = i + 1;
                while (j < str.length) {
                    const code = str.charCodeAt(j);
                    if (
                    // `0-9`
                    (code >= 48 && code <= 57) ||
                        // `A-Z`
                        (code >= 65 && code <= 90) ||
                        // `a-z`
                        (code >= 97 && code <= 122) ||
                        // `_`
                        code === 95) {
                        name += str[j++];
                        continue;
                    }
                    break;
                }
                if (!name)
                    throw new TypeError(`Missing parameter name at ${i}`);
                tokens.push({ type: "NAME", index: i, value: name });
                i = j;
                continue;
            }
            if (char === "(") {
                let count = 1;
                let pattern = "";
                let j = i + 1;
                if (str[j] === "?") {
                    throw new TypeError(`Pattern cannot start with "?" at ${j}`);
                }
                while (j < str.length) {
                    if (str[j] === "\\") {
                        pattern += str[j++] + str[j++];
                        continue;
                    }
                    if (str[j] === ")") {
                        count--;
                        if (count === 0) {
                            j++;
                            break;
                        }
                    }
                    else if (str[j] === "(") {
                        count++;
                        if (str[j + 1] !== "?") {
                            throw new TypeError(`Capturing groups are not allowed at ${j}`);
                        }
                    }
                    pattern += str[j++];
                }
                if (count)
                    throw new TypeError(`Unbalanced pattern at ${i}`);
                if (!pattern)
                    throw new TypeError(`Missing pattern at ${i}`);
                tokens.push({ type: "PATTERN", index: i, value: pattern });
                i = j;
                continue;
            }
            tokens.push({ type: "CHAR", index: i, value: str[i++] });
        }
        tokens.push({ type: "END", index: i, value: "" });
        return tokens;
    }
    /**
     * Parse a string for the raw tokens.
     */
    function parse(str, options = {}) {
        const tokens = lexer(str);
        const { prefixes = "./" } = options;
        const defaultPattern = `[^${escapeString(options.delimiter || "/#?")}]+?`;
        const result = [];
        let key = 0;
        let i = 0;
        let path = "";
        const tryConsume = (type) => {
            if (i < tokens.length && tokens[i].type === type)
                return tokens[i++].value;
        };
        const mustConsume = (type) => {
            const value = tryConsume(type);
            if (value !== undefined)
                return value;
            const { type: nextType, index } = tokens[i];
            throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
        };
        const consumeText = () => {
            let result = "";
            let value;
            while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
                result += value;
            }
            return result;
        };
        while (i < tokens.length) {
            const char = tryConsume("CHAR");
            const name = tryConsume("NAME");
            const pattern = tryConsume("PATTERN");
            if (name || pattern) {
                let prefix = char || "";
                if (prefixes.indexOf(prefix) === -1) {
                    path += prefix;
                    prefix = "";
                }
                if (path) {
                    result.push(path);
                    path = "";
                }
                result.push({
                    name: name || key++,
                    prefix,
                    suffix: "",
                    pattern: pattern || defaultPattern,
                    modifier: tryConsume("MODIFIER") || "",
                });
                continue;
            }
            const value = char || tryConsume("ESCAPED_CHAR");
            if (value) {
                path += value;
                continue;
            }
            if (path) {
                result.push(path);
                path = "";
            }
            const open = tryConsume("OPEN");
            if (open) {
                const prefix = consumeText();
                const name = tryConsume("NAME") || "";
                const pattern = tryConsume("PATTERN") || "";
                const suffix = consumeText();
                mustConsume("CLOSE");
                result.push({
                    name: name || (pattern ? key++ : ""),
                    pattern: name && !pattern ? defaultPattern : pattern,
                    prefix,
                    suffix,
                    modifier: tryConsume("MODIFIER") || "",
                });
                continue;
            }
            mustConsume("END");
        }
        return result;
    }
    exports.parse = parse;
    /**
     * Compile a string to a template function for the path.
     */
    function compile(str, options) {
        return tokensToFunction(parse(str, options), options);
    }
    exports.compile = compile;
    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction(tokens, options = {}) {
        const reFlags = flags(options);
        const { encode = (x) => x, validate = true } = options;
        // Compile all the tokens into regexps.
        const matches = tokens.map((token) => {
            if (typeof token === "object") {
                return new RegExp(`^(?:${token.pattern})$`, reFlags);
            }
        });
        return (data) => {
            let path = "";
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (typeof token === "string") {
                    path += token;
                    continue;
                }
                const value = data ? data[token.name] : undefined;
                const optional = token.modifier === "?" || token.modifier === "*";
                const repeat = token.modifier === "*" || token.modifier === "+";
                if (Array.isArray(value)) {
                    if (!repeat) {
                        throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
                    }
                    if (value.length === 0) {
                        if (optional)
                            continue;
                        throw new TypeError(`Expected "${token.name}" to not be empty`);
                    }
                    for (let j = 0; j < value.length; j++) {
                        const segment = encode(value[j], token);
                        if (validate && !matches[i].test(segment)) {
                            throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                        }
                        path += token.prefix + segment + token.suffix;
                    }
                    continue;
                }
                if (typeof value === "string" || typeof value === "number") {
                    const segment = encode(String(value), token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                    }
                    path += token.prefix + segment + token.suffix;
                    continue;
                }
                if (optional)
                    continue;
                const typeOfMessage = repeat ? "an array" : "a string";
                throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}`);
            }
            return path;
        };
    }
    exports.tokensToFunction = tokensToFunction;
    /**
     * Create path match function from `path-to-regexp` spec.
     */
    function match(str, options) {
        const keys = [];
        const re = pathToRegexp(str, keys, options);
        return regexpToFunction(re, keys, options);
    }
    exports.match = match;
    /**
     * Create a path match function from `path-to-regexp` output.
     */
    function regexpToFunction(re, keys, options = {}) {
        const { decode = (x) => x } = options;
        return function (pathname) {
            const m = re.exec(pathname);
            if (!m)
                return false;
            const { 0: path, index } = m;
            const params = Object.create(null);
            for (let i = 1; i < m.length; i++) {
                if (m[i] === undefined)
                    continue;
                const key = keys[i - 1];
                if (key.modifier === "*" || key.modifier === "+") {
                    params[key.name] = m[i].split(key.prefix + key.suffix).map((value) => {
                        return decode(value, key);
                    });
                }
                else {
                    params[key.name] = decode(m[i], key);
                }
            }
            return { path, index, params };
        };
    }
    exports.regexpToFunction = regexpToFunction;
    /**
     * Escape a regular expression string.
     */
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
    }
    /**
     * Get the flags for a regexp from the options.
     */
    function flags(options) {
        return options && options.sensitive ? "" : "i";
    }
    /**
     * Pull out keys from a regexp.
     */
    function regexpToRegexp(path, keys) {
        if (!keys)
            return path;
        const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
        let index = 0;
        let execResult = groupsRegex.exec(path.source);
        while (execResult) {
            keys.push({
                // Use parenthesized substring match if available, index otherwise
                name: execResult[1] || index++,
                prefix: "",
                suffix: "",
                modifier: "",
                pattern: "",
            });
            execResult = groupsRegex.exec(path.source);
        }
        return path;
    }
    /**
     * Transform an array into a regexp.
     */
    function arrayToRegexp(paths, keys, options) {
        const parts = paths.map((path) => pathToRegexp(path, keys, options).source);
        return new RegExp(`(?:${parts.join("|")})`, flags(options));
    }
    /**
     * Create a path regexp from string input.
     */
    function stringToRegexp(path, keys, options) {
        return tokensToRegexp(parse(path, options), keys, options);
    }
    /**
     * Expose a function for taking tokens and returning a RegExp.
     */
    function tokensToRegexp(tokens, keys, options = {}) {
        const { strict = false, start = true, end = true, encode = (x) => x, delimiter = "/#?", endsWith = "", } = options;
        const endsWithRe = `[${escapeString(endsWith)}]|$`;
        const delimiterRe = `[${escapeString(delimiter)}]`;
        let route = start ? "^" : "";
        // Iterate over the tokens and create our regexp string.
        for (const token of tokens) {
            if (typeof token === "string") {
                route += escapeString(encode(token));
            }
            else {
                const prefix = escapeString(encode(token.prefix));
                const suffix = escapeString(encode(token.suffix));
                if (token.pattern) {
                    if (keys)
                        keys.push(token);
                    if (prefix || suffix) {
                        if (token.modifier === "+" || token.modifier === "*") {
                            const mod = token.modifier === "*" ? "?" : "";
                            route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
                        }
                        else {
                            route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
                        }
                    }
                    else {
                        if (token.modifier === "+" || token.modifier === "*") {
                            route += `((?:${token.pattern})${token.modifier})`;
                        }
                        else {
                            route += `(${token.pattern})${token.modifier}`;
                        }
                    }
                }
                else {
                    route += `(?:${prefix}${suffix})${token.modifier}`;
                }
            }
        }
        if (end) {
            if (!strict)
                route += `${delimiterRe}?`;
            route += !options.endsWith ? "$" : `(?=${endsWithRe})`;
        }
        else {
            const endToken = tokens[tokens.length - 1];
            const isEndDelimited = typeof endToken === "string"
                ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
                : endToken === undefined;
            if (!strict) {
                route += `(?:${delimiterRe}(?=${endsWithRe}))?`;
            }
            if (!isEndDelimited) {
                route += `(?=${delimiterRe}|${endsWithRe})`;
            }
        }
        return new RegExp(route, flags(options));
    }
    exports.tokensToRegexp = tokensToRegexp;
    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     */
    function pathToRegexp(path, keys, options) {
        if (path instanceof RegExp)
            return regexpToRegexp(path, keys);
        if (Array.isArray(path))
            return arrayToRegexp(path, keys, options);
        return stringToRegexp(path, keys, options);
    }
    exports.pathToRegexp = pathToRegexp;
});
define("@scom/scom-dapp-container/utils/theme.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lightTheme = exports.darkTheme = void 0;
    ///<amd-module name='@scom/scom-dapp-container/utils/theme.ts'/> 
    exports.darkTheme = {
        "background": {
            "main": "#0C1234",
            "modal": "#192046",
            "gradient": "linear-gradient(254.8deg, #E75B66 -8.08%, #B52082 84.35%)"
        },
        "input": {
            "background": "#232B5A",
            "fontColor": "rgba(255, 255, 255, 0.3)"
        },
        "text": {
            "primary": "#fff",
            "secondary": "#fff"
        },
        "colors": {
            "primary": {
                "main": "#ff9800",
                "contrastText": "#fff"
            },
            "secondary": {
                "main": "#222237",
                "contrastText": "#fff"
            }
        },
        "buttons": {
            "primary": {
                "background": "transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box",
                "hoverBackground": "linear-gradient(255deg,#f15e61,#b52082)",
                "disabledBackground": "transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box",
            },
            "secondary": {
                "background": "transparent linear-gradient(255deg,#e75b66,#b52082) 0% 0% no-repeat padding-box",
                "hoverBackground": "linear-gradient(255deg,#f15e61,#b52082)",
                "disabledBackground": "transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box",
            }
        }
    };
    exports.lightTheme = {
        "background": {
            "modal": "#fff",
            "main": "#DBDBDB"
        },
        "input": {
            "background": "#fff",
            "fontColor": "#323232"
        },
        "text": {
            "primary": "#333333",
            "secondary": "#33333"
        },
        "colors": {
            "primary": {
                "main": "#ff9800",
                "contrastText": "#fff"
            },
            "secondary": {
                "main": "#222237",
                "contrastText": "#fff"
            }
        },
        "buttons": {
            "primary": {
                "background": "transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box",
                "hoverBackground": "linear-gradient(255deg,#f15e61,#b52082)",
                "disabledBackground": "transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box",
            },
            "secondary": {
                "background": "transparent linear-gradient(255deg,#e75b66,#b52082) 0% 0% no-repeat padding-box",
                "hoverBackground": "linear-gradient(255deg,#f15e61,#b52082)",
                "disabledBackground": "transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box",
            }
        }
    };
});
define("@scom/scom-dapp-container/utils/index.ts", ["require", "exports", "@scom/scom-dapp-container/utils/pathToRegexp.ts", "@ijstech/components", "@scom/scom-dapp-container/utils/theme.ts"], function (require, exports, pathToRegexp_1, components_3, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.match = exports.updateTheme = exports.formatNumber = void 0;
    Object.defineProperty(exports, "match", { enumerable: true, get: function () { return pathToRegexp_1.match; } });
    const formatNumber = (value, decimalFigures) => {
        const newValue = (typeof value === 'object') ? value.toFixed() : value;
        const minValue = '0.0000001';
        return components_3.FormatUtils.formatNumber(newValue, { decimalFigures: decimalFigures || 4, minValue });
    };
    exports.formatNumber = formatNumber;
    function updateStyle(target, name, value) {
        value ?
            target.style.setProperty(name, value) :
            target.style.removeProperty(name);
    }
    function updateTheme(target, theme) {
        if (!theme)
            theme = {};
        updateStyle(target, '--text-primary', theme.fontColor);
        updateStyle(target, '--background-main', theme.backgroundColor);
        updateStyle(target, '--input-font_color', theme.inputFontColor);
        updateStyle(target, '--input-background', theme.inputBackgroundColor);
        updateStyle(target, '--colors-primary-main', theme.buttonBackgroundColor);
        updateStyle(target, '--colors-primary-contrast_text', theme.buttonFontColor);
        updateStyle(target, '--background-modal', theme.modalColor);
        updateStyle(target, '--colors-secondary-main', theme.secondaryColor);
        updateStyle(target, '--colors-secondary-contrast_text', theme.secondaryFontColor);
        updateStyle(target, '--primary-button-background', theme.primaryButtonBackground);
        updateStyle(target, '--primary-button-hover-background', theme.primaryButtonHoverBackground);
        updateStyle(target, '--primary-button-disabled-background', theme.primaryButtonDisabledBackground);
        updateStyle(target, '--max-button-background', theme.maxButtonBackground);
        updateStyle(target, '--max-button-hover-background', theme.maxButtonHoverBackground);
    }
    exports.updateTheme = updateTheme;
    __exportStar(theme_1, exports);
});
define("@scom/scom-dapp-container/header.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.walletModalStyle = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    exports.walletModalStyle = components_4.Styles.style({
        boxSizing: 'border-box',
        $nest: {
            '.i-modal_header': {
                borderRadius: '10px 10px 0 0',
                background: 'unset',
                borderBottom: `2px solid ${Theme.divider}`,
                padding: '1rem',
                fontWeight: 700,
                fontSize: '1rem'
            },
            '.list-view': {
                $nest: {
                    '.list-item:hover': {
                        $nest: {
                            '> *': {
                                opacity: 1
                            }
                        }
                    },
                    '.list-item': {
                        cursor: 'pointer',
                        transition: 'all .3s ease-in',
                        $nest: {
                            '&.disabled-network-selection': {
                                cursor: 'default',
                                $nest: {
                                    '&:hover > *': {
                                        opacity: '0.5 !important',
                                    }
                                }
                            },
                            '> *': {
                                opacity: .5
                            }
                        }
                    },
                    '.list-item.is-actived': {
                        $nest: {
                            '> *': {
                                opacity: 1
                            },
                            '&:after': {
                                content: "''",
                                top: '50%',
                                left: 12,
                                position: 'absolute',
                                background: '#20bf55',
                                borderRadius: '50%',
                                width: 10,
                                height: 10,
                                transform: 'translate3d(-50%,-50%,0)'
                            }
                        }
                    }
                }
            }
        }
    });
    exports.default = components_4.Styles.style({
        $nest: {
            '::-webkit-scrollbar-track': {
                borderRadius: '12px',
                border: '1px solid transparent',
                backgroundColor: 'unset'
            },
            '::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: 'unset'
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2) 0% 0% no-repeat padding-box'
            },
            '.os-modal': {
                boxSizing: 'border-box',
                $nest: {
                    '.i-modal_header': {
                        borderRadius: '10px 10px 0 0',
                        background: 'unset',
                        borderBottom: `2px solid ${Theme.divider}`,
                        padding: '1rem',
                        fontWeight: 700,
                        fontSize: '1rem'
                    },
                    '.list-view': {
                        $nest: {
                            '.list-item:hover': {
                                $nest: {
                                    '> *': {
                                        opacity: 1
                                    }
                                }
                            },
                            '.list-item': {
                                cursor: 'pointer',
                                transition: 'all .3s ease-in',
                                $nest: {
                                    '&.disabled-network-selection': {
                                        cursor: 'default',
                                        $nest: {
                                            '&:hover > *': {
                                                opacity: '0.5 !important',
                                            }
                                        }
                                    },
                                    '> *': {
                                        opacity: .5
                                    }
                                }
                            },
                            '.list-item.is-actived': {
                                $nest: {
                                    '> *': {
                                        opacity: 1
                                    },
                                    '&:after': {
                                        content: "''",
                                        top: '50%',
                                        left: 12,
                                        position: 'absolute',
                                        background: '#20bf55',
                                        borderRadius: '50%',
                                        width: 10,
                                        height: 10,
                                        transform: 'translate3d(-50%,-50%,0)'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '.header-logo > img': {
                maxHeight: 'unset',
                maxWidth: 'unset'
            },
            '.wallet-modal > div': {
                boxShadow: 'rgb(0 0 0 / 10%) 0px 0px 5px 0px, rgb(0 0 0 / 10%) 0px 0px 1px 0px'
            },
            '.wallet-modal .modal': {
                minWidth: 200
            },
            '.custom-switch .wrapper': {
                borderRadius: 40,
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.15)',
                $nest: {
                    '.switch-base': {
                        background: Theme.background.gradient
                    },
                    '.track::before': {
                        fontSize: 18,
                        color: Theme.text.primary
                    },
                    '.track::after': {
                        transform: 'translateY(-50%) rotate(-30deg)',
                        fontSize: 18,
                        color: '#fff'
                    },
                    '.track': {
                        background: 'linear-gradient(0deg, #252A48, #252A48), #8994A3',
                        color: 'transparent'
                    },
                    '.switch-base.checked +.track': {
                        background: Theme.background.main
                    }
                }
            },
            'i-button': {
                boxShadow: 'none'
            }
        }
    });
});
define("@scom/scom-dapp-container/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list", "@scom/scom-multicall"], function (require, exports, components_5, eth_wallet_1, scom_network_list_1, scom_multicall_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewOnExplorerByAddress = exports.viewOnExplorerByTxHash = exports.State = exports.getWalletProvider = exports.getWallet = exports.registerSendTxEvents = exports.logoutWallet = exports.switchNetwork = exports.connectWallet = exports.isClientWalletConnected = exports.WalletPlugin = void 0;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    ;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
    async function createWalletPluginConfigProvider(wallet, pluginName, packageName, events, options) {
        switch (pluginName) {
            case WalletPlugin.MetaMask:
                return new eth_wallet_1.MetaMaskProvider(wallet, events, options);
            case WalletPlugin.WalletConnect:
                return new eth_wallet_1.Web3ModalProvider(wallet, events, options);
            default: {
                if (packageName) {
                    const provider = await components_5.application.loadPackage(packageName, '*');
                    return new provider(wallet, events, options);
                }
            }
        }
    }
    async function connectWallet(state, walletPlugin, triggeredByUser = false) {
        let wallet = eth_wallet_1.Wallet.getClientInstance();
        if (triggeredByUser || state.isFirstLoad) {
            let provider = state.getWalletPluginProvider(walletPlugin);
            if (provider?.installed()) {
                await wallet.connect(provider, {
                    userTriggeredConnect: triggeredByUser
                });
            }
            state.isFirstLoad = false;
        }
        return wallet;
    }
    exports.connectWallet = connectWallet;
    async function switchNetwork(state, chainId) {
        const rpcWallet = state.getRpcWallet();
        if (!rpcWallet)
            return;
        await rpcWallet.switchNetwork(chainId);
    }
    exports.switchNetwork = switchNetwork;
    async function logoutWallet() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        await wallet.disconnect();
        localStorage.setItem('walletProvider', '');
        components_5.application.EventBus.dispatch("IsWalletDisconnected" /* EventId.IsWalletDisconnected */, false);
    }
    exports.logoutWallet = logoutWallet;
    function registerSendTxEvents(sendTxEventHandlers) {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        wallet.registerSendTxEvents({
            transactionHash: (error, receipt) => {
                if (sendTxEventHandlers.transactionHash) {
                    sendTxEventHandlers.transactionHash(error, receipt);
                }
            },
            confirmation: (receipt) => {
                if (sendTxEventHandlers.confirmation) {
                    sendTxEventHandlers.confirmation(receipt);
                }
            },
        });
    }
    exports.registerSendTxEvents = registerSendTxEvents;
    ;
    function getWallet() {
        return eth_wallet_1.Wallet.getInstance();
    }
    exports.getWallet = getWallet;
    ;
    function getWalletProvider() {
        return localStorage.getItem('walletProvider') || '';
    }
    exports.getWalletProvider = getWalletProvider;
    ;
    class State {
        constructor() {
            this.networkMap = {};
            this.defaultChainId = 0;
            this.infuraId = "";
            this.wallets = [];
            this.walletPluginMap = {};
            this.rpcWalletId = "";
            this.isFirstLoad = true;
            this.getNetworkInfo = (chainId) => {
                return this.networkMap[chainId];
            };
        }
        update(data) {
            if (data.defaultChainId)
                this.defaultChainId = data.defaultChainId;
            if (data.networks)
                this.setNetworkList(data.networks);
            if (data.wallets)
                this.wallets = data.wallets;
            if (data.rpcWalletId) {
                this.rpcWalletId = data.rpcWalletId;
            }
            if (!eth_wallet_1.Wallet.getClientInstance().chainId && data.defaultChainId) { //FIXME: make sure there's data
                const clientWalletConfig = {
                    defaultChainId: this.defaultChainId,
                    networks: Object.values(this.networkMap),
                    infuraId: this.infuraId,
                    multicalls: (0, scom_multicall_1.getMulticallInfoList)()
                };
                eth_wallet_1.Wallet.getClientInstance().initClientWallet(clientWalletConfig);
            }
        }
        async initWalletPlugins() {
            let wallet = eth_wallet_1.Wallet.getClientInstance();
            let networkList = this.getSiteSupportedNetworks();
            const rpcs = {};
            for (const network of networkList) {
                let rpc = network.rpcUrls[0];
                if (rpc)
                    rpcs[network.chainId] = rpc;
            }
            for (let walletPlugin of this.wallets) {
                let pluginName = walletPlugin.name;
                let providerOptions;
                if (pluginName == WalletPlugin.WalletConnect) {
                    let mainChainId = this.defaultChainId;
                    let optionalChains = networkList.map((network) => network.chainId).filter((chainId) => chainId !== mainChainId);
                    let walletConnectConfig = components_5.application.store?.walletConnectConfig;
                    providerOptions = {
                        ...walletConnectConfig,
                        name: pluginName,
                        infuraId: this.infuraId,
                        chains: [mainChainId],
                        optionalChains: optionalChains,
                        rpc: rpcs,
                        useDefaultProvider: true
                    };
                }
                else {
                    providerOptions = {
                        name: pluginName,
                        infuraId: this.infuraId,
                        rpc: rpcs,
                        useDefaultProvider: true
                    };
                }
                let clientSideProvider = this.getWalletPluginProvider(pluginName);
                if (!clientSideProvider) {
                    let provider = await createWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, {}, providerOptions);
                    this.walletPluginMap[pluginName] = {
                        name: pluginName,
                        packageName: walletPlugin.packageName,
                        provider
                    };
                }
            }
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
                    for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
                        networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = {
                    ...networkInfo,
                    ...network
                };
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        getSupportedWalletProviders() {
            const providers = this.wallets.map(v => this.walletPluginMap[v.name]?.provider);
            return providers.filter(provider => provider);
        }
        getSiteSupportedNetworks() {
            let networkFullList = Object.values(this.networkMap);
            let list = networkFullList.filter(network => !network.isDisabled);
            return list;
        }
        getWalletPluginProvider(name) {
            return this.walletPluginMap[name]?.provider;
        }
        getRpcWallet() {
            return eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId);
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet?.chainId;
        }
        ;
        hasMetaMask() {
            const provider = this.getWalletPluginProvider(WalletPlugin.MetaMask);
            return provider?.installed() || false;
        }
    }
    exports.State = State;
    const viewOnExplorerByTxHash = (state, chainId, txHash) => {
        let network = state.getNetworkInfo(chainId);
        if (network && network.explorerTxUrl) {
            let url = `${network.explorerTxUrl}${txHash}`;
            window.open(url);
        }
    };
    exports.viewOnExplorerByTxHash = viewOnExplorerByTxHash;
    const viewOnExplorerByAddress = (state, chainId, address) => {
        let network = state.getNetworkInfo(chainId);
        if (network && network.explorerAddressUrl) {
            let url = `${network.explorerAddressUrl}${address}`;
            window.open(url);
        }
    };
    exports.viewOnExplorerByAddress = viewOnExplorerByAddress;
});
define("@scom/scom-dapp-container/translations.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-dapp-container/translations.json.ts'/> 
    exports.default = {
        "en": {
            "account": "Account",
            "connect_wallet": "Connect Wallet",
            "connect": "Connect",
            "connected_with": "Connected with",
            "copy_address": "Copy Address",
            "logout": "Logout",
            "no_address_selected": "No address selected",
            "powered_by": "Powered By",
            "recommended_wallet_for_chrome": "Recommended wallet for Chrome",
            "supported_networks": "Supported Networks",
            "switch_wallet": "Switch wallet",
            "the_address_has_been_copied": "The address has been copied",
            "unsupported_network": "Unsupported Network",
            "view_on_explorer": "View on Explorer",
            "we_support_the_following_networks_please_click_to_connect": "We support the following networks, please click to connect.",
            "we_support_the_following_networks_please_switch_network_in_the_connected_wallet": "We support the following networks, please switch network in the connected wallet.",
        },
        "zh-hant": {
            "account": "帳戶",
            "connect_wallet": "連接錢包",
            "connect": "連接",
            "connected_with": "已連接至",
            "copy_address": "複製地址",
            "logout": "登出",
            "no_address_selected": "未選擇地址",
            "powered_by": "由...提供支持",
            "recommended_wallet_for_chrome": "推薦的 Chrome 錢包",
            "supported_networks": "支持的網絡",
            "switch_wallet": "切換錢包",
            "the_address_has_been_copied": "地址已複製",
            "unsupported_network": "不支持的網絡",
            "view_on_explorer": "在瀏覽器上查看",
            "we_support_the_following_networks_please_click_to_connect": "我們支持以下網絡，請點擊連接。",
            "we_support_the_following_networks_please_switch_network_in_the_connected_wallet": "我們支持以下網絡，請在已連接的錢包中切換網絡。",
        },
        "vi": {
            "account": "Tài khoản",
            "connect_wallet": "Kết nối ví",
            "connect": "Kết nối",
            "connected_with": "Đã kết nối với",
            "copy_address": "Sao chép địa chỉ",
            "logout": "Đăng xuất",
            "no_address_selected": "Chưa chọn địa chỉ",
            "powered_by": "Được hỗ trợ bởi",
            "recommended_wallet_for_chrome": "Ví được khuyến nghị cho Chrome",
            "supported_networks": "Các mạng được hỗ trợ",
            "switch_wallet": "Chuyển ví",
            "the_address_has_been_copied": "Địa chỉ đã được sao chép",
            "unsupported_network": "Mạng không được hỗ trợ",
            "view_on_explorer": "Xem trên trình khám phá",
            "we_support_the_following_networks_please_click_to_connect": "Chúng tôi hỗ trợ các mạng sau, vui lòng nhấp để kết nối.",
            "we_support_the_following_networks_please_switch_network_in_the_connected_wallet": "Chúng tôi hỗ trợ các mạng sau, vui lòng chuyển mạng trong ví đã kết nối.",
        }
    };
});
define("@scom/scom-dapp-container/connectWalletModule.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-dapp-container/store/index.ts", "@scom/scom-dapp-container/translations.json.ts"], function (require, exports, components_6, eth_wallet_2, store_1, translations_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectWalletModule = void 0;
    const Theme = components_6.Styles.Theme.ThemeVars;
    let ConnectWalletModule = class ConnectWalletModule extends components_6.Module {
        constructor() {
            super(...arguments);
            this.connectToProviderFunc = async (walletPlugin) => {
                const provider = this.state.getWalletPluginProvider(walletPlugin);
                if (provider?.installed()) {
                    await (0, store_1.connectWallet)(this.state, walletPlugin, true);
                }
                else {
                    let homepage = provider.homepage;
                    this.openLink(homepage);
                }
                if (this.onWalletConnected)
                    this.onWalletConnected();
            };
        }
        setState(state) {
            this.state = state;
        }
        openLink(link) {
            return window.open(link, '_blank');
        }
        ;
        isWalletActive(walletPlugin) {
            const provider = this.state.getWalletPluginProvider(walletPlugin);
            return provider ? provider.installed() && eth_wallet_2.Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
        }
        updateDot(connected) {
            const wallet = eth_wallet_2.Wallet.getClientInstance();
            if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
                this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
            }
            if (connected && this.walletMapper.has(wallet.clientSideProvider?.name)) {
                this.walletMapper.get(wallet.clientSideProvider?.name).classList.add('is-actived');
            }
            this.currActiveWallet = wallet.clientSideProvider?.name;
        }
        async renderWalletList() {
            await this.state.initWalletPlugins();
            this.gridWalletList.clearInnerHTML();
            this.walletMapper = new Map();
            const walletList = this.state.getSupportedWalletProviders();
            walletList.forEach((wallet) => {
                const isActive = this.isWalletActive(wallet.name);
                if (isActive)
                    this.currActiveWallet = wallet.name;
                const hsWallet = (this.$render("i-hstack", { class: isActive ? 'is-actived list-item' : 'list-item', verticalAlignment: 'center', gap: 12, background: { color: Theme.colors.secondary.light }, border: { radius: 10 }, position: "relative", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, horizontalAlignment: "space-between", onClick: () => this.connectToProviderFunc(wallet.name) },
                    this.$render("i-label", { caption: wallet.displayName, margin: { left: '1rem' }, wordBreak: "break-word", font: { size: '.875rem', bold: true, color: Theme.colors.secondary.contrastText } }),
                    this.$render("i-image", { width: 34, height: "auto", url: wallet.image || '' })));
                this.walletMapper.set(wallet.name, hsWallet);
                this.gridWalletList.append(hsWallet);
            });
        }
        init() {
            this.i18n.init({ ...translations_json_1.default });
            super.init();
        }
        render() {
            return (this.$render("i-vstack", { padding: { left: '1rem', right: '1rem', bottom: '2rem' }, lineHeight: 1.5 },
                this.$render("i-label", { font: { size: '.875rem' }, caption: '$recommended_wallet_for_chrome', margin: { top: '1rem' }, wordBreak: "break-word" }),
                this.$render("i-panel", null,
                    this.$render("i-grid-layout", { id: 'gridWalletList', class: 'list-view', margin: { top: '0.5rem' }, columnsPerRow: 1, templateRows: ['max-content'], gap: { row: 8 } }))));
        }
    };
    ConnectWalletModule = __decorate([
        (0, components_6.customElements)('dapp-container-connect-wallet-module')
    ], ConnectWalletModule);
    exports.ConnectWalletModule = ConnectWalletModule;
});
define("@scom/scom-dapp-container/header.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-dapp-container/utils/index.ts", "@scom/scom-dapp-container/header.css.ts", "@scom/scom-dapp-container/store/index.ts", "@scom/scom-dapp-container/connectWalletModule.tsx", "@scom/scom-dapp-container/translations.json.ts"], function (require, exports, components_7, eth_wallet_3, index_1, header_css_1, index_2, connectWalletModule_1, translations_json_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerHeader = void 0;
    const Theme = components_7.Styles.Theme.ThemeVars;
    let DappContainerHeader = class DappContainerHeader extends components_7.Module {
        constructor(parent, options) {
            super(parent, options);
            this.supportedNetworks = [];
            this.isInited = false;
            this.walletInfo = {
                address: '',
                balance: '',
                networkId: 0
            };
            this._showWalletNetwork = true;
            this.walletEvents = [];
            this.onChainChanged = async (chainId) => {
                this.walletInfo.networkId = chainId;
                this.selectedNetwork = this.state.getNetworkInfo(chainId);
                let clientWallet = eth_wallet_3.Wallet.getClientInstance();
                const isConnected = clientWallet.isConnected;
                const rpcWallet = this.state.getRpcWallet();
                const balance = await rpcWallet.balanceOf(clientWallet.address);
                this.walletInfo.balance = (0, index_1.formatNumber)(balance.toFixed(), 2);
                this.updateConnectedStatus(isConnected);
                this.updateList(isConnected);
            };
            this.updateConnectedStatus = async (isConnected) => {
                if (isConnected) {
                    if (!this.lblBalance.isConnected)
                        await this.lblBalance.ready();
                    this.lblBalance.caption = `${this.walletInfo.balance} ${this.symbol}`;
                    if (!this.lblWalletAddress.isConnected)
                        await this.lblWalletAddress.ready();
                    this.lblWalletAddress.caption = this.shortlyAddress;
                    if (!this.lblWalletAddress2.isConnected)
                        await this.lblWalletAddress2.ready();
                    this.lblWalletAddress2.caption = this.shortlyAddress;
                    const walletChainId = this.state.getChainId();
                    const networkInfo = this.state.getNetworkInfo(walletChainId);
                    this.hsViewAccount.visible = !!networkInfo?.explorerAddressUrl;
                }
                else {
                    this.hsViewAccount.visible = false;
                }
                if (!this.lblNetwork.isConnected)
                    await this.lblNetwork.ready();
                if (!this.imgNetwork.isConnected)
                    await this.imgNetwork.ready();
                const isSupportedNetwork = this.selectedNetwork && this.supportedNetworks.findIndex(network => network.chainId === this.selectedNetwork.chainId) !== -1;
                if (isSupportedNetwork) {
                    const img = this.selectedNetwork?.image ? this.selectedNetwork.image : '';
                    this.imgNetwork.url = img || "";
                    this.imgNetwork.visible = true;
                    this.iconNetwork.image = new components_7.Image(this, { width: 26, height: 26, url: img || "" });
                    this.lblNetwork.caption = this.selectedNetwork?.chainName ?? "";
                }
                else {
                    this.imgNetwork.visible = false;
                    this.iconNetwork.name = "question-circle";
                    this.lblNetwork.caption = "$unsupported_network";
                }
                this.btnConnectWallet.visible = !isConnected;
                this.hsBalance.visible = isConnected;
                this.pnlWalletDetail.visible = isConnected;
            };
            this.openConnectModal = () => {
                this.initConnectWalletModule('$connect_wallet');
            };
            this.openNetworkModal = () => {
                this.mdNetwork.visible = true;
            };
            this.openWalletDetailModal = () => {
                this.mdWalletDetail.visible = true;
            };
            this.openAccountModal = (target, event) => {
                event.stopPropagation();
                this.mdWalletDetail.visible = false;
                this.mdAccount.visible = true;
            };
            this.openSwitchModal = (target, event) => {
                event.stopPropagation();
                this.mdWalletDetail.visible = false;
                this.initConnectWalletModule('$switch_wallet');
            };
            this.logout = async (target, event) => {
                event.stopPropagation();
                this.mdWalletDetail.visible = false;
                await (0, index_2.logoutWallet)();
                this.updateConnectedStatus(false);
                this.updateList(false);
                this.mdAccount.visible = false;
            };
            this.copyWalletAddress = () => {
                components_7.application.copyToClipboard(this.walletInfo.address || "");
            };
        }
        ;
        get theme() {
            return this._theme;
        }
        set theme(value) {
            this._theme = value;
        }
        get symbol() {
            let symbol = '';
            if (this.selectedNetwork?.chainId && this.selectedNetwork?.symbol) {
                symbol = this.selectedNetwork?.symbol;
            }
            return symbol;
        }
        get shortlyAddress() {
            const address = this.walletInfo.address;
            if (!address)
                return 'No address selected';
            return components_7.FormatUtils.truncateWalletAddress(address);
        }
        get showWalletNetwork() {
            return this._showWalletNetwork ?? true;
        }
        set showWalletNetwork(value) {
            this._showWalletNetwork = value;
            this.pnlWallet.visible = this.showWalletNetwork;
        }
        onHide() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            for (let event of this.walletEvents) {
                clientWallet.unregisterWalletEvent(event);
            }
            this.walletEvents = [];
        }
        registerEvent() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            this.walletEvents.push(clientWallet.registerWalletEvent(this, eth_wallet_3.Constants.ClientWalletEvent.AccountsChanged, async (payload) => {
                const { userTriggeredConnect, account } = payload;
                let connected = !!account;
                if (connected) {
                    this.walletInfo.address = clientWallet.address;
                    // this.walletInfo.balance = formatNumber((await wallet.balance).toFixed(), 2);
                    const rpcWallet = this.state.getRpcWallet();
                    const balance = await rpcWallet.balanceOf(clientWallet.address);
                    this.walletInfo.balance = (0, index_1.formatNumber)(balance.toFixed(), 2);
                }
                this.updateConnectedStatus(connected);
                this.updateList(connected);
            }));
        }
        async init() {
            if (this.isInited)
                return;
            this.i18n.init({ ...translations_json_2.default });
            super.init();
            this.$eventBus = components_7.application.EventBus;
            this.registerEvent();
            this.isInited = true;
            this.classList.add(header_css_1.default);
            this.initTheme();
            this.observer = new ResizeObserver((entries) => {
                if (this.getBoundingClientRect().width > 570) {
                    this.btnConnectWallet.caption = "$connect_wallet";
                    this.pnlNetwork.visible = true;
                    this.pnlNetworkMobile.visible = false;
                    this.pnlWalletAddress.visible = true;
                    this.pnlWalletMobile.visible = false;
                }
                else {
                    this.btnConnectWallet.caption = "$connect";
                    this.pnlNetwork.visible = false;
                    this.pnlNetworkMobile.visible = true;
                    this.pnlWalletAddress.visible = false;
                    this.pnlWalletMobile.visible = true;
                }
            });
            this.observer.observe(this);
        }
        setState(state) {
            this.state = state;
        }
        async reloadWalletsAndNetworks() {
            const chainId = this.state.getChainId();
            this.selectedNetwork = this.selectedNetwork || this.state.getNetworkInfo(chainId);
            if (this.connectWalletModule)
                await this.connectWalletModule.renderWalletList();
            this.renderNetworks();
            const rpcWallet = this.state.getRpcWallet();
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            const isConnected = (0, index_2.isClientWalletConnected)();
            if (!isConnected) {
                let selectedProvider = localStorage.getItem('walletProvider');
                if (!selectedProvider && this.state.hasMetaMask()) {
                    selectedProvider = index_2.WalletPlugin.MetaMask;
                }
                await (0, index_2.connectWallet)(this.state, selectedProvider);
                if (rpcWallet)
                    rpcWallet.address = clientWallet.address;
            }
            if (isConnected) {
                this.walletInfo.address = clientWallet.address;
                const walletChainId = chainId;
                this.walletInfo.networkId = walletChainId;
                if (rpcWallet) {
                    const balance = await rpcWallet.balanceOf(clientWallet.address);
                    this.walletInfo.balance = (0, index_1.formatNumber)(balance.toFixed(), 2);
                }
                else {
                    this.walletInfo.balance = (0, index_1.formatNumber)((await clientWallet.balance).toFixed(), 2); //To be removed
                }
            }
            this.updateConnectedStatus(isConnected);
        }
        updateDot(connected, type) {
            if (type === 'network') {
                const walletChainId = this.state.getChainId();
                if (this.currActiveNetworkId !== undefined && this.currActiveNetworkId !== null && this.networkMapper.has(this.currActiveNetworkId)) {
                    this.networkMapper.get(this.currActiveNetworkId).classList.remove('is-actived');
                }
                if (connected && this.networkMapper.has(walletChainId)) {
                    this.networkMapper.get(walletChainId).classList.add('is-actived');
                }
                this.currActiveNetworkId = walletChainId;
            }
            else {
                if (this.connectWalletModule)
                    this.connectWalletModule.updateDot(connected);
            }
        }
        updateList(isConnected) {
            if (isConnected && (0, index_2.getWalletProvider)() !== index_2.WalletPlugin.MetaMask) {
                this.lblNetworkDesc.caption = "$we_support_the_following_networks_please_switch_network_in_the_connected_wallet";
            }
            else {
                this.lblNetworkDesc.caption = "$we_support_the_following_networks_please_click_to_connect";
            }
            this.updateDot(isConnected, 'wallet');
            this.updateDot(isConnected, 'network');
        }
        async initConnectWalletModule(title) {
            let isFirstLoad = false;
            if (!this.connectWalletModule) {
                this.connectWalletModule = new connectWalletModule_1.ConnectWalletModule();
                this.connectWalletModule.onWalletConnected = () => {
                    this.connectWalletModule.closeModal();
                };
                isFirstLoad = true;
            }
            this.connectWalletModule.setState(this.state);
            const modal = this.connectWalletModule.openModal({
                title: title,
                class: header_css_1.walletModalStyle,
                width: 440,
                border: { radius: 10 }
            });
            if (isFirstLoad) {
                if (this.theme)
                    (0, index_1.updateTheme)(modal, this.theme);
                await this.connectWalletModule.renderWalletList();
                modal.refresh();
            }
        }
        viewOnExplorerByAddress() {
            const walletChainId = this.state.getChainId();
            (0, index_2.viewOnExplorerByAddress)(this.state, walletChainId, this.walletInfo.address);
        }
        async switchNetwork(chainId) {
            if (!chainId)
                return;
            await (0, index_2.switchNetwork)(this.state, chainId);
            this.mdNetwork.visible = false;
        }
        isWalletActive(walletPlugin) {
            const provider = this.state.getWalletPluginProvider(walletPlugin);
            return provider ? provider.installed() && eth_wallet_3.Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
        }
        isNetworkActive(chainId) {
            const walletChainId = this.state.getChainId();
            return walletChainId === chainId;
        }
        renderNetworks() {
            this.gridNetworkGroup.clearInnerHTML();
            this.networkMapper = new Map();
            this.supportedNetworks = this.state.getSiteSupportedNetworks();
            this.gridNetworkGroup.append(...this.supportedNetworks.map((network) => {
                const img = network.image ? this.$render("i-image", { url: network.image || '', width: 34, height: 34 }) : [];
                const isActive = this.isNetworkActive(network.chainId);
                if (isActive)
                    this.currActiveNetworkId = network.chainId;
                const hsNetwork = (this.$render("i-hstack", { onClick: () => this.switchNetwork(network.chainId), background: { color: Theme.colors.secondary.light }, border: { radius: 10 }, position: "relative", class: isActive ? 'is-actived list-item' : 'list-item', padding: { top: '0.65rem', bottom: '0.65rem', left: '0.5rem', right: '0.5rem' } },
                    this.$render("i-hstack", { margin: { left: '1rem' }, verticalAlignment: "center", gap: 12 },
                        img,
                        this.$render("i-label", { caption: network.chainName, wordBreak: "break-word", font: { size: '.875rem', bold: true, color: Theme.colors.secondary.contrastText } }))));
                this.networkMapper.set(network.chainId, hsNetwork);
                return hsNetwork;
            }));
        }
        onThemeChanged() {
            const parent = this.closest('i-scom-dapp-container');
            if (parent) {
                parent.theme = this.switchTheme.checked ? 'light' : 'dark';
            }
        }
        initTheme() {
            const getThemeVars = (theme) => {
                const themeVars = theme === 'light' ? index_1.lightTheme : index_1.darkTheme;
                return {
                    fontColor: themeVars.text.primary,
                    backgroundColor: themeVars.background.main,
                    inputFontColor: themeVars.input.fontColor,
                    inputBackgroundColor: themeVars.input.background,
                    buttonBackgroundColor: themeVars.colors.primary.main,
                    buttonFontColor: themeVars.colors.primary.contrastText,
                    modalColor: themeVars.background.modal,
                    secondaryColor: themeVars.colors.secondary.main,
                    secondaryFontColor: themeVars.colors.secondary.contrastText,
                    textSecondary: themeVars.text.secondary,
                    primaryButtonBackground: themeVars.buttons.primary.background,
                    primaryButtonHoverBackground: themeVars.buttons.primary.hoverBackground,
                    primaryButtonDisabledBackground: themeVars.buttons.primary.disabledBackground,
                    maxButtonBackground: themeVars.buttons.secondary.background,
                    maxButtonHoverBackground: themeVars.buttons.secondary.hoverBackground
                };
            };
            const parent = this.closest('i-scom-dapp-container');
            if (parent) {
                parent.theme = this.switchTheme.checked ? 'light' : 'dark';
                parent.initTag({
                    light: getThemeVars('light'),
                    dark: getThemeVars('dark')
                });
            }
        }
        render() {
            return (this.$render("i-panel", { padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }, background: { color: Theme.background.modal } },
                this.$render("i-hstack", { verticalAlignment: 'center', horizontalAlignment: 'space-between', gap: "0.5rem" },
                    this.$render("i-panel", null,
                        this.$render("i-switch", { id: "switchTheme", checkedText: '\u263C', uncheckedText: '\u263E', checkedThumbColor: "transparent", uncheckedThumbColor: "transparent", class: "custom-switch", onChanged: this.onThemeChanged.bind(this) })),
                    this.$render("i-hstack", { id: "pnlWallet", verticalAlignment: 'center', horizontalAlignment: 'end' },
                        this.$render("i-panel", { margin: { right: '0.5rem' }, cursor: "pointer", onClick: this.openNetworkModal },
                            this.$render("i-stack", { id: "pnlNetwork", height: 32, direction: "horizontal", alignItems: "center", justifyContent: "center", background: { color: Theme.colors.secondary.main }, padding: { left: '0.75rem', right: '0.75rem' }, border: { radius: 12 }, gap: 6 },
                                this.$render("i-image", { id: "imgNetwork", width: 26, height: 26, stack: { shrink: '0' } }),
                                this.$render("i-label", { id: "lblNetwork", caption: "$unsupported_network", font: { color: Theme.colors.secondary.contrastText } })),
                            this.$render("i-stack", { id: "pnlNetworkMobile", direction: "horizontal", alignItems: "center", background: { color: Theme.action.selectedBackground }, padding: { right: 10 }, border: { radius: 16 }, gap: 6, visible: false },
                                this.$render("i-stack", { height: 32, width: 32, direction: "horizontal", alignItems: "center", justifyContent: "center", background: { color: Theme.background.paper }, border: { radius: '50%' } },
                                    this.$render("i-icon", { id: "iconNetwork", width: 26, height: 26, stack: { shrink: '0' } })),
                                this.$render("i-icon", { width: 13, height: 13, name: "chevron-down" }))),
                        this.$render("i-hstack", { id: "hsBalance", height: 32, visible: false, horizontalAlignment: "center", verticalAlignment: "center", background: { color: Theme.colors.primary.main }, border: { radius: 12 }, padding: { left: '0.75rem', right: '0.75rem' } },
                            this.$render("i-label", { id: "lblBalance", font: { color: Theme.colors.primary.contrastText } })),
                        this.$render("i-panel", { id: "pnlWalletDetail", visible: false },
                            this.$render("i-panel", { margin: { left: '0.5rem' }, cursor: "pointer", onClick: this.openWalletDetailModal },
                                this.$render("i-stack", { id: "pnlWalletAddress", height: 32, direction: "horizontal", alignItems: "center", justifyContent: "center", background: { color: Theme.background.gradient }, padding: { left: '0.75rem', right: '0.75rem' }, border: { radius: 12 } },
                                    this.$render("i-label", { id: "lblWalletAddress", font: { color: Theme.colors.error.contrastText } })),
                                this.$render("i-stack", { id: "pnlWalletMobile", direction: "horizontal", alignItems: "center", background: { color: Theme.action.selectedBackground }, padding: { right: 10 }, border: { radius: 16 }, gap: 6, visible: false },
                                    this.$render("i-stack", { height: 32, width: 32, direction: "horizontal", alignItems: "center", justifyContent: "center", background: { color: Theme.background.gradient }, border: { radius: '50%' } },
                                        this.$render("i-icon", { width: 18, height: 18, name: "wallet" })),
                                    this.$render("i-icon", { width: 13, height: 13, name: "chevron-down" }))),
                            this.$render("i-modal", { id: "mdWalletDetail", class: "wallet-modal", height: "auto", maxWidth: 200, showBackdrop: false, popupPlacement: "bottomRight" },
                                this.$render("i-vstack", { gap: 15, padding: { top: 10, left: 10, right: 10, bottom: 10 } },
                                    this.$render("i-button", { caption: "$account", width: "100%", height: "auto", border: { radius: 12 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.openAccountModal }),
                                    this.$render("i-button", { caption: "$switch_wallet", width: "100%", height: "auto", border: { radius: 12 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.openSwitchModal }),
                                    this.$render("i-button", { caption: "$logout", width: "100%", height: "auto", border: { radius: 12 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.logout })))),
                        this.$render("i-button", { id: "btnConnectWallet", height: 32, caption: "$connect_wallet", border: { radius: 12 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.background.gradient }, padding: { top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }, onClick: this.openConnectModal }))),
                this.$render("i-modal", { id: 'mdNetwork', title: '$supported_networks', class: 'os-modal', width: 440, closeIcon: { name: 'times' }, border: { radius: 10 } },
                    this.$render("i-vstack", { height: '100%', lineHeight: 1.5, padding: { left: '1rem', right: '1rem', bottom: '2rem' } },
                        this.$render("i-label", { id: 'lblNetworkDesc', margin: { top: '1rem' }, font: { size: '.875rem' }, wordBreak: "break-word", caption: '$we_support_the_following_networks_please_click_to_connect' }),
                        this.$render("i-hstack", { margin: { left: '-1.25rem', right: '-1.25rem' }, height: '100%' },
                            this.$render("i-grid-layout", { id: 'gridNetworkGroup', font: { color: '#f05e61' }, height: "calc(100% - 160px)", width: "100%", overflow: { y: 'auto' }, margin: { top: '1.5rem' }, padding: { left: '1.25rem', right: '1.25rem' }, columnsPerRow: 1, templateRows: ['max-content'], class: 'list-view', gap: { row: '0.5rem' } })))),
                this.$render("i-modal", { id: 'mdAccount', title: '$account', class: 'os-modal', width: 440, height: 200, closeIcon: { name: 'times' }, border: { radius: 10 } },
                    this.$render("i-vstack", { width: "100%", padding: { top: "1.75rem", bottom: "1rem", left: "2.75rem", right: "2.75rem" }, gap: 5 },
                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center' },
                            this.$render("i-label", { font: { size: '0.875rem' }, caption: '$connected_with' }),
                            this.$render("i-button", { caption: '$logout', font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: 6, bottom: 6, left: 10, right: 10 }, border: { radius: 5 }, onClick: this.logout })),
                        this.$render("i-label", { id: "lblWalletAddress2", font: { size: '1.25rem', bold: true, color: Theme.colors.primary.main }, lineHeight: 1.5 }),
                        this.$render("i-hstack", { verticalAlignment: "center", gap: "2.5rem" },
                            this.$render("i-hstack", { class: "pointer", verticalAlignment: "center", tooltip: { content: `$the_address_has_been_copied`, trigger: 'click' }, gap: "0.5rem", onClick: this.copyWalletAddress },
                                this.$render("i-icon", { name: "copy", width: "16px", height: "16px", fill: Theme.text.secondary }),
                                this.$render("i-label", { caption: "$copy_address", font: { size: "0.875rem", bold: true } })),
                            this.$render("i-hstack", { id: "hsViewAccount", class: "pointer", verticalAlignment: "center", onClick: this.viewOnExplorerByAddress.bind(this) },
                                this.$render("i-icon", { name: "external-link-alt", width: "16", height: "16", fill: Theme.text.secondary, display: "inline-block" }),
                                this.$render("i-label", { caption: "$view_on_explorer", margin: { left: "0.5rem" }, font: { size: "0.875rem", bold: true } })))))));
        }
    };
    __decorate([
        (0, components_7.observable)()
    ], DappContainerHeader.prototype, "walletInfo", void 0);
    DappContainerHeader = __decorate([
        (0, components_7.customElements)('dapp-container-header')
    ], DappContainerHeader);
    exports.DappContainerHeader = DappContainerHeader;
});
define("@scom/scom-dapp-container/footer.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-dapp-container/translations.json.ts"], function (require, exports, components_8, translations_json_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerFooter = void 0;
    const Theme = components_8.Styles.Theme.ThemeVars;
    let DappContainerFooter = class DappContainerFooter extends components_8.Module {
        constructor(parent) {
            super(parent);
        }
        init() {
            this.i18n.init({ ...translations_json_3.default });
            super.init();
        }
        get footer() {
            return this._footer;
        }
        set footer(value) {
            this._footer = value;
            this.lblFooter.clearInnerHTML();
            this.lblFooter.appendChild(value);
        }
        render() {
            return (this.$render("i-hstack", { class: "footer", horizontalAlignment: "end", verticalAlignment: "center", padding: { left: '0.5rem', right: '1.313rem', top: '0.75rem', bottom: '0.75rem' }, background: { color: Theme.background.modal } },
                this.$render("i-hstack", { id: "lblFooter", gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: "$powered_by", font: { size: '0.75rem', color: Theme.text.primary } }),
                    this.$render("i-label", { caption: "SECURE", font: { size: '0.75rem', color: '#F99E43', weight: 700 } }),
                    this.$render("i-label", { caption: "COMPUTE", font: { size: '0.75rem', color: Theme.text.primary, weight: 700 } }))));
        }
    };
    DappContainerFooter = __decorate([
        (0, components_8.customElements)('dapp-container-footer')
    ], DappContainerFooter);
    exports.DappContainerFooter = DappContainerFooter;
});
define("@scom/scom-dapp-container", ["require", "exports", "@ijstech/components", "@scom/scom-dapp-container/index.css.ts", "@scom/scom-dapp-container/store/index.ts", "@ijstech/eth-wallet", "@scom/scom-dapp-container/utils/index.ts", "@scom/scom-dapp-container/body.tsx", "@scom/scom-dapp-container/header.tsx", "@scom/scom-dapp-container/footer.tsx"], function (require, exports, components_9, index_css_1, index_3, eth_wallet_4, utils_1, body_1, header_1, footer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerFooter = exports.DappContainerHeader = exports.DappContainerBody = void 0;
    Object.defineProperty(exports, "DappContainerBody", { enumerable: true, get: function () { return body_1.DappContainerBody; } });
    Object.defineProperty(exports, "DappContainerHeader", { enumerable: true, get: function () { return header_1.DappContainerHeader; } });
    Object.defineProperty(exports, "DappContainerFooter", { enumerable: true, get: function () { return footer_1.DappContainerFooter; } });
    const Theme = components_9.Styles.Theme.ThemeVars;
    let ScomDappContainer = class ScomDappContainer extends components_9.Module {
        constructor(parent, options) {
            super(parent, options);
            this.isInited = false;
            this.tag = {};
            this.state = new index_3.State();
            this.deferReadyCallback = true;
        }
        set theme(value) {
            this._theme = value;
            this.setTag(this.tag);
            const parent = this.parentElement;
            if (parent?.setTheme)
                parent.setTheme(this.theme);
        }
        get theme() {
            return this._theme ?? 'dark';
        }
        isEmptyData(value) {
            return !value || !value.networks || value.networks.length === 0;
        }
        async initData() {
            if (!this.dappContainerBody.isConnected)
                await this.dappContainerBody.ready();
            if (!this.dappContainerHeader.isConnected)
                await this.dappContainerHeader.ready();
            if (!this.isInited) {
                this.isInited = true;
                const networks = this.getAttribute('networks', true) ?? this.networks;
                const wallets = this.getAttribute('wallets', true) ?? this.wallets;
                const showHeader = this.getAttribute('showHeader', true) ?? this.showHeader;
                const showFooter = this.getAttribute('showFooter', true) ?? this.showFooter;
                const showWalletNetwork = this.getAttribute('showWalletNetwork', true) ?? this.showWalletNetwork;
                const defaultChainId = this.getAttribute('defaultChainId', true) ?? this._data?.defaultChainId;
                const rpcWalletId = this.getAttribute('rpcWalletId', true) ?? this._data?.rpcWalletId;
                let data = { defaultChainId, networks, wallets, showHeader, showFooter, showWalletNetwork, rpcWalletId };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
            }
        }
        async init() {
            let children = [];
            for (let child of this.children) {
                children.push(child);
            }
            super.init();
            // this.classList.add('main-dapp');
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const tag = this.getAttribute('tag', true);
                tag && this.setTag(tag);
                await this.initData();
            }
            this.executeReadyCallback();
            for (let item of children) {
                this.dappContainerBody.setModule(item);
            }
        }
        onHide() {
            this.dappContainerBody.onHide();
            this.dappContainerHeader.onHide();
            this.dappContainerFooter.onHide();
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get networks() {
            return this._data?.networks ?? [];
        }
        set networks(value) {
            this._data.networks = value;
            this.state.update(this._data);
        }
        get wallets() {
            return this._data?.wallets ?? [];
        }
        set wallets(value) {
            this._data.wallets = value;
            this.state.update(this._data);
        }
        get showHeader() {
            return this._data?.showHeader ?? true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
            this.dappContainerHeader.visible = this.showHeader;
        }
        get showFooter() {
            return this._data?.showFooter ?? true;
        }
        set showFooter(value) {
            this._data.showFooter = value;
            this.dappContainerFooter.visible = this.showFooter;
        }
        get showWalletNetwork() {
            return this._data?.showWalletNetwork ?? true;
        }
        set showWalletNetwork(value) {
            this._data.showWalletNetwork = value;
        }
        setRootDir(value) {
            this._rootDir = value || '';
        }
        getRootDir() {
            return this._rootDir;
        }
        async getData() {
            return this._data;
        }
        async setData(data) {
            this._data = JSON.parse(JSON.stringify(data));
            if (!this.isInited)
                await this.ready();
            this.pnlLoading.visible = true;
            this.gridMain.visible = false;
            this.dappContainerHeader.setState(this.state);
            this.dappContainerHeader.visible = this.showHeader;
            this.dappContainerHeader.showWalletNetwork = this.showWalletNetwork;
            this.dappContainerFooter.visible = this.showFooter;
            if (this.showWalletNetwork) {
                this.state.update(this._data);
                const rpcWallet = this.state.getRpcWallet();
                if (rpcWallet) {
                    rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                        this.dappContainerHeader.onChainChanged(chainId);
                    });
                    if (this._data.defaultChainId) {
                        const chainId = this.state.getChainId();
                        if (chainId !== this._data.defaultChainId) {
                            await (0, index_3.switchNetwork)(this.state, this._data.defaultChainId);
                        }
                    }
                    this.dappContainerHeader.reloadWalletsAndNetworks();
                }
            }
            if (!this._data) {
                this.dappContainerBody.clear();
                return;
            }
            this.pnlLoading.visible = false;
            this.gridMain.visible = true;
        }
        // getActions() {
        //   let module = this.dappContainerBody.getModule();
        //   let actions;
        //   if (module && module.getActions) {
        //     actions = module.getActions();
        //   }
        //   return actions;
        // }
        // getEmbedderActions() {
        //   let module = this.dappContainerBody.getModule();
        //   let actions;
        //   if (module && module.getEmbedderActions) {
        //     actions = module.getEmbedderActions();
        //   }
        //   return actions;
        // }
        getModule() {
            let module = this.dappContainerBody.getModule();
            return module;
        }
        setModule(module) {
            this.dappContainerBody.clear();
            this.dappContainerBody.setModule(module);
        }
        getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            const theme = this.tag[this.theme] || {};
            (0, utils_1.updateTheme)(this, theme);
            if (this.dappContainerHeader)
                this.dappContainerHeader.theme = theme;
        }
        initTag(value) {
            this.setTag(value);
            const parent = this.parentElement;
            if (parent?.setTag)
                parent.setTag(this.tag);
        }
        render() {
            return (this.$render("i-vstack", { class: index_css_1.default, width: "100%", height: "100%", background: { color: Theme.background.main }, overflow: "hidden" },
                this.$render("dapp-container-header", { visible: false, id: "dappContainerHeader" }),
                this.$render("i-panel", { stack: { grow: "1" }, overflow: "hidden" },
                    this.$render("i-vstack", { id: "pnlLoading", height: "100%", horizontalAlignment: "center", verticalAlignment: "center", padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, visible: false },
                        this.$render("i-panel", { class: 'spinner' })),
                    this.$render("i-grid-layout", { id: "gridMain", height: "100%", templateColumns: ["1fr"] },
                        this.$render("dapp-container-body", { id: "dappContainerBody", overflow: "auto" }))),
                this.$render("dapp-container-footer", { visible: false, id: "dappContainerFooter" })));
        }
    };
    ScomDappContainer = __decorate([
        components_9.customModule,
        (0, components_9.customElements)('i-scom-dapp-container')
    ], ScomDappContainer);
    exports.default = ScomDappContainer;
});
