// Focused PostgreSQL integration checks. No browser, image rendering or Clerk calls.
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

for(const key of ['POSTGRES_PRISMA_URL','POSTGRES_URL_NON_POOLING']) {
  if(!['localhost','127.0.0.1','[::1]'].includes(new URL(process.env[key] ?? '').hostname)) throw new Error('Local database required.');
}
const userId=process.argv.find(arg=>arg.startsWith('--user-id='))?.slice(10);
if(!userId) throw new Error('Pass the explicit local fixture account with --user-id=<id>.');
const {default:db}=await import('../utils/prisma.ts');
const {addPlayerQuery,addMultiplePlayersQuery,PlayerAdditionError}=await import('../server/queries/player.ts');
const createdIds=[];
const player=name=>({name,level:5,position:'mid'});
const fixture=async count=>{
  const match=await db.match.create({data:{name:`[QA temporal] ${randomUUID().slice(0,8)}`,userId}});
  createdIds.push(match.id);
  if(count) await db.player.createMany({data:Array.from({length:count},(_,i)=>({...player(`Base ${i}`),matchId:match.id}))});
  return match.id;
};

await test('player additions preserve capacity and identity under concurrent writes',async t=>{
  try {
    await t.test('two concurrent individual additions compete for one remaining slot',async()=>{
      const id=await fixture(39);
      const results=await Promise.allSettled([addPlayerQuery(id,player('Alta A'),userId),addPlayerQuery(id,player('Alta B'),userId)]);
      assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
      assert.equal(await db.player.count({where:{matchId:id}}),40);
      assert.ok(results.find(result=>result.status==='rejected').reason instanceof PlayerAdditionError);
    });
    await t.test('two concurrent batches cannot overfill or partially insert',async()=>{
      const id=await fixture(38);
      const results=await Promise.allSettled([
        addMultiplePlayersQuery(id,[player('Lote A1'),player('Lote A2')],userId),
        addMultiplePlayersQuery(id,[player('Lote B1'),player('Lote B2')],userId),
      ]);
      assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
      assert.equal(await db.player.count({where:{matchId:id}}),40);
      for(const prefix of ['Lote A','Lote B']) {
        const count=await db.player.count({where:{matchId:id,name:{startsWith:prefix}}});
        assert.ok(count===0 || count===2);
      }
    });
    await t.test('mixed individual and bulk additions share the same match lock',async()=>{
      const id=await fixture(38);
      const results=await Promise.allSettled([
        addPlayerQuery(id,player('Individual'),userId),
        addMultiplePlayersQuery(id,[player('Lote 1'),player('Lote 2')],userId),
      ]);
      assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
      const count=await db.player.count({where:{matchId:id}});
      assert.ok(count===39 || count===40);
      assert.ok([0,2].includes(await db.player.count({where:{matchId:id,name:{startsWith:'Lote'}}})));
    });
    await t.test('concurrent identical names only insert once',async()=>{
      const id=await fixture(0);
      const results=await Promise.allSettled([addPlayerQuery(id,player('Mismo nombre'),userId),addPlayerQuery(id,player('Mismo nombre'),userId)]);
      assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
      assert.equal(await db.player.count({where:{matchId:id}}),1);
    });
    await t.test('duplicate names inside a batch reject the complete batch',async()=>{
      const id=await fixture(0);
      await assert.rejects(addMultiplePlayersQuery(id,[player('Repetido'),player('Repetido')],userId),PlayerAdditionError);
      assert.equal(await db.player.count({where:{matchId:id}}),0);
    });
    await t.test('ownership is checked in the locked write, not only in the action',async()=>{
      const id=await fixture(0);
      await assert.rejects(addPlayerQuery(id,player('Ajeno'),`${userId}-other-account`));
      await assert.rejects(addMultiplePlayersQuery(id,[player('Ajeno')],`${userId}-other-account`));
      assert.equal(await db.player.count({where:{matchId:id}}),0);
    });
    await t.test('an oversized batch leaves the match unchanged',async()=>{
      const id=await fixture(0);
      await assert.rejects(addMultiplePlayersQuery(id,Array.from({length:41},(_,i)=>player(`Exceso ${i}`)),userId),PlayerAdditionError);
      assert.equal(await db.player.count({where:{matchId:id}}),0);
    });
  } finally {
    try {await db.match.deleteMany({where:{id:{in:createdIds},userId}});}
    finally {await db.$disconnect();}
  }
});
