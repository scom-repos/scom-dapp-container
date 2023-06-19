/// <amd-module name="@scom/scom-dapp-container/interface.ts" />
declare module "@scom/scom-dapp-container/interface.ts" {
    import { IClientSideProvider, INetwork } from "@ijstech/eth-wallet";
    interface IWalletPlugin {
        name: string;
        packageName?: string;
        provider?: IClientSideProvider;
    }
    interface IDappContainerData {
        defaultChainId?: number;
        networks?: INetworkConfig[];
        wallets?: IWalletPlugin[];
        showHeader?: boolean;
        showFooter?: boolean;
        showWalletNetwork?: boolean;
    }
    interface IPageBlockData {
        name: string;
        description: string;
        ipfscid: string;
        imgUrl: string;
        localPath?: string;
    }
    interface ICodeInfoFileContent {
        version: ISemanticVersion;
        codeCID: string;
        source: string;
    }
    interface ISemanticVersion {
        major: number;
        minor: number;
        patch: number;
    }
    enum EVENT {
        'UPDATE_TAG' = "UPDATE_TAG"
    }
    interface IExtendedNetwork extends INetwork {
        symbol?: string;
        env?: string;
        explorerName?: string;
        explorerTxUrl?: string;
        explorerAddressUrl?: string;
        isDisabled?: boolean;
    }
    interface INetworkConfig {
        chainName?: string;
        chainId: number;
    }
    export { IWalletPlugin, IPageBlockData, IDappContainerData, ICodeInfoFileContent, EVENT, IExtendedNetwork, INetworkConfig };
}
/// <amd-module name="@scom/scom-dapp-container/index.css.ts" />
declare module "@scom/scom-dapp-container/index.css.ts" {
    const _default: string;
    export default _default;
}
/// <amd-module name="@scom/scom-dapp-container/body.tsx" />
declare module "@scom/scom-dapp-container/body.tsx" {
    import { ControlElement, Module } from "@ijstech/components";
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['dapp-container-body']: ControlElement;
            }
        }
    }
    export class DappContainerBody extends Module {
        private pnlModule;
        private module;
        private isLoading;
        isInited: boolean;
        clear(): void;
        getModule(): any;
        setModule(module: Module): void;
        init(): void;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-dapp-container/utils/pathToRegexp.ts" />
declare module "@scom/scom-dapp-container/utils/pathToRegexp.ts" {
    export interface ParseOptions {
        /**
         * Set the default delimiter for repeat parameters. (default: `'/'`)
         */
        delimiter?: string;
        /**
         * List of characters to automatically consider prefixes when parsing.
         */
        prefixes?: string;
    }
    /**
     * Parse a string for the raw tokens.
     */
    export function parse(str: string, options?: ParseOptions): Token[];
    export interface TokensToFunctionOptions {
        /**
         * When `true` the regexp will be case sensitive. (default: `false`)
         */
        sensitive?: boolean;
        /**
         * Function for encoding input strings for output.
         */
        encode?: (value: string, token: Key) => string;
        /**
         * When `false` the function can produce an invalid (unmatched) path. (default: `true`)
         */
        validate?: boolean;
    }
    /**
     * Compile a string to a template function for the path.
     */
    export function compile<P extends object = object>(str: string, options?: ParseOptions & TokensToFunctionOptions): PathFunction<P>;
    export type PathFunction<P extends object = object> = (data?: P) => string;
    /**
     * Expose a method for transforming tokens into the path function.
     */
    export function tokensToFunction<P extends object = object>(tokens: Token[], options?: TokensToFunctionOptions): PathFunction<P>;
    export interface RegexpToFunctionOptions {
        /**
         * Function for decoding strings for params.
         */
        decode?: (value: string, token: Key) => string;
    }
    /**
     * A match result contains data about the path match.
     */
    export interface MatchResult<P extends object = object> {
        path: string;
        index: number;
        params: P;
    }
    /**
     * A match is either `false` (no match) or a match result.
     */
    export type Match<P extends object = object> = false | MatchResult<P>;
    /**
     * The match function takes a string and returns whether it matched the path.
     */
    export type MatchFunction<P extends object = object> = (path: string) => Match<P>;
    /**
     * Create path match function from `path-to-regexp` spec.
     */
    export function match<P extends object = object>(str: Path, options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions): MatchFunction<P>;
    /**
     * Create a path match function from `path-to-regexp` output.
     */
    export function regexpToFunction<P extends object = object>(re: RegExp, keys: Key[], options?: RegexpToFunctionOptions): MatchFunction<P>;
    /**
     * Metadata about a key.
     */
    export interface Key {
        name: string | number;
        prefix: string;
        suffix: string;
        pattern: string;
        modifier: string;
    }
    /**
     * A token is a string (nothing special) or key metadata (capture group).
     */
    export type Token = string | Key;
    export interface TokensToRegexpOptions {
        /**
         * When `true` the regexp will be case sensitive. (default: `false`)
         */
        sensitive?: boolean;
        /**
         * When `true` the regexp won't allow an optional trailing delimiter to match. (default: `false`)
         */
        strict?: boolean;
        /**
         * When `true` the regexp will match to the end of the string. (default: `true`)
         */
        end?: boolean;
        /**
         * When `true` the regexp will match from the beginning of the string. (default: `true`)
         */
        start?: boolean;
        /**
         * Sets the final character for non-ending optimistic matches. (default: `/`)
         */
        delimiter?: string;
        /**
         * List of characters that can also be "end" characters.
         */
        endsWith?: string;
        /**
         * Encode path tokens for use in the `RegExp`.
         */
        encode?: (value: string) => string;
    }
    /**
     * Expose a function for taking tokens and returning a RegExp.
     */
    export function tokensToRegexp(tokens: Token[], keys?: Key[], options?: TokensToRegexpOptions): RegExp;
    /**
     * Supported `path-to-regexp` input types.
     */
    export type Path = string | RegExp | Array<string | RegExp>;
    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     */
    export function pathToRegexp(path: Path, keys?: Key[], options?: TokensToRegexpOptions & ParseOptions): RegExp;
}
/// <amd-module name="@scom/scom-dapp-container/utils/theme.ts" />
declare module "@scom/scom-dapp-container/utils/theme.ts" {
    export const darkTheme: {
        background: {
            main: string;
            modal: string;
            gradient: string;
        };
        input: {
            background: string;
            fontColor: string;
        };
        text: {
            primary: string;
            secondary: string;
        };
        colors: {
            primary: {
                main: string;
                contrastText: string;
            };
            secondary: {
                main: string;
                contrastText: string;
            };
        };
    };
    export const lightTheme: {
        background: {
            modal: string;
            main: string;
        };
        input: {
            background: string;
            fontColor: string;
        };
        text: {
            primary: string;
            secondary: string;
        };
        colors: {
            primary: {
                main: string;
                contrastText: string;
            };
            secondary: {
                main: string;
                contrastText: string;
            };
        };
    };
}
/// <amd-module name="@scom/scom-dapp-container/utils/index.ts" />
declare module "@scom/scom-dapp-container/utils/index.ts" {
    import { match, MatchFunction } from "@scom/scom-dapp-container/utils/pathToRegexp.ts";
    const IPFS_SCOM_URL = "https://ipfs.scom.dev/ipfs";
    interface IGetModuleOptions {
        ipfscid?: string;
        localPath?: string;
    }
    function fetchFileContentByCid(ipfsCid: string): Promise<Response | undefined>;
    function getSCConfigByCodeCid(codeCid: string): Promise<any>;
    const formatNumber: (value: any, decimals?: number) => string;
    const formatNumberWithSeparators: (value: number, precision?: number) => string;
    const getEmbedElement: (path: string) => Promise<HTMLElement>;
    export { IPFS_SCOM_URL, fetchFileContentByCid, getSCConfigByCodeCid, formatNumber, formatNumberWithSeparators, match, MatchFunction, IGetModuleOptions, getEmbedElement };
    export * from "@scom/scom-dapp-container/utils/theme.ts";
}
/// <amd-module name="@scom/scom-dapp-container/header.css.ts" />
declare module "@scom/scom-dapp-container/header.css.ts" {
    const _default_1: string;
    export default _default_1;
}
/// <amd-module name="@scom/scom-dapp-container/store/index.ts" />
declare module "@scom/scom-dapp-container/store/index.ts" {
    import { Erc20, IClientSideProvider, ISendTxEventsOptions, IWallet } from '@ijstech/eth-wallet';
    import { IDappContainerData, IExtendedNetwork, IWalletPlugin } from "@scom/scom-dapp-container/interface.ts";
    export enum WalletPlugin {
        MetaMask = "metamask",
        WalletConnect = "walletconnect"
    }
    export const enum EventId {
        ConnectWallet = "connectWallet",
        IsWalletConnected = "isWalletConnected",
        chainChanged = "chainChanged",
        IsWalletDisconnected = "IsWalletDisconnected"
    }
    export function isWalletConnected(): boolean;
    export function initWalletPlugins(eventHandlers?: {
        [key: string]: Function;
    }): Promise<void>;
    export function connectWallet(walletPlugin: string): Promise<IWallet>;
    export function switchNetwork(chainId: number): Promise<void>;
    export function logoutWallet(): Promise<void>;
    export const hasWallet: () => boolean;
    export const hasMetaMask: () => boolean;
    export const truncateAddress: (address: string) => string;
    export const getSupportedWallets: () => IWalletPlugin[];
    export const getSupportedWalletProviders: () => IClientSideProvider[];
    export interface ITokenObject {
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean | null;
        logoURI?: string;
        isCommon?: boolean | null;
        balance?: string | number;
        isNative?: boolean | null;
    }
    export function registerSendTxEvents(sendTxEventHandlers: ISendTxEventsOptions): void;
    export function getChainId(): number;
    export function getWallet(): IWallet;
    export function getWalletProvider(): string;
    export function getErc20(address: string): Erc20;
    export const updateStore: (data: IDappContainerData) => void;
    export const getNetworkInfo: (chainId: number) => IExtendedNetwork | undefined;
    export const viewOnExplorerByTxHash: (chainId: number, txHash: string) => void;
    export const viewOnExplorerByAddress: (chainId: number, address: string) => void;
    export const getNetworkType: (chainId: number) => string;
    export const getDefaultChainId: () => number;
    export const getSiteSupportedNetworks: () => IExtendedNetwork[];
    export const isValidEnv: (env: string) => boolean;
    export const getInfuraId: () => string;
    export const getEnv: () => string;
    export const setWalletPluginProvider: (name: string, wallet: IWalletPlugin) => void;
    export const getWalletPluginMap: () => Record<string, IWalletPlugin>;
    export const getWalletPluginProvider: (name: string) => IClientSideProvider;
}
/// <amd-module name="@scom/scom-dapp-container/header.tsx" />
declare module "@scom/scom-dapp-container/header.tsx" {
    import { Module, Control, ControlElement, Container } from '@ijstech/components';
    export class DappContainerHeader extends Module {
        private btnNetwork;
        private hsBalance;
        private lblBalance;
        private pnlWalletDetail;
        private btnWalletDetail;
        private mdWalletDetail;
        private btnConnectWallet;
        private mdNetwork;
        private mdConnect;
        private mdAccount;
        private lblNetworkDesc;
        private lblWalletAddress;
        private hsViewAccount;
        private gridWalletList;
        private gridNetworkGroup;
        private switchTheme;
        private pnlWallet;
        private $eventBus;
        private selectedNetwork;
        private networkMapper;
        private walletMapper;
        private currActiveNetworkId;
        private currActiveWallet;
        private supportedNetworks;
        isInited: boolean;
        private walletInfo;
        private _showWalletNetwork;
        constructor(parent?: Container, options?: any);
        get symbol(): string;
        get shortlyAddress(): string;
        get showWalletNetwork(): boolean;
        set showWalletNetwork(value: boolean);
        registerEvent(): void;
        init(): Promise<void>;
        reloadWalletsAndNetworks(): Promise<void>;
        onChainChanged: (chainId: number) => Promise<void>;
        updateConnectedStatus: (isConnected: boolean) => Promise<void>;
        updateDot(connected: boolean, type: 'network' | 'wallet'): void;
        updateList(isConnected: boolean): void;
        openConnectModal: () => void;
        openNetworkModal: () => void;
        openWalletDetailModal: () => void;
        openAccountModal: (target: Control, event: Event) => void;
        openSwitchModal: (target: Control, event: Event) => void;
        logout: (target: Control, event: Event) => Promise<void>;
        viewOnExplorerByAddress(): void;
        switchNetwork(chainId: number): Promise<void>;
        openLink(link: any): Window;
        connectToProviderFunc: (walletPlugin: string) => Promise<void>;
        copyWalletAddress: () => void;
        isWalletActive(walletPlugin: any): boolean;
        isNetworkActive(chainId: number): boolean;
        renderWalletList: () => Promise<void>;
        renderNetworks(): void;
        initData(): Promise<void>;
        private onThemeChanged;
        private initTheme;
        render(): any;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['dapp-container-header']: ControlElement;
            }
        }
    }
}
/// <amd-module name="@scom/scom-dapp-container/footer.tsx" />
declare module "@scom/scom-dapp-container/footer.tsx" {
    import { Module, ControlElement, Control } from '@ijstech/components';
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['dapp-container-footer']: ControlElement;
            }
        }
    }
    export class DappContainerFooter extends Module {
        private _footer;
        private lblFooter;
        constructor(parent?: any);
        init(): void;
        get footer(): Control;
        set footer(value: Control);
        render(): any;
    }
}
/// <amd-module name="@scom/scom-dapp-container" />
declare module "@scom/scom-dapp-container" {
    import { ControlElement, Module, Container } from "@ijstech/components";
    import { IWalletPlugin, IDappContainerData } from "@scom/scom-dapp-container/interface.ts";
    export { DappContainerBody } from "@scom/scom-dapp-container/body.tsx";
    export { DappContainerHeader } from "@scom/scom-dapp-container/header.tsx";
    export { DappContainerFooter } from "@scom/scom-dapp-container/footer.tsx";
    interface INetworkConfig {
        chainName?: string;
        chainId: number;
    }
    interface ScomDappElement extends ControlElement {
        lazyLoad?: boolean;
        networks?: INetworkConfig[];
        wallets?: IWalletPlugin[];
        showHeader?: boolean;
        showFooter?: boolean;
        showWalletNetwork?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ["i-scom-dapp-container"]: ScomDappElement;
            }
        }
    }
    export default class ScomDappContainer extends Module {
        private pnlLoading;
        private gridMain;
        private dappContainerHeader;
        private dappContainerBody;
        private dappContainerFooter;
        private _data;
        private _rootDir;
        private isInited;
        private _theme;
        tag: any;
        set theme(value: string);
        get theme(): string;
        private initData;
        init(): Promise<void>;
        static create(options?: ScomDappElement, parent?: Container): Promise<ScomDappContainer>;
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        get showFooter(): boolean;
        set showFooter(value: boolean);
        get showWalletNetwork(): boolean;
        set showWalletNetwork(value: boolean);
        setRootDir(value: string): void;
        getRootDir(): string;
        getData(): Promise<IDappContainerData>;
        setData(data: IDappContainerData): Promise<void>;
        getActions(): any;
        getEmbedderActions(): any;
        getModule(): any;
        setModule(module: Module): void;
        getTag(): any;
        private updateTag;
        setTag(value: any): void;
        initTag(value: any): void;
        private updateStyle;
        private updateTheme;
        render(): any;
    }
}
