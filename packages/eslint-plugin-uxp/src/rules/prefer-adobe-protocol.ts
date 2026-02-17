import type { Rule } from 'eslint';

const ADOBE_PROTOCOL = 'adobe:';
const PHOTOSHOP_NATIVE_MODULES = [
  'photoshop',
  'uxp',
  'fs',
  'os',
  'path',
  'process',
] as const;
const ADOBE_NATIVE_MODULES = new Set<string>(PHOTOSHOP_NATIVE_MODULES);
const MESSAGE_ID = 'preferAdobeProtocol';

function isTargetLiteralNode(node: Rule.Node): boolean {
  const parent = node.parent as (Rule.Node & {
    source?: Rule.Node;
    parameter?: Rule.Node;
    argument?: Rule.Node;
    callee?: Rule.Node;
    arguments?: Rule.Node[];
  }) | undefined;
  if (!parent) {
    return false;
  }
  const parentType = (parent as { type?: string }).type;

  // import x from 'module', export ... from 'module', import('module')
  if (
    (parentType === 'ImportDeclaration' || parentType === 'ExportNamedDeclaration' || parentType === 'ImportExpression')
    && parent.source === node
  ) {
    return true;
  }

  // import('module') in TS import types
  if (parentType === 'TSImportType' && (parent.parameter === node || parent.argument === node)) {
    return true;
  }

  // static require('module')
  if (
    parentType === 'CallExpression'
    && parent.callee?.type === 'Identifier'
    && parent.callee.name === 'require'
    && parent.arguments?.length === 1
    && parent.arguments[0] === node
  ) {
    return true;
  }

  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer using the "adobe:" protocol for UXP native modules',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      [MESSAGE_ID]: 'Prefer `adobe:{{moduleName}}` over `{{moduleName}}`.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      Literal(node) {
        if (!isTargetLiteralNode(node)) {
          return;
        }

        const value = node.value;
        if (typeof value !== 'string' || value.startsWith(ADOBE_PROTOCOL) || !ADOBE_NATIVE_MODULES.has(value)) {
          return;
        }

        const insertPosition = context.sourceCode.getRange(node)[0] + 1; // after opening quote
        context.report({
          node,
          messageId: MESSAGE_ID,
          data: { moduleName: value },
          fix(fixer) {
            return fixer.insertTextAfterRange([insertPosition, insertPosition], ADOBE_PROTOCOL);
          },
        });
      },
    };
  },
};

export default rule;
