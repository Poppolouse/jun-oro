import Sidebar from '../components/Sidebar';

const ArkadeLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background-primary">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default ArkadeLayout;