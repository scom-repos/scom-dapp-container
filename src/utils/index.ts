import { BigNumber } from '@ijstech/eth-wallet';
import { match, MatchFunction } from './pathToRegexp';
import { Control, FormatUtils } from '@ijstech/components';

const formatNumber = (value: number | string | BigNumber, decimalFigures?: number) => {
  const newValue = (typeof value === 'object') ? value.toFixed() : value;
  const minValue = '0.0000001';
  return FormatUtils.formatNumber(newValue, { decimalFigures: decimalFigures || 4, minValue });
};

function updateStyle(target: Control, name: string, value: any) {
  value ?
    target.style.setProperty(name, value) :
    target.style.removeProperty(name);
}

function updateTheme(target: Control, theme: any) {
  if (!theme) theme = {};
  updateStyle(target, '--text-primary', theme.fontColor);
  updateStyle(target, '--background-main', theme.backgroundColor);
  updateStyle(target, '--input-font_color', theme.inputFontColor);
  updateStyle(target, '--input-background', theme.inputBackgroundColor);
  updateStyle(target, '--colors-primary-main', theme.buttonBackgroundColor);
  updateStyle(target, '--colors-primary-contrast_text', theme.buttonFontColor);
  updateStyle(target, '--background-modal', theme.modalColor);
  updateStyle(target, '--colors-secondary-main', theme.secondaryColor);
  updateStyle(target, '--colors-secondary-contrast_text', theme.secondaryFontColor);
  updateStyle(target, '--primary-button-background', theme.primaryButtonBackground);
  updateStyle(target, '--primary-button-hover-background', theme.primaryButtonHoverBackground);
  updateStyle(target, '--primary-button-disabled-background', theme.primaryButtonDisabledBackground);
  updateStyle(target, '--max-button-background', theme.maxButtonBackground);
  updateStyle(target, '--max-button-hover-background', theme.maxButtonHoverBackground);
}

export {
  formatNumber,
  updateTheme,
  match,
  MatchFunction
}

export * from './theme';
