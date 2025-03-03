import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";

export interface IdentityRequirementsCardProps {
  className?: string;
}

interface Requirement {
  name: string;
  status: string;
}

export default function IdentityRequirementsCard({
  className = "",
}: IdentityRequirementsCardProps) {
  const jobSummary = useAppSelector((state) => {
    const jobID = state.waterlooworks.onJobId;
    if (!jobID) return null;
    const jobData = state.waterlooworks.jobData[jobID];
    return jobData?.summary || null;
  });

  if (!jobSummary) {
    return null;
  }

  let summaryData;
  try {
    summaryData = JSON.parse(jobSummary);
  } catch (e) {
    console.error("Error parsing summary:", e);
    return null;
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "required":
        return {
          bgColor: "var(--colorStatusWarningBackground1)",
          textColor: "var(--colorStatusWarningForeground1)",
          icon: "close",
        };
      case "preferred":
        return {
          bgColor: "var(--colorPaletteYellowBackground1)",
          textColor: "var(--colorPaletteYellowForeground1)",
          icon: "exclamation",
        };
      case "not required":
        return {
          bgColor: "var(--colorStatusSuccessBackground1)",
          textColor: "var(--colorStatusSuccessForeground1)",
          icon: "check",
        };
      default:
        return {
          bgColor: "transparent",
          textColor: "inherit",
          icon: "",
        };
    }
  };

  const allRequirements: Requirement[] = [
    {
      name: "Driver's License",
      status: summaryData.driver_license || "Not Required",
    },
    {
      name: "Work Visa",
      status: summaryData.canadian_citizen_or_pr === "Required" ? "Required" : "Not Required",
    },
    {
      name: "French Fluency",
      status: summaryData.speak_french || "Not Required",
    },
    {
      name: "Background Check",
      status: summaryData.background_check ? "Required" : "Not Required",
    },
    {
      name: "Citizenship",
      status: summaryData.canadian_citizen_or_pr || "Not Required",
    },
  ];

  const requiredItems = allRequirements.filter(
    (req) => req.status.toLowerCase() === "required"
  );
  const preferredItems = allRequirements.filter(
    (req) => req.status.toLowerCase() === "preferred"
  );
  const notRequiredItems = allRequirements.filter(
    (req) => req.status.toLowerCase() === "not required"
  );

  const otherRequirements = summaryData.other_special_requirements || [];

  const renderRequirementItem = (requirement: Requirement) => {
    const style = getStatusStyle(requirement.status);
    return (
      <div key={requirement.name} className="flex items-center justify-between mt-2">
        <span className="text-sm">{requirement.name}</span>
        <div
          className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-md text-nowrap"
          style={{
            backgroundColor: style.bgColor,
            color: style.textColor,
          }}
        >
          <span>{requirement.status}</span>
          <Symbols iconSize="20px">
            {style.icon}
          </Symbols>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      <div className="flex items-center justify-start gap-3 mb-2">
        <Symbols iconSize="24px">siren</Symbols>
        <h2 className="text-base font-semibold">Special Requirements</h2>
      </div>

      {/* Required Items */}
      {requiredItems.length > 0 && (
        <div className="mb-2">
          {requiredItems.map(renderRequirementItem)}
        </div>
      )}

      {/* Preferred Items */}
      {preferredItems.length > 0 && (
        <div className="mb-2">
          {preferredItems.map(renderRequirementItem)}
        </div>
      )}

      {/* Other Special Requirements */}
      {otherRequirements.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-start gap-3 mb-3">
            <Symbols iconSize="24px">radar</Symbols>
            <h3 className="text-base font-semibold">
              Other Special Requirements
            </h3>
          </div>
          <ul className="space-y-2">
            {otherRequirements.map(
              (req: string, index: number) => (
                <li
                  key={index}
                  className="text-base border-l-2 border-gray-300 pl-3"
                >
                  {req}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Not Required Section */}
      {notRequiredItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Symbols iconSize="24px">search_check_2</Symbols>
              <h3 className="text-base font-semibold">
                Not Required
              </h3>
            </div>
            <Symbols iconSize="24px">keyboard_arrow_down</Symbols>
          </div>
          
          {notRequiredItems.map(renderRequirementItem)}
        </div>
      )}
    </div>
  );
}
