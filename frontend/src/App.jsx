import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import InsertEntity from './pages/InsertEntity'
import EntityDetail from './pages/EntityDetail'
import EditEntity from './pages/EditEntity'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="new" element={<InsertEntity />} />
                    <Route path="entity/:id" element={<EntityDetail />} />
                    <Route path="entity/:id/edit" element={<EditEntity />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
