import axios from "axios";
import { SCRIPT_ID, SERVER_URL } from "./constants";
import { findOrCreateParentUid } from "./find-or-create-parent-uid";
import {
  createBlock,
  getCreateTimeByBlockUid,
  InputTextNode,
} from "roam-client";
import Bugsnag from "@bugsnag/js";
import {
  parentBlockFromSenderType,
  hashtagFromSenderType,
} from "./entry-helpers";
import { reduceFeedItems } from "./reduce-messages";
import { startingOrder } from "./starting-order";
import { configValues } from "./configure";
import { itemToNode, FeedItem } from "ptn-helpers";

export const roamKey = document.getElementById(SCRIPT_ID)?.dataset.roam_key;

export const fetchNotes = async () => {
  axios(`${SERVER_URL}/feed.json?roam_key=${roamKey}`)
    .then(async (res) => {
      const feedItems: FeedItem[] = res.data["items"];
      for (var i = 0; i < feedItems.length; i++) {
        const feedItem: FeedItem = feedItems[i];
        await axios.patch(
          `${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${roamKey}`,
          { status: "syncing" }
        );
      }

      const messageMap = feedItems.reduce(reduceFeedItems, {});

      for (const pageName of Object.keys(messageMap)) {
        for (const senderType of Object.keys(messageMap[pageName])) {
          const feedItems: FeedItem[] = messageMap[pageName][senderType];
          const date = new Date(feedItems[0].date_published),
            parentUid = findOrCreateParentUid(
              date,
              parentBlockFromSenderType(senderType),
              window.roamAlphaAPI,
              createBlock
            );
          for (const [i, feedItem] of feedItems.entries()) {
            const hashtag =
              hashtagFromSenderType(senderType) || configValues.hashtag;
            const node: InputTextNode = itemToNode(feedItem, hashtag);

            const existingBlock =
              node?.uid && (await getCreateTimeByBlockUid(`${node.uid}`));

            if (!node.uid || !existingBlock) {
              const hasSmartBlockTemplate =
                configValues.smartblockTemplate &&
                configValues.smartblockTemplate.length > 0;

              const orderOffset = hasSmartBlockTemplate ? i * 2 : i;

              if (hasSmartBlockTemplate) {
                const { smartblockTemplate } = configValues;

                let smartBlockId = window.roamAlphaAPI.util.generateUID();
                window.roamAlphaAPI.createBlock({
                  location: {
                    "parent-uid": parentUid,
                    order:
                      startingOrder(parentUid, window.roamAlphaAPI) +
                      orderOffset +
                      1,
                  },
                  block: { string: "", uid: smartBlockId },
                });

                window.roamjs?.extension.smartblocks.triggerSmartblock({
                  srcName: smartblockTemplate,
                  targetUid: smartBlockId,
                  variables: {
                    feedItem: feedItem,
                    rawText: feedItem.content_text,
                    hashtag: hashtag,
                    senderType: senderType,
                    attachmentText: feedItem.attachments
                      ?.map((attachment) => attachment.title)
                      .join(", "),
                  },
                });
              } else {
                await createBlock({
                  node,
                  parentUid,
                  order:
                    startingOrder(parentUid, window.roamAlphaAPI) + orderOffset,
                });
              }
            }

            await axios.patch(
              `${SERVER_URL}/feed/${feedItem.id}.json?roam_key=${roamKey}`,
              { status: "synced" }
            );
          }
        }
      }
    })
    .catch((e) => {
      console.log("phonetoroam error", e);
      Bugsnag.notify(e);
    });
};
