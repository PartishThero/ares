import React from 'react';
import { 
  Compass, 
  Navigation, 
  Mountain, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  X,
  Plus
} from 'lucide-react';
import DestinationInspector from './DestinationInspector';
import RoutePlanner from './RoutePlanner';
import ElevationProfile from './ElevationProfile';
import MissionPanel from './MissionPanel';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  inspectionData,
  onSetAsStart,
  onSetAsDest,
  onCenterMap,
  onSelectPOI,
  startCoord,
  destCoord,
  routePrompt,
  onClearRoutePrompt,
  onSelectStart,
  onSelectDest,
  selectedProfileId,
  onSelectProfile,
  onCalculateRoute,
  isCalculating,
  plannedRoute,
  allRoutes,
  routeScore,
  onResetRoute,
  activeMissionId,
  onSelectMission,
  onLoadAndPlanMission,
  userPOIs = [],
  onOpenAddPOI,
  onDeleteUserPOI,
  customMissions = [],
  onOpenCreateMission,
  onDeleteCustomMission,
  onPlanUnchartedTraverse,
  mapPickingMode = null,
  onSetPickingMode,
  onFocusStart,
  onFocusRoute
}) {
  const tabs = [
    { id: 'planner', label: 'Route', icon: <Navigation className="w-4 h-4" /> },
    { id: 'profile', label: 'Elevation', icon: <Mountain className="w-4 h-4" /> },
    { id: 'inspector', label: 'Inspector', icon: <MapPin className="w-4 h-4" /> },
    { id: 'missions', label: 'Missions', icon: <Compass className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`absolute top-20 left-3 bottom-12 z-20 flex flex-col transition-all duration-300 pointer-events-auto ${
        isCollapsed ? 'w-12' : 'w-[calc(100vw-1.5rem)] sm:w-[420px] md:w-[450px]'
      }`}
    >
      <div className="relative h-full bg-ares-surface/95 backdrop-blur-md border border-ares-border rounded-2xl shadow-panel flex flex-col overflow-hidden">
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 rounded-r-md bg-ares-surface border border-l-0 border-ares-border flex items-center justify-center text-ares-text-muted hover:text-ares-accent transition-colors shadow-panel"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="h-12 border-b border-ares-border bg-ares-surface-alt/70 flex items-center px-2 select-none overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isCollapsed) onToggleCollapse();
                  onSelectTab(tab.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-ares-accent text-ares-bg font-bold shadow-glow-accent'
                    : 'text-ares-text-muted hover:text-ares-text hover:bg-ares-surface-alt'
                }`}
              >
                {tab.icon}
                {!isCollapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'inspector' && (
              <DestinationInspector
                inspectionData={inspectionData}
                onSetAsStart={onSetAsStart}
                onSetAsDest={onSetAsDest}
                onCenterMap={onCenterMap}
                onSelectPOI={onSelectPOI}
                onOpenAddPOI={onOpenAddPOI}
                onDeleteUserPOI={onDeleteUserPOI}
                onPlanUnchartedTraverse={onPlanUnchartedTraverse}
                startCoord={startCoord}
                destCoord={destCoord}
                routePrompt={routePrompt}
                onClearRoutePrompt={onClearRoutePrompt}
                onSwitchToPlanner={() => onSelectTab('planner')}
              />
            )}

            {activeTab === 'planner' && (
              <RoutePlanner
                startCoord={startCoord}
                destCoord={destCoord}
                onSelectStart={onSelectStart}
                onSelectDest={onSelectDest}
                selectedProfileId={selectedProfileId}
                onSelectProfile={onSelectProfile}
                onCalculateRoute={onCalculateRoute}
                isCalculating={isCalculating}
                plannedRoute={plannedRoute}
                allRoutes={allRoutes}
                routeScore={routeScore}
                onResetRoute={onResetRoute}
                userPOIs={userPOIs}
                mapPickingMode={mapPickingMode}
                onSetPickingMode={onSetPickingMode}
                onFocusStart={onFocusStart}
                onFocusRoute={onFocusRoute}
              />
            )}

            {activeTab === 'profile' && (
              <ElevationProfile
                plannedRoute={plannedRoute}
              />
            )}

            {activeTab === 'missions' && (
              <MissionPanel
                activeMissionId={activeMissionId}
                onSelectMission={onSelectMission}
                onLoadAndPlanMission={onLoadAndPlanMission}
                isCalculating={isCalculating}
                customMissions={customMissions}
                onOpenCreateMission={onOpenCreateMission}
                onDeleteCustomMission={onDeleteCustomMission}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
