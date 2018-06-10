import React from 'react';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

import { Recomposer, StateUpdaterMap } from '../Recomposer';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/mapProps-test.js
 */
test('mapProps maps owner props to child props', () => {
  interface OuterProps {}
  interface InnerProps {
    str: string;
  }
  interface InnerState {
    strings: string[];
  }
  type InnerStateUpdaterMap = StateUpdaterMap<InnerState, 'updateStrings'>;
  type Props = InnerProps & InnerState & InnerStateUpdaterMap;

  // type test
  const Component = ({ str }: Props) => (str ? null : null);
  const mapProps = ({ strings, ...rest }) => ({
    ...rest,
    str: strings.join(''),
  });
  new Recomposer<OuterProps, InnerProps, InnerState, InnerStateUpdaterMap>()
    .withState('strings', 'updateStrings', ['do', 're', 'mi'])
    .mapProps(mapProps)
    .enhance(Component);
  new Recomposer()
    .withState<InnerState, InnerStateUpdaterMap>('strings', 'updateStrings', ['do', 're', 'mi'])
    .mapProps<InnerProps>(mapProps)
    .enhance(Component);

  const component: any = sinon.spy(Component);
  component.displayName = 'component';

  const StringConcat = new Recomposer()
    .withState<InnerState, InnerStateUpdaterMap>('strings', 'updateStrings', ['do', 're', 'mi'])
    .mapProps<InnerProps>(mapProps)
    .enhance(component);

  expect(StringConcat.displayName).toBe('withState(mapProps(component))');

  mount(<StringConcat />);
  const { updateStrings } = component.firstCall.args[0];
  updateStrings(strings => [...strings, 'fa']);

  expect(component.firstCall.args[0].str).toBe('doremi');
  expect(component.secondCall.args[0].str).toBe('doremifa');
});
