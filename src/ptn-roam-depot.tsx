import React from "react";
import ReactDOM from "react-dom";
import getCurrentUserEmail from "roamjs-components/queries/getCurrentUserEmail";
import { render as renderToast } from "roamjs-components/components/Toast";
import getCurrentUserUid from "roamjs-components/queries/getCurrentUserUid";
import { render as renderOnboardingAlert } from "./components/onboarding-alert";
import { useDebounce } from "@react-hook/debounce";
import {
  HASHTAG_KEY,
  PARENT_BLOCK_KEY,
  SCRIPT_ID,
  SETTINGS_CONFIG,
  inputTypes,
  BRING_YOUR_OWN_PTN_KEY,
  DEFAULT_SETTINGS,
  PTN_ROOT,
  ROOT_ID,
  SHARED_HEADERS,
  SHARED_FETCH_PARAMS,
} from "./constants";
import { fetchNotes } from "./fetch-notes";
import { PTNSettings, RoamExtentionAPI, SingletonProps } from "./types";
import { Intent, Spinner, SpinnerSize } from "@blueprintjs/core";

const scriptData = document.getElementById(SCRIPT_ID)?.dataset;
const ptnKeyFromScript = scriptData?.ptn_key || scriptData?.roam_key;

const updateExistingCustomer = async (ptnKey: string) =>
  await fetch(`${PTN_ROOT}/customers/update`, {
    ...SHARED_FETCH_PARAMS,
    headers: { ...SHARED_HEADERS, "x-ptn-key": ptnKey },
  });

const getSignInToken = async (ptnKey: string): Promise<string> =>
  fetch(`${PTN_ROOT}/customers/sign_in_token.json`, {
    ...SHARED_FETCH_PARAMS,
    headers: { ...SHARED_HEADERS, "x-ptn-key": ptnKey },
    body: JSON.stringify({
      ptnKeyJSON: JSON.stringify(ptnKey),
    }),
  })
    .then((res) => res.json())
    .then((res) => res.token)
    .catch(() => undefined);

const cleanHashtag = (hashtag: string): string =>
  hashtag.indexOf("#") === 0 ? hashtag.substring(1) : hashtag;

const Singleton = ({ extensionAPI }: SingletonProps) => {
  const [existingPtnKeyFromSettings, existingSettings] = React.useMemo(() => {
    return [extensionAPI.settings.get("ptnKey"), extensionAPI.settings.getAll()];
  }, [extensionAPI.settings]);

  const [ptnKey, setPtnKeyDebounced, setPtnKey] = useDebounce(undefined, 500);
  const [existingPtnKey, setExistingPtnKey] = React.useState<string>();
  const [signInToken, setSignInToken] = React.useState<string>();
  const [clerkIdFromRoam, setClerkIdFromRoam] = React.useState<string>();
  const [liveSettings, setLiveSettings] = React.useState<PTNSettings>({
    ...DEFAULT_SETTINGS,
    ...existingSettings,
  } as PTNSettings);

  const setSignInTokenAsync = async (ptnKey: string) =>
    setSignInToken(await getSignInToken(ptnKey));

  React.useEffect(() => {
    if (existingPtnKeyFromSettings) {
      setExistingPtnKey(existingPtnKeyFromSettings);
    } else if (ptnKeyFromScript) {
      setExistingPtnKey(ptnKeyFromScript);
      updateExistingCustomer(ptnKeyFromScript);
    } else {
      const createUserAndSetPtnKey = async (email: string, roam_id: string) => {
        try {
          const response = await fetch("https://app.phonetonote.com/clerk/create", {
            method: "POST",
            mode: "cors",
            headers: { ...SHARED_HEADERS },
            body: JSON.stringify({ email, roam_id }),
          });

          const {
            ptnKey: newPtnKey,
            clerkId: newClerkId,
          }: {
            ptnKey: string | undefined;
            clerkId: string | undefined;
          } = await response.json();

          if (newPtnKey && newClerkId) {
            setClerkIdFromRoam(newClerkId);
            setExistingPtnKey(newPtnKey);
          } else {
            throw new Error("No ptnKey returned from server");
          }
        } catch (e) {
          console.log("Error creating new user:", e);
        }
      };

      renderOnboardingAlert({
        onConfirm: () => {
          createUserAndSetPtnKey(getCurrentUserEmail(), getCurrentUserUid()).then(() => {
            renderToast({
              id: "NEW_PTN_KEY_CREATED",
              content:
                "🙌 new ptn key created, thanks for joining phonetonote. click the ptn dash link in the left sidebar to get started",
              intent: Intent.SUCCESS,
            });
          });
        },
        onCancel: () => {
          renderToast({
            id: BRING_YOUR_OWN_PTN_KEY,
            content: "👍 please add your ptn key in roam's phonetonote extension settings",
            intent: Intent.SUCCESS,
          });
          setExistingPtnKey(BRING_YOUR_OWN_PTN_KEY);
        },
      });
    }
  }, [existingPtnKeyFromSettings]);

  React.useEffect(() => {
    if (!extensionAPI || !existingPtnKey || !setPtnKey || !setPtnKeyDebounced) {
      return;
    } else {
      if (existingPtnKey !== BRING_YOUR_OWN_PTN_KEY) {
        extensionAPI.settings.set("ptnKey", existingPtnKey);
      }
      extensionAPI.settings.panel.create({
        tabTitle: "phonetonote",
        settings: [
          {
            ...SETTINGS_CONFIG["ptnKey"],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                setPtnKeyDebounced(event.currentTarget.value);
              },
            },
          },
          {
            ...SETTINGS_CONFIG["showDashLink"],
            action: {
              type: "switch",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                const newObj = {
                  ["showDashLink"]: !!event?.currentTarget?.checked,
                };
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  ...newObj,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG["smartblockTemplate"],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                const newObj = {
                  smartblockTemplate: event?.currentTarget?.value,
                };
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  ...newObj,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG[HASHTAG_KEY],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                const newObj = {
                  [HASHTAG_KEY]: cleanHashtag(event?.currentTarget?.value),
                };
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  ...newObj,
                }));
              },
            },
          },
          {
            ...SETTINGS_CONFIG[PARENT_BLOCK_KEY],
            action: {
              type: "input",
              onChange: (event: React.FormEvent<HTMLInputElement>) => {
                const newObj = {
                  [PARENT_BLOCK_KEY]: event?.currentTarget?.value,
                };
                setLiveSettings((liveSettings) => ({
                  ...liveSettings,
                  ...newObj,
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
                  const newObj = { [id]: event?.currentTarget?.value };
                  setLiveSettings((liveSettings) => ({
                    ...liveSettings,
                    ...newObj,
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
                  const newObj = { [id]: event?.currentTarget?.value };
                  setLiveSettings((liveSettings) => ({
                    ...liveSettings,
                    ...newObj,
                  }));
                },
              },
            };
          }),
        ],
      });

      setPtnKey(existingPtnKey);
    }
  }, [extensionAPI, existingPtnKey, setPtnKey, setPtnKeyDebounced]);

  React.useEffect(() => {
    if (ptnKey && liveSettings) {
      const fetchFreshNotes = (e: PointerEvent | undefined) => {
        // e is undefined when being fired from setInterval
        // otherwise it is a pointer event with an HTML target,
        // we fetch notes when the target is the the DAILY NOTES button
        if (!e || (e?.target as HTMLElement)?.innerText?.toUpperCase() === "DAILY NOTES") {
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

  React.useEffect(() => {
    if (ptnKey && ptnKey !== BRING_YOUR_OWN_PTN_KEY) {
      setSignInTokenAsync(ptnKey);
    }
  }, [ptnKey]);

  const clerkIdFromRoamString = clerkIdFromRoam || "null";
  const welcomeUrl = `welcome?token=${signInToken}&clerkIdFromRoam=${clerkIdFromRoamString}`;
  const urlFragment = ptnKey === BRING_YOUR_OWN_PTN_KEY ? "" : welcomeUrl;
  const ptnDashLink = `https://dashboard.phonetonote.com/${urlFragment}`;

  const noSettings = !Object.keys(liveSettings).includes("showDashLink");
  const dashLinkEnabled = liveSettings?.showDashLink;
  const ptnLinkIsAvailable = signInToken || ptnKey === BRING_YOUR_OWN_PTN_KEY;

  return ptnLinkIsAvailable ? (
    noSettings || dashLinkEnabled ? (
      <a href={ptnDashLink} className="log-button" target={"_blank"} rel="noreferrer">
        <span className="bp3-icon bp3-icon-mobile-phone icon"></span>
        ptn dash ↗
      </a>
    ) : (
      <> </>
    )
  ) : (
    <Spinner aria-label={"ptn is loading..."} intent={Intent.SUCCESS} size={SpinnerSize.SMALL} />
  );
};

export default {
  onload: ({ extensionAPI }: RoamExtentionAPI) => {
    const container = document.getElementsByClassName("roam-sidebar-content")[0];
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
