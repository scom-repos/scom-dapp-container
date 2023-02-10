import { application, ControlElement, customElements, Module, Panel } from "@ijstech/components";
import { IDappContainerData, IPageBlockData } from "@modules/interface";
import { getModule } from "@modules/utils";

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

  clear() {
    this.pnlModule.clearInnerHTML();
  }

  getModule() {
    return this.module;
  }
  
  async setData(data: IDappContainerData) {
    if (data.content && data.content.module) {
      this.module = await this.loadModule(data.content.module);
      if (this.module) {
        await this.module.setData(data.content.properties);
        if (data.content.tag) this.module.setTag(data.content.tag);
      }
    }
  }
  
  async loadModule(moduleData: IPageBlockData) {
    this.pnlModule.clearInnerHTML();
    let module: any = await getModule(moduleData);
    if (module) {
      this.pnlModule.append(module);
    }
    return module;
  }

  render() {
    return (
      <i-panel id="pnlModule"></i-panel>
    );
  }
}