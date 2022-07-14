// import { fetchNotes, roamKey } from "../fetch-notes";
// import { configure, configValues } from "../configure";
// import Bugsnag from "@bugsnag/js";
import React from "react";
import ReactDOM from "react-dom";

const ROOT_ID = "ptn-roam-depot-root";

const Singleton = (props: { name: string }) => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>
        Hello, {props.name} clicked the button {count} times
      </h1>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
};

export default {
  onload: () => {
    console.log("ptn log onload");
    const container = document.getElementsByClassName(
      "roam-sidebar-content"
    )[0];
    const ptnRoot = document.createElement("span");
    ptnRoot.id = `${ROOT_ID}`;
    container.insertBefore(ptnRoot, container.firstChild);
    ReactDOM.render(<Singleton name={"foo"} />, ptnRoot);
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
