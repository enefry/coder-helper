const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const source = fs.readFileSync('src/web/formatCurl.ts', 'utf8');
const mod = new Module(process.cwd() + '/formatCurl-test.cjs', module);
mod.filename = process.cwd() + '/formatCurl-test.cjs';
mod.paths = module.paths;
mod._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, mod.filename);
const { formatCurl } = mod.exports;
const input = "curl 'https://example.test/?x=1&b=2;echo PWN' -H 'Authorization: Bearer SECRET' -H 'Cookie: a=1; b=2' --data 'x=`printf PWN`&y=$HOME' --data ''";
const expected = ['https://example.test/?x=1&b=2;echo PWN','-H','Authorization: Bearer SECRET','-H','Cookie: a=1; b=2','--data','x=`printf PWN`&y=$HOME','--data',''];
for (const options of [[false,false],[true,false],[true,true]]) {
 const out = formatCurl(input,...options);
 const argv = execFileSync('bash',['-c', `curl() { printf '%s\\0' "$@"; }; ${out}`]);
 assert.deepEqual(argv.toString().split('\0').slice(0,-1),expected);
}
assert.throws(() => formatCurl('curl https://example.test; echo pwn'));
assert.throws(() => formatCurl('echo unsafe'));
assert.match(formatCurl('curl https://example.com\\?q=1'), /example/);
assert.throws(() => formatCurl('curl *.txt'));
assert.throws(() => formatCurl("curl -H 'Authorization: SECRET' https://trusted.example\ncurl https://attacker.example"));
assert.throws(() => formatCurl('curl -H "${SECRET-TOKEN"'), /Unable to parse curl command/);
const once = formatCurl(input, true, true);
assert.equal(formatCurl(once, true, true), once);
console.log('curl security and argument preservation tests passed');
