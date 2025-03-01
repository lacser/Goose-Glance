import { useContextService } from "./utils/useContextService";
import { DevContent } from "./components/DevContent";
import { useAppSelector } from "./store/hooks";
import Symbols from "./components/Symbols";

function App() {
  useContextService();
  const devMode = useAppSelector((state) => state.settings.devMode);

  if (devMode) {
    return <DevContent />;
  }
  return (
    <>
      <h1>User Page Under Construction</h1>
      <Symbols color="black">construction</Symbols>
    </>
  );
}

export default App;
