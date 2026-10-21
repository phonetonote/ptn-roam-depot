import { Button, Classes, Dialog, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import React from "react";
import createOverlayRender from "roamjs-components/util/createOverlayRender";
import { ERROR_MESSAGES, RequestCodeResult, VerifyCodeResult } from "../onboarding";

type VerifiedResult = Extract<VerifyCodeResult, { ok: true }>;

type VerifyCodeDialogProps = {
  email: string;
  onVerify: (code: string) => Promise<VerifyCodeResult>;
  onResend: () => Promise<RequestCodeResult>;
  onVerified: (result: VerifiedResult) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

const VerifyCodeDialog = ({
  email,
  onVerify,
  onResend,
  onVerified,
  isOpen = true,
  onClose,
}: VerifyCodeDialogProps) => {
  const [code, setCode] = React.useState("");
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [notice, setNotice] = React.useState<string>();

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!code.trim() || isBusy) return;

    setIsBusy(true);
    setError(undefined);
    setNotice(undefined);
    const result = await onVerify(code);
    setIsBusy(false);

    if (result.ok) {
      onVerified(result);
      onClose?.();
    } else {
      setError(ERROR_MESSAGES[result.reason]);
    }
  };

  const resend = async () => {
    setIsBusy(true);
    setError(undefined);
    const result = await onResend();
    setIsBusy(false);

    if (result.ok) {
      setNotice(`we sent a new code to ${email}.`);
    } else {
      setError(ERROR_MESSAGES[result.reason]);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="connect phonetonote"
      icon="envelope"
      canOutsideClickClose={false}
    >
      <form onSubmit={submit}>
        <div className={Classes.DIALOG_BODY}>
          <p>
            we emailed a code to <strong>{email}</strong>. paste it here to connect your
            phonetonote account.
          </p>
          <FormGroup
            label="code"
            labelFor="ptn-verification-code"
            helperText={error || notice}
            intent={error ? Intent.DANGER : Intent.NONE}
          >
            <InputGroup
              id="ptn-verification-code"
              autoFocus
              autoComplete="one-time-code"
              placeholder="ABCD2345"
              value={code}
              intent={error ? Intent.DANGER : Intent.NONE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button minimal disabled={isBusy} onClick={resend} text="send a new code" />
            <Button disabled={isBusy} onClick={onClose} text="cancel" />
            <Button
              type="submit"
              intent={Intent.PRIMARY}
              loading={isBusy}
              disabled={!code.trim()}
              text="connect"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export const render = createOverlayRender<VerifyCodeDialogProps>("ptn-verify-code", VerifyCodeDialog);

export default VerifyCodeDialog;
