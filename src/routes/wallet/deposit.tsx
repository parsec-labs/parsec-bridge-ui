/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { Fragment } from 'react';
import { computed, observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Form, Button } from 'antd';
import autobind from 'autobind-decorator';

import TokenValue from '../../components/tokenValue';
import AmountInput from '../../components/amountInput';
import Tokens from '../../stores/tokens';
import Network from '../../stores/network';
import ExitHandler from '../../stores/exitHandler';
import { BigIntType, bi, ZERO, greaterThan, lessThanOrEqual } from 'jsbi-utils';

interface DepositProps {
  tokens?: Tokens;
  network?: Network;
  exitHandler?: ExitHandler;
  color: number;
  onColorChange: (color: number) => void;
}

@inject('tokens', 'exitHandler', 'network')
@observer
export default class Deposit extends React.Component<DepositProps, any> {
  @computed
  get selectedToken() {
    const { tokens, color } = this.props;
    return tokens && tokens.tokenForColor(color);
  }

  @observable
  value: number | string = 0;

  @autobind
  handleSubmit(e) {
    e.preventDefault();
    const { exitHandler } = this.props;
    const value = this.selectedToken.toCents(this.value);
    exitHandler.deposit(this.selectedToken, String(value)).then(({ futureReceipt }) => {
      futureReceipt.once('transactionHash', depositTxHash => {
        console.log('deposit', depositTxHash); // eslint-disable-line
        this.value = 0;
      });
    });
  }

  canSubmitValue(value: BigIntType) {
    const { network } = this.props;
    return (
      network.canSubmit &&
      value && greaterThan(bi(value), ZERO) &&
      (this.selectedToken.isNft || lessThanOrEqual(bi(value), this.selectedToken.balance))
    );
  }

  render() {
    const { tokens, color, onColorChange } = this.props;

    return (
      <Fragment>
        <h2>Make a deposit</h2>

        {this.selectedToken.isNft && (
          <p>
            {this.selectedToken.name} is non-fungible token. Please enter
            tokenId to deposit
          </p>
        )}

        <Form onSubmit={this.handleSubmit} layout="inline">
          <AmountInput
            placeholder="Amount to deposit"
            value={this.value}
            onChange={value => {
              this.value = value;
            }}
            color={color}
            onColorChange={newColor => {
              onColorChange(newColor);
              this.value = tokens.tokenForColor(newColor).isNft
                ? ''
                : this.value;
            }}
          />

          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              disabled={!this.canSubmitValue(this.selectedToken.toCents(this.value))}
            >
              Deposit
            </Button>
          </Form.Item>
        </Form>

        <dl className="info" style={{ marginTop: 10 }}>
          <dt>Token name</dt>
          <dd>{this.selectedToken.name}</dd>
          <dt>Token contract address</dt>
          <dd>{this.selectedToken.address}</dd>
          <dt>Token balance</dt>
          <dd>
            <TokenValue
              value={this.selectedToken.balance}
              color={this.selectedToken.color}
            />
          </dd>
          <dt>Plasma balance</dt>
          <dd>
            <TokenValue
              value={this.selectedToken.plasmaBalance}
              color={this.selectedToken.color}
            />
          </dd>
        </dl>
      </Fragment>
    );
  }
}
