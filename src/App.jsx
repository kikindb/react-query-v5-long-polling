import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MAX_RETRIES = 5;
const TIMEOUT_MS = 1000;

function getRandomData() {
  return axios('http://localhost:3000/random');
}

function App() {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [startFetchingData, setStartFetchingData] = useState(false);

  const { error, data, fetchStatus, isFetching, status } = useQuery({
    queryKey: ['repoData'],
    queryFn: () => getRandomData(),
    refetchInterval: (query) => {
      console.log('query', query);
      setCount(query?.state?.dataUpdateCount);
      const queryStatus = query?.state?.data?.request?.status;
      const responseData = query?.state?.data?.data;

      if (
        (queryStatus === 200 && responseData?.paymentStatus === 'Success') ||
        count >= MAX_RETRIES ||
        query?.state?.error ||
        queryStatus > 299
      ) {
        return false;
      }

      return TIMEOUT_MS;
    },
    refetchIntervalInBackground: true,
    enabled: startFetchingData,
  });

  function haveMaxCallsReached() {
    return count >= MAX_RETRIES && data?.data?.paymentStatus === 'Pending';
  }

  function handleClick() {
    setClickCount((prev) => prev + 1);
    setStartFetchingData(true);
    console.log('click... ', startFetchingData);
    queryClient.resetQueries();
    setCount(0);
  }

  return (
    <>
      <h1>Long Polling with React Query v5</h1>
      <div className='card'>
        <button
          onClick={handleClick}
          disabled={isFetching || data?.data?.paymentStatus === 'Success'}
        >
          Fetch count is {count}
        </button>
        {JSON.stringify(clickCount)};
        {error && <h2>{`An error has occurred: ${error?.message}`}</h2>}
        {haveMaxCallsReached() && <h2>Max calls reached, please try again</h2>}
        <p>
          <code>{JSON.stringify(data?.data)}</code>
          <br />
          {fetchStatus + ' '}
          {JSON.stringify(isFetching)}
          &nbsp;{status}
        </p>
        {data?.data?.paymentStatus === 'Success' && (
          <h2>Response Successful ✅</h2>
        )}
      </div>
    </>
  );
}

export default App;
