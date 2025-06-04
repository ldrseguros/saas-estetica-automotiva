import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  ...otherProps
}) => {
  return (
    <div
      className="w-full flex items-center justify-center mb-8"
      {...otherProps}
    >
      <div className="flex items-center w-full max-w-3xl">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`step-circle ${
                  index + 1 <= currentStep ? "active" : ""
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-2">{step}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`step-connector ${
                  index + 1 < currentStep ? "active" : ""
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
