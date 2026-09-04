import { useCallback } from "react";
import { useContextService } from "./hooks/useContextService";
import { useIndexedDB } from "./hooks/useIndexedDB";
import { useSettingsSync } from "./hooks/useSettingsSync";
import { useScrollForwarding } from "./hooks/useScrollForwarding";
import { useAutoAnalysis } from "./hooks/useAutoAnalysis";
import { useBulkAnalysis } from "./hooks/useBulkAnalysis";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setCollapsed as setCollapsedAction } from "./store/slices/settingsSlice";
import { useJobSummary } from "./hooks/useJobData";
import { DevContent } from "./components/devContent";
import {
  RoleSummaryCard,
  IdentityRequirementsCard,
  WorkDurationCard,
  SkillRequirementsCard,
  WorkLocationCard,
  CompanyInfoCard,
  GooseGlanceBanner,
  ErrorPage,
  NoAnalysisPage,
  AnalysisErrorPage,
  AnalyzingPage,
  NoConfigPage,
} from "./components";

function App() {
  useContextService();
  useIndexedDB();
  useSettingsSync();
  useScrollForwarding();
  useAutoAnalysis();
  useBulkAnalysis();

  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.settings.collapsed);
  const devMode = useAppSelector((state) => state.settings.devMode);
  const onJobId = useAppSelector((state) => state.waterlooworks.onJobId);
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
  const error = useAppSelector((state) => state.waterlooworks.error);
  const aiProvider = useAppSelector((state) => state.settings.aiProvider);
  const openaiApiKey = useAppSelector((state) => state.settings.openaiApiKey);
  const geminiApiKey = useAppSelector((state) => state.settings.geminiApiKey);
  const openRouterApiKey = useAppSelector((state) => state.settings.openRouterApiKey);
  const { summary } = useJobSummary();

  const onToggleCollapse = useCallback(() => {
    dispatch(setCollapsedAction(!collapsed));
  }, [dispatch, collapsed]);

  // Check if AI provider is configured
  const isAiConfigured = useCallback(() => {
    switch (aiProvider) {
      case 'OpenAI':
        return openaiApiKey.trim() !== '';
      case 'Gemini':
        return geminiApiKey.trim() !== '';
      case 'OpenRouter':
        return openRouterApiKey.trim() !== '';
      case 'Local':
        return true;
      default:
        return false;
    }
  }, [aiProvider, openaiApiKey, geminiApiKey, openRouterApiKey]);

  if (devMode) {
    return <DevContent />;
  }
  if (!onJobId) {
    return (
      <>
        <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
        {!collapsed && <ErrorPage />}
      </>
    );
  }
  if (!isAiConfigured()) {
    return (
      <>
        <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
        {!collapsed && <NoConfigPage />}
      </>
    );
  }
  
  if (!summary) {
    if (error) {
      return (
        <>
          <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
          {!collapsed && <AnalysisErrorPage />}
        </>
      );
    } else if (isLoading) {
      return (
        <>
          <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
          {!collapsed && <AnalyzingPage />}
        </>
      );
    } else {
      return (
        <>
          <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
          {!collapsed && <NoAnalysisPage />}
        </>
      );
    }
  }

  return (
    <>
      <GooseGlanceBanner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      {!collapsed && (
        <div className="columns-[300px] gap-2 p-2">
          <div className="break-inside-avoid mb-2">
            <RoleSummaryCard />
          </div>
          <div className="break-inside-avoid mb-2">
            <IdentityRequirementsCard />
          </div>
          <div className="break-inside-avoid mb-2">
            <WorkLocationCard />
          </div>
          <div className="break-inside-avoid mb-2">
            <WorkDurationCard />
          </div>
          <div className="break-inside-avoid mb-2">
            <SkillRequirementsCard />
          </div>
          <div className="break-inside-avoid mb-2">
            <CompanyInfoCard />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
