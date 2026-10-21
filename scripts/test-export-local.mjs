// Authenticated local browser QA. Requires seed-export-fixtures.mjs first.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';

const origin = 'http://localhost:3000';
const userId = process.argv.find(arg => arg.startsWith('--user-id='))?.slice(10);
if (!userId || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') || !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Explicit local test account required.');
for (const key of ['POSTGRES_PRISMA_URL','POSTGRES_URL_NON_POOLING']) if (!['localhost','127.0.0.1','[::1]'].includes(new URL(process.env[key]).hostname)) throw new Error('Local database required.');
const fixtures = JSON.parse(await readFile('.local/export-fixtures.json','utf8'));
const fixture = key => fixtures.find(f => f.key === key);
const output = '.local/export-qa';
await mkdir(output,{recursive:true});
const report = { exports:[], responsive:[], checks:[], failures:[] };
const browser = await puppeteer.launch({headless:true});
const db = new PrismaClient();
let page;
const originalTeams = new Map();
const originalNames = new Map();
const originalPlayers = new Map();
const check = (condition,message) => {assert.ok(condition,message); report.checks.push(message);};
const button = name => `::-p-aria(${name}[role="button"])`;
const select = async (suffix,label) => {
  await page.click(`[role="combobox"][id$="-${suffix}-control"]`);
  await page.waitForSelector('[role="option"]');
  await page.locator(`::-p-aria(${label}[role="option"])`).click();
};
const open = async key => {
  await page.goto(`${origin}/partidos/${fixture(key).matchId}`);
  await page.waitForSelector(button('Exportar'));
  await page.waitForFunction(() => window.Clerk?.loaded && window.Clerk?.user);
};
const editor = async () => {
  await page.click(button('Exportar'));
  await page.waitForSelector('[role="dialog"] [role="combobox"]');
};
const close = async () => {await page.click(button('Cerrar')); await page.waitForSelector('[role="dialog"]',{hidden:true});};
const setRoles = async f => page.evaluate(({id,roles}) => localStorage.setItem(`scaloneta:export-player-roles:v1:${id}`,JSON.stringify(roles)),{id:f.matchId,roles:f.roles});

async function download(f,options,label,retain=false) {
  const query = new URLSearchParams({...options,roles:JSON.stringify(f.roles)}).toString();
  const data = await page.evaluate(async url => {
    const response = await fetch(url);
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let i=0;i<bytes.length;i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
    return {status:response.status,type:response.headers.get('content-type'),base64:btoa(binary)};
  },`/download/${f.matchId}?${query}`);
  assert.equal(data.status,200,`${label}: response`);
  assert.equal(data.type,'image/png',`${label}: type`);
  const bytes = Buffer.from(data.base64,'base64');
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width,2560);
  assert.ok(metadata.height>0 && metadata.height<32768,`${label}: height`);
  report.exports.push({label,options,width:metadata.width,height:metadata.height,bytes:bytes.length});
  if (retain) await writeFile(`${output}/${label}.png`,bytes);
}

try {
  page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:resolve(output)});
  page.setDefaultTimeout(15000);
  const owned = await db.match.findMany({where:{id:{in:fixtures.map(f=>f.matchId)},userId},select:{id:true,teams:true,name:true}});
  assert.equal(owned.length,fixtures.length,'Every fixture must belong to the explicit test account.');
  for (const match of owned) {originalTeams.set(match.id,match.teams);originalNames.set(match.id,match.name);}
  await page.goto(origin);
  await page.waitForFunction(() => window.Clerk?.loaded);
  const clerk = createClerkClient({secretKey:process.env.CLERK_SECRET_KEY});
  const {token} = await clerk.signInTokens.createSignInToken({userId,expiresInSeconds:60});
  await page.evaluate(async ticket => {
    const signIn = await window.Clerk.client.signIn.create({strategy:'ticket',ticket});
    await window.Clerk.setActive({session:signIn.createdSessionId});
  },token);
  await page.setViewport({width:1440,height:900});

  // Real renderer + PNG endpoint across the complete option matrix.
  const long = fixture('long-names');
  await open('long-names');
  if (!process.argv.includes('--skip-matrix')) {
  for (const background of ['pasto','natural','potrero']) {
    for (const weather of ['none','rain','snow']) for (const avatarShape of ['square','circle','none']) for (const alignment of ['left','center']) {
      const options={background,weather,avatarShape,alignment};
      const label=`matrix-${background}-${weather}-${avatarShape}-${alignment}`;
      await download(long,options,label,avatarShape==='square' && alignment==='left');
    }
    console.log(`PNG matrix: ${background} complete`);
  }
  for (const key of ['one-each','maximum','unbalanced','roles']) for (const avatarShape of ['square','none']) {
    await download(fixture(key),{background:'pasto',weather:'none',avatarShape,alignment:'center'},`edge-${key}-${avatarShape}`,true);
  }

  }

  await open('maximum');
  check(await page.$$eval('button',els=>els.some(el=>el.textContent.trim()==='Agregar'&&el.disabled)),'The match player limit disables adding more players.');
  await editor();
  await page.click('[id$="-captain-maximum-0-control"]');
  await page.waitForSelector('[role="option"]');
  check(await page.$$eval('[role="option"]',els=>els.length)===51,'Maximum-roster role menu includes all 50 players and No indicado.');
  await page.keyboard.press('End');
  await page.waitForFunction(()=>document.activeElement?.textContent.includes('Jugador 050'));
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[id$="-captain-maximum-0-control"]')?.textContent.includes('Jugador 050'));
  await page.click('[id$="-goalkeeper-maximum-0-control"]');
  await page.waitForSelector('[role="option"]');
  await page.keyboard.press('End');
  await page.waitForFunction(()=>document.activeElement?.textContent.includes('Jugador 050'));
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[id$="-goalkeeper-maximum-0-control"]')?.textContent.includes('Jugador 050'));
  check(true,'The last player in a maximum-roster menu can hold both roles via keyboard.');
  for (const shape of ['Cuadradas','Circulares']) {
    await select('avatar',shape);
    const separate=await page.$eval('[data-player-role="captain"]',badge=>{
      const pair=Array.from(badge.parentElement.querySelectorAll('[data-player-role]'));
      const [a,b]=pair.map(el=>el.getBoundingClientRect());
      return pair.length===2&&a.left<b.left&&Math.abs(a.top-b.top)<1;
    });
    check(separate,`${shape}: shared captain and goalkeeper badges occupy opposite sides.`);
  }
  await close();

  console.log('Checking preferences and role persistence');
  // Preferences overwrite cleanly and roles remain local to each match.
  await open('roles');
  await setRoles(fixture('roles'));
  await editor();
  await select('background','Potrero');
  await select('weather','Nieve');
  await select('avatar','Circulares');
  await page.click('label:has([value="center"])');
  await select('captain-roles-0','Jugador 002');
  await select('goalkeeper-roles-0','No indicado');
  await close();
  await editor();
  const preferences = await page.evaluate(() => JSON.parse(localStorage.getItem('scaloneta:image-export:v1')));
  check(preferences.background==='potrero' && preferences.weather==='snow' && preferences.avatarShape==='circle' && preferences.alignment==='center','Preferences survive closing and reopening the editor.');
  check(await page.$eval('[id$="-captain-roles-0-control"]',el=>el.textContent.includes('Jugador 002')),'A manually selected captain survives reopening.');
  check(await page.$eval('[id$="-goalkeeper-roles-0-control"]',el=>el.textContent.includes('No indicado')),'Explicit No indicado survives reopening.');
  await select('goalkeeper-roles-0','Jugador 003');
  check(await page.$$eval('[data-player-role]',els=>els.length)===4,'Both roles in each team are restored.');
  await close();
  await open('one-each');
  await editor();
  check(await page.$eval('[role="combobox"][id$="-background-control"]',el=>el.textContent.includes('Potrero')),'Appearance preferences are shared across matches.');
  check(await page.$$eval('[data-player-role="captain"]',els=>els.length)===0,'Captain choices do not leak to another match.');
  await close();

  await open('long-names');
  await editor();
  const photoSources=[];
  for (const [label,palette] of [['Césped sintético','synthetic-forest'],['Césped natural','natural-olive'],['Potrero','potrero-harvest']]) {
    await select('background',label);
    await page.waitForFunction(palette=>Array.from(document.querySelectorAll('[data-player-id] img')).some(img=>img.src.includes(`palette=${palette}`)) && document.querySelector('[role="combobox"][id$="-avatar-control"] img')?.src.includes(`palette=${palette}`),{},palette);
    photoSources.push(await page.$$eval('[data-player-id] img',els=>els.filter(img=>img.src.startsWith('data:')).map(img=>img.src)));
    check(await page.$eval('[role="combobox"][id$="-avatar-control"] img',(img,palette)=>img.src.includes(`palette=${palette}`),palette),`${label}: image-selector sample follows the surface palette.`);
  }
  check(photoSources.every(sources=>sources.length===1&&sources[0]===photoSources[0][0]),'Uploaded player imagery stays identical across surface palettes.');
  await close();

  // Roster edits invalidate both roles in every affected team.
  await open('roles');
  await page.click(button('Sacar a Jugador 001 del equipo'));
  await page.locator('::-p-aria(Jugador 001[role="button"])').click();
  await page.click('[role="combobox"][aria-label="Asignar jugadores al equipo"]');
  await page.locator('::-p-aria(Equipo 2[role="option"])').click();
  await editor();
  check(await page.$$eval('[data-player-role]',els=>els.length)===0,'Moving a player clears captain and goalkeeper in both affected teams.');
  check(await page.$$eval('[data-player-role-control]',els=>els.every(el=>el.textContent.includes('No indicado'))),'Invalidated role selects show No indicado.');
  await close();

  await open('roles');
  await setRoles(fixture('roles'));
  await page.click(button('Sacar a Jugador 001 del equipo'));
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('scaloneta:export-player-roles:v1:'+document.location.pathname.split('/').at(-1)))?.['roles-0']?.assignments.captain===null);
  await page.locator('::-p-aria(Jugador 001[role="button"])').click();
  await page.click('[role="combobox"][aria-label="Asignar jugadores al equipo"]');
  await page.locator('::-p-aria(Equipo 1[role="option"])').click();
  await editor();
  check(await page.$eval('[id$="-captain-roles-0-control"]',el=>el.textContent.includes('No indicado')) && await page.$eval('[id$="-goalkeeper-roles-0-control"]',el=>el.textContent.includes('No indicado')),'Roles do not resurrect after a closed-editor roster round trip.');
  await close();

  console.log('Checking legacy teams');
  // Existing invalid data is repairable but cannot be exported.
  await open('legacy-three');
  check(await page.$eval(button('Exportar'),el=>el.disabled),'Three-team fixture disables Exportar.');
  await page.hover('[aria-label="Exportación no disponible"]');
  await page.waitForSelector('[role="tooltip"]');
  check(await page.$eval('[role="tooltip"]',el=>el.textContent.includes('Dejá solo dos')),'Disabled export explains the team limit on hover.');
  await page.keyboard.press('Escape');
  await page.focus('[aria-label="Exportación no disponible"]');
  await page.waitForSelector('[role="tooltip"]');
  check(await page.$eval('[role="tooltip"]',el=>el.textContent.includes('Dejá solo dos')),'Disabled export explains how to repair the match on keyboard focus.');
  const invalid = await page.evaluate(async id=>{const response=await fetch(`/download/${id}`);return {status:response.status,body:await response.json()};},fixture('legacy-three').matchId);
  check(invalid.status===422,'Direct PNG requests also reject three-team matches.');
  check(await page.$$eval('button',els=>!els.some(el=>el.textContent.trim()==='Agregar'&&!el.getAttribute('aria-haspopup'))),'No third-team creation action is offered.');
  await page.click(button('Eliminar equipo Equipo 3'));
  check(await page.$eval(button('Exportar'),el=>el.disabled),'Removing a team still requires assigning its orphaned players.');
  for (const name of ['Jugador 005','Jugador 006']) await page.locator(`::-p-aria(${name}[role="button"])`).click();
  await page.click('[role="combobox"][aria-label="Asignar jugadores al equipo"]');
  await page.locator('::-p-aria(Equipo 1[role="option"])').click();
  check(await page.$eval(button('Exportar'),el=>!el.disabled),'Repairing the roster enables exporting a legacy match.');

  for (const key of ['empty-team','unassigned']) {
    await open(key);
    check(await page.$eval(button('Exportar'),el=>el.disabled),`${key}: export is disabled until teams are complete.`);
    const status=await page.evaluate(async id=>(await fetch(`/download/${id}`)).status,fixture(key).matchId);
    check(status===422,`${key}: direct PNG requests reject incomplete rosters.`);
  }

  console.log('Checking save, image failure, retry and success states');
  await open('one-each');
  await page.locator('input[name="name"]').filter(el=>el.value==='Equipo 1').fill('Equipo 1 QA');
  await editor();
  await page.evaluate(() => {
    window.__qaFailureMode='save';
    window.__qaCounts={saves:0,images:0};
    window.__qaDownloads=[];
    window.__qaOriginalFetch=window.fetch;
    window.fetch=async (input,init) => {
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      const headers=new Headers(init?.headers ?? (input instanceof Request?input.headers:undefined));
      if (headers.has('next-action')) {
        window.__qaCounts.saves++;
        if (window.__qaFailureMode==='save') {
          await new Promise(resolve=>setTimeout(resolve,600));
          return new Response('QA save failure',{status:500});
        }
      }
      if (/^\/download\/\d+$/.test(url.pathname)) {
        window.__qaCounts.images++;
        window.__qaDownloads.push(url.search);
        if (window.__qaFailureMode==='image') return new Response('{"error":"QA image failure"}',{status:503,headers:{'content-type':'application/json'}});
      }
      return window.__qaOriginalFetch(input,init);
    };
  });
  const counts=()=>page.evaluate(()=>window.__qaCounts);
  await page.click(button('Descargar'));
  await page.waitForSelector('button[aria-busy="true"]');
  check(await page.$eval(button('Cerrar'),el=>el.disabled),'The editor cannot close during export.');
  await page.waitForFunction(()=>document.querySelector('[role="alert"]')?.textContent.includes('No se pudieron guardar'));
  check((await counts()).saves===1 && (await counts()).images===0,'A save failure prevents image generation and shows the save error.');
  await page.evaluate(()=>window.__qaFailureMode='image');
  await page.click(button('Descargar'));
  await page.waitForFunction(()=>document.querySelector('[role="alert"]')?.textContent.includes('Los equipos están guardados'));
  const saved = await db.match.findUnique({where:{id:fixture('one-each').matchId}});
  check(JSON.parse(saved.teams)[0].name==='Equipo 1 QA','Image failure keeps the successful team save.');
  check((await counts()).saves===2 && (await counts()).images===1,'Image failure is reported separately from save failure.');
  await page.evaluate(()=>window.__qaFailureMode='none');
  await page.click(button('Descargar'));
  await page.waitForFunction(()=>document.querySelector('[role="status"]')?.textContent.includes('¡Descarga iniciada!'));
  check((await counts()).saves===2 && (await counts()).images===2,'Retry after an image failure does not save unchanged teams again.');
  check(await page.$eval('button[aria-busy]',el=>el.getAttribute('aria-busy')==='false' && !el.disabled),'Download success restores the usable controls.');
  await page.click(button('Descargar'));
  await page.waitForFunction(()=>window.__qaCounts.images===3 && document.querySelector('[role="status"]')?.textContent.includes('¡Descarga iniciada!'));
  check((await counts()).saves===2,'A second successful export of the same match does not save it again.');
  check(await page.evaluate(()=>window.__qaDownloads.at(-1)===window.__qaDownloads.at(-2)),'Successive exports carry the same saved options and roles.');
  await close();
  await page.locator('input[name="name"]').filter(el=>el.value==='Equipo 1 QA').fill('Equipo 1 solo guardado');
  await page.click(button('Guardar'));
  await page.waitForFunction(()=>document.body.innerText.includes('¡Equipos guardados con éxito!'));
  check((await counts()).saves===3 && (await counts()).images===3,'Guardar remains independently usable without generating an image.');
  await page.evaluate(()=>{window.fetch=window.__qaOriginalFetch;});

  // Responsive page + modal at baseline sizes and both sides of layout changes.
  const longPlayer=await db.player.findFirst({where:{matchId:long.matchId}});
  originalPlayers.set(longPlayer.id,longPlayer.name);
  await db.player.update({where:{id:longPlayer.id},data:{name:'X'.repeat(40)}});
  await db.match.update({where:{id:long.matchId,userId},data:{name:'W'.repeat(40)}});
  await open('long-names');
  for (const [width,height] of [[320,568],[390,844],[639,800],[640,800],[767,1024],[768,1024],[1023,768],[1024,768],[1279,800],[1280,800],[1440,900]]) {
    await page.setViewport({width,height});
    const pageOverflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    await editor();
    if (width>=1024) {
      await page.waitForSelector('[data-team-export]');
      check(await page.$eval('[data-match-banner] h1',el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).textOverflow==='ellipsis'),'Long unbroken match names truncate in the export banner.');
    }
    const modal = await page.evaluate(()=>{
      const dialog=document.querySelector('[role="dialog"]');
      const rect=dialog.getBoundingClientRect();
      const options=dialog.querySelector('fieldset').parentElement;
      return {outside:rect.left<0||rect.right>innerWidth,overflow:dialog.scrollWidth>dialog.clientWidth,optionsOverflow:options.scrollWidth>options.clientWidth,preview:Boolean(document.querySelector('[data-team-export]'))};
    });
    report.responsive.push({width,height,pageOverflow,...modal});
    await page.screenshot({path:`${output}/responsive-${width}.png`});
    await close();
  }
  console.log('Responsive matrix complete');
  check(report.responsive.every(r=>!r.pageOverflow&&!r.outside&&!r.overflow&&!r.optionsOverflow),'Page, dialog and controls fit every tested viewport.');
  await page.setViewport({width:1440,height:900});
  await open('one-each');
  await editor();
  await page.screenshot({path:`${output}/final-preview.png`});
} catch (error) {
  report.failures.push(error.message);
  if (page) await page.screenshot({path:`${output}/failure.png`}).catch(()=>{});
  console.error(error.stack);
  process.exitCode=1;
} finally {
  const restorations=[
    ...Array.from(originalTeams,([id,teams])=>({name:`match ${id}`,run:()=>db.match.update({where:{id,userId},data:{teams,name:originalNames.get(id)}})})),
    ...Array.from(originalPlayers,([id,name])=>({name:`player ${id}`,run:()=>db.player.update({where:{id},data:{name}})})),
  ];
  try {
    const results=await Promise.allSettled(restorations.map(item=>Promise.resolve().then(item.run)));
    results.forEach((result,index)=>{
      if (result.status==='rejected') {report.failures.push(`Could not restore ${restorations[index].name}`);process.exitCode=1;}
    });
    await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
 } finally {
    await Promise.allSettled([browser.close(),db.$disconnect()]);
  }
}
