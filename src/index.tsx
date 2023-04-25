import { customElements, ControlElement, customModule, GridLayout, Module, Panel, Styles, Container } from "@ijstech/components";
import { IWalletPlugin, IDappContainerData, IExtendedNetwork } from "./interface";
import {} from "@ijstech/eth-contract";
import styleClass from './index.css';
import { DappContainerBody } from './body';
import { DappContainerHeader } from "./header";
import { updateStore } from "./store/index";
export { DappContainerBody } from './body';
export { DappContainerHeader } from './header';
export { DappContainerFooter } from './footer';

const Theme = Styles.Theme.ThemeVars;
interface INetworkConfig {
  chainName?: string;
  chainId: number;
}

interface ScomDappElement extends ControlElement {
  networks?: INetworkConfig[];
  wallets?: IWalletPlugin[];
  showHeader?: boolean;
  // content?: IDappContainerContent;
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
  private pnlLoading: Panel;
  private gridMain: GridLayout;
  private dappContainerHeader: DappContainerHeader;
  private dappContainerBody: DappContainerBody;
  private _data: IDappContainerData | undefined;
  private _rootDir: string;
  private isInited: boolean = false;
  private _theme: string;

  tag: any = {};

  set theme(value: string) {
    this._theme = value;
    this.setTag(this.tag);
  }
  get theme() {
    return this._theme ?? 'dark';
  }

  private async initData() {
    if (!this.dappContainerBody.isConnected) await this.dappContainerBody.ready();
    if (!this.dappContainerHeader.isConnected) await this.dappContainerHeader.ready();
    if (!this.isInited) {
      this.isInited = true;
      const networks = this.getAttribute('networks', true) || this.networks;
      const wallets = this.getAttribute('wallets', true) || this.wallets;
      const showHeader = this.getAttribute('showHeader', true) || this.showHeader;
      await this.setData({networks, wallets, showHeader})
    }
  }

  async init() {
    let children = []
    for (let child of this.children) {
      children.push(child)
    }
    this.isReadyCallbackQueued = true;
    super.init();
    this.classList.add('main-dapp');
    const tag = this.getAttribute('tag', true)
    tag && this.setTag(tag)
    await this.initData();
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
    for (let item of children) {
      this.dappContainerBody.setModule(item);
    }
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
    updateStore(this._data);
  }

  get wallets() {
    return this._data?.wallets ?? [];
  }
  set wallets(value: IWalletPlugin[]) {
    this._data.wallets = value;
    updateStore(this._data);
  }

  get showHeader() {
    return this._data?.showHeader ?? true;
  }
  set showHeader(value: boolean) {
    this._data.showHeader = value;
  }

  // get content() {
  //   return this._data?.content;
  // }
  // set content(value: IDappContainerContent) {
  //   this._data.content = value;
  //   if (!this.isRendering) this.renderContent();
  // }

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
    this._data = data;
    if (!this.isInited) return;
    this.pnlLoading.visible = true;
    this.gridMain.visible = false;
    this.dappContainerHeader.visible = this._data.showHeader;
    updateStore(this._data);
    this.dappContainerHeader.reloadWalletsAndNetworks();
    if (!this._data) {
      this.dappContainerBody.clear();
      return;
    }
    // await this.renderContent();
    this.pnlLoading.visible = false;
    this.gridMain.visible = true;
  }

  // private async renderContent() {
  //   if (this._data?.content?.module) {
  //     try {
  //       console.log('this._data.content.module', this._data.content.module)
  //       const rootDir = this.getRootDir();
  //       const module: any = await getEmbedElement(rootDir ? `${rootDir}/${this._data.content.module.localPath}` : this._data.content.module.localPath);
  //       console.log(module)
  //       if (module) {
  //         this.setModule(module);
  //         await module.ready();
  //         if (this._data.content?.properties)
  //           await module.setData(this._data.content.properties);
  //         const tagData = this._data.tag || this._data?.content?.tag || null;
  //         if (tagData) {
  //           module.setTag(tagData);
  //           this.setTag(tagData);
  //         }
  //       }
  //     } catch {}
  //   }
  // }

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
    if (newValue.light) this.updateTag('light', newValue.light);
    if (newValue.dark) this.updateTag('dark', newValue.dark);
    this.updateTheme();
  }

  initTag(value: any) {
    this.setTag(value);
    const parent = this.parentElement as any;
    if (parent?.setTag) parent.setTag(this.tag);
  }

  private updateStyle(name: string, value: any) {
    value ?
      this.style.setProperty(name, value) :
      this.style.removeProperty(name);
  }

  private updateTheme() {
    this.updateStyle('--text-primary', this.tag[this.theme]?.fontColor);
    this.updateStyle('--background-main', this.tag[this.theme]?.backgroundColor);
    this.updateStyle('--input-font_color', this.tag[this.theme]?.inputFontColor);
    this.updateStyle('--input-background', this.tag[this.theme]?.inputBackgroundColor);
    this.updateStyle('--colors-primary-main', this.tag[this.theme]?.buttonBackgroundColor);
    this.updateStyle('--background-modal', this.tag[this.theme]?.modalColor);
    this.updateStyle('--colors-secondary-main', this.tag[this.theme]?.secondaryColor);
  }
  
  render() {
    return (
      <i-vstack class={styleClass} width="100%" height="100%" background={{ color: Theme.background.main }}>
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
        <dapp-container-footer></dapp-container-footer>
      </i-vstack>
    )
  }
}