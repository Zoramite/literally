import { describe, test } from 'vitest';

import { RouteTrie } from './router';

describe('direct matching', () => {
  test.concurrent('match simple route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/foo', 'bar');

    const match = trie.match('/foo');

    expect(match?.value).toBe('bar');
  });

  test.concurrent('match root route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/', 'bar');

    const match = trie.match('/');

    expect(match?.value).toBe('bar');
  });
});

describe('param matching', () => {
  test.concurrent('match param route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo}', 'baz');

    const match = trie.match('/foobar');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar');
  });

  test.concurrent('match nested param route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo}/to/the/{bar}/fu', 'baz');

    const match = trie.match('/foobar/to/the/max/fu');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar');
    expect(match?.params!['bar']).toBe('max');
  });

  test.concurrent('match param (string-typed) route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:string}', 'baz');

    const match = trie.match('/foobar');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar');
  });

  test.concurrent('match param (number-typed) route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:number}', 'baz');

    const match = trie.match('/124');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe(124);
  });

  test.concurrent('match param (boolean-typed) route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:boolean}', 'baz');

    let match = trie.match('/true');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe(true);

    match = trie.match('/false');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe(false);

    match = trie.match('/1');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe(true);

    match = trie.match('/0');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe(false);
  });
});

describe('wildcard matching', () => {
  test.concurrent('match simple route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:*}', 'baz');

    const match = trie.match('/foobar');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar');
  });

  test.concurrent('match multi-level route', async ({ expect }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:*}', 'baz');

    const match = trie.match('/foobar/baz/be');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar/baz/be');
  });

  test.concurrent('match multi-level with param sibling route', async ({
    expect,
  }) => {
    const trie = new RouteTrie();

    trie.add('/{foo:*}', 'baz');
    trie.add('/{foobar}', 'tux');

    const match = trie.match('/foobar/baz/be');

    expect(match?.value).toBe('baz');
    expect(match?.params!['foo']).toBe('foobar/baz/be');
  });
});

describe('query parameter stripping', () => {
  test.concurrent('ignores query parameters during matching', async ({
    expect,
  }) => {
    const trie = new RouteTrie();

    trie.add('/foo', 'bar');
    trie.add('/baz/{id}', 'item');

    let match = trie.match('/foo?templateId=123&test=true');
    expect(match?.value).toBe('bar');

    match = trie.match('/baz/abc?name=hello');
    expect(match?.value).toBe('item');
    expect(match?.params!['id']).toBe('abc');
  });
});

describe('route setting and overwriting', () => {
  test.concurrent('allows overwriting nested routes using set', async ({
    expect,
  }) => {
    const trie = new RouteTrie();

    trie.set('/fleet/service', 'first-value');
    trie.set('/fleet/service', 'second-value');
    trie.set('/fleet/service/', 'third-value');

    const match = trie.match('/fleet/service');
    expect(match?.value).toBe('third-value');
  });
});

describe('sub-trie mounting', () => {
  test.concurrent('mounts a child trie under a prefix', async ({ expect }) => {
    const mainTrie = new RouteTrie();
    mainTrie.add('/', 'home');

    const campTrie = new RouteTrie();
    campTrie.add('/badges', 'badges-page');
    campTrie.add('/{campId}/stickers', 'stickers-page');

    mainTrie.mount('/camp', campTrie);

    expect(mainTrie.match('/')?.value).toBe('home');
    expect(mainTrie.match('/camp/badges')?.value).toBe('badges-page');

    const stickersMatch = mainTrie.match('/camp/123/stickers');
    expect(stickersMatch?.value).toBe('stickers-page');
    expect(stickersMatch?.params!['campId']).toBe('123');
  });

  test.concurrent('mounts nested sub-tries', async ({ expect }) => {
    const mainTrie = new RouteTrie();
    const gameTrie = new RouteTrie();
    const jeopardyTrie = new RouteTrie();

    jeopardyTrie.add('/host', 'jeopardy-host');
    jeopardyTrie.add('/play', 'jeopardy-play');

    gameTrie.mount('/jeopardy', jeopardyTrie);
    mainTrie.mount('/games', gameTrie);

    expect(mainTrie.match('/games/jeopardy/host')?.value).toBe('jeopardy-host');
    expect(mainTrie.match('/games/jeopardy/play')?.value).toBe('jeopardy-play');
  });
});
