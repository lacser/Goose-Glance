import { useContextService } from "./utils/useContextService";
import { useIndexedDB } from "./utils/useIndexedDB";
import { DevContent } from "./components/devContent";
import { useAppSelector } from "./store/hooks";
import { RoleSummaryCard, IdentityRequirementsCard } from "./components";

function App() {
  useContextService();
  useIndexedDB();
  const devMode = useAppSelector((state) => state.settings.devMode);

  if (devMode) {
    return <DevContent />;
  }
  return (
    <>
      <div className="flex gap-2 p-2">
        <RoleSummaryCard />
        <IdentityRequirementsCard />
      </div>
    </>
  );
}

export default App;
