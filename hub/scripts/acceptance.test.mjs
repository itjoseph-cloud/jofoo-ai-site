import test from 'node:test';
import assert from 'node:assert/strict';
import {target} from './check-utils.mjs';
test('Link validation honors project base and external origins',()=>{assert.match(target('/guides/ar/example/'),/dist[\\/]ar[\\/]example[\\/]index.html$/);assert.equal(target('https://example.com/'),null);assert.equal(target('/outside/'),null);});

test('Domain-root legal pages are outside the hub build',()=>{for(const page of ['privacy.html','terms.html'])assert.equal(target(`https://jofooai.jofoo.tech/${page}`),null);assert.match(target('https://jofooai.jofoo.tech/guides/example/'),/dist[\\/]example[\\/]index.html$/);assert.equal(target('https://jofooai.jofoo.tech/outside/'),null);});

test('All same-origin paths outside the base are listed as external',()=>{for(const url of ['/', '/index.html', '/privacy.html', '/terms.html', '/media/example.png', '/guides-other/', '/guides', '../outside/'])assert.equal(target(url),null);});
