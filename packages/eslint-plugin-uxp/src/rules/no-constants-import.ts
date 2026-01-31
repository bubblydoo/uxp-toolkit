import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from "photoshop/dom/Constants"',
      recommended: true,
    },
    messages: {
      noConstantsImport: 'Importing from "photoshop/dom/Constants" is not allowed. Use direct imports from specific modules instead.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string' && source === 'photoshop/dom/Constants') {
          context.report({
            node: node.source,
            messageId: 'noConstantsImport',
          });
        }
      },
      CallExpression(node) {
        // Check for require() calls
        if (
          node.callee.type === 'Identifier'
          && node.callee.name === 'require'
          && node.arguments.length > 0
          && node.arguments[0].type === 'Literal'
        ) {
          const source = node.arguments[0].value;
          if (source === 'photoshop/dom/Constants') {
            context.report({
              node: node.arguments[0],
              messageId: 'noConstantsImport',
            });
          }
        }
      },
    };
  },
};

export default rule;
