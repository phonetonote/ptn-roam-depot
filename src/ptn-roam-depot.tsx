// import { fetchNotes, roamKey } from "../fetch-notes";
// import { configure, configValues } from "../configure";
// import Bugsnag from "@bugsnag/js";
import React from "react";
import ReactDOM from "react-dom";
import { roamKey } from "./index-pages";

const ROOT_ID = "ptn-roam-depot-root";

type PTNStatus =
  | "WAITING"
  | "TIME_TO_LOOK_FOR_EXISTING_PTN_KEY"
  | "TIME_TO_MAYBE_SEND_PTN_KEY_TO_BACKEND";

type GetSettingFn = (key: string) => string | undefined;
type SetSettingFn = (key: string, value: string) => void;

type RoamExtentionAPI = {
  extensionAPI: {
    settings: {
      get: GetSettingFn;
      set: (key: string, value: string) => void;
      getAll: () => { [key: string]: string };
      panel: {
        create: (config: any) => void;
      };
    };
  };
};

const Singleton = (props: {
  getSettingFn: GetSettingFn;
  setSettingFn: SetSettingFn;
}) => {
  const { setSettingFn, getSettingFn } = props;
  const [count, setCount] = React.useState(0);

  const [status, setStatus] = React.useState<PTNStatus>("WAITING");
  const [ptnKey, setPtnKey] = React.useState<string>();

  React.useEffect(() => {
    const existingPtnKeyFromSettings = getSettingFn("ptnKey");
    console.log("existingPtnKeyFromSettings", existingPtnKeyFromSettings);
    setStatus("TIME_TO_LOOK_FOR_EXISTING_PTN_KEY");
  }, []);

  React.useEffect(() => {
    if (status === "TIME_TO_LOOK_FOR_EXISTING_PTN_KEY") {
      console.log("TIME_TO_LOOK_FOR_EXISTING_PTN_KEY");

      const existingPtnKeyFromScript = roamKey;

      setSettingFn("ptnKey", existingPtnKeyFromScript);
      setPtnKey(existingPtnKeyFromScript);

      setStatus("TIME_TO_MAYBE_SEND_PTN_KEY_TO_BACKEND");
    }
  }, [status]);

  return (
    <div>
      <h1>Hello, clicked the button {count} times</h1>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
};

const panelConfig = {
  tabTitle: "phonetonote",
  settings: [
    {
      name: "ptn key",
      id: "ptnKey",
      description: "your ptn key, used to tie your phonetonote account to roam",
      action: {
        type: "input",
        placeholder: "...",
      },
    },
  ],
};

export default {
  onload: ({ extensionAPI }: RoamExtentionAPI) => {
    console.log("ptn log onload");
    console.log(extensionAPI);
    extensionAPI.settings.panel.create(panelConfig);
    const container = document.getElementsByClassName(
      "roam-sidebar-content"
    )[0];
    const ptnRoot = document.createElement("span");
    ptnRoot.id = `${ROOT_ID}`;
    container.insertBefore(ptnRoot, container.firstChild);
    ReactDOM.render(
      <Singleton
        getSettingFn={extensionAPI.settings.get}
        setSettingFn={extensionAPI.settings.set}
      />,
      ptnRoot
    );
    // Bugsnag.start({ apiKey: "0ca67498b27bd9e3fba038f7fb0cd0b4" });

    // if (roamKey) {
    //   Bugsnag.setUser(roamKey, undefined, undefined);
    // }

    // configure();
    // fetchNotes();

    // document.addEventListener("click", (e: any) => {
    //   if (e?.target?.innerText?.toUpperCase() === "DAILY NOTES") {
    //     fetchNotes();
    //   }
    // });

    // window.setInterval(() => fetchNotes(), 1000 * 60);
  },
  onunload: () => {
    const ptnRoot = document.getElementById(ROOT_ID);
    console.log("ptnRoot", ptnRoot);
    ReactDOM.unmountComponentAtNode(ptnRoot);
    ptnRoot.remove();

    console.log("ptn log onunload");
  },
};

// #TODO move to this once it works
// export default runExtension({
//   roamMarketplace: true,
//   extensionId: "ptn-roam-depot",
//   run: () => {
//     console.log("ptn log onload");
//   },
//   unload: () => {
//     console.log("ptn log onunload");
//   },
// });
