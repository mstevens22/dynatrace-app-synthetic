import React, { useEffect } from "react";
import {
  FilterBar,
  FilterItemValues,
} from "@dynatrace/strato-components-preview/filters";
import {
  SelectV2,
  TimeframeSelector,
} from "@dynatrace/strato-components-preview/forms";
import { useState } from "react";
import { subDays } from "date-fns";
import type { TimeframeV2 } from "@dynatrace/strato-components-preview/core";
import { stateClient } from '@dynatrace-sdk/client-state';

export const FilterBarGlobal = ({ filtersPropagation }) => {
  //Default Filter values
  const defaultFilterState = {
    timeframe: {
      value: {
        from: {
          absoluteDate: subDays(new Date(), 1).toISOString(),
          value: 'now()-1d',
          type: 'expression',
        },
        to: {
          absoluteDate: new Date().toISOString(),
          value: 'now()',
          type: 'expression',
        },
      } as TimeframeV2,
    },
  };
  const [timeframe, setTimeframe] = useState<TimeframeV2 | null>(
    defaultFilterState.timeframe.value
  );

  useEffect(() => {
    stateClient
      .getAppState({
        key: 'filters',
      })
      .then((appState) => {
        //Saved app state found
        const filterItemValues = JSON.parse(appState.value).filters
        setTimeframe(filterItemValues.timeframe.value)
        // Propagate filters to parent Compopnent
        filtersPropagation(filterItemValues)
      })
      .catch(async (e) => {
        // No app state found. Trigger the function, then store the response in the app state    
        await stateClient.setAppState({
          key: 'filters',
          body: {
            value: JSON.stringify({
              timestamp: Date.now(),
              filters: defaultFilterState,
            })
          }
        });
        filtersPropagation(defaultFilterState);
      });
    }, [])

  //Propagate filters changes to parent component
  const handleFilterChange = (filterItemValues: FilterItemValues) => {
    //Save filter values
    stateClient.setAppState({
      key: 'filters',
      body: {
        value: JSON.stringify({
          timestamp: Date.now(),
          filters: filterItemValues,
        })
      }
    });
    // Propagate filters to parent Component
    filtersPropagation(filterItemValues)
  };
  
  return (
    <FilterBar onFilterChange={handleFilterChange} id="filterGlobal">    
      <FilterBar.Item name="timeframe" label="Timeframe" showLabel={false}>
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </FilterBar.Item>
    </FilterBar>
  );
};
