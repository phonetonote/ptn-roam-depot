import React from "react";
import ReactDOM from "react-dom";
import getCurrentUserEmail from "roamjs-components/queries/getCurrentUserEmail";
import getCurrentUserUid from "roamjs-components/queries/getCurrentUserUid";
import {
  HASHTAG_KEY,
  PARENT_BLOCK_KEY,
  SCRIPT_ID,
  SETTINGS_CONFIG,
  inputTypes,
} from "./constants";
import { fetchNotes } from "./fetch-notes";
import {
  GetKeyFn,
  SetSettingFn,
  PTNSettings,
  RoamExtentionAPI,
  PTNDefaultSettings,
} from "./types";

const ROOT_ID = "ptn-roam-depot-root";
const SHARED_HEADERS = { "Content-Type": "application/json" };
const PTN_ROOT = "https://app.phonetonote.com";
const DEFAULT_SETTINGS: Pick<PTNSettings, PTNDefaultSettings> = {
  [HASHTAG_KEY]: "ptn",
  [PARENT_BLOCK_KEY]: "mobile notes",
  ["showDashLink"]: true,
};

const scriptData = document.getElementById(SCRIPT_ID)?.dataset;
const ptnKeyFromScript = scriptData?.ptn_key || scriptData?.roam_key;

const updateExistingCustomer = async (ptnKey: string) => {
  await fetch(`${PTN_ROOT}/customers/update`, {
    method: "POST",
    mode: "cors",
    headers: { ...SHARED_HEADERS, "x-ptn-key": ptnKey },
  });
};

const getSignInToken = async (ptnKey: string): Promise<string> => {
  return fetch(`${PTN_ROOT}/customers/sign_in_token.json`, {
    method: "POST",
    mode: "cors",
    headers: { ...SHARED_HEADERS, "x-ptn-key": ptnKey },
    body: JSON.stringify({
      ptnKeyJSON: JSON.stringify(ptnKey),
    }),
  })
    .then((res) => res.json())
    .then((res) => res.token)
    .catch(() => undefined);
};

const cleanHashtag = (hashtag: string): string => {
  if (hashtag.indexOf("#") === 0) {
    return hashtag.substring(1);
  }

  return hashtag;
};

const Singleton = (props: {
  extensionAPI: {
    settings: {
      get: GetKeyFn;
      set: SetSettingFn;
      getAll: () => { [key: string]: any };
      panel: {
        create: (config: { [key: string]: any }) => void;
      };
    };
  };
}) => {
  const { extensionAPI } = props;

  const [ptnKey, setPtnKey] = React.useState<string>();
  const [signInToken, setSignInToken] = React.useState<string>();
  const [liveSettings, setLiveSettings] = React.useState<PTNSettings>({
    ...DEFAULT_SETTINGS,
    ...extensionAPI.settings.getAll(),
  } as PTNSettings);

  const [clerkIdFromRoam, setClerkIdFromRoam] = React.useState<string>();

  const setSignInTokenAsync = async (ptnKey: string) => {
    if (ptnKey) {
      const newSignInToken = await getSignInToken(ptnKey);
      if (newSignInToken) {
        setSignInToken(newSignInToken);
      }
    }
  };

  React.useEffect(() => {
    setSignInTokenAsync(ptnKey);
  }, [ptnKey]);

  React.useEffect(() => {
    if (!extensionAPI) {
      return;
    } else {
      extensionAPI.settings.panel.create({
        tabTitle: "phonetonote",
        settings: [
          {
            ...SETTINGS_CONFIG["ptnKey"],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                setPtnKey(event.currentTarget.value);
              },
            },
          },
          {
            ...SETTINGS_CONFIG["showDashLink"],
            action: {
              type: "switch",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                setLiveSettings((myLiveSettings) => ({
                  ...myLiveSettings,
                  showDashLink: event.currentTarget.checked,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG["smartblockTemplate"],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  smartblockTemplate: event.currentTarget.value,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG[HASHTAG_KEY],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                const e = event.currentTarget;
                let updatedValue = {};
                updatedValue = { [HASHTAG_KEY]: cleanHashtag(e.value) };

                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  ...updatedValue,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG[PARENT_BLOCK_KEY],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  [PARENT_BLOCK_KEY]: event.currentTarget.value,
                }));
              },
            },
          },
          ...inputTypes.map((inputType) => {
            const id = `${inputType}Hashtag`;
            return {
              name: `${inputType} hashtag`,
              type: "text",
              description: `hashtag for messages sent via ${inputType}, will over ride global hashtag setting.`,
              id,
              action: {
                type: "input",
                onChange: (event: React.FormEvent<HTMLInputElement>) => {
                  setLiveSettings((liveSettings) => ({
                    ...liveSettings,
                    [id]: event.currentTarget.value,
                  }));
                },
              },
            };
          }),
          ...inputTypes.map((inputType) => {
            const id = `${inputType}ParentBlock`;

            return {
              name: `${inputType} parent block`,
              type: "text",
              description: `name of the parent block for messages sent via ${inputType}, will over ride global parent block title setting.`,
              id,
              action: {
                type: "input",
                onChange: (event: React.FormEvent<HTMLInputElement>) => {
                  setLiveSettings((liveSettings) => ({
                    ...liveSettings,
                    [id]: event.currentTarget.value,
                  }));
                },
              },
            };
          }),
        ],
      });

      const existingPtnKeyFromSettings = extensionAPI.settings.get("ptnKey");
      if (existingPtnKeyFromSettings) {
        setPtnKey(existingPtnKeyFromSettings);
      } else {
        const existingPtnKeyFromScript = ptnKeyFromScript;
        if (existingPtnKeyFromScript) {
          extensionAPI.settings.set("ptnKey", existingPtnKeyFromScript);
          updateExistingCustomer(existingPtnKeyFromScript);
          setPtnKey(existingPtnKeyFromScript);
        } else {
          const createUserAndSetPtnKey = async (
            email: string,
            roam_id: string
          ) => {
            const headers = { ...SHARED_HEADERS };

            try {
              const response = await fetch(
                "https://app.phonetonote.com/clerk/create",
                {
                  method: "POST",
                  mode: "cors",
                  headers,
                  body: JSON.stringify({ email, roam_id }),
                }
              );

              const {
                ptnKey: newPtnKey,
                clerkId: newClerkId,
              }: { ptnKey: string | undefined; clerkId: string | undefined } =
                await response.json();

              if (newPtnKey && newClerkId) {
                setClerkIdFromRoam(newClerkId);
                extensionAPI.settings.set("ptnKey", newPtnKey);
                setPtnKey(newPtnKey);
              } else {
                throw new Error("No ptnKey returned from server");
              }
            } catch (e) {
              console.log("Error creating new user:", e);
            }
          };

          createUserAndSetPtnKey(getCurrentUserEmail(), getCurrentUserUid());
        }
      }
    }
  }, [extensionAPI]);

  React.useEffect(() => {
    if (ptnKey && ptnKey.length > 0) {
      const fetchFreshNotes = (e: any) => {
        if (!e || e?.target?.innerText?.toUpperCase() === "DAILY NOTES") {
          fetchNotes(ptnKey, getCurrentUserUid(), liveSettings);
        }
      };

      document.addEventListener("click", fetchFreshNotes);
      const intervalId = window.setInterval(fetchFreshNotes, 1000 * 90);

      return () => {
        document.removeEventListener("click", fetchFreshNotes);
        window.clearInterval(intervalId);
      };
    }
  }, [liveSettings, ptnKey]);

  return signInToken ? (
    !Object.keys(liveSettings).includes("showDashLink") ||
    liveSettings?.showDashLink ? (
      <a
        href={`https://dashboard.phonetonote.com/welcome?token=${signInToken}&clerkIdFromRoam=${
          clerkIdFromRoam || "null"
        }`}
        className="log-button"
        target={"_blank"}
        rel="noreferrer"
      >
        <span className="bp3-icon bp3-icon-mobile-phone icon"></span>
        ptn dash ↗
      </a>
    ) : (
      <> </>
    )
  ) : (
    <span style={{ color: "white", marginLeft: "20px" }}>ptn is loading</span>
  );
};

export default {
  onload: ({ extensionAPI }: RoamExtentionAPI) => {
    const container = document.getElementsByClassName(
      "roam-sidebar-content"
    )[0];
    const ptnRoot = document.createElement("div");
    ptnRoot.id = `${ROOT_ID}`;

    const existingButtons = container.getElementsByClassName("log-button");
    const lastExistingButton = existingButtons[existingButtons.length - 1];
    container.insertBefore(ptnRoot, lastExistingButton);

    ReactDOM.render(<Singleton extensionAPI={extensionAPI} />, ptnRoot);
  },
  onunload: () => {
    const ptnRoot = document.getElementById(ROOT_ID);
    ReactDOM.unmountComponentAtNode(ptnRoot);
    ptnRoot.remove();
  },
};
