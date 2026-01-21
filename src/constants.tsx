import { InputType, PTNDefaultSettings, PTNSettings } from "./types";

export const SERVER_URL = "https://app.phonetonote.com";
export const MEDIA_URL = "https://ptn-telegram-attachments.ptn.computer/";
export const PARENT_BLOCK_KEY = "parentBlockTitle";
export const PARENT_BLOCK_TITLE = "parent block title";
export const HASHTAG_KEY = "hashtag";
export const HASHTAG_TITLE = "hashtag";
export const SCRIPT_ID = "phone-to-roam-script";

export const inputTypes: InputType[] = ["sms", "facebook", "alfred", "telegram", "zapier", "email"];

export const BRING_YOUR_OWN_PTN_KEY = "BRING_YOUR_OWN_PTN_KEY";

export const SETTINGS_CONFIG = {
  ptnKey: {
    name: "ptn key",
    description: "your ptn key, used to tie your phonetonote account to roam",
    id: "ptnKey",
  },
  smartblockTemplate: {
    name: "smartblock template",
    description:
      "((BETA FEATURE)) pass each phonetonote message to the smartblock of your choice. use this to let smartblocks handle rendering your mobile notes for more customizability.",
    id: "smartblockTemplate",
  },
  [HASHTAG_KEY]: {
    name: HASHTAG_TITLE,
    description:
      "if you want  #hashtag at the end of each ptn note, put what you want that hashtag to be here. if you do not want a hashtag, make this blank.",
    id: HASHTAG_KEY,
  },
  [PARENT_BLOCK_KEY]: {
    name: PARENT_BLOCK_TITLE,
    description:
      "if you want your ptn notes nested under a block, give that block a name here. if you do not want them nested under anything, leave this blank.",
    id: PARENT_BLOCK_KEY,
  },
  ["showDashLink"]: {
    name: "show link to ptn dashboard in left nav",
    description: "the ptn dashboard is available at https://dashboard.phonetonote.com . enabling this setting adds a link to it in the roam sidebar.",
    id: "showDashLink",
  },
};

export const ROOT_ID = "ptn-roam-depot-root";
export const SHARED_HEADERS = { "Content-Type": "application/json" };
export const DEFAULT_SETTINGS: Pick<PTNSettings, PTNDefaultSettings> = {
  [HASHTAG_KEY]: "",
  [PARENT_BLOCK_KEY]: "mobile notes",
  ["showDashLink"]: true,
};

export const SHARED_FETCH_PARAMS: {
  method: string;
  mode: RequestMode;
} = {
  method: "POST",
  mode: "cors",
};

export const MD_IMAGE_REGEX = /!\[\]\((.*)\)/g;
