import Immutable from 'immutable';
  // Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elemente
const inlineElementNames = Immutable.Set.of('B', 'BIG', 'I', 'SMALL', 'TT',
    'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 'EM', 'KBD', 'STRONG', 'SAMP', 'VAR',
    'A', 'BDO', 'BR', 'IMG', 'MAP', 'OBJECT', 'Q', 'SCRIPT', 'SPAN', 'SUB', 'SUP',
    'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA');

export default inlineElementNames;

