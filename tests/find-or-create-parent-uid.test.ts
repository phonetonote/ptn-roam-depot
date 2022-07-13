import { toRoamDate } from "roam-client";
import {
  findOrCreateParentUid,
  testableToRoamDateUid,
  testableToRoamDate,
} from "../src/find-or-create-parent-uid";

const expectedUid = "foo987";
const date = new Date();

test("it queries the roamAPI with the roam date", () => {
  const parentBlock = undefined;
  const querySpy = jest.fn();
  const createPageSpy = jest.fn();
  const createBlockSpy = jest.fn();

  querySpy.mockReturnValue([[{ uid: expectedUid }]]);
  createPageSpy.mockReturnValue("abc123");

  const api = {
    q: querySpy,
    createPage: createPageSpy,
  };

  const result = findOrCreateParentUid(date, parentBlock, api, createBlockSpy);
  const roamDate = testableToRoamDate(date);
  expect(querySpy).toHaveBeenCalledWith(
    `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${roamDate}"]]`
  );
  expect(result).toEqual(expectedUid);
});

const parentBlock = "foo";
const expectedParentUid = "123def";

test("it searches for the parent block", () => {
  const querySpy = jest.fn();
  querySpy.mockReturnValue([
    [
      {
        uid: expectedUid,
        children: [{ string: parentBlock, uid: expectedParentUid }],
      },
    ],
  ]);

  const api = {
    q: querySpy,
    createPage: jest.fn(),
  };

  const result = findOrCreateParentUid(date, parentBlock, api, jest.fn());
  const roamDate = testableToRoamDate(date);
  expect(querySpy).toHaveBeenCalledWith(
    `[:find (pull ?e [* {:block/children [*]}]) :where [?e :node/title "${roamDate}"]]`
  );
  expect(result).toEqual(expectedParentUid);
});

test("it creates the daily page if needed", () => {
  const querySpy = jest.fn();
  const createPageSpy = jest.fn();
  const parentBlock = undefined;
  createPageSpy.mockReturnValue([[]]);
  querySpy.mockReturnValueOnce([]);
  querySpy.mockReturnValueOnce([[{ uid: "THISISIT" }]]);

  const api = {
    q: querySpy,
    createPage: createPageSpy,
  };

  const result = findOrCreateParentUid(date, parentBlock, api, jest.fn());
  expect(createPageSpy).toHaveBeenCalledWith({
    page: { title: toRoamDate(new Date()), uid: testableToRoamDateUid(date) },
  });
});

test("it creates the parent block if it does not exist", () => {
  const querySpy = jest.fn();
  const createBlockSpy = jest.fn();

  querySpy.mockReturnValue([[{ uid: expectedUid, children: undefined }]]);

  const api = {
    q: querySpy,
    createPage: jest.fn(),
  };

  const result = findOrCreateParentUid(date, parentBlock, api, createBlockSpy);
  expect(createBlockSpy).toHaveBeenCalledWith({
    node: { children: [], text: parentBlock },
    order: 0,
    parentUid: expectedUid,
  });
});
