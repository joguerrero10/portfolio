import stylelint from 'stylelint';
import valueParser from 'postcss-value-parser';

const ruleName = 'portfolio/rem-flow';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (reason) => `CSS contract: ${reason}`,
});

const rule = (enabled) => (root, result) => {
  if (!enabled) return;
  const variables = new Map();
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--') || decl.prop.startsWith('$'))
      variables.set(decl.prop, decl.value);
  });
  const report = (node, reason) =>
    stylelint.utils.report({
      ruleName,
      result,
      node,
      message: messages.rejected(reason),
      word: node.prop || node.params,
    });

  function check(value, node, property, seen = new Set()) {
    valueParser(value).walk((part) => {
      if (part.type === 'function') {
        if (part.value === 'url') return false;
        if (part.value === 'var') {
          const name = part.nodes.find((item) => item.type === 'word')?.value;
          if (name && variables.has(name) && !seen.has(name)) {
            check(variables.get(name), node, property, new Set([...seen, name]));
          }
        }
        if (property.startsWith('margin') && ['calc', 'min', 'max', 'clamp'].includes(part.value)) {
          report(
            node,
            'margin arithmetic may recreate positioning; use nonnegative spacing tokens',
          );
        }
        if (/^translate/i.test(part.value)) report(node, 'translation cannot be used for layout');
        return;
      }
      if (part.type !== 'word') return;
      if (part.value.startsWith('$') && variables.has(part.value) && !seen.has(part.value)) {
        check(variables.get(part.value), node, property, new Set([...seen, part.value]));
      }
      const dimension = valueParser.unit(part.value);
      if (!dimension) return;
      const unit = dimension.unit.toLowerCase();
      const number = Number(dimension.number);
      if (unit && !['rem', 'em', 'fr', 's', 'ms', 'deg'].includes(unit)) {
        report(node, `unit ${unit} is forbidden, including inside tokens and media queries`);
      }
      const isVariable = property.startsWith('--') || property.startsWith('$');
      if (unit === 'fr' && !/^grid(?:-template|-auto)?(?:-columns|-rows)?$/.test(property)) {
        report(node, 'fr is only allowed directly in grid tracks');
      }
      if (
        ['s', 'ms'].includes(unit) &&
        !/^(?:transition|animation)(?:-(?:duration|delay))?$/.test(property) &&
        !(isVariable && /(?:duration|delay)/.test(property))
      ) {
        report(node, 'time units are only allowed for durations and delays');
      }
      if (unit === 'deg' && !/^(?:rotate|transform|background(?:-image)?)$/.test(property)) {
        report(node, 'deg must describe an actual angle');
      }
      if (property.startsWith('margin') && number < 0)
        report(node, 'negative margins are forbidden');
      if (
        !unit &&
        number !== 0 &&
        /^(?:(?:min-|max-)?(?:width|height|inline-size|block-size)|font-size|(?:row-|column-)?gap|padding(?:-.+)?|margin(?:-.+)?|(?:border(?:-.+)?|outline)-width|outline-offset|letter-spacing|text-indent)$/.test(
          property,
        )
      ) {
        report(node, 'nonzero lengths require rem or em');
      }
    });
  }

  root.walkDecls((decl) => check(decl.value, decl, decl.prop));
  root.walkAtRules((atRule) => {
    if (['media', 'container', 'supports'].includes(atRule.name))
      check(atRule.params, atRule, '@' + atRule.name);
  });
};
rule.ruleName = ruleName;
rule.messages = messages;
export default stylelint.createPlugin(ruleName, rule);
