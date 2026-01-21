import { RoamNode } from "./types";

export const findOrCreateParentUid = async (
  date: Date,
  parentBlock: string | undefined,
  roamAPI: any,
  createBlock: (obj: {
    node: RoamNode;
    parentUid: string;
    order: number;
  }) => Promise<string>
): Promise<string> => {
  const pageName = window.roamAlphaAPI.util.dateToPageTitle(date),
    roamUid = window.roamAlphaAPI.util.dateToPageUid(date),
    results = () =>
      roamAPI.q(
        `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${pageName}"]]`
      );

  // if daily page doesn't exist, create it
  if (results().length === 0) {
    roamAPI.createPage({ page: { title: pageName, uid: roamUid } });
  }

  // if no parentBlock, return the daily page
  if (
    !parentBlock ||
    typeof parentBlock !== "string" ||
    parentBlock.length === 0
  ) {
    return results()[0][0]["uid"];
  }

  // search for the matching parent block
  const children = results()[0][0]["children"] || [];
  const potentialParentBlock = children.filter((pBlock: any) => {
    return pBlock.string === parentBlock;
  });

  // if the matching parent block exists, return it
  if (potentialParentBlock.length > 0) {
    return potentialParentBlock[0]["uid"];
  }

  // if not, create it
  const node: RoamNode = { text: parentBlock, children: [] };
  return await createBlock({
    node,
    parentUid: results()[0][0]["uid"],
    order: children.length,
  });
};
