import { application, customModule, GridLayout, Module, Panel, Styles } from "@ijstech/components";
import { IDappContainerData } from "@pageblock-dapp-container/interface";
import styleClass from './index.css';
import { DappContainerBody } from './body';
import { updateStore } from "@pageblock-dapp-container/store";
import { DappContainerHeader } from "./header";
export { DappContainerBody } from './body';
export { DappContainerHeader } from './header';
export { DappContainerFooter } from './footer';

const Theme = Styles.Theme.ThemeVars;

@customModule
export class DappContainer extends Module {
  private pnlLoading: Panel;
  private gridMain: GridLayout;
  private dappContainerHeader: DappContainerHeader;
  private dappContainerBody: DappContainerBody;
  private _data: IDappContainerData | undefined;
  private _rootDir: string;
  private embedInitializedEvent: any;
  tag: any = {};

  async init() {
    super.init();
    this.classList.add('main-dapp');
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
    if (this._data.showHeader) {
      this.dappContainerHeader.visible = true;
    }
    else {
      this.dappContainerHeader.visible = false;
    }
    updateStore(this._data);
    this.dappContainerHeader.reloadWalletsAndNetworks();
    if (!this._data) {
      this.dappContainerBody.clear();
      return;
    }
    await this.renderPageByConfig();
    this.pnlLoading.visible = false;
    this.gridMain.visible = true;
  }

  getActions() {
    let module = this.dappContainerBody.getModule();
    let actions;
    if (module && module.getActions) {
      actions = module.getActions();
    }
    return actions;
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
  }
  
  async renderPageByConfig() {
    await this.dappContainerBody.setData(this._rootDir, this._data);
    const containingModule = this.dappContainerBody.getModule();
    if (this.embedInitializedEvent) {
      this.embedInitializedEvent.unregister();
    }
    this.embedInitializedEvent = application.EventBus.register(this, 'embedInitialized', async (module) => {
      if (containingModule.tagName !== module.tagName) return;
      application.EventBus.dispatch('embedInitialized', this);
    });
  }

  onHide() {
    if (this.embedInitializedEvent) {
      this.embedInitializedEvent.unregister();
    }
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