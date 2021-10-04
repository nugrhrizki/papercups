import React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Box, Flex} from 'theme-ui';

import {Container, Input, Paragraph, Title} from '../common';
import {PlusOutlined} from '../icons';
import * as API from '../../api';
import {Broadcast} from '../../types';
import BroadcastsTable from './BroadcastsTable';
import logger from '../../logger';
import {NewBroadcastModalButton} from './NewBroadcastModal';

type Props = RouteComponentProps<{}>;
type State = {
  filterQuery: string;
  filteredBroadcasts: Array<Broadcast>;
  loading: boolean;
  broadcasts: Array<Broadcast>;
};

const filterBroadcastsByQuery = (
  broadcasts: Array<Broadcast>,
  query?: string
): Array<Broadcast> => {
  if (!query || !query.length) {
    return broadcasts;
  }

  return broadcasts.filter((broadcast) => {
    const {id, name, description} = broadcast;

    const words = [id, name, description]
      .filter((str) => str && String(str).trim().length > 0)
      .join(' ')
      .replace('_', ' ')
      .split(' ')
      .map((str) => str.toLowerCase());

    const queries = query.split(' ').map((str) => str.toLowerCase());

    return queries.every((q) => {
      return words.some((word) => word.indexOf(q) !== -1);
    });
  });
};

class BroadcastsOverview extends React.Component<Props, State> {
  state: State = {
    filteredBroadcasts: [],
    filterQuery: '',
    loading: true,
    broadcasts: [],
  };

  async componentDidMount() {
    await this.handleRefreshBroadcasts();
  }

  handleSearchBroadcasts = (filterQuery: string) => {
    const {broadcasts = []} = this.state;

    if (!filterQuery?.length) {
      this.setState({filterQuery: '', filteredBroadcasts: broadcasts});
    }

    this.setState({
      filterQuery,
      filteredBroadcasts: filterBroadcastsByQuery(broadcasts, filterQuery),
    });
  };

  handleRefreshBroadcasts = async () => {
    try {
      const {filterQuery} = this.state;
      const broadcasts = await API.fetchBroadcasts();

      this.setState({
        filteredBroadcasts: filterBroadcastsByQuery(broadcasts, filterQuery),
        loading: false,
        broadcasts,
      });
    } catch (err) {
      logger.error('Error loading broadcasts!', err);

      this.setState({loading: false});
    }
  };

  handleNewBroadcast = (broadcast: Broadcast) => {
    this.props.history.push(`/broadcasts/${broadcast.id}`);
  };

  render() {
    const {loading, filteredBroadcasts = []} = this.state;

    return (
      <Container>
        <Flex sx={{justifyContent: 'space-between', alignItems: 'center'}}>
          <Title level={3}>Broadcasts</Title>

          <NewBroadcastModalButton
            type="primary"
            icon={<PlusOutlined />}
            onSuccess={this.handleNewBroadcast}
          >
            New broadcast
          </NewBroadcastModalButton>
        </Flex>

        <Box mb={4}>
          <Paragraph>
            Broadcasts allow you to send emails and other notifications to your
            customers for important announcements.
          </Paragraph>
        </Box>

        <Box mb={3}>
          <Input.Search
            placeholder="Search broadcasts..."
            allowClear
            onSearch={this.handleSearchBroadcasts}
            style={{width: 400}}
          />
        </Box>

        <Box my={4}>
          <BroadcastsTable loading={loading} broadcasts={filteredBroadcasts} />
        </Box>
      </Container>
    );
  }
}

export default BroadcastsOverview;