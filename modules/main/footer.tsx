import {
  Module,
  customElements,
  Label,
  ControlElement,
  Styles,
  application
} from '@ijstech/components';
import Assets from '@pageblock-dapp-container/assets';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['dapp-container-footer']: ControlElement;
    }
  }
}

const Theme = Styles.Theme.ThemeVars;

@customElements('dapp-container-footer')
export class DappContainerFooter extends Module {
  private _footer: string;
  private lblFooter: Label;

  constructor(parent?: any) {
    super(parent);
  }

  async init() {
    super.init();
    this.footer = "Powered By SECURE COMPUTE";
  }

  get footer() {
    return this._footer;
  }

  set footer(value: string) {
    this._footer = value;
    this.lblFooter.caption = value;
  }

  render() {
    return (
      <i-hstack
        class="footer"
        height={50}
        horizontalAlignment="start"
        verticalAlignment="center"
        padding={{ left: 20, right: 20, top: 10, bottom: 10 }}
        border={{ width: 1, style: 'solid', color: Theme.divider }}
        gap={10}
      >
        <i-image height={30} width={30} url={Assets.logo}></i-image>
        <i-label id="lblFooter" font={{ color: Theme.text.primary }}></i-label>
      </i-hstack>
    );
  }
}

