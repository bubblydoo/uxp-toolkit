import type { Rule } from 'eslint';

const MESSAGE_ID = 'noTailwindGapUtility';
const TAILWIND_GAP_UTILITY_REGEX = /\bgap(?:-[xy])?-(?:\[[^\]]+\]|[\w./%-]+)\b/;
const CLASS_HELPER_NAMES = new Set(['clsx', 'classnames', 'cn', 'twMerge', 'cva']);

function findGapUtility(value: string): string | null {
  return value.match(TAILWIND_GAP_UTILITY_REGEX)?.[0] ?? null;
}

function isClassPropertyNode(node: unknown): boolean {
  const property = node as {
    type?: string;
    key?: { type?: string; name?: string; value?: unknown };
  };
  if (property.type !== 'Property') {
    return false;
  }
  if (property.key?.type === 'Identifier') {
    return property.key.name === 'className' || property.key.name === 'class';
  }
  if (property.key?.type === 'Literal') {
    return property.key.value === 'className' || property.key.value === 'class';
  }
  return false;
}

function isClassStringContext(node: Rule.Node): boolean {
  const parent = node.parent as {
    type?: string;
    name?: { type?: string; name?: string };
    callee?: { type?: string; name?: string };
    parent?: unknown;
  } | undefined;

  if (!parent) {
    return false;
  }

  if (
    parent.type === 'JSXAttribute'
    && parent.name?.type === 'JSXIdentifier'
    && (parent.name.name === 'className' || parent.name.name === 'class')
  ) {
    return true;
  }

  if (isClassPropertyNode(parent)) {
    return true;
  }

  if (
    parent.type === 'CallExpression'
    && parent.callee?.type === 'Identifier'
    && CLASS_HELPER_NAMES.has(parent.callee.name ?? '')
  ) {
    return true;
  }

  if (
    parent.type === 'TemplateLiteral'
    && parent.parent
    && isClassStringContext(parent as unknown as Rule.Node)
  ) {
    return true;
  }

  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind gap utilities in UXP code',
      recommended: true,
    },
    messages: {
      [MESSAGE_ID]: 'Tailwind utility `{{utility}}` is not supported in UXP because it maps to CSS gap.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      Literal(node) {
        if (!isClassStringContext(node)) {
          return;
        }
        if (typeof node.value !== 'string') {
          return;
        }
        const utility = findGapUtility(node.value);
        if (utility) {
          context.report({
            node,
            messageId: MESSAGE_ID,
            data: { utility },
          });
        }
      },
      TemplateElement(node) {
        if (!isClassStringContext(node)) {
          return;
        }
        const utility = findGapUtility(node.value.raw);
        if (utility) {
          context.report({
            node,
            messageId: MESSAGE_ID,
            data: { utility },
          });
        }
      },
    };
  },
};

export default rule;
