import { customElements, ControlElement, customModule, GridLayout, Module, Panel, Styles, Container } from "@ijstech/components";
import { IWalletPlugin, IDappContainerContent, IDappContainerData, IExtendedNetwork } from "./interface";
import {} from "@ijstech/eth-contract";
import styleClass from './index.css';
import { DappContainerBody } from './body';
import { DappContainerHeader } from "./header";
import { updateStore } from "./store/index";
import { getEmbedElement } from "./utils/index";
export { DappContainerBody } from './body';
export { DappContainerHeader } from './header';
export { DappContainerFooter } from './footer';

const Theme = Styles.Theme.ThemeVars;

interface ScomDappElement extends ControlElement {
  networks: number[];
  wallets: IWalletPlugin[];
  showHeader?: boolean;
  content: IDappContainerContent;
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
  private isRendering: boolean = false;

  tag: any = {};

  private async initData() {
    if (!this.isInited && this.dappContainerHeader.isInited && this.dappContainerBody.isInited) {
      this.isInited = true;
      this.isRendering = true;
      const networks = this.getAttribute('networks', true, [])
      const wallets = this.getAttribute('wallets', true, [])
      const showHeader = this.getAttribute('showHeader', true, true)
      const content = this.getAttribute('content', true, [])
      await this.setData({networks, wallets, content, showHeader})
      this.isRendering = false;
    }
  }

  async init() {
    this.isReadyCallbackQueued = true;
    super.init();
    this.classList.add('main-dapp');
    const tag = this.getAttribute('tag', true)
    tag && this.setTag(tag)
    await this.initData();
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
  }

  async connectedCallback() {
    super.connectedCallback();
    if (!this.isConnected) return;
    if (!this.dappContainerHeader.isInited)
      await this.dappContainerHeader.init();
    await this.initData();
  }

  static async create(options?: ScomDappElement, parent?: Container){
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get networks() {
    return this._data.networks;
  }
  set networks(value: IExtendedNetwork[]) {
    this._data.networks = value;
    updateStore(this._data);
  }

  get wallets() {
    return this._data.wallets;
  }
  set wallets(value: IWalletPlugin[]) {
    this._data.wallets = value;
    updateStore(this._data);
  }

  get content() {
    return this._data.content;
  }
  set content(value: IDappContainerContent) {
    this._data.content = value;
    if (!this.isRendering) this.renderContent();
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
    this.pnlLoading.visible = true;
    this.gridMain.visible = false;
    this._data = data;
    this.dappContainerHeader.visible = this._data.showHeader;
    updateStore(this._data);
    this.dappContainerHeader.reloadWalletsAndNetworks();
    if (!this._data) {
      this.dappContainerBody.clear();
      return;
    }
    await this.renderContent();
    this.pnlLoading.visible = false;
    this.gridMain.visible = true;
  }

  private async renderContent() {
    if (this._data?.content?.module) {
      try {
        console.log('this._data.content.module', this._data.content.module)
        const rootDir = this.getRootDir();
        const module: any = await getEmbedElement(rootDir ? `${rootDir}/${this._data.content.module.localPath}` : this._data.content.module.localPath);
        console.log(module)
        if (module) {
          this.setModule(module);
          await module.ready();
          if (this._data.content?.properties)
            await module.setData(this._data.content.properties);
          const tagData = this._data.tag || this._data?.content?.tag || null;
          if (tagData) {
            module.setTag(tagData);
            this.setTag(tagData);
          }
        }
      } catch {}
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

  setModule(module: Module) {
    this.dappContainerBody.clear();
    this.dappContainerBody.setModule(module);
  }

  getTag() {
    let bodyTag = this.dappContainerBody.getTag();
    return {
      ...this.tag,
      ...bodyTag
    }
  }

  setTag(value: any) {
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop))
        this.tag[prop] = newValue[prop];
    }
    if (this.dappContainerBody)
      this.dappContainerBody.setTag(this.tag);
    this.updateTheme();
  }

  private updateStyle(name: string, value: any) {
    value ?
      this.style.setProperty(name, value) :
      this.style.removeProperty(name);
  }

  private updateTheme() {
    this.updateStyle('--text-primary', this.tag?.fontColor);
    this.updateStyle('--background-main', this.tag?.backgroundColor);
    this.updateStyle('--input-font_color', this.tag?.inputFontColor);
    this.updateStyle('--input-background', this.tag?.inputBackgroundColor);
    this.updateStyle('--colors-primary-main', this.tag?.buttonBackgroundColor);
    this.updateStyle('--background-modal', this.tag?.modalColor);
    this.updateStyle('--colors-secondary-main', this.tag?.secondaryColor);
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