import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-indigo-600">Internet Entity Logger</Link>
                    <nav className="flex gap-4">
                        <Link to="/tags" className="text-sm font-medium text-gray-500 hover:text-gray-900">Tags</Link>
                        <Link to="/new" className="text-sm font-medium text-gray-500 hover:text-gray-900">New Entity</Link>
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
