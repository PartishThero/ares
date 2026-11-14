import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MarsMap from './components/MarsMap';
import LayerControls from './components/LayerControls';
import Sidebar from './components/Sidebar';
import RadiationPanel from './components/RadiationPanel';
import MissionReportModal from './components/MissionReportModal';
import { inspectMarsLocation } from './services/marsData';
import { planAresRoute } from './algorithms/astar';
import { ROUTE_PROFILES } from './algorithms/terrainCost';
import { scoreRoute } from './algorithms/routeScoring';
import { PRESET_MISSIONS } from './data/missionData';
import { SCIENTIFIC_TARGETS } from './data/scientificTargets';

export default function App() {
  const [activeLayerId, setActiveLayerId] = useState('viking-color');
  const [layerOpacity, setLayerOpacity] = useState(1.0);
  const [showHazards, setShowHazards] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [selectedCoord, setSelectedCoord] = useState([137.4025, -4.9450]);
  const [panToCoord, setPanToCoord] = useState(null);
  const [inspectionData, setInspectionData] = useState(() => inspectMarsLocation(137.4025, -4.9450));

  const [startCoord, setStartCoord] = useState([137.3880, -4.7310]);
  const [destCoord, setDestCoord] = useState([137.4025, -4.9450]);
  const [selectedProfileId, setSelectedProfileId] = useState('safest');
  const [isCalculating, setIsCalculating] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [allRoutes, setAllRoutes] = useState({});
  const [routeScore, setRouteScore] = useState(null);

  const [activeMission, setActiveMission] = useState(PRESET_MISSIONS[0]);

  const [activeTab, setActiveTab] = useState('planner');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRadiationOpen, setIsRadiationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const calculateTraverseRoutes = useCallback((start, dest, activeProfileKey = 'safest', waypoints = []) => {
    if (!start || !dest) return;
    setIsCalculating(true);

    setTimeout(() => {
      try {
        const safestRoute = planAresRoute(start, dest, waypoints, ROUTE_PROFILES.SAFEST);
        const shortestRoute = planAresRoute(start, dest, [], ROUTE_PROFILES.SHORTEST);
        const scienceRoute = planAresRoute(start, dest, waypoints.length > 0 ? waypoints : [[137.3820, -4.8920]], ROUTE_PROFILES.SCIENCE);

        const routesMap = {
          safest: safestRoute,
          shortest: shortestRoute,
          science: scienceRoute
        };

        setAllRoutes(routesMap);

        const chosenRoute = routesMap[activeProfileKey] || safestRoute;
        setPlannedRoute(chosenRoute);

        const score = scoreRoute(
          chosenRoute.metrics,
          activeProfileKey === 'science' ? 95 : 75
        );
        setRouteScore(score);
      } catch (err) {
        console.error('Pathfinding calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 40);
  }, []);

  useEffect(() => {
    calculateTraverseRoutes(startCoord, destCoord, 'safest', [[137.3820, -4.8920]]);
  }, []);

  const handleSelectCoordinate = (lon, lat) => {
    setSelectedCoord([lon, lat]);
    const data = inspectMarsLocation(lon, lat);
    setInspectionData(data);
    setActiveTab('inspector');
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
  };

  const handleCenterMap = (coord) => {
    setPanToCoord(coord);
  };

  const handleSetAsStart = (coord) => {
    setStartCoord(coord);
    setActiveTab('planner');
    if (destCoord) {
      calculateTraverseRoutes(coord, destCoord, selectedProfileId);
    }
  };

  const handleSetAsDest = (coord) => {
    setDestCoord(coord);
    setActiveTab('planner');
    if (startCoord) {
      calculateTraverseRoutes(startCoord, coord, selectedProfileId);
    }
  };

  const handleSelectPOI = (poi) => {
    setSelectedCoord(poi.coordinates);
    setPanToCoord(poi.coordinates);
    const data = inspectMarsLocation(poi.coordinates[0], poi.coordinates[1]);
    setInspectionData(data);
    setActiveTab('inspector');
  };

  const handleSelectProfile = (profileId) => {
    setSelectedProfileId(profileId);
    if (allRoutes[profileId]) {
      setPlannedRoute(allRoutes[profileId]);
      const score = scoreRoute(
        allRoutes[profileId].metrics,
        profileId === 'science' ? 95 : 75
      );
      setRouteScore(score);
    } else if (startCoord && destCoord) {
      calculateTraverseRoutes(startCoord, destCoord, profileId);
    }
  };

  const handleLoadAndPlanMission = (mission) => {
    setActiveMission(mission);
    setStartCoord(mission.startCoords);
    setDestCoord(mission.destCoords);
    setSelectedCoord(mission.destCoords);
    setPanToCoord(mission.destCoords);

    const waypointsCoords = mission.targetWaypoints
      .map((id) => SCIENTIFIC_TARGETS.find((t) => t.id === id)?.coordinates)
      .filter(Boolean);

    const profileKey = mission.recommendedMode === 'Safest' ? 'safest' : 'science';
    setSelectedProfileId(profileKey);

    calculateTraverseRoutes(mission.startCoords, mission.destCoords, profileKey, waypointsCoords);
    setActiveTab('planner');
  };

  const handleResetView = () => {
    setPanToCoord([137.385, -4.785]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-ares-bg text-ares-text overflow-hidden select-none">
      <Header
        onResetView={handleResetView}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenRadiation={() => setIsRadiationOpen(true)}
        activeMission={activeMission}
        isCalculatingRoute={isCalculating}
      />

      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative h-full">
          <MarsMap
            activeLayerId={activeLayerId}
            layerOpacity={layerOpacity}
            showHazards={showHazards}
            showPOIs={showPOIs}
            showGrid={showGrid}
            selectedCoord={selectedCoord}
            onSelectCoordinate={handleSelectCoordinate}
            plannedRoute={plannedRoute}
            allRoutes={allRoutes}
            activeRouteProfile={selectedProfileId}
            startCoord={startCoord}
            destCoord={destCoord}
            panToCoord={panToCoord}
          />

          <div className="absolute top-4 left-4 z-20 w-72 sm:w-80 max-w-[calc(100vw-2rem)]">
            <LayerControls
              activeLayerId={activeLayerId}
              onSelectLayer={setActiveLayerId}
              layerOpacity={layerOpacity}
              onChangeOpacity={setLayerOpacity}
              showHazards={showHazards}
              onToggleHazards={() => setShowHazards(!showHazards)}
              showPOIs={showPOIs}
              onTogglePOIs={() => setShowPOIs(!showPOIs)}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
            />
          </div>
        </div>

        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          inspectionData={inspectionData}
          onSetAsStart={handleSetAsStart}
          onSetAsDest={handleSetAsDest}
          onCenterMap={handleCenterMap}
          onSelectPOI={handleSelectPOI}
          startCoord={startCoord}
          destCoord={destCoord}
          onSelectStart={handleSetAsStart}
          onSelectDest={handleSetAsDest}
          selectedProfileId={selectedProfileId}
          onSelectProfile={handleSelectProfile}
          onCalculateRoute={() => calculateTraverseRoutes(startCoord, destCoord, selectedProfileId)}
          isCalculating={isCalculating}
          plannedRoute={plannedRoute}
          allRoutes={allRoutes}
          routeScore={routeScore}
          onResetRoute={() => {
            setPlannedRoute(null);
            setAllRoutes({});
            setRouteScore(null);
          }}
          activeMissionId={activeMission?.id}
          onSelectMission={setActiveMission}
          onLoadAndPlanMission={handleLoadAndPlanMission}
        />
      </div>

      <RadiationPanel
        isOpen={isRadiationOpen}
        onClose={() => setIsRadiationOpen(false)}
        plannedRouteDurationHours={plannedRoute?.metrics?.estimatedDurationHours || 3.5}
      />

      <MissionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        activeMission={activeMission}
        plannedRoute={plannedRoute}
        routeScore={routeScore}
        startCoord={startCoord}
        destCoord={destCoord}
      />
    </div>
  );
}
