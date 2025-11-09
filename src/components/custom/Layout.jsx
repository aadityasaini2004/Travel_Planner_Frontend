import { Outlet } from 'react-router-dom';
import Header from './Header';
import PageTransition from './PageTransition';

function Layout() {
  return (
    <div>
      <Header />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
}

export default Layout;
