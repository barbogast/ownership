import { Route, Router } from "wouter";

import Ownership from "./ownership/Index";
import MainMenu from "./MainMenu";
import Query from "./query/Query";
import Report from "./report/Report";
import DatabaseDefinition from "./databaseDefinition/DatabaseDefinition";
import RepositoryList from "./repository/RepositoryList";
import NestedRoutes from "./NestedRoutes";
import WithNestedStores from "./nestedStores/WithNestedStores";
import DevTools from "./DevTools";
import ReportDisplay from "./report/ReportDisplay";
import InjectFromStore from "./InjectFromStore";
import { useQuery } from "./query/queryStore";
import { useReport } from "./report/reportStore";
import { useDatabaseDefinition } from "./databaseDefinition/databaseDefinitionStore";

function App() {
  return (
    <Router>
      <MainMenu>
        <Route path="/" component={RepositoryList}></Route>
        <Route path="/ownership" component={Ownership} />
        <Route
          path="/:organization/:repository/:rest*"
          component={({ params }) => (
            <WithNestedStores>
              <NestedRoutes
                base={`/${params.organization}/${params.repository}`}
              >
                <Route
                  path="/db/:databaseDefinitionId"
                  component={(props) => (
                    // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
                    // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
                    <InjectFromStore
                      key={props.params.databaseDefinitionId}
                      id={props.params.databaseDefinitionId}
                      useFunc={useDatabaseDefinition}
                      child={(databaseDefinition) => (
                        <DatabaseDefinition
                          databaseDefinition={databaseDefinition}
                        />
                      )}
                    />
                  )}
                ></Route>

                <Route
                  path="/query/:queryId"
                  component={(props) => (
                    <InjectFromStore
                      // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
                      // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
                      key={props.params.queryId}
                      id={props.params.queryId}
                      child={(query) => <Query query={query} />}
                      useFunc={useQuery}
                    />
                  )}
                ></Route>

                <Route
                  path="/report/edit/:reportId"
                  component={(props) => (
                    // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
                    // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
                    <InjectFromStore
                      key={props.params.reportId}
                      id={props.params.reportId}
                      useFunc={useReport}
                      child={(report) => (
                        <Report
                          key={props.params.reportId}
                          displayComponent={ReportDisplay}
                          report={report}
                        />
                      )}
                    />
                  )}
                />
                <Route path="/dev-tools" component={DevTools} />
              </NestedRoutes>
            </WithNestedStores>
          )}
        />
      </MainMenu>

      <Route
        path="/report/view/:reportId"
        component={(props) => (
          // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
          // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
          <InjectFromStore
            key={props.params.reportId}
            id={props.params.reportId}
            useFunc={useReport}
            child={(report) => (
              <Report
                key={props.params.reportId}
                displayComponent={ReportDisplay}
                report={report}
                readOnly
              />
            )}
          />
        )}
      />
    </Router>
  );
}

export default App;
