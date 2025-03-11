import React from 'react';
import {
  Route,
  Routes,
  Link,
} from 'react-router-dom';
import {
  Page,
  AppHeader,
} from '@dynatrace/strato-components-preview/layouts';
import { AvailabilityCountry } from './pages/AvailabilityCountry';

export const App = () => {
  return (
    <Page>

      <Page.Main>
        <Routes>          
          <Route path="/" element={<AvailabilityCountry />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};

      /* <Page.Header>
        <AppHeader>
          <AppHeader.NavItems>
            <AppHeader.NavItem as={Link} to="/" >Availibity per Country</AppHeader.NavItem>
          </AppHeader.NavItems>
        </AppHeader>
      </Page.Header> */