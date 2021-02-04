import * as React from 'react';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

import { Recomposer } from '../';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/withPropsOnChange-test.js
 */
test('withPropsOnChange maps subset of owner props to child props', () => {
  const component: any = sinon.spy(() => null);
  component.displayName = 'component';

  const mapSpy = sinon.spy();
  const StringConcat = new Recomposer()
    .withState('strings', 'updateStrings', { a: 'a', b: 'b', c: 'c' })
    .flattenProp('strings')
    .withPropsOnChange(['a', 'b'], ({ a, b, ...props }) => {
      mapSpy();
      return {
        ...props,
        foobar: a + b,
      };
    })
    .enhance(component);

  expect(StringConcat.displayName).toBe('withState(flattenProp(withPropsOnChange(component)))');

  mount(<StringConcat />);
  const { updateStrings } = component.firstCall.args[0];
  expect(component.lastCall.args[0].foobar).toBe('ab');
  expect(component.calledOnce).toBe(true);
  expect(mapSpy.callCount).toBe(1);

  // Does not re-map for non-dependent prop updates
  updateStrings(strings => ({ ...strings, c: 'baz' }));
  expect(component.lastCall.args[0].foobar).toBe('ab');
  expect(component.lastCall.args[0].c).toBe('c');
  expect(component.calledTwice).toBe(true);
  expect(mapSpy.callCount).toBe(1);

  updateStrings(strings => ({ ...strings, a: 'foo', b: 'bar' }));
  expect(component.lastCall.args[0].foobar).toBe('foobar');
  expect(component.lastCall.args[0].c).toBe('baz');
  expect(component.calledThrice).toBe(true);
  expect(mapSpy.callCount).toBe(2);
});
