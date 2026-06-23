import { describe, expect, test } from 'vitest';

import { parseYaml } from './yaml';

describe('yaml', () => {
  describe('parseYaml', () => {
    test('parses simple key-value pairs', () => {
      const yaml = `
key1: value1
key2: "value2"
key3: 'value3'
`;
      expect(parseYaml(yaml)).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });

    test('parses primitive values', () => {
      const yaml = `
boolTrue: true
boolFalse: false
nullValue: null
numInt: 42
numFloat: 3.14
`;
      expect(parseYaml(yaml)).toEqual({
        boolTrue: true,
        boolFalse: false,
        nullValue: null,
        numInt: 42,
        numFloat: 3.14,
      });
    });

    test('parses nested objects by indentation', () => {
      const yaml = `
parent:
  child1: value1
  child2:
    grandchild: value2
sibling: value3
`;
      expect(parseYaml(yaml)).toEqual({
        parent: {
          child1: 'value1',
          child2: {
            grandchild: 'value2',
          },
        },
        sibling: 'value3',
      });
    });

    test('ignores comments', () => {
      const yaml = `
# This is a comment
key1: value1 # inline comment
key2: "value # with hash"
key3: 'value # with single hash'
`;
      expect(parseYaml(yaml)).toEqual({
        key1: 'value1',
        key2: 'value # with hash',
        key3: 'value # with single hash',
      });
    });

    test('ignores empty lines and trimmed keys', () => {
      const yaml = `
  
  key1  :   value1  
  
`;
      expect(parseYaml(yaml)).toEqual({
        key1: 'value1',
      });
    });

    test('handles quotes around keys', () => {
      const yaml = `
"key-one": value1
'key-two': value2
`;
      expect(parseYaml(yaml)).toEqual({
        'key-one': 'value1',
        'key-two': 'value2',
      });
    });
  });
});
