import { application, ControlElement, customElements, Module, Panel } from "@ijstech/components";
import { IDappContainerData, IPageBlockData } from "@pageblock-dapp-container/interface";
import { getModule } from "@pageblock-dapp-container/utils";

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

  clear() {
    this.pnlModule.clearInnerHTML();
    this.module = null;
  }

  getModule() {
    return this.module;
  }
  
  setModule(module: Module) {
    this.module = module;
    this.module.parent = this.pnlModule;
    this.pnlModule.append(module);
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
    return this.module?.getTag();
  }

  setTag(data: any) {
    if (this.module) this.module.setTag(data);
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
    return (
      <i-panel id="pnlModule"></i-panel>
    );
  }
}