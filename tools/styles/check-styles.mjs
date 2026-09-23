import fs from 'node:fs/promises';
import path from 'node:path';
import stylelint from 'stylelint';
import ts from 'typescript';
import { parseTemplate } from '@angular/compiler';

const findings = [];
let sheets = 0;
let templates = 0;
const lint = await stylelint.lint({
  files: ['src/**/*.scss', 'src/**/*.css'],
  allowEmptyInput: false,
  formatter: 'string',
});
process.stdout.write(lint.report);
if (lint.errored) process.exitCode = 1;
sheets += lint.results.length;

async function checkCss(css, filename) {
  const result = await stylelint.lint({ code: css, codeFilename: filename });
  if (result.errored) {
    findings.push(
      ...result.results.flatMap((item) =>
        item.warnings.map((warning) => `${filename}: ${warning.text}`),
      ),
    );
  }
}

async function checkTemplate(template, filename) {
  templates++;
  const parsed = parseTemplate(template, filename);
  for (const error of parsed.errors ?? []) findings.push(`${filename}: ${error}`);
  const visit = async (nodes) => {
    for (const node of nodes) {
      for (const attribute of node.attributes ?? []) {
        if (attribute.name === 'style')
          await checkCss(`.inline { ${attribute.value} }`, filename + '.scss');
      }
      for (const input of node.inputs ?? []) {
        if (input.type === 3 || input.name === 'style' || input.name === 'ngStyle') {
          findings.push(
            `${filename}: dynamic style bindings are unsupported by the CSS contract; use classes and tokens`,
          );
        }
      }
      if (node.name === 'style')
        await checkCss(
          (node.children ?? []).map((child) => child.value ?? '').join(''),
          filename + '.scss',
        );
      await visit(node.children ?? []);
      await visit(node.branches ?? []);
      if (node.empty) await visit(node.empty.children ?? []);
    }
  };
  await visit(parsed.nodes);
}

async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (['assets', 'vendor', 'node_modules', 'dist'].includes(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(filename);
      continue;
    }
    if (filename.endsWith('.html'))
      await checkTemplate(await fs.readFile(filename, 'utf8'), filename);
    if (!filename.endsWith('.ts') || filename.endsWith('.spec.ts')) continue;
    const source = ts.createSourceFile(
      filename,
      await fs.readFile(filename, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const pending = [];
    function visit(node) {
      if (
        ts.isDecorator(node) &&
        ts.isCallExpression(node.expression) &&
        node.expression.expression.getText(source) === 'Component'
      ) {
        const metadata = node.expression.arguments[0];
        if (metadata && ts.isObjectLiteralExpression(metadata)) {
          for (const [key, extension] of [
            ['templateUrl', '.html'],
            ['styleUrl', '.scss'],
          ]) {
            const field = metadata.properties.find(
              (property) =>
                ts.isPropertyAssignment(property) && property.name.getText(source) === key,
            );
            const expected = `./${path.basename(filename, '.ts')}${extension}`;
            if (
              !field ||
              !ts.isStringLiteralLike(field.initializer) ||
              field.initializer.text !== expected
            ) {
              findings.push(
                `${filename}: components require ${key}: '${expected}' in their own folder`,
              );
            } else {
              pending.push(
                fs
                  .access(path.join(path.dirname(filename), expected))
                  .catch(() => findings.push(`${filename}: missing ${expected}`)),
              );
            }
          }
          if (
            metadata.properties.some((property) =>
              ['template', 'styles', 'styleUrls'].includes(property.name?.getText(source)),
            )
          ) {
            findings.push(
              `${filename}: use separate HTML and SCSS files, not inline templates/styles`,
            );
          }
        }
      }
      if (ts.isPropertyAssignment(node)) {
        const name = node.name.getText(source).replace(/^['"]|['"]$/g, '');
        if (name.startsWith('[style'))
          findings.push(`${filename}: dynamic host styles are unsupported; use classes and tokens`);
        if (name === 'template' && ts.isStringLiteralLike(node.initializer))
          pending.push(checkTemplate(node.initializer.text, filename));
        if (name === 'styles') {
          const values = ts.isArrayLiteralExpression(node.initializer)
            ? node.initializer.elements
            : [node.initializer];
          for (const value of values) {
            if (ts.isStringLiteralLike(value))
              pending.push(checkCss(value.text, filename + '.scss'));
            else findings.push(`${filename}: component styles must be statically inspectable`);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    await Promise.all(pending);
  }
}
await walk('src');
if (findings.length) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
}
if (!process.exitCode)
  console.log(
    `CSS contract passed: ${sheets} stylesheets, ${templates} Angular templates; CSS/SCSS and inline styles parsed.`,
  );
