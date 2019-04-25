/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
 * found in the LICENSE file in the root directory of this source tree.
 */

import { observable, reaction } from 'mobx';
import Web3Plasma from './web3/plasma';
import autobind from 'autobind-decorator';

export default class PlasmaConfig {
  // DEPRECATED. Use rootNetworkId instead
  @observable
  public rootNetwork: string;

  @observable
  public rootNetworkId: number;

  @observable
  public exitHandlerAddr: string;

  @observable
  public bridgeAddr: string;

  @observable
  public operatorAddr: string;

  @observable
  public rootEventDelay: number;

  constructor(private readonly plasma: Web3Plasma) {
    if (this.plasma.ready) {
      this.fetchConfig();
    } else {
      reaction(() => this.plasma.ready, this.fetchConfig);
    }
  }

  @autobind
  private fetchConfig() {
    this.plasma.instance
      .getConfig()
      .then(
        ({
          rootNetwork,
          rootNetworkId,
          exitHandlerAddr,
          bridgeAddr,
          operatorAddr,
          bridgeDelay,
        }: any) => {
          this.rootNetwork = rootNetwork;
          this.rootNetworkId = rootNetworkId;
          this.exitHandlerAddr = exitHandlerAddr;
          this.bridgeAddr = bridgeAddr;
          this.operatorAddr = operatorAddr;
          this.rootEventDelay = Number(bridgeDelay);
        }
      );
  }
}
