import { assert, refute } from 'referee'
import { clone, pick, isEqual, extend } from '../lib/dash'

let {suite, test} = window

suite('dash')

test('clone arrays', () => {
  let a = [1, 2, 3]
  let b = clone(a)
  b.push(4)
  assert.equals(a, [1, 2, 3])
  assert.equals(b, [1, 2, 3, 4])
})

test('clone objects', () => {
  let a = {a: 1, b: 2}
  let b = clone(a)
  b.c = 3
  assert.equals(a, {a: 1, b: 2})
  assert.equals(b, {a: 1, b: 2, c: 3})
})

test('clone falsy values', () => {
  assert.equals(clone(undefined), undefined)
  assert.equals(clone(null), null)
  assert.equals(clone(false), false)
  assert.equals(clone(0), 0)
})

test('pick', () => {
  assert.equals(pick({a: 1, b: 2, c: 3}, ['a', 'c']), {a: 1, c: 3})
  assert.equals(pick({a: 1}, ['a', 'c']), {a: 1})
})

test('isEqual', () => {
  let arr = []
  assert(isEqual({a: 1, b: 2}, {a: 1, b: 2}))
  assert(isEqual({a: 1, b: arr}, {a: 1, b: arr}))
  refute(isEqual({a: 1, b: 2}, {a: 1, b: '2'}))
  refute(isEqual({a: 1, b: 2}, {a: 1}))
  refute(isEqual({a: 1, b: {c: 3}}, {a: 1, b: {c: 3}}))
})

test('extend', () => {
  assert.equals(extend({}, {a: 1, b: 2}, null, {c: 3}), {a: 1, b: 2, c: 3})

  let obj = {d: 4}
  let target = {}
  extend(target, obj)
  target.a = 1
  obj.b = 2
  assert.equals(obj, {b: 2, d: 4})
  assert.equals(target, {a: 1, d: 4})
})
