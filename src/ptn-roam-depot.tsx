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
  GetPtnKeyFn,
  OnboardingStatus,
  RoamExtentionAPI,
  PTNSettings,
  SetSettingFn,
} from "./types";

const ROOT_ID = "ptn-roam-depot-root";
const SHARED_HEADERS = { "Content-Type": "application/json" };
const PTN_ROOT = "https://app.phonetonote.com";
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
  getPtnKeyFromSettings: GetPtnKeyFn;
  setSettingFunc: SetSettingFn;
  createSettings: (config: any) => void;
  existingSettings: { [key: string]: any };
}) => {
  console.log("existingSettings", props.existingSettings);

  const {
    getPtnKeyFromSettings,
    setSettingFunc,
    createSettings,
    existingSettings,
  } = props;

  const [onboardingStatus, setOnboardingStatus] =
    React.useState<OnboardingStatus>("START");

  const [ptnKey, setPtnKey] = React.useState<string>();
  const [signInToken, setSignInToken] = React.useState<string>();
  const [settings, setSettings] = React.useState<PTNSettings>(
    existingSettings as PTNSettings
  );

  const panelConfig = {
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
            setSettings({
              ...settings,
              showDashLink: event.currentTarget.checked,
            });
          },
        },
      },
      {
        ...SETTINGS_CONFIG["smartblockTemplate"],
        action: {
          type: "input",
          onChange: (event: React.FormEvent<HTMLInputElement>) => {
            setSettings({
              ...settings,
              smartblockTemplate: event.currentTarget.value,
            });
          },
        },
      },
      {
        ...SETTINGS_CONFIG[HASHTAG_KEY],
        action: {
          type: "input",
          onChange: (event: React.FormEvent<HTMLInputElement>) => {
            setSettings({
              ...settings,
              [HASHTAG_KEY]: cleanHashtag(event.currentTarget.value),
            });
          },
        },
      },
      {
        ...SETTINGS_CONFIG[PARENT_BLOCK_KEY],
        action: {
          type: "input",
          onChange: (event: React.FormEvent<HTMLInputElement>) => {
            setSettings({
              ...settings,
              [PARENT_BLOCK_KEY]: event.currentTarget.value,
            });
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
              setSettings({
                ...settings,
                [id]: event.currentTarget.value,
              });
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
              setSettings({
                ...settings,
                [id]: event.currentTarget.value,
              });
            },
          },
        };
      }),
    ],
  };

  const createUserAndSetPtnKey = async (email: string, roam_id: string) => {
    const headers = { ...SHARED_HEADERS };

    try {
      const response = await fetch("https://app.phonetonote.com/clerk/create", {
        method: "POST",
        mode: "cors",
        headers,
        body: JSON.stringify({ email, roam_id }),
      });

      const json: { ptnKey: string | undefined } = await response.json();
      const newPtnKey = json["ptnKey"];

      if (newPtnKey) {
        setPtnKey(newPtnKey);
        setSettingFunc("ptnKey", newPtnKey);
        setOnboardingStatus("END");
      } else {
        throw new Error("No ptnKey returned from server");
      }
    } catch (e) {
      console.log("Error creating new user:", e);
    }
  };

  const fetchFromDailyNotes = (e: any) => {
    const roamId = getCurrentUserUid();
    if (e?.target?.innerText?.toUpperCase() === "DAILY NOTES") {
      fetchNotes(ptnKey, roamId, settings);
    }
  };

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
    const currentUserUid = getCurrentUserUid();

    if (onboardingStatus === "START") {
      createSettings(panelConfig);
      setSettingFunc("onboardingStatus", "END");

      const existingPtnKeyFromSettings = getPtnKeyFromSettings();
      if (existingPtnKeyFromSettings) {
        setPtnKey(existingPtnKeyFromSettings);
        setOnboardingStatus("END");
      } else {
        setSettingFunc(HASHTAG_KEY, "ptn");
        setSettingFunc(PARENT_BLOCK_KEY, "mobile notes");
        setSettingFunc("showDashLink", true);

        const existingPtnKeyFromScript = ptnKeyFromScript;
        if (existingPtnKeyFromScript) {
          setSettingFunc("ptnKey", existingPtnKeyFromScript);
          updateExistingCustomer(existingPtnKeyFromScript);
          setPtnKey(existingPtnKeyFromScript);
          setOnboardingStatus("END");
        } else {
          const currentUserEmail = getCurrentUserEmail();
          createUserAndSetPtnKey(currentUserEmail, currentUserUid);
        }
      }
    } else if (onboardingStatus === "END") {
      if (!ptnKey) {
        alert("error getting ptnKey, please contact support@phonetonote.com");
      } else {
        fetchNotes(ptnKey, currentUserUid, settings);

        document.addEventListener("click", fetchFromDailyNotes);

        const intervalId = window.setInterval(
          () => fetchNotes(ptnKey, currentUserUid, settings),
          1000 * 60
        );

        return () => {
          document.removeEventListener("click", fetchFromDailyNotes);
          window.clearInterval(intervalId);
        };
      }
    }
  }, [onboardingStatus]);

  return signInToken ? (
    settings?.showDashLink ? (
      <a
        href={`https://dashboard.phonetonote.com/welcome?token=${signInToken}`}
        className="log-button"
        target={"_blank"}
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

    ReactDOM.render(
      <Singleton
        getPtnKeyFromSettings={() => extensionAPI.settings.get("ptnKey")}
        setSettingFunc={extensionAPI.settings.set}
        createSettings={extensionAPI.settings.panel.create}
        existingSettings={extensionAPI.settings.getAll()}
      />,
      ptnRoot
    );
  },
  onunload: () => {
    const ptnRoot = document.getElementById(ROOT_ID);
    ReactDOM.unmountComponentAtNode(ptnRoot);
    ptnRoot.remove();
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
