import { getTreeByPageName } from "roam-client";
import getSettingValueFromTree from "roamjs-components/util/getSettingValueFromTree";
import { inputTypes } from "./configure";
import { CONFIG, HASHTAG_KEY, PARENT_BLOCK_KEY } from "./constants";

const parentBlock = getSettingValueFromTree({
  key: PARENT_BLOCK_KEY,
  tree: getTreeByPageName(CONFIG),
});

type SenderType = typeof inputTypes[number];

export const parentBlockFromSenderType = (senderType: SenderType) => {
  return (
    getSettingValueFromTree({
      key: `${senderType} ${PARENT_BLOCK_KEY}`,
      tree: getTreeByPageName(CONFIG),
    }) || parentBlock
  );
};

export const hashtagFromSenderType = (senderType: SenderType) => {
  return getSettingValueFromTree({
    key: `${senderType} ${HASHTAG_KEY}`,
    tree: getTreeByPageName(CONFIG),
  });
};
