import { customElements, ControlElement, customModule, GridLayout, Module, Panel, Styles, Container } from "@ijstech/components";
import { IWalletPlugin, IDappContainerData } from "./interface";
import styleClass from './index.css';
import { DappContainerBody } from './body';
import { DappContainerHeader } from "./header";
import { State, switchNetwork } from "./store/index";
import { DappContainerFooter } from "./footer";
import { Constants, IEventBusRegistry } from "@ijstech/eth-wallet";
import { updateTheme } from "./utils";
export { DappContainerBody } from './body';
export { DappContainerHeader } from './header';
export { DappContainerFooter } from './footer';

const Theme = Styles.Theme.ThemeVars;
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
  rpcWalletId?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["i-scom-dapp-container"]: ScomDappElement;
    }
  }
}

@customModule
@customElements('i-scom-dapp-container')
export default class ScomDappContainer extends Module {
  private state: State;
  private pnlLoading: Panel;
  private gridMain: GridLayout;
  private dappContainerHeader: DappContainerHeader;
  private dappContainerBody: DappContainerBody;
  private dappContainerFooter: DappContainerFooter;
  private _data: IDappContainerData | undefined;
  private _rootDir: string;
  private isInited: boolean = false;
  private _theme: string;

  tag: any = {};

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.state = new State();
    this.deferReadyCallback = true;
  }

  set theme(value: string) {
    this._theme = value;
    this.setTag(this.tag);
    const parent = this.parentElement as any;
    if (parent?.setTheme) parent.setTheme(this.theme);
  }
  get theme() {
    return this._theme ?? 'dark';
  }

  isEmptyData(value: IDappContainerData) {
    return !value || !value.networks || value.networks.length === 0;
  }

  private async initData() {
    if (!this.dappContainerBody.isConnected) await this.dappContainerBody.ready();
    if (!this.dappContainerHeader.isConnected) await this.dappContainerHeader.ready();
    if (!this.isInited) {
      this.isInited = true;
      const networks = this.getAttribute('networks', true) ?? this.networks;
      const wallets = this.getAttribute('wallets', true) ?? this.wallets;
      const showHeader = this.getAttribute('showHeader', true) ?? this.showHeader;
      const showFooter = this.getAttribute('showFooter', true) ?? this.showFooter;
      const showWalletNetwork = this.getAttribute('showWalletNetwork', true) ?? this.showWalletNetwork;
      const defaultChainId = this.getAttribute('defaultChainId', true) ?? this._data?.defaultChainId;
      const rpcWalletId = this.getAttribute('rpcWalletId', true) ?? this._data?.rpcWalletId;
      let data = {defaultChainId, networks, wallets, showHeader, showFooter, showWalletNetwork, rpcWalletId};
      if (!this.isEmptyData(data)) {
        await this.setData(data);
      }
    }
  }

  async init() {
    let children = []
    for (let child of this.children) {
      children.push(child)
    }
    super.init();
    // this.classList.add('main-dapp');
    const lazyLoad = this.getAttribute('lazyLoad', true, false);
    if (!lazyLoad) {
      const tag = this.getAttribute('tag', true)
      tag && this.setTag(tag)
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

  static async create(options?: ScomDappElement, parent?: Container){
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get networks() {
    return this._data?.networks ?? [];
  }
  set networks(value: INetworkConfig[]) {
    this._data.networks = value;
    this.state.update(this._data);
  }

  get wallets() {
    return this._data?.wallets ?? [];
  }
  set wallets(value: IWalletPlugin[]) {
    this._data.wallets = value;
    this.state.update(this._data);
  }

  get showHeader() {
    return this._data?.showHeader ?? true;
  }
  set showHeader(value: boolean) {
    this._data.showHeader = value;
    this.dappContainerHeader.visible = this.showHeader;
  }

  get showFooter() {
    return this._data?.showFooter ?? true;
  }
  set showFooter(value: boolean) {
    this._data.showFooter = value;
    this.dappContainerFooter.visible = this.showFooter;
  }

  get showWalletNetwork() {
    return this._data?.showWalletNetwork ?? true;
  }
  set showWalletNetwork(value: boolean) {
    this._data.showWalletNetwork = value;
  }

  setRootDir(value: string) {
    this._rootDir = value || '';
  }

  getRootDir() {
    return this._rootDir;
  }

  async getData() {
    return this._data;
  }

  async setData(data: IDappContainerData) {
    this._data = JSON.parse(JSON.stringify(data));
    if (!this.isInited) await this.ready();
    this.pnlLoading.visible = true;
    this.gridMain.visible = false;
    this.dappContainerHeader.setState(this.state);
    this.dappContainerHeader.visible = this.showHeader;
    this.dappContainerHeader.showWalletNetwork = this.showWalletNetwork;
    this.dappContainerFooter.visible = this.showFooter;
    if (this.showWalletNetwork) {
      this.state.update(this._data);
      const rpcWallet = this.state.getRpcWallet();
      if (rpcWallet){
        rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
          this.dappContainerHeader.onChainChanged(chainId);
        });
        if (this._data.defaultChainId) {
          const chainId = this.state.getChainId();
          if (chainId !== this._data.defaultChainId) {
            await switchNetwork(this.state, this._data.defaultChainId);
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

  setModule(module: Module) {
    this.dappContainerBody.clear();
    this.dappContainerBody.setModule(module);
  }

  getTag() {
    return this.tag;
  }

  private updateTag(type: 'light'|'dark', value: any) {
    this.tag[type] = this.tag[type] ?? {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop))
        this.tag[type][prop] = value[prop];
    }
  }

  setTag(value: any) {
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
    updateTheme(this, theme);
    if (this.dappContainerHeader) this.dappContainerHeader.theme = theme;
  }

  initTag(value: any) {
    this.setTag(value);
    const parent = this.parentElement as any;
    if (parent?.setTag) parent.setTag(this.tag);
  }
  
  render() {
    return (
      <i-vstack class={styleClass} width="100%" height="100%" background={{ color: Theme.background.main }} overflow="hidden">
        <dapp-container-header visible={false} id="dappContainerHeader"></dapp-container-header>
        <i-panel stack={{ grow: "1" }} overflow="hidden">
          <i-vstack
            id="pnlLoading"
            height="100%"
            horizontalAlignment="center"
            verticalAlignment="center"
            padding={{ top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }}
            visible={false}
          >
            <i-panel class={'spinner'}></i-panel>
          </i-vstack>
          <i-grid-layout id="gridMain" height="100%" templateColumns={["1fr"]}>
            <dapp-container-body id="dappContainerBody" overflow="auto"></dapp-container-body>
          </i-grid-layout>
        </i-panel>
        <dapp-container-footer visible={false} id="dappContainerFooter"></dapp-container-footer>
      </i-vstack>
    )
  }
}