#!/usr/bin/env node

var minimist = require('minimist');
var spawn = require('child_process').spawn;

var argv = minimist(process.argv.slice(2), {
    boolean: [ 'color' ],
    alias: { c: 'color', color: 'colors' }
});
var vargv = minimist(process.argv.slice(2));

var args = argv._.slice();
args.unshift('-t', 'coverify', '--bare', '--no-detect-globals');

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
coverify.stderr.pipe(process.stderr);

function onexit (name) {
    return function (code) {
        if (code === 0) return;
        console.error('non-zero exit code in `' + name + '` command');
        process.exit(1);
    };
}
