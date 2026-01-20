export const startingOrder = (
  parentUid: string,
  roamAPI: Window["roamAlphaAPI"]
): number => {
  const childrenQuery = roamAPI.q(
    `[ :find (pull ?e [* {:block/children [*]}]) :where [?e :block/uid "${parentUid}"]]`
  ) as { children?: unknown[] }[][] | null;
  return childrenQuery?.[0]?.[0]?.children?.length || 0;
};
