import { Alert } from "@blueprintjs/core";
import React from "react";
import createOverlayRender from "roamjs-components/util/createOverlayRender";

const OnboardingAlert = ({ onConfirm, onCancel, onClose }: any) => {
  return (
    <>
      <Alert
        cancelButtonText="bring existing ptn key"
        isOpen={true}
        confirmButtonText="connect with my email"
        icon="issue-new"
        intent="primary"
        onCancel={onCancel}
        onConfirm={onConfirm}
        onClose={onClose}
      >
        <h3 className="bp4-heading">welcome to phonetonote</h3>
        <p className="bp4-ui-text">to use phonetonote, you need a ptn key.</p>
        <p className="bp4-ui-text">
          we'll email you a code to connect your account. this works for new and existing
          phonetonote accounts.
        </p>
      </Alert>
    </>
  );
};

export const render = createOverlayRender<any>("onboarding-alert", OnboardingAlert);

export default OnboardingAlert;
