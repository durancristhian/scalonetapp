import test from 'node:test';
import assert from 'node:assert/strict';
import {getSavedTeamsError} from './team-validation.ts';

const teams=[{id:'a',name:'Uno',players:[1]},{id:'b',name:'Dos',players:[2]}];
test('resolved rosters accept one player each and the full configured match size',()=>{
  assert.equal(getSavedTeamsError(teams,[1,2]),null);
  const ids=Array.from({length:100},(_,i)=>i+1);
  assert.equal(getSavedTeamsError([{...teams[0],players:ids.slice(0,50)},{...teams[1],players:ids.slice(50)}],ids),null);
});
test('the shared save/export validator rejects legacy counts and malformed team data',()=>{
  for (const value of [null,[],[teams[0]],[...teams,{id:'c',name:'Tres',players:[3]}],[null,null],[teams[0],{...teams[1],id:'a'}]]) assert.ok(getSavedTeamsError(value,[1,2,3]));
});
test('empty, unassigned, deleted and repeated players cannot reach a saved export',()=>{
  assert.ok(getSavedTeamsError([{...teams[0],players:[]},teams[1]],[2]));
  assert.ok(getSavedTeamsError(teams,[1,2,3]));
  assert.ok(getSavedTeamsError(teams,[2]));
  assert.ok(getSavedTeamsError([teams[0],{...teams[1],players:[1,2]}],[1,2]));
  assert.ok(getSavedTeamsError([{...teams[0],players:[1,1]},teams[1]],[1,2]));
});
test('invalid team names are rejected before persistence and rendering',()=>{
  for (const name of ['', '   ', 'x'.repeat(41), null]) assert.ok(getSavedTeamsError([{...teams[0],name},teams[1]],[1,2]));
  assert.equal(getSavedTeamsError([{...teams[0],name:'x'.repeat(40)},teams[1]],[1,2]),null);
});
