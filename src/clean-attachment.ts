import { FeedAttachment } from "ptn-helpers";
import { MD_IMAGE_REGEX, MEDIA_URL } from "./constants";

export const cleanAttachment = async (attachment: FeedAttachment): Promise<FeedAttachment> => {
  const cleanedAttachment = { ...attachment };
  const originalUrl = attachment.url;

  if (originalUrl && originalUrl.includes(MEDIA_URL)) {
    const { file, mimeType } = await fetch(originalUrl)
      .then(async (r) => {
        return {
          file: await r.blob(),
          mimeType: r.headers.get("Content-Type"),
        };
      })
      .then((obj) => obj);

    const splits = originalUrl.split("/");
    const lastSplit = splits[splits.length - 1];
    const newFile = new File([file], lastSplit, {
      type: mimeType,
    });

    const uploadTheFile: any = window.roamAlphaAPI.util.uploadFile;
    const uploadedUrl: string =
      (await uploadTheFile({
        file: newFile,
      }).then((x: any) => x)) ?? "file-upload-error";

    const strippedUrl = [...uploadedUrl.matchAll(MD_IMAGE_REGEX)];
    const cleanUrl = strippedUrl?.[0]?.[1] ?? uploadedUrl;
    cleanedAttachment["url"] = cleanUrl;

    const attachmentType = attachment._ptr_media_type;
    const attachmentTitle = attachment.title;
    if ((!attachmentTitle || attachmentTitle === "") && attachmentType === "document") {
      cleanedAttachment["title"] = lastSplit;
    }
  }

  return cleanedAttachment;
};
