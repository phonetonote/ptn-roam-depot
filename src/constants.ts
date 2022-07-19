import { InputType } from "./types";

export const SERVER_URL = "https://app.phonetoroam.com";
export const ID = "ptr";
export const CONFIG = `roam/js/${ID}`;
export const PARENT_BLOCK_KEY = "parentBlockTitle";
export const PARENT_BLOCK_TITLE = "parent block title";
export const HASHTAG_KEY = "hashtag";
export const HASHTAG_TITLE = "hashtag";
export const SCRIPT_ID = "phone-to-roam-script";

export const inputTypes: InputType[] = [
  "sms",
  "facebook",
  "alfred",
  "telegram",
  "zapier",
  "email",
];

export const SETTINGS_CONFIG = {
  ptnKey: {
    type: "text",
    name: "ptn key",
    description: "your ptn key, used to tie your phonetonote account to roam",
    id: "ptnKey",
  },
  smartblockTemplate: {
    name: "smartblock template",
    type: "text",
    description:
      "((BETA FEATURE)) pass each phonetonote message to the smartblock of your choice. use this to let smartblocks handle rendering your mobile notes for more customizability.",
    id: "smartblockTemplate",
  },
  [HASHTAG_KEY]: {
    name: HASHTAG_TITLE,
    type: "text",
    description:
      "if you want  #hashtag at the end of each phonetoroam note, put what you want that hashtag to be here. if you do not want a hashtag, make this blank.",
    id: HASHTAG_KEY,
  },
  [PARENT_BLOCK_KEY]: {
    name: PARENT_BLOCK_TITLE,
    type: "text",
    description:
      "if you want your phonetoroam notes nested under a block, give that block a name here. if you do not want them nested under anything, leave this blank.",
    id: PARENT_BLOCK_KEY,
  },
  ["showDashLink"]: {
    name: "show link to ptn dashboard in left nav",
    type: "boolean",
    id: "showDashLink",
  },
};
