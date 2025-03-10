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

function getThemeVars(themeVars: any) {
  return {
    fontColor: themeVars.text.primary,
    backgroundColor: themeVars.background.main,
    inputFontColor: themeVars.input.fontColor,
    inputBackgroundColor: themeVars.input.background,
    buttonBackgroundColor: themeVars.colors.primary.main,
    buttonFontColor: themeVars.colors.primary.contrastText,
    modalColor: themeVars.background.modal,
    secondaryColor: themeVars.colors.secondary.main,
    secondaryFontColor: themeVars.colors.secondary.contrastText,
    textSecondary: themeVars.text.secondary,
    primaryButtonBackground: themeVars.buttons.primary.background,
    primaryButtonHoverBackground: themeVars.buttons.primary.hoverBackground,
    primaryButtonDisabledBackground: themeVars.buttons.primary.disabledBackground,
    maxButtonBackground: themeVars.buttons.secondary.background,
    maxButtonHoverBackground: themeVars.buttons.secondary.hoverBackground
  }
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
  getThemeVars,
  updateTheme,
  match,
  MatchFunction
}

export * from './theme';
