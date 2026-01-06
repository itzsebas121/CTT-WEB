import { Outlet, Link } from 'react-router-dom';
import { Menu } from '../../components/layout';

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <Menu />

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
