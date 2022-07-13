import { toRoamDate } from "roam-client";
import { FeedItem } from "ptn-helpers";

export const reduceFeedItems = (
  obj: Record<string, Record<string, FeedItem[]>>,
  feedItem: FeedItem
) => {
  const date = new Date(feedItem.date_published),
    pageName = toRoamDate(date),
    senderType = feedItem._ptr_sender_type;

  if (!obj.hasOwnProperty(pageName)) {
    obj[pageName] = {};
  }

  if (!obj[pageName][senderType]) {
    obj[pageName][senderType] = [];
  }

  obj[pageName][senderType].push(feedItem);
  return obj;
};
