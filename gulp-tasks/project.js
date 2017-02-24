/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const polymer = require('polymer-build');

const polymerJSON = path.join(process.cwd(), 'polymer.json');
const project = new polymer.PolymerProject(polymerJSON);

const buildPath = 'build';
const serviceWorkerPath = 'service-worker.js';
const swPrecacheConfig = require('../sw-precache-config.json');

// This is the heart of polymer-build, and exposes much of the
// work that Polymer CLI usually does for you
// There are tasks to split the source files and dependency files into
// streams, and tasks to rejoin them and output service workers
// You should not need to modify anything in this file
// If you find that you can't accomplish something because of the way
// this module is structured please file an issue
// https://github.com/PolymerElements/generator-polymer-init-custom-build/issues

// Returns a ReadableStream of all the source files
// Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json
function splitSource() {
  return project.sources().pipe(project.splitHtml());
}

// Returns a ReadableStream of all the dependency files
// Dependency files are those in bower_components/**
function splitDependencies() {
  return project.dependencies().pipe(project.splitHtml());
}

// Returns a WriteableStream to rejoin all split files
function rejoin() {
  return project.rejoinHtml();
}

// Returns a function which accepts refernces to functions that generate
// ReadableStreams. These ReadableStreams will then be merged, and used to
// generate the bundled and unbundled versions of the site.
// Takes an argument for the user to specify the kind of output they want
// either bundled or unbundled. If this argument is omitted it will output both
function merge(source, dependencies) {
  return function output() {
    const mergedFiles = mergeStream(source(), dependencies());

    return new Promise(resolve => {
      mergedFiles.pipe(gulp.dest(buildPath))
        .on('end', resolve);
    });
  };
}

// Returns a function which takes an argument for the user to specify the kind
// of bundle they're outputting (either bundled or unbundled) and generates a
// service worker for that bundle.
// If this argument is omitted it will create service workers for both bundled
// and unbundled output
function serviceWorker() {
  return polymer.addServiceWorker({
    project: project,
    buildRoot: buildPath,
    swPrecacheConfig: swPrecacheConfig,
    path: serviceWorkerPath,
    bundled: true
  });
}

module.exports = {
  splitSource: splitSource,
  splitDependencies: splitDependencies,
  rejoin: rejoin,
  merge: merge,
  serviceWorker: serviceWorker
};
