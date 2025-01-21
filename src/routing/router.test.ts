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

  test.concurrent(
    'match multi-level with param sibling route',
    async ({ expect }) => {
      const trie = new RouteTrie();

      trie.add('/{foo:*}', 'baz');
      trie.add('/{foobar}', 'tux');

      const match = trie.match('/foobar/baz/be');

      expect(match?.value).toBe('baz');
      expect(match?.params!['foo']).toBe('foobar/baz/be');
    },
  );
});
