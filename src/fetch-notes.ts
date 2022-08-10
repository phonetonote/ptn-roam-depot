import axios from "axios";
import { MD_IMAGE_REGEX, SERVER_URL } from "./constants";
import { findOrCreateParentUid } from "./find-or-create-parent-uid";

import createBlock from "roamjs-components/writes/createBlock";
import getCreateTimeByBlockUid from "roamjs-components/queries/getCreateTimeByBlockUid";

import { reduceFeedItems } from "./reduce-messages";
import { startingOrder } from "./starting-order";
import { FeedAttachment, FeedItem, itemToNode } from "ptn-helpers";
import { InputType, PTNSettings, RoamExtentionAPI } from "./types";
import { InputTextNode } from "roamjs-components/types";
import { cleanAttachment } from "./clean-attachment";

export const fetchNotes = async (
  ptnKey: string,
  roamId: string,
  settings: PTNSettings | undefined
) => {
  const { smartblockTemplate, hashtag: hashtagFromSetting } = settings || {};
  axios(`${SERVER_URL}/feed.json?roam_key=${ptnKey}`)
    .then(async (res) => {
      const feedItems: FeedItem[] = res.data["items"];
      for (var i = 0; i < feedItems.length; i++) {
        const feedItem: FeedItem = feedItems[i];
        await axios.patch(
          `${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${ptnKey}&roam_id=${roamId}&sender_source=roam_depot`,
          { status: "syncing" }
        );
      }

      const messageMap = feedItems.reduce(reduceFeedItems, {});

      for (const pageName of Object.keys(messageMap)) {
        for (const senderType of Object.keys(messageMap[pageName]) as InputType[]) {
          const feedItems: FeedItem[] = messageMap[pageName][senderType];
          const date = new Date(feedItems[0].date_published),
            parentUid = await findOrCreateParentUid(
              date,
              settings[`${senderType}ParentBlock`] || settings?.parentBlockTitle,
              window.roamAlphaAPI,
              createBlock
            );
          for (const [i, feedItem] of Array.from(feedItems.entries())) {
            for (var j = 0; j < (feedItem?.attachments?.length ?? 0); j++) {
              const attachment = { ...feedItem.attachments[j] };
              const cleanedAttachment = await cleanAttachment(attachment);
              if (cleanedAttachment) {
                feedItem.attachments[j] = cleanedAttachment;
              }
            }
            const hashtag = settings[`${senderType}Hashtag`] || hashtagFromSetting;
            const node: InputTextNode = itemToNode(feedItem, hashtag);

            const existingBlock = node?.uid && (await getCreateTimeByBlockUid(`${node.uid}`));

            if (!node.uid || !existingBlock) {
              const hasSmartBlockTemplate = smartblockTemplate && smartblockTemplate.length > 0;

              const orderOffset = hasSmartBlockTemplate ? i * 2 : i;

              if (hasSmartBlockTemplate) {
                let smartBlockId = window.roamAlphaAPI.util.generateUID();
                window.roamAlphaAPI.createBlock({
                  location: {
                    "parent-uid": parentUid,
                    order: startingOrder(parentUid, window.roamAlphaAPI) + orderOffset + 1,
                  },
                  block: { string: "", uid: smartBlockId },
                });

                window.roamjs?.extension?.smartblocks?.triggerSmartblock({
                  srcName: smartblockTemplate,
                  targetUid: smartBlockId,
                  variables: {
                    rawText: feedItem.content_text,
                    hashtag: hashtag,
                    senderType: senderType,
                    attachmentText:
                      feedItem.attachments
                        ?.map((attachment: FeedAttachment) => attachment.title)
                        .join(", ") || "",
                  },
                });
              } else {
                await createBlock({
                  node,
                  parentUid,
                  order: startingOrder(parentUid, window.roamAlphaAPI) + orderOffset,
                });
              }
            }

            await axios.patch(`${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${ptnKey}`, {
              status: "synced",
              synced_by: "roam",
            });
          }
        }
      }
    })
    .catch((e) => {
      console.log("ptn error", e);
    });
};
