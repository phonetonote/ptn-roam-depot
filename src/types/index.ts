import { HASHTAG_KEY, PARENT_BLOCK_KEY } from "../constants";

export type OnboardingStatus = "START" | "END";

export type RoamExtentionAPI = {
  extensionAPI: {
    settings: {
      get: (key: string) => string | undefined;
      set: (key: string, value: string) => void;
      getAll: () => { [key: string]: string };
      panel: {
        create: (config: any) => void;
      };
    };
  };
};

export type InputType =
  | "sms"
  | "facebook"
  | "alfred"
  | "telegram"
  | "zapier"
  | "email";

export type PTNSettings = {
  smartblockTemplate: string;
  [HASHTAG_KEY]: string;
  [PARENT_BLOCK_KEY]: string;
  smsHashtag: string;
  facebookHashtag: string;
  alfredHashtag: string;
  telegramHashtag: string;
  zapierHashtag: string;
  emailHashtag: string;

  smsParentBlock: string;
  facebookParentBlock: string;
  alfredParentBlock: string;
  telegramParentBlock: string;
  zapierParentBlock: string;
  emailParentBlock: string;

  showDashLink: boolean;
};

export type PTNDefaultSettings =
  | typeof HASHTAG_KEY
  | typeof PARENT_BLOCK_KEY
  | "showDashLink";

export type RoamNode = {
  text: string;
  children: RoamNode[];
};

type GetKeyFn = (key: string) => string | undefined;
type SetSettingFn = (key: string, value: any) => void;
type GetAllFn = () => { [key: string]: any };
type CreatePanelFn = (config: { [key: string]: any }) => void;

export type SingletonProps = {
  extensionAPI: {
    settings: {
      get: GetKeyFn;
      set: SetSettingFn;
      getAll: GetAllFn;
      panel: {
        create: CreatePanelFn;
      };
    };
  };
};
