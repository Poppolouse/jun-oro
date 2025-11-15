import React from 'react';
import ArkadeHeader from '../components/ArkadeHeader';
import ArkadeSidebar from '../components/ArkadeSidebar';
import BacklogTrackingDashboard from '../components/BacklogTrackingDashboard';
import SiteFooter from '../components/SiteFooter';
import ElementSelector from '../components/Tutorial/ElementSelector';
import ErrorBoundary from '../components/ErrorBoundary';

function BacklogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex flex-col">
      <ArkadeHeader />
      <div className="flex flex-1 min-h-0">
        <ArkadeSidebar />
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <BacklogTrackingDashboard />
          </ErrorBoundary>
        </main>
      </div>
      <SiteFooter />
      <ElementSelector />
    </div>
  );
}

export default BacklogPage;
