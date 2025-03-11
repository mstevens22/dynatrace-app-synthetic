import React from 'react';

import { useState } from "react";
import { Button } from '@dynatrace/strato-components/buttons';
import { XmarkIcon } from '@dynatrace/strato-icons';
import {
  Page,
  TitleBar,
} from "@dynatrace/strato-components-preview/layouts";
import { FilterBarGlobal } from "../components/FilterBarGlobal";
import {
  FilterItemValues,
} from "@dynatrace/strato-components-preview/filters";

import { AvailabilityMap, AvailabilityCountryDetails } from "../components";
  
export const AvailabilityCountry = () => {
    //Global filters
    const [filterItemValues, setFilterItemValues] = useState<FilterItemValues | null>(null);
    const handleFilters  = (filterItemValues: FilterItemValues) => {
        setFilterItemValues(filterItemValues)
    };

    //When button is clicked within country tooltip on Map
    const handleCountrySelection  = (selectedCountryfromChild: string) => {
        setSelectedCountry(selectedCountryfromChild)
        setDetailView(true)
      };

    //State of detailView panel
    const [detailView, setDetailView] = useState(false);

    //Define which country is selected and whose details are displayed
    const [selectedCountry, setSelectedCountry] = useState<string | null>();

    return (        
        <Page>
      <Page.Main style={{ display: "flex", flexDirection: "column" }}>
        <TitleBar>
          <TitleBar.Title>chanel.com Availability</TitleBar.Title>
          <TitleBar.Subtitle>
            Based on synthetic scenarios
          </TitleBar.Subtitle>
          <TitleBar.Suffix>
          <FilterBarGlobal filtersPropagation={handleFilters}/>
          </TitleBar.Suffix>
        </TitleBar>
        {filterItemValues && (       
         <AvailabilityMap countrySelection={handleCountrySelection} filters={filterItemValues}/>
        )}
       
      </Page.Main>
        <Page.DetailView style={{ display: "flex", flexDirection: "column" }} preferredWidth={'40%'}  dismissed={!detailView}>
          <TitleBar>
            <TitleBar.Subtitle>
              Availability for <b>{selectedCountry}</b> scenarios
            </TitleBar.Subtitle>
            <TitleBar.Action>
            <Button onClick={() => setDetailView(false)} aria-label="Close sidebar" >
              <Button.Prefix>
                <XmarkIcon />
              </Button.Prefix>
            </Button>
          </TitleBar.Action>
          </TitleBar>
          <AvailabilityCountryDetails country={selectedCountry} filters={filterItemValues}/>
        </Page.DetailView>
    </Page>
    );
};