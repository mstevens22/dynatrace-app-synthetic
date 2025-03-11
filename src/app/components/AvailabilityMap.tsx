import React from 'react';
import { Flex } from '@dynatrace/strato-components/layouts';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { ChoroplethLayer,ThresholdLegend, ChoroplethLayerTooltipData, MapView, Tooltip, TooltipAtoms  } from '@dynatrace/strato-geo';
import { ProgressCircle } from '@dynatrace/strato-components/content';
import { Button } from '@dynatrace/strato-components/buttons';
import { XmarkIcon } from '@dynatrace/strato-icons';
import { useQueriesWithCache } from "./commons/useQueriesWithCache";
import { getAvailabilityByCountry } from './commons/queries';
  
export const AvailabilityMap = ({countrySelection, filters}) => {
    
    //Pass selected country to parent
    const handleCountrySelection = (country: string) => {
        countrySelection(country)
      };
    
    //Get data from Grail DQL query
    const availabilityByCountry = useQueriesWithCache(getAvailabilityByCountry(filters));

    console.log(getAvailabilityByCountry(filters))

    type CountryStat = {
        country: string;
        availability: number;
    };

    return (         
        <Flex width="100%" flexDirection="column" justifyContent="center" gap={16}>
      {availabilityByCountry.isLoading && <ProgressCircle />}
      {availabilityByCountry.data && (   
            <MapView height={1000} initialViewState={{ zoom: 1 }}>                
              <ChoroplethLayer data={availabilityByCountry.data.records as CountryStat[]} regionAccessor={'country'} valueAccessor={'availability'} color={'legend'}>
              <ChoroplethLayer.Tooltip>
                {(regionData: ChoroplethLayerTooltipData<CountryStat>) => {            
                    return (
                    <Tooltip.Body>
                        <Tooltip.Item>
                        <Tooltip.Content>
                            <Tooltip.Text variant="secondary">{regionData.data.country}</Tooltip.Text>
                        </Tooltip.Content>
                        <Tooltip.Value>
                            <Button onClick={() => handleCountrySelection(regionData.data.country)}
                                color="primary"
                                width="full"
                                textAlign="start">
                                    {regionData.data.availability} %
                            </Button>
                        </Tooltip.Value>                        
                        </Tooltip.Item>
                    </Tooltip.Body>
                    );
                }}
            </ChoroplethLayer.Tooltip>
            </ChoroplethLayer>
            <ThresholdLegend ranges={[
          {
            from: 0,
            to: 75,
            color: Colors.Charts.CategoricalThemed.Fireplace.Color06.Default,
          },
          {
            from: 75,
            to: 95,
            color: Colors.Charts.Status.Critical.Default,
          },
          {
            from: 95,
            to: 98,
            color: Colors.Charts.Status.Warning.Default,
          },
          {
            from: 98,
            to: 101,
            color: Colors.Charts.Status.Ideal.Default,
          }
        ]}/>
            </MapView>
             )}
    </Flex>
          );    
  };