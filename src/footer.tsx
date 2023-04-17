import {
  Module,
  customElements,
  ControlElement,
  Styles,
  HStack,
  Control
} from '@ijstech/components';

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
  private _footer: Control;
  private lblFooter: HStack;

  constructor(parent?: any) {
    super(parent);
  }

  init() {
    super.init();
  }

  get footer() {
    return this._footer;
  }

  set footer(value: Control) {
    this._footer = value;
    this.lblFooter.clearInnerHTML();
    this.lblFooter.appendChild(value);
  }

  render() {
    return (
      <i-hstack
        class="footer"
        horizontalAlignment="start"
        verticalAlignment="center"
        padding={{ left: '0.5rem', right: '0.5rem',bottom: '1.25rem' }}
        // border={{ width: 1, style: 'solid', color: Theme.divider }}
      >
        {/* <i-image height={30} width={30} url={Assets.logo}></i-image> */}
        <i-hstack id="lblFooter" gap={4} verticalAlignment="center">
          <i-label caption="Powered By" font={{size: '0.75rem', color: Theme.text.primary}}></i-label>
          <i-label caption="SECURE" font={{size: '0.875rem', color: '#F99E43', weight: 700}}></i-label>
          <i-label caption="COMPUTE" font={{size: '0.875rem', color: Theme.text.primary, weight: 700}}></i-label>
        </i-hstack>
      </i-hstack>
    );
  }
}

