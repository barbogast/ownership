import { Route, Router } from "wouter";
import { useLocationProperty, navigate } from "wouter/use-location";

import CreateDatabase from "./CreateDatebase";
import Ownership from "./ownership/Index";
import MainMenu from "./MainMenu";
import { Db } from "./Db";
import Query from "./query/Query";
import Report from "./report/Report";

function App() {
  // returns the current hash location in a normalized form
  // (excluding the leading '#' symbol)
  const hashLocation = () => window.location.hash.replace(/^#/, "") || "/";

  const hashNavigate = (to: string) => navigate("#" + to);

  const useHashLocation = (): [string, (to: string) => void] => {
    const location = useLocationProperty(hashLocation);
    return [location, hashNavigate];
  };

  return (
    <Router hook={useHashLocation} base="/ownership">
      <Db>
        <Route path="/">
          <MainMenu />
        </Route>
        <Route
          path="/ownership"
          component={() => (
            <MainMenu>
              <Ownership />
            </MainMenu>
          )}
        />
        <Route
          path="/new-database"
          component={() => (
            <MainMenu>
              <CreateDatabase />
            </MainMenu>
          )}
        ></Route>

        <Route
          path="/query/:queryId"
          component={(props) => (
            // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
            // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
            <MainMenu>
              <Query {...props} key={props.params.queryId} />
            </MainMenu>
          )}
        ></Route>

        <Route
          path="/report/edit/:reportId"
          component={(props) => (
            // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
            // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
            <MainMenu>
              <Report
                reportId={props.params.reportId}
                key={props.params.reportId}
              />
            </MainMenu>
          )}
        />

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
      </Db>
    </Router>
  );
}

export default App;
