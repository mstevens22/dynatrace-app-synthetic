import React, { useMemo } from 'react';
import { Flex } from '@dynatrace/strato-components/layouts';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { ProgressCircle } from '@dynatrace/strato-components/content';
import { units } from '@dynatrace-sdk/units';
import { IntentButton } from '@dynatrace/strato-components/buttons';
import {
    DataTableV2,
    DataTableV2ColumnDef
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
//Define scenario availability based on steps vaailability
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
      
const columns = useMemo<DataTableV2ColumnDef<(typeof scenario)[number]>[]>(
  () => [
        {
            header: 'Scenario',
            id: 'scenario',
            accessor: 'name',
            width: 'content'
          },
          {
            header: 'Availability',
            accessor: 'availability',
            id: 'availability',        
            formatter: { input: units.percentage.percent },
            width: 'content'
          }          
        ],
        []
      );      

    return (         
        <Flex width="100%" flexDirection="column" justifyContent="center" gap={16}>
            {availabilityByScenario.isLoading && <ProgressCircle />}
      {availabilityByScenario.data && (
        <DataTableV2 fullWidth data={scenario} columns={columns} subRows rowThresholds={[
          {rules: [
                  {
                      accessor: 'availability',
                      value: 0,
                      comparator: 'greater-than-or-equal-to',                                             
                    },
                {
                  accessor: 'availability',
                  value: 75,
                  comparator: 'less-than'
                },
              ],
              color: Colors.Charts.CategoricalThemed.Fireplace.Color06.Default,
              type: 'pill',
            },
            {rules: [
              {
                accessor: 'availability',
                  value: 75,
                  comparator: 'greater-than-or-equal-to', 
                },
              {
                accessor: 'availability',
                  value: 95,
                  comparator: 'less-than',
              },
          ],
              color: Colors.Charts.Status.Critical.Default,
              type: 'pill',
          },
          {rules: [
              {
                accessor: 'availability',
                  value: 95,
                  comparator: 'greater-than-or-equal-to',                  
              },
          {
            accessor: 'availability',
              value: 98,
              comparator: 'less-than',
          },
          ],
          color: Colors.Charts.Status.Warning.Default,
          type: 'pill',
      },
    {rules: [
      {
        accessor: 'availability',
          value: 98,
          comparator: 'greater-than-or-equal-to', 
        },
    {
      accessor: 'availability',
      value: 100,
      comparator: 'less-than-or-equal-to',
    },
  ],
  color: Colors.Charts.Status.Ideal.Default,
  type: 'pill',
},
        ]} variant = {{
          rowDensity: 'comfortable',
          rowSeparation: 'zebraStripes',
          verticalDividers: true,
          contained: true,
        }}><DataTableV2.RowActions>
        {(row) => (
             !(row.id as string)?.includes("TEST_STEP") ? (
            <IntentButton
                  appId="dynatrace.synthetic"
                  intentId="view_monitor_list_filtered_by_monitor_ids"
                  payload={{
                    'dt.synthetic.monitor_ids': [row.id],
                  }}
                />
              ):<></>
        )}
      </DataTableV2.RowActions>
      </DataTableV2>
      )}
        </Flex>
          );    
  };