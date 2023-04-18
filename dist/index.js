var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
            this.module.parent = this.pnlModule;
            this.pnlModule.append(this.module);
        }
        // async setData(rootDir: string, data: IDappContainerData) {
        //   if (this.isLoading) return;
        //   this.isLoading = true;
        //   if (data.content && data.content.module) {
        //     this.clear();
        //     try {
        //       this.module = await this.loadModule(rootDir, data.content.module);
        //       if (this.module) {
        //         await this.module.setData(data.content.properties);
        //         const tagData = data.tag || data?.content?.tag || null;
        //         if (tagData) {
        //           this.module.setTag(tagData);
        //           const parent = this.parentElement.closest('.main-dapp');
        //           if (parent) (parent as any).setTag(tagData);
        //         }
        //       }
        //     } catch (err) {}
        //   }
        //   this.isLoading = false;
        // }
        getTag() {
            var _a;
            return (_a = this.module) === null || _a === void 0 ? void 0 : _a.getTag();
        }
        setTag(data) {
            if (this.module)
                this.module.setTag(data);
        }
        init() {
            super.init();
            this.isInited = true;
        }
        // async loadModule(rootDir: string, moduleData: IPageBlockData) {
        //   this.clear();
        //   let module: any = await getModule(rootDir, moduleData);
        //   if (module) {
        //     module.parent = this.pnlModule;
        //     this.pnlModule.append(module);
        //   }
        //   return module;
        // }
        render() {
            return (this.$render("i-panel", { id: "pnlModule" }));
        }
    };
    DappContainerBody = __decorate([
        components_2.customElements('dapp-container-body')
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
define("@scom/scom-dapp-container/utils/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-dapp-container/utils/pathToRegexp.ts"], function (require, exports, components_3, eth_wallet_1, pathToRegexp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEmbedElement = exports.match = exports.formatNumberWithSeparators = exports.formatNumber = exports.getSCConfigByCodeCid = exports.fetchFileContentByCid = exports.IPFS_SCOM_URL = void 0;
    Object.defineProperty(exports, "match", { enumerable: true, get: function () { return pathToRegexp_1.match; } });
    const IPFS_SCOM_URL = "https://ipfs.scom.dev/ipfs";
    exports.IPFS_SCOM_URL = IPFS_SCOM_URL;
    async function fetchFileContentByCid(ipfsCid) {
        let response;
        try {
            response = await fetch(`${IPFS_SCOM_URL}/${ipfsCid}`);
        }
        catch (err) {
            const IPFS_Gateway = 'https://ipfs.io/ipfs/{CID}';
            response = await fetch(IPFS_Gateway.replace('{CID}', ipfsCid));
        }
        return response;
    }
    exports.fetchFileContentByCid = fetchFileContentByCid;
    ;
    async function getSCConfigByCodeCid(codeCid) {
        let scConfig;
        try {
            let scConfigRes = await fetchFileContentByCid(`${codeCid}/dist/scconfig.json`);
            if (scConfigRes)
                scConfig = await scConfigRes.json();
        }
        catch (err) { }
        return scConfig;
    }
    exports.getSCConfigByCodeCid = getSCConfigByCodeCid;
    const formatNumber = (value, decimals) => {
        let val = value;
        const minValue = '0.0000001';
        if (typeof value === 'string') {
            val = new eth_wallet_1.BigNumber(value).toNumber();
        }
        else if (typeof value === 'object') {
            val = value.toNumber();
        }
        if (val != 0 && new eth_wallet_1.BigNumber(val).lt(minValue)) {
            return `<${minValue}`;
        }
        return formatNumberWithSeparators(val, decimals || 4);
    };
    exports.formatNumber = formatNumber;
    const formatNumberWithSeparators = (value, precision) => {
        if (!value)
            value = 0;
        if (precision) {
            let outputStr = '';
            if (value >= 1) {
                outputStr = value.toLocaleString('en-US', { maximumFractionDigits: precision });
            }
            else {
                outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
            }
            if (outputStr.length > 18) {
                outputStr = outputStr.substr(0, 18) + '...';
            }
            return outputStr;
        }
        else {
            return value.toLocaleString('en-US');
        }
    };
    exports.formatNumberWithSeparators = formatNumberWithSeparators;
    // const getModule = async (rootDir: string, options: IGetModuleOptions) => {
    //   let module: Module;
    //   if (options.localPath) {
    //       const localRootPath = rootDir ? `${rootDir}/${options.localPath}` : options.localPath;
    //       const scconfigRes = await fetch(`${localRootPath}/scconfig.json`);
    //       const scconfig = await scconfigRes.json();
    //       scconfig.rootDir = localRootPath;
    //       module = await application.newModule(scconfig.main, scconfig);
    //   }
    //   else {
    //     const response = await fetchFileContentByCid(options.ipfscid);
    //     const result: ICodeInfoFileContent = await response.json();
    //     const codeCID = result.codeCID;
    //     const scConfig = await getSCConfigByCodeCid(codeCID);
    //     if (!scConfig) return;
    //     const main: string = scConfig.main;
    //     if (main.startsWith("@")) {
    //       scConfig.rootDir = `${IPFS_SCOM_URL}/${codeCID}/dist`;
    //       module = await application.newModule(main, scConfig);
    //     } else {
    //       const root = `${IPFS_SCOM_URL}/${codeCID}/dist`;
    //       const mainScriptPath = main.replace('{root}', root);
    //       const dependencies = scConfig.dependencies;
    //       for (let key in dependencies) {
    //         dependencies[key] = dependencies[key].replace('{root}', root);
    //       }
    //       module = await application.newModule(mainScriptPath, { dependencies });
    //     }
    //   }
    //   return module;
    // }
    const getEmbedElement = async (path) => {
        components_3.application.currentModuleDir = path;
        await components_3.application.loadScript(`${path}/index.js`);
        components_3.application.currentModuleDir = '';
        const elementName = `i-${path.split('/').pop()}`;
        const element = document.createElement(elementName);
        return element;
    };
    exports.getEmbedElement = getEmbedElement;
});
define("@scom/scom-dapp-container/header.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    exports.default = components_4.Styles.style({
        zIndex: 2,
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
            }
        }
    });
});
define("@scom/scom-dapp-container/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_5.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        logo: fullPath('img/sc-logo.png'),
        fullPath
    };
});
define("@scom/scom-dapp-container/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list"], function (require, exports, components_6, eth_wallet_2, scom_network_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWalletPluginProvider = exports.getWalletPluginMap = exports.setWalletPluginProvider = exports.getEnv = exports.getInfuraId = exports.isValidEnv = exports.getSiteSupportedNetworks = exports.getDefaultChainId = exports.getNetworkType = exports.viewOnExplorerByAddress = exports.viewOnExplorerByTxHash = exports.getNetworkInfo = exports.updateStore = exports.getErc20 = exports.getWalletProvider = exports.getWallet = exports.getChainId = exports.registerSendTxEvents = exports.getSupportedWalletProviders = exports.getSupportedWallets = exports.truncateAddress = exports.hasMetaMask = exports.hasWallet = exports.logoutWallet = exports.switchNetwork = exports.connectWallet = exports.initWalletPlugins = exports.isWalletConnected = exports.WalletPlugin = void 0;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    ;
    function isWalletConnected() {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isWalletConnected = isWalletConnected;
    async function getWalletPluginConfigProvider(wallet, pluginName, packageName, events, options) {
        switch (pluginName) {
            case WalletPlugin.MetaMask:
                return new eth_wallet_2.MetaMaskProvider(wallet, events, options);
            case WalletPlugin.WalletConnect:
                return new eth_wallet_2.Web3ModalProvider(wallet, events, options);
            default: {
                if (packageName) {
                    const provider = await components_6.application.loadPackage(packageName, '*');
                    return new provider(wallet, events, options);
                }
            }
        }
    }
    async function initWalletPlugins(eventHandlers) {
        let wallet = eth_wallet_2.Wallet.getClientInstance();
        const events = {
            onAccountChanged: (account) => {
                var _a, _b;
                if (eventHandlers && eventHandlers.accountsChanged) {
                    eventHandlers.accountsChanged(account);
                }
                const connected = !!account;
                if (connected) {
                    localStorage.setItem('walletProvider', ((_b = (_a = eth_wallet_2.Wallet.getClientInstance()) === null || _a === void 0 ? void 0 : _a.clientSideProvider) === null || _b === void 0 ? void 0 : _b.name) || '');
                }
                components_6.application.EventBus.dispatch("isWalletConnected" /* IsWalletConnected */, connected);
            },
            onChainChanged: (chainIdHex) => {
                const chainId = Number(chainIdHex);
                if (eventHandlers && eventHandlers.chainChanged) {
                    eventHandlers.chainChanged(chainId);
                }
                components_6.application.EventBus.dispatch("chainChanged" /* chainChanged */, chainId);
            }
        };
        let networkList = exports.getSiteSupportedNetworks();
        const rpcs = {};
        for (const network of networkList) {
            let rpc = network.rpcUrls[0];
            if (rpc)
                rpcs[network.chainId] = rpc;
        }
        for (let walletPlugin of state.wallets) {
            let pluginName = walletPlugin.name;
            let providerOptions;
            if (pluginName == WalletPlugin.WalletConnect) {
                providerOptions = {
                    name: pluginName,
                    infuraId: exports.getInfuraId(),
                    bridge: "https://bridge.walletconnect.org",
                    rpc: rpcs,
                    useDefaultProvider: true
                };
            }
            else {
                providerOptions = {
                    name: pluginName,
                    infuraId: exports.getInfuraId(),
                    rpc: rpcs,
                    useDefaultProvider: true
                };
            }
            let provider = await getWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, events, providerOptions);
            exports.setWalletPluginProvider(pluginName, {
                name: pluginName,
                packageName: walletPlugin.packageName,
                provider
            });
        }
    }
    exports.initWalletPlugins = initWalletPlugins;
    async function connectWallet(walletPlugin) {
        let wallet = eth_wallet_2.Wallet.getClientInstance();
        // if (!wallet.chainId) {
        //   wallet.chainId = getDefaultChainId();
        // }
        let provider = exports.getWalletPluginProvider(walletPlugin);
        if (provider === null || provider === void 0 ? void 0 : provider.installed()) {
            await wallet.connect(provider);
        }
        return wallet;
    }
    exports.connectWallet = connectWallet;
    async function switchNetwork(chainId) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        await wallet.switchNetwork(chainId);
        if (!isWalletConnected()) {
            components_6.application.EventBus.dispatch("chainChanged" /* chainChanged */, chainId);
        }
    }
    exports.switchNetwork = switchNetwork;
    async function logoutWallet() {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        await wallet.disconnect();
        localStorage.setItem('walletProvider', '');
        components_6.application.EventBus.dispatch("IsWalletDisconnected" /* IsWalletDisconnected */, false);
    }
    exports.logoutWallet = logoutWallet;
    const hasWallet = function () {
        let hasWallet = false;
        const walletPluginMap = exports.getWalletPluginMap();
        for (let pluginName in walletPluginMap) {
            const provider = walletPluginMap[pluginName].provider;
            if (provider.installed()) {
                hasWallet = true;
                break;
            }
        }
        return hasWallet;
    };
    exports.hasWallet = hasWallet;
    const hasMetaMask = function () {
        const provider = exports.getWalletPluginProvider(WalletPlugin.MetaMask);
        return provider.installed();
    };
    exports.hasMetaMask = hasMetaMask;
    const truncateAddress = (address) => {
        if (address === undefined || address === null)
            return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    };
    exports.truncateAddress = truncateAddress;
    const getSupportedWallets = () => {
        return state.wallets;
    };
    exports.getSupportedWallets = getSupportedWallets;
    const getSupportedWalletProviders = () => {
        const walletPluginMap = exports.getWalletPluginMap();
        return state.wallets.map(v => walletPluginMap[v.name].provider);
    };
    exports.getSupportedWalletProviders = getSupportedWalletProviders;
    ;
    function registerSendTxEvents(sendTxEventHandlers) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
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
    function getChainId() {
        return eth_wallet_2.Wallet.getInstance().chainId;
    }
    exports.getChainId = getChainId;
    ;
    function getWallet() {
        return eth_wallet_2.Wallet.getInstance();
    }
    exports.getWallet = getWallet;
    ;
    function getWalletProvider() {
        return localStorage.getItem('walletProvider') || '';
    }
    exports.getWalletProvider = getWalletProvider;
    ;
    function getErc20(address) {
        const wallet = getWallet();
        return new eth_wallet_2.Erc20(wallet, address);
    }
    exports.getErc20 = getErc20;
    ;
    const state = {
        networkMap: {},
        defaultChainId: 0,
        infuraId: "",
        env: "",
        wallets: [],
        walletPluginMap: {}
    };
    const updateStore = (data) => {
        if (data.defaultChainId)
            setDefaultChainId(data.defaultChainId);
        setNetworkList(data.networks);
        setWalletList(data.wallets);
    };
    exports.updateStore = updateStore;
    const setWalletList = (wallets) => {
        state.wallets = wallets;
    };
    const setNetworkList = (networkList, infuraId) => {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        state.networkMap = {};
        const defaultNetworkList = scom_network_list_1.default();
        const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
            acc[cur.chainId] = cur;
            return acc;
        }, {});
        for (let network of networkList) {
            const networkInfo = defaultNetworkMap[network.chainId];
            if (!networkInfo)
                continue;
            if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                for (let i = 0; i < network.rpcUrls.length; i++) {
                    network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                }
            }
            state.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
            wallet.setNetworkInfo(state.networkMap[network.chainId]);
        }
    };
    const getNetworkInfo = (chainId) => {
        return state.networkMap[chainId];
    };
    exports.getNetworkInfo = getNetworkInfo;
    const viewOnExplorerByTxHash = (chainId, txHash) => {
        let network = exports.getNetworkInfo(chainId);
        if (network && network.explorerTxUrl) {
            let url = `${network.explorerTxUrl}${txHash}`;
            window.open(url);
        }
    };
    exports.viewOnExplorerByTxHash = viewOnExplorerByTxHash;
    const viewOnExplorerByAddress = (chainId, address) => {
        let network = exports.getNetworkInfo(chainId);
        if (network && network.explorerAddressUrl) {
            let url = `${network.explorerAddressUrl}${address}`;
            window.open(url);
        }
    };
    exports.viewOnExplorerByAddress = viewOnExplorerByAddress;
    const getNetworkType = (chainId) => {
        var _a;
        let network = exports.getNetworkInfo(chainId);
        return (_a = network === null || network === void 0 ? void 0 : network.explorerName) !== null && _a !== void 0 ? _a : 'Unknown';
    };
    exports.getNetworkType = getNetworkType;
    const setDefaultChainId = (chainId) => {
        state.defaultChainId = chainId;
    };
    const getDefaultChainId = () => {
        return state.defaultChainId;
    };
    exports.getDefaultChainId = getDefaultChainId;
    const getSiteSupportedNetworks = () => {
        let networkFullList = Object.values(state.networkMap);
        let list = networkFullList.filter(network => !network.isDisabled && exports.isValidEnv(network.env));
        return list;
    };
    exports.getSiteSupportedNetworks = getSiteSupportedNetworks;
    const isValidEnv = (env) => {
        const _env = state.env === 'testnet' || state.env === 'mainnet' ? state.env : "";
        return !_env || !env || env === _env;
    };
    exports.isValidEnv = isValidEnv;
    const setInfuraId = (infuraId) => {
        state.infuraId = infuraId;
    };
    const getInfuraId = () => {
        return state.infuraId;
    };
    exports.getInfuraId = getInfuraId;
    const setEnv = (env) => {
        state.env = env;
    };
    const getEnv = () => {
        return state.env;
    };
    exports.getEnv = getEnv;
    const setWalletPluginProvider = (name, wallet) => {
        state.walletPluginMap[name] = wallet;
    };
    exports.setWalletPluginProvider = setWalletPluginProvider;
    const getWalletPluginMap = () => {
        return state.walletPluginMap;
    };
    exports.getWalletPluginMap = getWalletPluginMap;
    const getWalletPluginProvider = (name) => {
        return state.walletPluginMap[name].provider;
    };
    exports.getWalletPluginProvider = getWalletPluginProvider;
});
define("@scom/scom-dapp-container/header.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-dapp-container/utils/index.ts", "@scom/scom-dapp-container/header.css.ts", "@scom/scom-dapp-container/store/index.ts"], function (require, exports, components_7, eth_wallet_3, index_1, header_css_1, index_2) {
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
            this.onChainChanged = async (chainId) => {
                this.walletInfo.networkId = chainId;
                this.selectedNetwork = index_2.getNetworkInfo(chainId);
                let wallet = eth_wallet_3.Wallet.getClientInstance();
                const isConnected = wallet.isConnected;
                this.walletInfo.balance = isConnected ? index_1.formatNumber((await wallet.balance).toFixed(), 2) : '0';
                this.updateConnectedStatus(isConnected);
                this.updateList(isConnected);
            };
            this.updateConnectedStatus = (isConnected) => {
                var _a, _b, _c;
                if (isConnected) {
                    this.lblBalance.caption = `${this.walletInfo.balance} ${this.symbol}`;
                    this.btnWalletDetail.caption = this.shortlyAddress;
                    this.lblWalletAddress.caption = this.shortlyAddress;
                    const networkInfo = index_2.getNetworkInfo(eth_wallet_3.Wallet.getInstance().chainId);
                    this.hsViewAccount.visible = !!(networkInfo === null || networkInfo === void 0 ? void 0 : networkInfo.explorerAddressUrl);
                }
                else {
                    this.hsViewAccount.visible = false;
                }
                const isSupportedNetwork = this.selectedNetwork && this.supportedNetworks.findIndex(network => network.chainId === this.selectedNetwork.chainId) !== -1;
                if (isSupportedNetwork) {
                    const img = ((_a = this.selectedNetwork) === null || _a === void 0 ? void 0 : _a.image) ? this.selectedNetwork.image : '';
                    this.btnNetwork.icon = img ? this.$render("i-icon", { width: 26, height: 26, image: { url: img } }) : undefined;
                    this.btnNetwork.caption = (_c = (_b = this.selectedNetwork) === null || _b === void 0 ? void 0 : _b.chainName) !== null && _c !== void 0 ? _c : "";
                }
                else {
                    this.btnNetwork.icon = undefined;
                    this.btnNetwork.caption = "Unsupported Network";
                }
                this.btnConnectWallet.visible = !isConnected;
                this.hsBalance.visible = isConnected;
                this.pnlWalletDetail.visible = isConnected;
            };
            this.openConnectModal = () => {
                this.mdConnect.title = "Connect wallet";
                this.mdConnect.visible = true;
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
                this.mdConnect.title = "Switch wallet";
                this.mdConnect.visible = true;
            };
            this.logout = async (target, event) => {
                event.stopPropagation();
                this.mdWalletDetail.visible = false;
                await index_2.logoutWallet();
                this.updateConnectedStatus(false);
                this.updateList(false);
                this.mdAccount.visible = false;
            };
            this.connectToProviderFunc = async (walletPlugin) => {
                const provider = index_2.getWalletPluginProvider(walletPlugin);
                if (provider === null || provider === void 0 ? void 0 : provider.installed()) {
                    await index_2.connectWallet(walletPlugin);
                }
                else {
                    let homepage = provider.homepage;
                    this.openLink(homepage);
                }
                this.mdConnect.visible = false;
            };
            this.copyWalletAddress = () => {
                components_7.application.copyToClipboard(this.walletInfo.address || "");
            };
            this.renderWalletList = async () => {
                let accountsChangedEventHandler = async (account) => {
                };
                let chainChangedEventHandler = async (hexChainId) => {
                    this.updateConnectedStatus(true);
                };
                await index_2.initWalletPlugins({
                    'accountsChanged': accountsChangedEventHandler,
                    'chainChanged': chainChangedEventHandler
                });
                this.gridWalletList.clearInnerHTML();
                this.walletMapper = new Map();
                const walletList = index_2.getSupportedWalletProviders();
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
            };
            this.$eventBus = components_7.application.EventBus;
            this.registerEvent();
        }
        ;
        get symbol() {
            var _a, _b, _c;
            let symbol = '';
            if (((_a = this.selectedNetwork) === null || _a === void 0 ? void 0 : _a.chainId) && ((_b = this.selectedNetwork) === null || _b === void 0 ? void 0 : _b.symbol)) {
                symbol = (_c = this.selectedNetwork) === null || _c === void 0 ? void 0 : _c.symbol;
            }
            return symbol;
        }
        get shortlyAddress() {
            const address = this.walletInfo.address;
            if (!address)
                return 'No address selected';
            return index_2.truncateAddress(address);
        }
        registerEvent() {
            let wallet = eth_wallet_3.Wallet.getInstance();
            this.$eventBus.register(this, "connectWallet" /* ConnectWallet */, this.openConnectModal);
            this.$eventBus.register(this, "isWalletConnected" /* IsWalletConnected */, async (connected) => {
                if (connected) {
                    this.walletInfo.address = wallet.address;
                    this.walletInfo.balance = index_1.formatNumber((await wallet.balance).toFixed(), 2);
                    this.walletInfo.networkId = wallet.chainId;
                }
                this.selectedNetwork = index_2.getNetworkInfo(wallet.chainId);
                this.updateConnectedStatus(connected);
                this.updateList(connected);
            });
            this.$eventBus.register(this, "IsWalletDisconnected" /* IsWalletDisconnected */, async (connected) => {
                this.selectedNetwork = index_2.getNetworkInfo(wallet.chainId);
                this.updateConnectedStatus(connected);
                this.updateList(connected);
            });
            this.$eventBus.register(this, "chainChanged" /* chainChanged */, async (chainId) => {
                this.onChainChanged(chainId);
            });
        }
        async init() {
            if (this.isInited)
                return;
            super.init();
            this.isInited = true;
            this.classList.add(header_css_1.default);
            await this.reloadWalletsAndNetworks();
            await this.initData();
        }
        async reloadWalletsAndNetworks() {
            this.selectedNetwork = this.selectedNetwork || index_2.getNetworkInfo(index_2.getDefaultChainId());
            let wallet = eth_wallet_3.Wallet.getClientInstance();
            const isConnected = wallet.isConnected;
            if (isConnected) {
                this.walletInfo.address = wallet.address;
                this.walletInfo.balance = index_1.formatNumber((await wallet.balance).toFixed(), 2);
                this.walletInfo.networkId = wallet.chainId;
            }
            await this.renderWalletList();
            this.renderNetworks();
            this.updateConnectedStatus(index_2.isWalletConnected());
        }
        updateDot(connected, type) {
            var _a, _b, _c;
            const wallet = eth_wallet_3.Wallet.getClientInstance();
            if (type === 'network') {
                if (this.currActiveNetworkId !== undefined && this.currActiveNetworkId !== null && this.networkMapper.has(this.currActiveNetworkId)) {
                    this.networkMapper.get(this.currActiveNetworkId).classList.remove('is-actived');
                }
                if (connected && this.networkMapper.has(wallet.chainId)) {
                    this.networkMapper.get(wallet.chainId).classList.add('is-actived');
                }
                this.currActiveNetworkId = wallet.chainId;
            }
            else {
                if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
                    this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
                }
                if (connected && this.walletMapper.has((_a = wallet.clientSideProvider) === null || _a === void 0 ? void 0 : _a.name)) {
                    this.walletMapper.get((_b = wallet.clientSideProvider) === null || _b === void 0 ? void 0 : _b.name).classList.add('is-actived');
                }
                this.currActiveWallet = (_c = wallet.clientSideProvider) === null || _c === void 0 ? void 0 : _c.name;
            }
        }
        updateList(isConnected) {
            if (isConnected && index_2.getWalletProvider() !== index_2.WalletPlugin.MetaMask) {
                this.lblNetworkDesc.caption = "We support the following networks, please switch network in the connected wallet.";
            }
            else {
                this.lblNetworkDesc.caption = "We support the following networks, please click to connect.";
            }
            this.updateDot(isConnected, 'wallet');
            this.updateDot(isConnected, 'network');
        }
        viewOnExplorerByAddress() {
            index_2.viewOnExplorerByAddress(eth_wallet_3.Wallet.getInstance().chainId, this.walletInfo.address);
        }
        async switchNetwork(chainId) {
            if (!chainId)
                return;
            await index_2.switchNetwork(chainId);
            this.mdNetwork.visible = false;
        }
        openLink(link) {
            return window.open(link, '_blank');
        }
        ;
        isWalletActive(walletPlugin) {
            var _a;
            const provider = index_2.getWalletPluginProvider(walletPlugin);
            return provider ? provider.installed() && ((_a = eth_wallet_3.Wallet.getClientInstance().clientSideProvider) === null || _a === void 0 ? void 0 : _a.name) === walletPlugin : false;
        }
        isNetworkActive(chainId) {
            return eth_wallet_3.Wallet.getInstance().chainId === chainId;
        }
        renderNetworks() {
            this.gridNetworkGroup.clearInnerHTML();
            this.networkMapper = new Map();
            this.supportedNetworks = index_2.getSiteSupportedNetworks();
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
        async initData() {
            let selectedProvider = localStorage.getItem('walletProvider');
            if (!selectedProvider && index_2.hasMetaMask()) {
                selectedProvider = index_2.WalletPlugin.MetaMask;
            }
            if (index_2.hasWallet()) {
                await index_2.connectWallet(selectedProvider);
            }
        }
        render() {
            return (this.$render("i-panel", { padding: { top: '1.188rem', bottom: '0.5rem', left: '5.25rem', right: '5.25rem' } },
                this.$render("i-hstack", { verticalAlignment: 'center', horizontalAlignment: 'end' },
                    this.$render("i-panel", null,
                        this.$render("i-button", { id: "btnNetwork", height: 38, margin: { right: '0.5rem' }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, border: { radius: 5 }, font: { color: Theme.colors.primary.contrastText }, onClick: this.openNetworkModal, caption: "Unsupported Network" })),
                    this.$render("i-hstack", { id: "hsBalance", height: 38, visible: false, horizontalAlignment: "center", verticalAlignment: "center", background: { color: Theme.colors.primary.main }, border: { radius: 5 }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' } },
                        this.$render("i-label", { id: "lblBalance", font: { color: Theme.colors.primary.contrastText } })),
                    this.$render("i-panel", { id: "pnlWalletDetail", visible: false },
                        this.$render("i-button", { id: "btnWalletDetail", height: 38, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, margin: { left: '0.5rem' }, border: { radius: 5 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, onClick: this.openWalletDetailModal }),
                        this.$render("i-modal", { id: "mdWalletDetail", class: "wallet-modal", height: "auto", maxWidth: 200, showBackdrop: false, popupPlacement: "bottomRight" },
                            this.$render("i-vstack", { gap: 15, padding: { top: 10, left: 10, right: 10, bottom: 10 } },
                                this.$render("i-button", { caption: "Account", width: "100%", height: "auto", border: { radius: 5 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.openAccountModal }),
                                this.$render("i-button", { caption: "Switch wallet", width: "100%", height: "auto", border: { radius: 5 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.openSwitchModal }),
                                this.$render("i-button", { caption: "Logout", width: "100%", height: "auto", border: { radius: 5 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem' }, onClick: this.logout })))),
                    this.$render("i-button", { id: "btnConnectWallet", height: 38, caption: "Connect Wallet", border: { radius: 5 }, font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, onClick: this.openConnectModal })),
                this.$render("i-modal", { id: 'mdNetwork', title: 'Supported Network', class: 'os-modal', width: 440, closeIcon: { name: 'times' }, border: { radius: 10 } },
                    this.$render("i-vstack", { height: '100%', lineHeight: 1.5, padding: { left: '1rem', right: '1rem', bottom: '2rem' } },
                        this.$render("i-label", { id: 'lblNetworkDesc', margin: { top: '1rem' }, font: { size: '.875rem' }, wordBreak: "break-word", caption: 'We support the following networks, please click to connect.' }),
                        this.$render("i-hstack", { margin: { left: '-1.25rem', right: '-1.25rem' }, height: '100%' },
                            this.$render("i-grid-layout", { id: 'gridNetworkGroup', font: { color: '#f05e61' }, height: "calc(100% - 160px)", width: "100%", overflow: { y: 'auto' }, margin: { top: '1.5rem' }, padding: { left: '1.25rem', right: '1.25rem' }, columnsPerRow: 1, templateRows: ['max-content'], class: 'list-view', gap: { row: '0.5rem' } })))),
                this.$render("i-modal", { id: 'mdConnect', title: 'Connect Wallet', class: 'os-modal', width: 440, closeIcon: { name: 'times' }, border: { radius: 10 } },
                    this.$render("i-vstack", { padding: { left: '1rem', right: '1rem', bottom: '2rem' }, lineHeight: 1.5 },
                        this.$render("i-label", { font: { size: '.875rem' }, caption: 'Recommended wallet for Chrome', margin: { top: '1rem' }, wordBreak: "break-word" }),
                        this.$render("i-panel", null,
                            this.$render("i-grid-layout", { id: 'gridWalletList', class: 'list-view', margin: { top: '0.5rem' }, columnsPerRow: 1, templateRows: ['max-content'], gap: { row: 8 } })))),
                this.$render("i-modal", { id: 'mdAccount', title: 'Account', class: 'os-modal', width: 440, height: 200, closeIcon: { name: 'times' }, border: { radius: 10 } },
                    this.$render("i-vstack", { width: "100%", padding: { top: "1.75rem", bottom: "1rem", left: "2.75rem", right: "2.75rem" }, gap: 5 },
                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center' },
                            this.$render("i-label", { font: { size: '0.875rem' }, caption: 'Connected with' }),
                            this.$render("i-button", { caption: 'Logout', font: { color: Theme.colors.error.contrastText }, background: { color: Theme.colors.error.light }, padding: { top: 6, bottom: 6, left: 10, right: 10 }, border: { radius: 5 }, onClick: this.logout })),
                        this.$render("i-label", { id: "lblWalletAddress", font: { size: '1.25rem', bold: true, color: Theme.colors.primary.main }, lineHeight: 1.5 }),
                        this.$render("i-hstack", { verticalAlignment: "center", gap: "2.5rem" },
                            this.$render("i-hstack", { class: "pointer", verticalAlignment: "center", tooltip: { content: `The address has been copied`, trigger: 'click' }, gap: "0.5rem", onClick: this.copyWalletAddress },
                                this.$render("i-icon", { name: "copy", width: "16px", height: "16px", fill: Theme.text.secondary }),
                                this.$render("i-label", { caption: "Copy Address", font: { size: "0.875rem", bold: true } })),
                            this.$render("i-hstack", { id: "hsViewAccount", class: "pointer", verticalAlignment: "center", onClick: this.viewOnExplorerByAddress.bind(this) },
                                this.$render("i-icon", { name: "external-link-alt", width: "16", height: "16", fill: Theme.text.secondary, display: "inline-block" }),
                                this.$render("i-label", { caption: "View on Explorer", margin: { left: "0.5rem" }, font: { size: "0.875rem", bold: true } })))))));
        }
    };
    __decorate([
        components_7.observable()
    ], DappContainerHeader.prototype, "walletInfo", void 0);
    DappContainerHeader = __decorate([
        components_7.customElements('dapp-container-header')
    ], DappContainerHeader);
    exports.DappContainerHeader = DappContainerHeader;
});
define("@scom/scom-dapp-container/footer.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerFooter = void 0;
    const Theme = components_8.Styles.Theme.ThemeVars;
    let DappContainerFooter = class DappContainerFooter extends components_8.Module {
        constructor(parent) {
            super(parent);
        }
        init() {
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
            return (this.$render("i-hstack", { class: "footer", horizontalAlignment: "start", verticalAlignment: "center", padding: { left: '0.5rem', right: '0.5rem', bottom: '1.25rem' } },
                this.$render("i-hstack", { id: "lblFooter", gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: "Powered By", font: { size: '0.75rem', color: Theme.text.primary } }),
                    this.$render("i-label", { caption: "SECURE", font: { size: '0.875rem', color: '#F99E43', weight: 700 } }),
                    this.$render("i-label", { caption: "COMPUTE", font: { size: '0.875rem', color: Theme.text.primary, weight: 700 } }))));
        }
    };
    DappContainerFooter = __decorate([
        components_8.customElements('dapp-container-footer')
    ], DappContainerFooter);
    exports.DappContainerFooter = DappContainerFooter;
});
define("@scom/scom-dapp-container", ["require", "exports", "@ijstech/components", "@scom/scom-dapp-container/index.css.ts", "@scom/scom-dapp-container/store/index.ts", "@scom/scom-dapp-container/utils/index.ts", "@scom/scom-dapp-container/body.tsx", "@scom/scom-dapp-container/header.tsx", "@scom/scom-dapp-container/footer.tsx"], function (require, exports, components_9, index_css_1, index_3, index_4, body_1, header_1, footer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DappContainerFooter = exports.DappContainerHeader = exports.DappContainerBody = void 0;
    Object.defineProperty(exports, "DappContainerBody", { enumerable: true, get: function () { return body_1.DappContainerBody; } });
    Object.defineProperty(exports, "DappContainerHeader", { enumerable: true, get: function () { return header_1.DappContainerHeader; } });
    Object.defineProperty(exports, "DappContainerFooter", { enumerable: true, get: function () { return footer_1.DappContainerFooter; } });
    const Theme = components_9.Styles.Theme.ThemeVars;
    let ScomDappContainer = class ScomDappContainer extends components_9.Module {
        constructor() {
            super(...arguments);
            this.isInited = false;
            this.isRendering = false;
            this.tag = {};
        }
        async initData() {
            if (!this.isInited && this.dappContainerHeader.isInited && this.dappContainerBody.isInited) {
                this.isInited = true;
                this.isRendering = true;
                const networks = this.getAttribute('networks', true, []);
                const wallets = this.getAttribute('wallets', true, []);
                const showHeader = this.getAttribute('showHeader', true, true);
                const content = this.getAttribute('content', true, []);
                await this.setData({ networks, wallets, content, showHeader });
                this.isRendering = false;
            }
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            this.classList.add('main-dapp');
            const tag = this.getAttribute('tag', true);
            tag && this.setTag(tag);
            await this.initData();
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        async connectedCallback() {
            super.connectedCallback();
            if (!this.isConnected)
                return;
            if (!this.dappContainerHeader.isInited)
                await this.dappContainerHeader.init();
            await this.initData();
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get networks() {
            return this._data.networks;
        }
        set networks(value) {
            this._data.networks = value;
            index_3.updateStore(this._data);
        }
        get wallets() {
            return this._data.wallets;
        }
        set wallets(value) {
            this._data.wallets = value;
            index_3.updateStore(this._data);
        }
        get content() {
            return this._data.content;
        }
        set content(value) {
            this._data.content = value;
            if (!this.isRendering)
                this.renderContent();
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
            this.pnlLoading.visible = true;
            this.gridMain.visible = false;
            this._data = data;
            this.dappContainerHeader.visible = this._data.showHeader;
            index_3.updateStore(this._data);
            this.dappContainerHeader.reloadWalletsAndNetworks();
            if (!this._data) {
                this.dappContainerBody.clear();
                return;
            }
            await this.renderContent();
            this.pnlLoading.visible = false;
            this.gridMain.visible = true;
        }
        async renderContent() {
            var _a, _b, _c, _d, _e;
            if ((_b = (_a = this._data) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.module) {
                try {
                    console.log('this._data.content.module', this._data.content.module);
                    const rootDir = this.getRootDir();
                    const module = await index_4.getEmbedElement(rootDir ? `${rootDir}/${this._data.content.module.localPath}` : this._data.content.module.localPath);
                    console.log(module);
                    if (module) {
                        this.setModule(module);
                        await module.ready();
                        if ((_c = this._data.content) === null || _c === void 0 ? void 0 : _c.properties)
                            await module.setData(this._data.content.properties);
                        const tagData = this._data.tag || ((_e = (_d = this._data) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.tag) || null;
                        if (tagData) {
                            module.setTag(tagData);
                            this.setTag(tagData);
                        }
                    }
                }
                catch (_f) { }
            }
        }
        getActions() {
            let module = this.dappContainerBody.getModule();
            let actions;
            if (module && module.getActions) {
                actions = module.getActions();
            }
            return actions;
        }
        getEmbedderActions() {
            let module = this.dappContainerBody.getModule();
            let actions;
            if (module && module.getEmbedderActions) {
                actions = module.getEmbedderActions();
            }
            return actions;
        }
        getModule() {
            let module = this.dappContainerBody.getModule();
            return module;
        }
        setModule(module) {
            this.dappContainerBody.clear();
            this.dappContainerBody.setModule(module);
        }
        getTag() {
            let bodyTag = this.dappContainerBody.getTag();
            return Object.assign(Object.assign({}, this.tag), bodyTag);
        }
        setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop))
                    this.tag[prop] = newValue[prop];
            }
            this.dappContainerBody.setTag(this.tag);
            this.updateTheme();
        }
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
            var _a, _b, _c, _d, _e;
            this.updateStyle('--text-primary', (_a = this.tag) === null || _a === void 0 ? void 0 : _a.fontColor);
            this.updateStyle('--background-main', (_b = this.tag) === null || _b === void 0 ? void 0 : _b.backgroundColor);
            this.updateStyle('--input-font_color', (_c = this.tag) === null || _c === void 0 ? void 0 : _c.inputFontColor);
            this.updateStyle('--input-background', (_d = this.tag) === null || _d === void 0 ? void 0 : _d.inputBackgroundColor);
            this.updateStyle('--colors-primary-main', (_e = this.tag) === null || _e === void 0 ? void 0 : _e.buttonBackgroundColor);
        }
        render() {
            return (this.$render("i-vstack", { class: index_css_1.default, width: "100%", height: "100%", background: { color: Theme.background.main } },
                this.$render("dapp-container-header", { visible: false, id: "dappContainerHeader" }),
                this.$render("i-panel", { stack: { grow: "1" }, overflow: "hidden" },
                    this.$render("i-vstack", { id: "pnlLoading", height: "100%", horizontalAlignment: "center", verticalAlignment: "center", padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, visible: false },
                        this.$render("i-panel", { class: 'spinner' })),
                    this.$render("i-grid-layout", { id: "gridMain", height: "100%", templateColumns: ["1fr"] },
                        this.$render("dapp-container-body", { id: "dappContainerBody", overflow: "auto" }))),
                this.$render("dapp-container-footer", null)));
        }
    };
    ScomDappContainer = __decorate([
        components_9.customModule,
        components_9.customElements('i-scom-dapp-container')
    ], ScomDappContainer);
    exports.default = ScomDappContainer;
});
