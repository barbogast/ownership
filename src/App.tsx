import { Route, Router } from "wouter";

import CreateDatabase from "./CreateDatebase";
import Ownership from "./ownership/Index";
import MainMenu from "./MainMenu";
import Query from "./query/Query";
import Report from "./report/Report";
import DatabaseDisplay from "./DatabaseDisplay";
import RepositoryList from "./repository/RepositoryList";
import NestedRoutes from "./NestedRoutes";
import WithNestedStores from "./nestedStorage/WithNestedStores";

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
                <Route path="/new-database" component={CreateDatabase}></Route>
                <Route path="/db/:name" component={DatabaseDisplay}></Route>

                <Route
                  path="/query/:queryId"
                  component={(props) => (
                    // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
                    // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
                    <Query {...props} key={props.params.queryId} />
                  )}
                ></Route>
              </NestedRoutes>
            </WithNestedStores>
          )}
        />

        <Route
          path="/report/edit/:reportId"
          component={(props) => (
            // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
            // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
            <Report
              reportId={props.params.reportId}
              key={props.params.reportId}
            />
          )}
        />
      </MainMenu>

      <Route
        path="/report/view/:reportId"
        component={(props) => (
          // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
          // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
          <Report
            reportId={props.params.reportId}
            readOnly
            key={props.params.reportId}
          />
        )}
      />
    </Router>
  );
}

export default App;
