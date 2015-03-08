let {assert} = require('referee')
let {suite, test, beforeEach, afterEach} = window
let path = require('../lib/path')

suite('path.extractParamNames')

test('returns an empty array when a pattern contains no dynamic segments', () => {
  assert.equals(path.extractParamNames('a/b/c'), [])
})

test('returns param names when there dynamic segments', () => {
  assert.equals(path.extractParamNames('/comments/:a/:b/edit'), ['a', 'b'])
})

test('uses the name "splat" for the * segment', () => {
  assert.equals(path.extractParamNames('/files/*.jpg'), ['splat'])
})

suite('path.extractParams')

test('patterns with no dynamic segments', () => {
  let pattern = 'a/b/c'
  assert.equals(path.extractParams(pattern, pattern), {})
  assert.equals(path.extractParams(pattern, 'd/e/f'), null)
})

test('patterns with dynamic segments', () => {
  let pattern = 'comments/:id.:ext/edit'
  assert.equals(path.extractParams(pattern, 'comments/abc.js/edit'), { id: 'abc', ext: 'js'})
})

test('patterns with optional dynamic segments', () => {
  let pattern = 'comments/:id?/edit'
  assert.equals(path.extractParams(pattern, 'comments/123/edit'), { id: '123' })
  assert.equals(path.extractParams(pattern, 'comments//edit'), { id: undefined })
  assert.equals(path.extractParams(pattern, 'users/123'), null)

  pattern = 'comments/:id?/?edit'
  assert.equals(path.extractParams(pattern, 'comments/123/edit'), { id: '123' })
  assert.equals(path.extractParams(pattern, 'comments/edit'), { id: undefined })
  assert.equals(path.extractParams(pattern, 'users/123'), null)
})

//     describe('and the path matches with a segment containing a .', function () {
//       it('returns an object with the params', function () {
//         expect(PathUtils.extractParams(pattern, 'comments/foo.bar/edit')).toEqual({ id: 'foo', ext: 'bar' });
//       });
//     });
//   });

//   describe('when a pattern has characters that have special URL encoding', function () {
//     var pattern = 'one, two';

//     describe('and the path matches', function () {
//       it('returns an empty object', function () {
//         expect(PathUtils.extractParams(pattern, 'one, two')).toEqual({});
//       });
//     });

//     describe('and the path does not match', function () {
//       it('returns null', function () {
//         expect(PathUtils.extractParams(pattern, 'one two')).toBe(null);
//       });
//     });
//   });

//   describe('when a pattern has dynamic segments and characters that have special URL encoding', function () {
//     var pattern = '/comments/:id/edit now';

//     describe('and the path matches', function () {
//       it('returns an object with the params', function () {
//         expect(PathUtils.extractParams(pattern, '/comments/abc/edit now')).toEqual({ id: 'abc' });
//       });
//     });

//     describe('and the path does not match', function () {
//       it('returns null', function () {
//         expect(PathUtils.extractParams(pattern, '/users/123')).toBe(null);
//       });
//     });
//   });

//   describe('when a pattern has a *', function () {
//     describe('and the path matches', function () {
//       it('returns an object with the params', function () {
//         expect(PathUtils.extractParams('/files/*', '/files/my/photo.jpg')).toEqual({ splat: 'my/photo.jpg' });
//         expect(PathUtils.extractParams('/files/*', '/files/my/photo.jpg.zip')).toEqual({ splat: 'my/photo.jpg.zip' });
//         expect(PathUtils.extractParams('/files/*.jpg', '/files/my/photo.jpg')).toEqual({ splat: 'my/photo' });
//       });
//     });

//     describe('and the path does not match', function () {
//       it('returns null', function () {
//         expect(PathUtils.extractParams('/files/*.jpg', '/files/my/photo.png')).toBe(null);
//       });
//     });
//   });

//   describe('when a pattern has a ?', function () {
//     var pattern = '/archive/?:name?';

//     describe('and the path matches', function () {
//       it('returns an object with the params', function () {
//         expect(PathUtils.extractParams(pattern, '/archive')).toEqual({ name: undefined });
//         expect(PathUtils.extractParams(pattern, '/archive/')).toEqual({ name: undefined });
//         expect(PathUtils.extractParams(pattern, '/archive/foo')).toEqual({ name: 'foo' });
//         expect(PathUtils.extractParams(pattern, '/archivefoo')).toEqual({ name: 'foo' });
//       });
//     });

//     describe('and the path does not match', function () {
//       it('returns null', function () {
//         expect(PathUtils.extractParams(pattern, '/archiv')).toBe(null);
//       });
//     });
//   });

//   describe('when a param has dots', function () {
//     var pattern = '/:query/with/:domain';

//     describe('and the path matches', function () {
//       it('returns an object with the params', function () {
//         expect(PathUtils.extractParams(pattern, '/foo/with/foo.app')).toEqual({ query: 'foo', domain: 'foo.app' });
//         expect(PathUtils.extractParams(pattern, '/foo.ap/with/foo')).toEqual({ query: 'foo.ap', domain: 'foo' });
//         expect(PathUtils.extractParams(pattern, '/foo.ap/with/foo.app')).toEqual({ query: 'foo.ap', domain: 'foo.app' });
//       });
//     });

//     describe('and the path does not match', function () {
//       it('returns null', function () {
//         expect(PathUtils.extractParams(pattern, '/foo.ap')).toBe(null);
//       });
//     });
//   });
// });

// describe('PathUtils.injectParams', function () {
//   describe('when a pattern does not have dynamic segments', function () {
//     var pattern = 'a/b/c';

//     it('returns the pattern', function () {
//       expect(PathUtils.injectParams(pattern, {})).toEqual(pattern);
//     });
//   });

//   describe('when a pattern has dynamic segments', function () {
//     var pattern = 'comments/:id/edit';

//     describe('and a param is missing', function () {
//       it('throws an Error', function () {
//         expect(function () {
//           PathUtils.injectParams(pattern, {});
//         }).toThrow(Error);
//       });
//     });

//     describe('and a param is optional', function () {
//       var pattern = 'comments/:id?/edit';

//       it('returns the correct path when param is supplied', function () {
//         expect(PathUtils.injectParams(pattern, { id:'123' })).toEqual('comments/123/edit');
//       });

//       it('returns the correct path when param is not supplied', function () {
//         expect(PathUtils.injectParams(pattern, {})).toEqual('comments//edit');
//       });
//     });

//     describe('and a param and forward slash are optional', function () {
//       var pattern = 'comments/:id?/?edit';

//       it('returns the correct path when param is supplied', function () {
//         expect(PathUtils.injectParams(pattern, { id:'123' })).toEqual('comments/123/edit');
//       });

//       it('returns the correct path when param is not supplied', function () {
//         expect(PathUtils.injectParams(pattern, {})).toEqual('comments/edit');
//       });
//     });

//     describe('and all params are present', function () {
//       it('returns the correct path', function () {
//         expect(PathUtils.injectParams(pattern, { id: 'abc' })).toEqual('comments/abc/edit');
//       });

//       it('returns the correct path when the value is 0', function () {
//         expect(PathUtils.injectParams(pattern, { id: 0 })).toEqual('comments/0/edit');
//       });
//     });

//     describe('and some params have special URL encoding', function () {
//       it('returns the correct path', function () {
//         expect(PathUtils.injectParams(pattern, { id: 'one, two' })).toEqual('comments/one, two/edit');
//       });
//     });

//     describe('and a param has a forward slash', function () {
//       it('preserves the forward slash', function () {
//         expect(PathUtils.injectParams(pattern, { id: 'the/id' })).toEqual('comments/the/id/edit');
//       });
//     });

//     describe('and some params contain dots', function () {
//       it('returns the correct path', function () {
//         expect(PathUtils.injectParams(pattern, { id: 'alt.black.helicopter' })).toEqual('comments/alt.black.helicopter/edit');
//       });
//     });
//   });

//   describe('when a pattern has one splat', function () {
//     it('returns the correct path', function () {
//       expect(PathUtils.injectParams('/a/*/d', { splat: 'b/c' })).toEqual('/a/b/c/d');
//     });
//   });

//   describe('when a pattern has multiple splats', function () {
//     it('returns the correct path', function () {
//       expect(PathUtils.injectParams('/a/*/c/*', { splat: [ 'b', 'd' ] })).toEqual('/a/b/c/d');
//     });

//     it('complains if not given enough splat values', function () {
//       expect(function () {
//         PathUtils.injectParams('/a/*/c/*', { splat: [ 'b' ] });
//       }).toThrow(Error);
//     });
//   });

//   describe('when a pattern has dots', function () {
//     it('returns the correct path', function () {
//       expect(PathUtils.injectParams('/foo.bar.baz')).toEqual('/foo.bar.baz');
//     });
//   });

//   describe('when a pattern has optional slashes', function () {
//     it('returns the correct path', function () {
//       expect(PathUtils.injectParams('/foo/?/bar/?/baz/?')).toEqual('/foo/bar/baz/');
//     });
//   });
// });

// describe('PathUtils.extractQuery', function () {
//   describe('when the path contains a query string', function () {
//     it('returns the parsed query object', function () {
//       expect(PathUtils.extractQuery('/?id=def&show=true')).toEqual({ id: 'def', show: 'true' });
//     });

//     it('properly handles arrays', function () {
//       expect(PathUtils.extractQuery('/?id%5B%5D=a&id%5B%5D=b')).toEqual({ id: [ 'a', 'b' ] });
//     });

//     it('properly handles encoded ampersands', function () {
//       expect(PathUtils.extractQuery('/?id=a%26b')).toEqual({ id: 'a&b' });
//     });
//   });

//   describe('when the path does not contain a query string', function () {
//     it('returns null', function () {
//       expect(PathUtils.extractQuery('/a/b/c')).toBe(null);
//     });
//   });
// });

// describe('PathUtils.withoutQuery', function () {
//   it('removes the query string', function () {
//     expect(PathUtils.withoutQuery('/a/b/c?id=def')).toEqual('/a/b/c');
//   });
// });

// describe('PathUtils.withQuery', function () {
//   it('appends the query string', function () {
//     expect(PathUtils.withQuery('/a/b/c', { id: 'def' })).toEqual('/a/b/c?id=def');
//   });

//   it('merges two query strings', function () {
//     expect(PathUtils.withQuery('/path?a=b', { c: [ 'd', 'e' ] })).toEqual('/path?a=b&c=d&c=e');
//   });

//   it('handles special characters', function () {
//     expect(PathUtils.withQuery('/path?a=b', { c: [ 'd#e', 'f&a=i#j+k' ] })).toEqual('/path?a=b&c=d%23e&c=f%26a%3Di%23j%2Bk');
//   });
// });