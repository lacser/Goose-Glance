import { useContextService } from "./utils/useContextService";
import { DevContent } from "./components/DevContent";
import { useAppSelector } from "./store/hooks";

function App() {
  useContextService();
  const devMode = useAppSelector((state) => state.settings.devMode);

  if (devMode) {
    return (<DevContent />);
  }
  return <div>Content To Be Added</div>;
}

export default App;
