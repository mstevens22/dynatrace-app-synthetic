import React from "react";
import { stateClient } from '@dynatrace-sdk/client-state';
import { useDqlQuery } from '@dynatrace-sdk/react-hooks';
import SHA256 from "crypto-js/sha256";

export const useQueriesWithCache = (query: string, validUntilTime: string = 'now+5m') => {
  
  const appStateKey = SHA256(query).toString()
  const { data, error, isLoading } = useDqlQuery({
    body: { query: query },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const appState = await stateClient.getAppState({ key: appStateKey });
        console.log('Cache HIT for '+appStateKey);        
        return JSON.parse(appState.value);
      } catch (e) {
        console.log('Cache MISSED for '+appStateKey);
        await stateClient.setAppState({
          key: appStateKey,
          body: {
            validUntilTime,
            value: JSON.stringify(data),
          },
        });
        return data;
      }
    };

    if (data) {
      fetchData();
    }
  }, [appStateKey, validUntilTime, data]);

  return { data, error, isLoading };
};