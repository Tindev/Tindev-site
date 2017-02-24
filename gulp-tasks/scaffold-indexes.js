'use strict';

const Analyzer = require('polymer-analyzer').Analyzer;
const FSUrlLoader = require('polymer-analyzer/lib/url-loader/fs-url-loader').FSUrlLoader;
const PackageUrlResolver = require('polymer-analyzer/lib/url-loader/package-url-resolver').PackageUrlResolver;
const HtmlCustomElementReferenceScanner = require('polymer-analyzer/lib/html/html-element-reference-scanner').HtmlCustomElementReferenceScanner;
const dom5 = require('dom5');
const parse5 = require('parse5');
const fs = require('fs-extra');
const path = require('path');
const gulp = require('gulp');

const analyzer = new Analyzer({
  urlLoader: new FSUrlLoader('./'),
  urlResolver: new PackageUrlResolver(),
  scanners: new Map([['html', [new HtmlCustomElementReferenceScanner()]]])
});

const buildFolder = path.resolve(process.cwd(), 'build');
const temporaryFolder = path.resolve(process.cwd(), 'index-build');
const temporaryBuildFolderLocation = path.resolve(buildFolder, 'index-build/**/*');

const scaffold = () =>
  analyzer.analyze('index.html')
  .then((document) => {
    const ast = document.parsedDocument.ast;
    fs.ensureDirSync(temporaryFolder);

    for (const element of document.getByKind('element-reference')) {
      const astNode = element.astNode;
      if (astNode.parentNode.tagName === 'iron-lazy-pages') {
        const route = dom5.getAttribute(astNode, 'data-route');
        const childLocation = dom5.getAttribute(astNode, 'data-path').substring(1);

        const fileContent = fs.readFileSync(childLocation, 'UTF-8');
        const parsedDocument = parse5.parse(fileContent);
        const template = dom5.query(parsedDocument, dom5.predicates.hasTagName('template'));
        const childContent = parse5.treeAdapters.default.getTemplateContent(template);

        const replacedSection = dom5.constructors.element('div');
        dom5.setAttribute(replacedSection, 'data-route', route);
        replacedSection.childNodes = childContent.childNodes;
        dom5.replace(astNode, replacedSection);

        const indexLocation = `${route ? `${route}/` : ''}index.html`;
        fs.ensureDirSync(path.resolve(temporaryFolder, route));
        fs.writeFileSync(path.resolve(temporaryFolder, indexLocation), parse5.serialize(ast));

        dom5.replace(replacedSection, astNode);
      }
    }
  });

const mergeIntoBuild = () =>
  gulp.src(temporaryBuildFolderLocation).
      pipe(gulp.dest(buildFolder));

module.exports = {
  scaffold: scaffold,
  mergeIntoBuild: mergeIntoBuild
};
