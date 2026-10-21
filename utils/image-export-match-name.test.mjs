import test from 'node:test';
import assert from 'node:assert/strict';
import { MATCH_SCHEMA, MATCH_UPDATE_SCHEMA } from '../schemas/match.ts';
import { getDuplicatedMatchName } from './match-name.ts';

test('match names require 1–40 characters after trimming',()=>{
  for(const name of ['', '   ', 'x'.repeat(41), null]) assert.equal(MATCH_SCHEMA.safeParse({name}).success,false);
  assert.equal(MATCH_SCHEMA.parse({name:'  Partido  '}).name,'Partido');
  assert.equal(MATCH_SCHEMA.parse({name:'x'.repeat(40)}).name.length,40);
});
test('partial match updates validate supplied names and reject ownership or ID changes',()=>{
  assert.deepEqual(MATCH_UPDATE_SCHEMA.parse({teams:'[]'}),{teams:'[]'});
  assert.deepEqual(MATCH_UPDATE_SCHEMA.parse({name:'  Partido  '}),{name:'Partido'});
  for(const data of [{name:''},{name:' '.repeat(5)},{name:'x'.repeat(41)},{name:null},{userId:'another-user'},{id:123}]) {
    assert.equal(MATCH_UPDATE_SCHEMA.safeParse(data).success,false);
  }
});
test('generated copy names reserve room for the prefix and timestamp',()=>{
  for(const original of ['Final','x'.repeat(40)]) {
    const name=getDuplicatedMatchName(original,'1792598400');
    assert.ok(name.startsWith('Copia de '));
    assert.ok(name.endsWith(' (1792598400)'));
    assert.equal(MATCH_SCHEMA.safeParse({name}).success,true);
  }
});
