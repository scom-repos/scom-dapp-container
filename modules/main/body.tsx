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

  clear() {
    this.pnlModule.clearInnerHTML();
  }

  async setData(data: IDappContainerData) {
    if (data.module) {
      let module = await this.loadModule(data.module);
      if (module) {
        await module.setData(data.content);
        if (data.tag) module.setTag(data.tag);
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