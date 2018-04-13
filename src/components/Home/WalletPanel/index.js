import { compose } from 'recompose';
import { withData, withProgressComponents, progressValues } from 'spunky';

import Home from './WalletPanel';
import Loading from '../../Loading';
import authActions from '../../../actions/authActions';
import balancesActions from '../../../actions/balancesActions';
import withInitialCall from '../../../hocs/withInitialCall';
import withNetworkData from '../../../hocs/withNetworkData';

const { LOADING } = progressValues;

const mapAuthDataToProps = ({ address }) => ({ address });

const mapBalancesDataToProps = (balances) => ({ balances });

export default compose(
  withData(authActions, mapAuthDataToProps),
  withNetworkData(),
  withInitialCall(balancesActions, ({ net, address }) => ({ net, address })),
  withProgressComponents(balancesActions, {
    [LOADING]: Loading
  }),
  withData(balancesActions, mapBalancesDataToProps)
)(Home);
