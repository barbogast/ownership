import { Route, Router } from "wouter";

import CreateDatabase from "./CreateDatebase";
import Ownership from "./ownership/Index";
import MainMenu from "./MainMenu";
import Query from "./query/Query";
import Report from "./report/Report";
import DatabaseDisplay from "./DatabaseDisplay";
import Projects from "./Projects";
import { getBasePath } from "./utils";

function App() {
  return (
    <Router base={getBasePath()}>
      <MainMenu>
        <Route path="/" component={Projects}></Route>
        <Route path="/ownership" component={Ownership} />
        <Route path="/new-database" component={CreateDatabase}></Route>
        <Route path="/db/:fileName" component={DatabaseDisplay}></Route>
        <Route
          path="/query/:queryId"
          component={(props) => (
            // Setting the 'key' prop makes sure that React actually mounts a new component when queryId changes.
            // Otherwise it would just update the previous component, and local state (like collapsible state, ...) would not be reset.
            <Query {...props} key={props.params.queryId} />
          )}
        ></Route>
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
