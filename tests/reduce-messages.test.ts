import { reduceFeedItems } from "../src/reduce-messages";

const baseFeedItem = {
  id: "ptr-1",
  date_published: "2020-01-01T00:00:00.000Z",
  url: "http://example.com/",
  content_text: "  foo  ",
  attachments: [],
  _ptr_sender_type: "sms",
};

test("reduces by date", () => {
  const data = [
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-07-20" },
  ];

  const results = data.reduce(reduceFeedItems, {});
  expect(Object.keys(results).length).toEqual(2);
});
