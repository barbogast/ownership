import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "Features",
    nextStep: "stepImport",
    component: () => (
      <div>
        <ul>
          <li>In-browser</li>
          <li>Serverless</li>
          <li>Offline-first</li>
          <li>Decentralized</li>
          <li>Structured</li>
        </ul>
        <h1>Data Exploration Platform</h1>
        No lock-in
        <ul>
          <li>Export your data at every step</li>
          <li>
            ... or access the raw data / configuration in the git repository
          </li>
        </ul>
        Client-side
        <ul>
          <li>No server required, having a browser is enough</li>
        </ul>
        Decentralized
        <ul>
          <li>Building on the decentralized nature of git / Github</li>
          <li>Just fork the repository and continue on your own</li>
        </ul>
        Platform agnostic
        <ul>
          <li>Executable in browser or on NodeJS</li>
          <li>Embeddable in other websites</li>
        </ul>
        Framework agnostic
        <ul>
          <li>
            Preferring configuration over code (but allowing both) allows you to
            replace parts or the whole stack
          </li>
          <li>
            while optionally allowing custom code whenever the configuration is
            not flexible enough
          </li>
        </ul>
        Reproducable
        <ul>
          <li>
            Each step (data generation, selection, transformation and rendering)
            is available to insepct and verify
          </li>
        </ul>
        Collaborative / Modifiable
        <ul>
          <li>
            Everybody viewer can immediately start to modify the data and charts
          </li>
        </ul>
        Flexible
        <ul>
          <li>Enter your data as CSV, or generate it by runnging a script</li>
          <li>Select your data with SQL or by pivoting</li>
          <li>Optionally transform the data with code</li>
          <li>Display as various chart types</li>
        </ul>
        Open source
      </div>
    ),
  };

  return step;
};

export default getStep;
