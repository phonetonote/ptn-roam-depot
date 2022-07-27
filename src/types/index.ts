import { HASHTAG_KEY, PARENT_BLOCK_KEY } from "../constants";

export type OnboardingStatus = "START" | "IN_PROGRESS" | "END";

export type GetPtnKeyFn = () => string | undefined;
export type SetSettingFn = (key: string, value: any) => void;

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

export type RoamNode = {
  text: string;
  children: RoamNode[];
};
