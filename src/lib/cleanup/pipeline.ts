import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export type CleanupDiagnostics = {
  removedImports: number;
  sortedJsxProps: number;
  normalizedTailwindClasses: number;
};

export type CleanupResult = {
  code: string;
  diagnostics: CleanupDiagnostics;
};

const parserOptions = {
  sourceType: "module" as const,
  plugins: ["typescript", "jsx", "decorators-legacy"] as const,
};

export function runDeterministicCleanup(input: string): CleanupResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ast = parse(input, parserOptions as any);

  const diagnostics: CleanupDiagnostics = {
    removedImports: 0,
    sortedJsxProps: 0,
    normalizedTailwindClasses: 0,
  };

  traverse(ast, {
    Program(programPath) {
      programPath.scope.crawl();

      programPath.get("body").forEach((child) => {
        if (!child.isImportDeclaration()) {
          return;
        }

        child.get("specifiers").forEach((specPath) => {
          const localName = specPath.node.local.name;
          const binding = programPath.scope.getBinding(localName);
          if (!binding || binding.referencePaths.length === 0) {
            diagnostics.removedImports += 1;
            specPath.remove();
          }
        });

        if (child.node.specifiers.length === 0) {
          child.remove();
        }
      });
    },
    JSXOpeningElement(path) {
      const attrs = path.node.attributes;
      const jsxAttrs = attrs.filter((attr): attr is t.JSXAttribute =>
        t.isJSXAttribute(attr),
      );
      const sorted = [...jsxAttrs].sort((a, b) => {
        const aName = getAttributeName(a).toLowerCase();
        const bName = getAttributeName(b).toLowerCase();
        return aName.localeCompare(bName);
      });

      let changed = false;
      let sortedIndex = 0;
      const nextAttrs = attrs.map((attr) => {
        if (t.isJSXAttribute(attr)) {
          const nextAttr = sorted[sortedIndex++];
          if (nextAttr !== attr) {
            changed = true;
          }
          return nextAttr;
        }
        return attr;
      });

      if (changed) {
        diagnostics.sortedJsxProps += 1;
        path.node.attributes = nextAttrs;
      }
    },
    JSXAttribute(path) {
      const attrName = getAttributeName(path.node);
      if (attrName !== "className" && attrName !== "class") {
        return;
      }

      const valueNode = path.node.value;
      if (!valueNode) {
        return;
      }

      if (t.isStringLiteral(valueNode)) {
        const sorted = reorderTailwindClasses(valueNode.value);
        if (sorted && sorted !== valueNode.value) {
          diagnostics.normalizedTailwindClasses += 1;
          path.node.value = t.stringLiteral(sorted);
        }
        return;
      }

      if (
        t.isJSXExpressionContainer(valueNode) &&
        t.isStringLiteral(valueNode.expression)
      ) {
        const sorted = reorderTailwindClasses(valueNode.expression.value);
        if (sorted && sorted !== valueNode.expression.value) {
          diagnostics.normalizedTailwindClasses += 1;
          path.node.value = t.stringLiteral(sorted);
        }
        return;
      }

      if (
        t.isJSXExpressionContainer(valueNode) &&
        t.isTemplateLiteral(valueNode.expression) &&
        valueNode.expression.expressions.length === 0
      ) {
        const rawValue = valueNode.expression.quasis
          .map((q) => q.value.cooked ?? "")
          .join("");
        const sorted = reorderTailwindClasses(rawValue);
        if (sorted && sorted !== rawValue) {
          diagnostics.normalizedTailwindClasses += 1;
          path.node.value = t.stringLiteral(sorted);
        }
      }
    },
  });

  const generated = generate(ast, {
    retainLines: true,
    decoratorsBeforeExport: true,
  }).code;

  return {
    code: generated,
    diagnostics,
  };
}

function getAttributeName(attr: t.JSXAttribute): string {
  if (t.isJSXIdentifier(attr.name)) {
    return attr.name.name;
  }
  return "";
}

function reorderTailwindClasses(value: string): string | null {
  // Skip formatting for now - just return the value as-is
  // Tailwind plugin has compatibility issues in server context
  return value;
}
