import { BigNumber } from '@ijstech/eth-wallet';
import { match, MatchFunction } from './pathToRegexp';
import { FormatUtils } from '@ijstech/components';

const formatNumber = (value: number | string | BigNumber, decimalFigures?: number) => {
  const newValue = (typeof value === 'object') ? value.toFixed() : value;
  const minValue = '0.0000001';
  return FormatUtils.formatNumber(newValue, {decimalFigures: decimalFigures || 4, minValue});
};

export {
  formatNumber,
  match,
  MatchFunction
}

export * from './theme';
