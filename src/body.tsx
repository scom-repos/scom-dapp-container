import {ControlElement, customElements, Module, Panel } from "@ijstech/components";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['dapp-container-body']: ControlElement;
    }
  }
}

@customElements('dapp-container-body')
export class DappContainerBody extends Module {
  private pnlModule: Panel;
  private module: any;
  private isLoading: boolean = false;
  isInited: boolean = false;

  clear() {
    this.pnlModule.clearInnerHTML();
    this.module = null;
  }

  getModule() {
    return this.module;
  }
  
  setModule(module: Module) {
    this.module = module;
    if (!this.pnlModule) return;
    this.module.parent = this.pnlModule;
    this.pnlModule.append(this.module);
  }

  init() {
    super.init();
    this.isInited = true;
  }
  
  render() {
    return (
      <i-panel id="pnlModule"></i-panel>
    );
  }
}