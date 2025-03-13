import React from 'react';
import { Flex } from '@dynatrace/strato-components/layouts';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { ProgressCircle } from '@dynatrace/strato-components/content';
import { units } from '@dynatrace-sdk/units';
import { IntentButton } from '@dynatrace/strato-components/buttons';
import {
    DataTable,
    TableRow,
    TableVariantConfig
  } from '@dynatrace/strato-components-preview/tables';
import type { TableColumn } from '@dynatrace/strato-components-preview/tables';
import { useQueriesWithCache } from "./commons/useQueriesWithCache";
import { getAvailabilityByScenarioByCountry, getExecutionsByScenarioStepCountry } from './commons/queries';
  
export const AvailabilityCountryDetails = ({country, filters}) => {
    //Get data from Grail DQL query
    const availabilityByScenario = useQueriesWithCache(getAvailabilityByScenarioByCountry(country, filters));
    const executionsByScenarioStepCountry = useQueriesWithCache(getExecutionsByScenarioStepCountry(country, filters));    
    

//Délaration ds interfaces
interface SubRow {
    id: string;
    name: string;
    availability: number;
}
interface Scenario {
    id: string;
    name: string;
    availability: number;
    subRows: SubRow[];
}
//Initialisation de mon objet final  
const scenario: Scenario[] = []
//Create ojbect with subrows   
executionsByScenarioStepCountry?.data?.records.forEach((step) => {
    //On vérifie si une entrée existe déjà pour le scenario sinon on la crée
    if (!scenario.some(scenario => scenario.id === step?.scenarioId)) {
        const current_scenario = 
            {
                id: step?.scenarioId as string,
                name: step?.scenarioName as string,
                availability: 0,
                subRows: [
                {
                    id: step?.step as string,
                    name: step?.stepName as string,
                    availability: step?.availabilityRate as number
                }
                ]
            }
            ;
        scenario.push(current_scenario)
    } else {
        scenario.forEach(scenario => {
            if (scenario.id === step?.scenarioId) {                  
                scenario.subRows.push({
                id: step?.step as string,
                name: step?.stepName as string,
                availability: step?.availabilityRate as number
                });
            }
            });
    }
});
//Define parent scenario availability based on steps availability
function updateAvailability(scenarios: Scenario[]) {
    scenarios.forEach(scenario => {
      if (scenario.subRows.length > 0) {
        // Convertit availability en nombre et calcule la moyenne
        const totalAvailability = scenario.subRows.reduce((sum, subRow) => sum + Number(subRow.availability), 0);
        scenario.availability = totalAvailability / scenario.subRows.length;
      } else {
        scenario.availability = 0; // Aucun subRow, disponibilité à 0
      }
    });
  }
// Mise à jour des données
updateAvailability(scenario);
    
    const columns: TableColumn[] = [
        {
            header: 'Scenario',
            accessor: 'name',
            ratioWidth: 3,
          },
          {
            header: 'Availability',
            accessor: 'availability',
            ratioWidth: 1,
            formatter: { input: units.percentage.percent },
          }
      ];

        //Table styling
  const tableVariant: TableVariantConfig = {
    rowDensity: 'comfortable',
    rowSeparation: 'zebraStripes',
    verticalDividers: true,
    contained: true,
  };

    return (         
        <Flex width="100%" flexDirection="column" justifyContent="center" gap={16}>
            {availabilityByScenario.isLoading && <ProgressCircle />}
      {availabilityByScenario.data && (
        <DataTable data={scenario} columns={columns} variant={tableVariant} rowThresholds={[
          {
            id: 'availability',
            value: 98,
            comparator: 'greater-than-or-equal-to',
            color: Colors.Charts.Status.Ideal.Default
          },
          {
            id: 'availability',
            value: 98,
            comparator: 'less-than',
            color: Colors.Charts.Status.Critical.Default
          } ]}>
            <DataTable.UserActions>
          <DataTable.RowActions>
              {(row: TableRow) => (
                  !(row.original.id as string)?.includes("TEST_STEP") ? (
                <IntentButton
                  appId="dynatrace.synthetic"
                  intentId="view_monitor_list_filtered_by_monitor_ids"
                  payload={{
                    'dt.synthetic.monitor_ids': [row.original.id],
                  }}
                />):null
              )}
            </DataTable.RowActions>
            </DataTable.UserActions>
          </DataTable>
      )}
        </Flex>
          );    
  };