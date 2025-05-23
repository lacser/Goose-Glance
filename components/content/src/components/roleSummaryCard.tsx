import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";

export interface RoleSummaryCardProps {
  className?: string;
}

export default function RoleSummaryCard({
  className = "",
}: RoleSummaryCardProps) {
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

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      <div className="flex items-center justify-start gap-3 mb-2">
        <Symbols iconSize="24px">badge</Symbols>
        <h2 className="text-base font-semibold">{summaryData.job_title}</h2>
      </div>

      <div>
        <h3 className="text-base font-semibold">Key Roles</h3>
        <ul className="list-disc pl-5 space-y-3">
          {summaryData.key_roles.map((role: string, index: number) => (
            <li key={index} className="text-base">
              <span dangerouslySetInnerHTML={{ __html: role }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
