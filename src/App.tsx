import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BlueprintList, BlueprintCreate, BlueprintDetail, BlueprintEdit } from './pages/Blueprints';
import { ContractList, ContractCreate, ContractDetail } from './pages/Contracts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blueprints">
            <Route index element={<BlueprintList />} />
            <Route path="new" element={<BlueprintCreate />} />
            <Route path=":id" element={<BlueprintDetail />} />
            <Route path=":id/edit" element={<BlueprintEdit />} />
          </Route>
          <Route path="contracts">
            <Route index element={<ContractList />} />
            <Route path="new" element={<ContractCreate />} />
            <Route path=":id" element={<ContractDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
