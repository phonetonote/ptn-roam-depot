// import { fetchNotes, roamKey } from "../fetch-notes";
// import { configure, configValues } from "../configure";
// import Bugsnag from "@bugsnag/js";

export default {
  onload: () => {
    console.log("ptn log onload");
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
