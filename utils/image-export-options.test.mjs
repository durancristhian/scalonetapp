import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_IMAGE_EXPORT_OPTIONS, imageExportSearchParams, parseImageExportOptions, readImageExportOptions, storeImageExportOptions } from './image-export-options.ts';
import { IMAGE_EXPORT_BACKGROUNDS } from './image-export-backgrounds.ts';
import { getImageExportBackgroundUrls } from './image-export-background.ts';

test('all 54 surface/weather/image/alignment combinations survive request serialization', () => {
  for (const {id: background} of IMAGE_EXPORT_BACKGROUNDS) for (const weather of ['none','rain','snow']) for (const avatarShape of ['square','circle','none']) for (const alignment of ['left','center']) {
    const options = {background, weather, avatarShape, alignment};
    assert.deepEqual(parseImageExportOptions(imageExportSearchParams(options)), options);
  }
});

test('unknown, duplicated and invalid options are rejected; missing ones use defaults', () => {
  for (const query of ['background=unknown','weather=hail','avatarShape=triangle','alignment=right','weather=snow&weather=rain','columns=1']) assert.equal(parseImageExportOptions(new URLSearchParams(query)), null);
  assert.deepEqual(parseImageExportOptions(new URLSearchParams()), DEFAULT_IMAGE_EXPORT_OPTIONS);
});

test('successive exports replace global preferences and unavailable storage keeps defaults usable', () => {
  const previous = globalThis.localStorage;
  const memory = new Map();
  globalThis.localStorage = {getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value)};
  try {
    for (const background of ['potrero','natural','pasto']) {
      const options = {...DEFAULT_IMAGE_EXPORT_OPTIONS, background, alignment:'center'};
      storeImageExportOptions(options);
      assert.deepEqual(readImageExportOptions(), options);
    }
    assert.equal(memory.size, 1);
    globalThis.localStorage = {getItem() {throw new Error('Unavailable');}, setItem() {throw new Error('Unavailable');}};
    assert.deepEqual(readImageExportOptions(), DEFAULT_IMAGE_EXPORT_OPTIONS);
    assert.doesNotThrow(() => storeImageExportOptions(DEFAULT_IMAGE_EXPORT_OPTIONS));
  } finally {globalThis.localStorage = previous;}
});

test('snow export waits for both settled field snow and the snowfall-only stand asset', () => {
  const urls = getImageExportBackgroundUrls({...DEFAULT_IMAGE_EXPORT_OPTIONS, weather:'snow'});
  assert.ok(urls.includes('/images/export-backgrounds/snow.svg'));
  assert.ok(urls.includes('/images/export-backgrounds/snowfall.svg'));
});
