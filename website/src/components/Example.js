// @flow

import * as React from 'react';
import styled from 'styled-components';
import Code from './Code';
import Loading from './Loading';
import Page from './Page';
import { getExampleData, formatExampleName } from '../utils/examples';

type PackageProps = {
  match: {
    params: {
      example: string,
      group: string,
      name: string,
    },
  },
};

type PackageState = {
  code?: string,
  Component?: React.Node,
};

const Body = styled.div`margin: 20px 0;`;

export default class Example extends React.PureComponent<PackageProps, PackageState> {
  state = { children: null };
  props: PackageProps;

  componentDidMount() {
    const { example, group, name } = this.props.match.params;
    this.setState(getExampleData(group, name, example));
  }

  render() {
    const { example } = this.props.match.params;
    const { code, Component } = this.state;
    return (
      <Page>
        <h1>{formatExampleName(example)}</h1>
        <Body>
          {code ? (
            <div>
              <Component />
              <Code>{code}</Code>
            </div>
          ) : (
            <Loading />
          )}
        </Body>
      </Page>
    );
  }
}
