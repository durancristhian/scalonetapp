import test from 'node:test';
import assert from 'node:assert/strict';
import {getSavedTeamsError} from './team-validation.ts';
import {canAssignPlayersToTeam,getPlayerAdditionError,getRemainingPlayerSlots,MAX_PLAYERS_PER_MATCH,MAX_PLAYERS_PER_TEAM} from './player-limits.ts';

const teams=[{id:'a',name:'Uno',players:[1]},{id:'b',name:'Dos',players:[2]}];
test('resolved rosters accept one player each and the full configured match size',()=>{
  assert.equal(getSavedTeamsError(teams,[1,2]),null);
  const ids=Array.from({length:MAX_PLAYERS_PER_MATCH},(_,i)=>i+1);
  assert.equal(getSavedTeamsError([{...teams[0],players:ids.slice(0,MAX_PLAYERS_PER_TEAM)},{...teams[1],players:ids.slice(MAX_PLAYERS_PER_TEAM)}],ids),null);
});
test('team capacity rejects 21 players even below the 40-player match limit',()=>{
  const ids=Array.from({length:22},(_,i)=>i+1);
  assert.match(getSavedTeamsError([{...teams[0],players:ids.slice(0,21)},{...teams[1],players:ids.slice(21)}],ids),/20 jugadores/);
  assert.match(getSavedTeamsError(teams,Array.from({length:41},(_,i)=>i+1)),/40 jugadores/);
});
test('single and bulk additions respect remaining slots and reject an oversized batch',()=>{
  for(const count of [0,1,38,39]) {
    const remaining=40-count;
    assert.equal(getRemainingPlayerSlots(count),remaining);
    assert.equal(getPlayerAdditionError(count,remaining),null);
    assert.ok(getPlayerAdditionError(count,remaining+1));
  }
  assert.ok(getPlayerAdditionError(40,1));
  assert.ok(getPlayerAdditionError(0,0));
  assert.ok(getPlayerAdditionError(0,41));
  assert.equal(getRemainingPlayerSlots(100),0);
});
test('assigning a selection to a full team is atomic and counts only new players',()=>{
  const ids=Array.from({length:20},(_,i)=>i+1);
  assert.equal(canAssignPlayersToTeam(ids,[1,20]),true);
  assert.equal(canAssignPlayersToTeam(ids,[21]),false);
  assert.equal(canAssignPlayersToTeam(ids.slice(0,19),[20]),true);
  assert.equal(canAssignPlayersToTeam(ids.slice(0,19),[20,21]),false);
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
