import test from 'node:test';
import assert from 'node:assert/strict';
import {target} from './check-utils.mjs';
test('Link validation honors project base and external origins',()=>{assert.match(target('/jofooai/ar/guides/example/'),/dist[\\/]ar[\\/]guides[\\/]example[\\/]index.html$/);assert.equal(target('https://example.com/'),null);assert.throws(()=>target('/outside/'));});
