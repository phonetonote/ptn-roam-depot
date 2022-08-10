import { Alert } from "@blueprintjs/core";
import React from "react";
import createOverlayRender from "roamjs-components/util/createOverlayRender";
import "./onboarding-alert.css";

const OnboardingAlert = ({ onConfirm, onCancel, onClose }: any) => {
  return (
    <>
      <Alert
        cancelButtonText="bring existing ptn key"
        isOpen={true}
        confirmButtonText="make a new one for me"
        icon="issue-new"
        intent="primary"
        onCancel={onCancel}
        onConfirm={onConfirm}
        onClose={onClose}
      >
        <h3 className="bp4-heading">welcome to phonetonote</h3>
        <p className="bp4-ui-text">to use phonetonote, you need a ptn key.</p>
      </Alert>
    </>
  );
};

export const render = createOverlayRender<any>("onboarding-alert", OnboardingAlert);

export default OnboardingAlert;
