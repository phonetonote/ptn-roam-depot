import { createConfigObserver } from "roamjs-components/components/ConfigPage";
import getSettingValueFromTree from "roamjs-components/util/getSettingValueFromTree";

import {
  CONFIG,
  DEFAULT_HASHTAG,
  HASHTAG_KEY,
  PARENT_BLOCK_KEY,
} from "./constants";
import { getTreeByPageName } from "roam-client";

const getHashtag = (): string => {
  return getSettingValueFromTree({
    key: "hashtag",
    defaultValue: DEFAULT_HASHTAG,
    tree: getTreeByPageName(CONFIG),
  });
};

const indexingEnabled = (): boolean => {
  return false;
};

const hashtagFromConfig = (): string => {
  let hashtag = getHashtag();

  if (hashtag.indexOf("#") === 0) {
    hashtag = hashtag.substring(1);
  }

  return hashtag && typeof hashtag === "string" && hashtag.length > 0
    ? hashtag
    : "";
};

const templateFromConfig = (): string => {
  return getSettingValueFromTree({
    key: "smartblock template",
    defaultValue: "",
    tree: getTreeByPageName(CONFIG),
  });
};

export const configValues = {
  indexingEnabled: indexingEnabled(),
  hashtag: hashtagFromConfig(),
  smartblockTemplate: templateFromConfig(),
};

export const inputTypes = [
  "sms",
  "facebook",
  "alfred",
  "telegram",
  "zapier",
  "email",
];

let fields: any[] = [];
fields = fields.concat([
  {
    type: "text",
    title: "smartblock template",
    description:
      "((BETA FEATURE)) pass each phonetonote message to the smartblock of your choice. use this to let smartblocks handle rendering your mobile notes for more customizability.",
    defaultValue: "",
  },
  {
    type: "text",
    title: `${HASHTAG_KEY}`,
    description:
      "if you want  #hashtag at the end of each phonetoroam note, put what you want that hashtag to be here. if you do not want a hashtag, make this blank.",
    defaultValue: DEFAULT_HASHTAG,
  },
  {
    type: "text",
    title: `${PARENT_BLOCK_KEY}`,
    description:
      "if you want your phonetoroam notes nested under a block, give that block a name here. if you do not want them nested under anything, leave this blank.",
    defaultValue: "phonetoroam notes",
  },
]);

fields = fields.concat(
  inputTypes.map((inputType) => {
    return {
      type: "text",
      title: `${inputType} ${HASHTAG_KEY}`,
      description: `hashtag for messages sent via ${inputType}, will over ride global hashtag setting.`,
    };
  })
);

fields = fields.concat(
  inputTypes.map((inputType) => {
    return {
      type: "text",
      title: `${inputType} ${PARENT_BLOCK_KEY}`,
      description: `name of the parent block for messages sent via ${inputType}, will over ride global parent block title setting.`,
    };
  })
);

export const configure = () => {
  createConfigObserver({
    title: CONFIG,
    config: {
      tabs: [
        {
          id: "home",
          fields,
        },
      ],
    },
  });
};
