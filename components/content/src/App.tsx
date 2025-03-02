import { useContextService } from "./utils/useContextService";
import { DevContent } from "./components/devContent";
import { useAppSelector } from "./store/hooks";
import { RoleSummaryCard } from "./components";

function App() {
  useContextService();
  const devMode = useAppSelector((state) => state.settings.devMode);

  if (devMode) {
    return <DevContent />;
  }
  return (
    <>
      <div className="flex gap-2 p-2">
        <RoleSummaryCard />
      </div>
    </>
  );
}

export default App;
