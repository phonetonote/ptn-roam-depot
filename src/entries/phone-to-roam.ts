import { fetchNotes, roamKey } from "../fetch-notes";
import { configure, configValues } from "../configure";
import Bugsnag from "@bugsnag/js";

Bugsnag.start({ apiKey: "0ca67498b27bd9e3fba038f7fb0cd0b4" });
if (roamKey) {
  Bugsnag.setUser(roamKey, undefined, undefined);
}

configure();
fetchNotes();

document.addEventListener("click", (e: any) => {
  if (e?.target?.innerText?.toUpperCase() === "DAILY NOTES") {
    fetchNotes();
  }
});

window.setInterval(() => fetchNotes(), 1000 * 60);
