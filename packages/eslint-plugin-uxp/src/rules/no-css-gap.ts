import type { Rule } from 'eslint';

const MESSAGE_ID = 'noCssGap';
const CSS_GAP_REGEX = /(?:^|[;\s{])gap\s*:/m;
const STYLE_CONTEXT_NAME_REGEX = /(?:styles?|css)$/i;
const CSS_HELPER_NAMES = new Set(['css', 'createGlobalStyle', 'sx']);

interface MaybeNodeWithName {
  name?: string;
}

function isGapPropertyKey(property: Rule.Node): boolean {
  if (property.type !== 'Property') {
    return false;
  }

  const { key } = property;
  if (key.type === 'Identifier') {
    return key.name === 'gap';
  }
  if (key.type === 'Literal') {
    return key.value === 'gap';
  }
  return false;
}

function isStyleContextName(value: string): boolean {
  return STYLE_CONTEXT_NAME_REGEX.test(value);
}

function getKeyName(node: Rule.Node | undefined): string | null {
  if (!node) {
    return null;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
}

function isStyleLikeTarget(node: Rule.Node): boolean {
  if (node.type === 'Identifier') {
    return isStyleContextName(node.name);
  }
  if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
    return isStyleContextName(node.property.name);
  }
  return false;
}

function isInStyleLikeContext(node: Rule.Node): boolean {
  let current: Rule.Node | undefined = node;
  while (current?.parent) {
    const parent = current.parent as {
      type?: string;
      id?: Rule.Node;
      init?: Rule.Node;
      left?: Rule.Node;
      right?: Rule.Node;
      key?: Rule.Node;
      value?: Rule.Node;
      callee?: Rule.Node;
      arguments?: Rule.Node[];
      name?: MaybeNodeWithName;
    };

    if (parent.type === 'JSXAttribute' && parent.name?.name === 'style') {
      return true;
    }

    if (parent.type === 'VariableDeclarator' && parent.init === current && parent.id?.type === 'Identifier') {
      if (isStyleContextName(parent.id.name)) {
        return true;
      }
    }

    if (parent.type === 'AssignmentExpression' && parent.right === current && parent.left && isStyleLikeTarget(parent.left)) {
      return true;
    }

    if (parent.type === 'Property' && parent.value === current) {
      const keyName = getKeyName(parent.key);
      if (keyName && isStyleContextName(keyName)) {
        return true;
      }
    }

    if (
      parent.type === 'CallExpression'
      && parent.arguments?.includes(current)
      && parent.callee?.type === 'Identifier'
      && CSS_HELPER_NAMES.has(parent.callee.name)
    ) {
      return true;
    }

    current = parent as Rule.Node;
  }

  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow CSS gap property usage in UXP code',
      recommended: true,
    },
    messages: {
      [MESSAGE_ID]: 'CSS `gap` is not supported in UXP. Use a compatible spacing approach.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      Property(node) {
        if (isGapPropertyKey(node) && isInStyleLikeContext(node)) {
          context.report({
            node: node.key,
            messageId: MESSAGE_ID,
          });
        }
      },
      TemplateElement(node) {
        if (CSS_GAP_REGEX.test(node.value.raw)) {
          context.report({
            node,
            messageId: MESSAGE_ID,
          });
        }
      },
    };
  },
};

export default rule;
