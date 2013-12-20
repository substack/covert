#!/usr/bin/env node

var parents = require('parents');
var fs = require('fs');
var path = require('path');
var resolve = require('resolve');

var paths = parents(process.cwd());
var parts = process.env.PATH.split(':');
var prefix = [];
var postfix = [ __dirname + '/node_modules/.bin' ];

for (var i = 0; i < paths.length; i++) {
    var x = path.join(paths[i], 'node_modules/.bin');
    if (fs.existsSync(x)) prefix.push(x);
}
process.env.PATH = prefix.concat(parts).concat(postfix).join(':');

var minimist = require('minimist');
var spawn = require('child_process').spawn;

var argv = minimist(process.argv.slice(2), {
    boolean: [ 'color', 'h' ],
    alias: { c: 'color', color: 'colors', h: 'help' }
});
var vargv = minimist(process.argv.slice(2));

var args = argv._.slice();
if (args.length === 0 || argv.h || argv.help) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
}

var coverifyPath = require.resolve('coverify');
try { coverifyPath = resolve.sync('coverify', { basedir: process.cwd() }) }
catch (e) {}

args.unshift('-t', coverifyPath, '--bare', '--no-detect-globals');

var browserify = spawn('browserify', args);
browserify.stderr.pipe(process.stderr);
browserify.on('exit', onexit('browserify'));

var node = spawn(process.execPath, []);
node.stderr.pipe(process.stderr);
node.on('exit', onexit('node'));

var cargs = [];
if (vargv.color === undefined && process.stdout.isTTY) {
    cargs = [ '--color' ];
}

var coverify = spawn('coverify', cargs);
coverify.stderr.pipe(process.stderr);
coverify.on('exit', onexit('coverify'));

browserify.stdout.pipe(node.stdin);
node.stdout.pipe(coverify.stdin);
coverify.stdout.pipe(process.stdout);

function onexit (name) {
    return function (code) {
        if (code === 0) return;
        console.error('non-zero exit code in `' + name + '` command');
        process.exit(1);
    };
}
