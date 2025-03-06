import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";
// import { useState } from "react";
import { ProgressBar } from "@fluentui/react-components";

export interface WorkTermDurationCardProps {
  className?: string;
}

interface MonthsGridProps {
  startMonth: string;
  endMonth: string;
  acrossYear: boolean;
}

const monthMap: { [key: string]: { abbrev: string; index: number } } = {
  january: { abbrev: "Jan", index: 0 },
  february: { abbrev: "Feb", index: 1 },
  march: { abbrev: "Mar", index: 2 },
  april: { abbrev: "Apr", index: 3 },
  may: { abbrev: "May", index: 4 },
  june: { abbrev: "Jun", index: 5 },
  july: { abbrev: "Jul", index: 6 },
  august: { abbrev: "Aug", index: 7 },
  september: { abbrev: "Sep", index: 8 },
  october: { abbrev: "Oct", index: 9 },
  november: { abbrev: "Nov", index: 10 },
  december: { abbrev: "Dec", index: 11 },
};

function MonthsGrid({ startMonth, endMonth, acrossYear }: MonthsGridProps) {
  startMonth = startMonth.toLowerCase();
  endMonth = endMonth.toLowerCase();
  return (
    <div className="bg-[--colorNeutralBackground6] rounded-md p-1">
      {[0, 6].map((startIndex) => (
        <div key={startIndex} className={`grid grid-cols-6`}>
          {Object.values(monthMap)
            .slice(startIndex, startIndex + 6)
            .map(({ abbrev, index }) => {
              const isStartMonth = abbrev === monthMap[startMonth].abbrev;
              const isEndMonth = abbrev === monthMap[endMonth].abbrev;
              const isIntermediateMonth =
                !acrossYear &&
                index > monthMap[startMonth].index &&
                index < monthMap[endMonth].index;

              return (
                <div
                  key={abbrev}
                  className={`text-center p-1 relative 
                    ${isStartMonth && !acrossYear ? "bg-[--colorNeutralBackground1] rounded-l-md" : ""} 
                    ${isStartMonth && acrossYear ? "bg-[--colorNeutralBackground1] rounded-md" : ""} 
                    ${isEndMonth && !acrossYear ? "bg-[--colorNeutralBackground1] rounded-r-md" : ""} 
                    ${isEndMonth && acrossYear ? "bg-[--colorNeutralBackground1] rounded-md" : ""} 
                    ${isIntermediateMonth ? "bg-[--colorNeutralBackground1]" : ""}
                `}>
                  {abbrev}
                  {isStartMonth && (
                    <div className="absolute bottom-1 left-2 right-2 h-1 bg-[--colorPaletteBlueBorderActive] rounded-full"></div>
                  )}
                  {isEndMonth && (
                    <div className="absolute bottom-1 left-2 right-2 h-1 bg-[--colorPaletteMarigoldForeground1] rounded-full"></div>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

export default function WorkDurationCard({
  className = "",
}: WorkTermDurationCardProps) {
  const jobId = useAppSelector((state) => state.waterlooworks.onJobId);

  const jobData = useAppSelector((state) => {
    if (!jobId) return null;
    return state.waterlooworks.jobData[jobId] || null;
  });
  if (!jobData || !jobData.summary) {
    return null;
  }

  let jobInfo;
  try {
    jobInfo = JSON.parse(jobData.summary);
  } catch (e) {
    console.error("Error parsing job info:", e);
    return null;
  }

  const workTermYears = jobInfo.work_term_year;
  const workTermMonths = jobInfo.work_term_month;
  const workTermDates = jobInfo.work_term_date;

  if (!workTermMonths) return null;

  const startYear = workTermYears?.[0] || null;
  const endYear = workTermYears?.[1] || null;
  const startMonth = workTermMonths[0];
  const endMonth = workTermMonths[1];
  const startDate = workTermDates?.[0] || null;
  const endDate = workTermDates?.[1] || null;

  const calculateWorkTermLength = () => {
    let yearDiff = 0;
    if (workTermYears && startYear && endYear) {
      yearDiff = endYear - startYear;
    }

    console.log("startMonth", startMonth);
    console.log("endMonth", endMonth);
    const startMonthIndex = monthMap[startMonth.toLowerCase()].index;
    const endMonthIndex = monthMap[endMonth.toLowerCase()].index;
    let monthDiff;
    if (startMonthIndex <= endMonthIndex) {
      monthDiff = endMonthIndex - startMonthIndex;
    } else {
      monthDiff = 12 - startMonthIndex + endMonthIndex;
      if (!workTermYears) yearDiff = 1;
    }

    let dayDiff = 0;
    if (workTermDates && startDate && endDate) {
      dayDiff = endDate - startDate;
      if (dayDiff < 0) {
        dayDiff += 30;
        if (monthDiff > 0) {
          monthDiff -= 1;
        } else if (yearDiff > 0) {
          yearDiff -= 1;
          monthDiff = 11;
        }
      }
    }

    return [yearDiff, monthDiff, dayDiff];
  };

  const workTermLength = calculateWorkTermLength();
  const durationParts = [];
  if (workTermLength[0] > 0)
    durationParts.push(
      `${workTermLength[0]} Year${workTermLength[0] > 1 ? "s" : ""}`
    );
  if (workTermLength[1] > 0)
    durationParts.push(
      `${workTermLength[1]} Month${workTermLength[1] > 1 ? "s" : ""}`
    );
  if (workTermLength[2] > 0)
    durationParts.push(
      `${workTermLength[2]} Day${workTermLength[2] > 1 ? "s" : ""}`
    );
  const duration = durationParts.join(", ");

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const dateRange =
    workTermDates && startDate && endDate
      ? `${startMonth} ${getOrdinalSuffix(
          startDate
        )} - ${endMonth} ${getOrdinalSuffix(endDate)}`
      : `${startMonth} - ${endMonth}`;

  const totalDays =
    workTermLength[0] * 365 + workTermLength[1] * 30 + workTermLength[2];
  const workTermLengthIndicator = Math.min(totalDays / 240, 1);
  const isLongerPeriodIndicator = totalDays > 240;

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      <div className="flex items-center justify-start gap-3 mb-2">
        <Symbols iconSize="24px">calendar_month</Symbols>
        <h2 className="text-base font-semibold">Work Term Duration</h2>
      </div>

      <div className="mb-2">
        <p className="text-xl font-medium">{duration}</p>
        <div className="my-2">
          <ProgressBar
            value={workTermLengthIndicator}
            color={isLongerPeriodIndicator ? "warning" : "brand"}
            thickness="large"
          />
        </div>
        <p className="text-base">{dateRange}</p>
      </div>

      <MonthsGrid
        startMonth={startMonth}
        endMonth={endMonth}
        acrossYear={startYear === endYear ? false : true}
      />
    </div>
  );
}
