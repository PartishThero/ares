import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MarsMap from './components/MarsMap';
import LayerControls from './components/LayerControls';
import Sidebar from './components/Sidebar';
import RadiationPanel from './components/RadiationPanel';
import MissionReportModal from './components/MissionReportModal';
import CustomMissionModal from './components/CustomMissionModal';
import AddPOIModal from './components/AddPOIModal';
import LandingPage from './components/LandingPage';
import { inspectMarsLocation } from './services/marsData';
import { planAresRoute } from './algorithms/astar';
import { ROUTE_PROFILES } from './algorithms/terrainCost';
import { scoreRoute } from './algorithms/routeScoring';
import { PRESET_MISSIONS } from './data/missionData';
import { SCIENTIFIC_TARGETS } from './data/scientificTargets';
import { getMarsSolTime } from './utils/coordinates';
import {
  getAstronautPOIs,
  saveAstronautPOI,
  deleteAstronautPOI,
  getCustomMissions,
  saveCustomMission,
  deleteCustomMission,
  generateLiveMarsTelemetry,
  fetchLiveSpaceWeather
} from './services/liveMarsApi';

export default function App() {
  const [viewMode, setViewMode] = useState('landing');
  const [marsTime, setMarsTime] = useState(getMarsSolTime());
  const [liveTelemetry, setLiveTelemetry] = useState(() => generateLiveMarsTelemetry(marsTime.sol));

  const [userPOIs, setUserPOIs] = useState(() => getAstronautPOIs());
  const [customMissions, setCustomMissions] = useState(() => getCustomMissions());

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
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
  const [isAddPOIOpen, setIsAddPOIOpen] = useState(false);
  const [addPOICoords, setAddPOICoords] = useState([137.3880, -4.7310]);
  const [interactionMode, setInteractionMode] = useState('default');

  useEffect(() => {
    const clockTimer = setInterval(() => {
      const time = getMarsSolTime();
      setMarsTime(time);
    }, 1000);

    const telemetryTimer = setInterval(() => {
      setLiveTelemetry(generateLiveMarsTelemetry(marsTime.sol));
    }, 3500);

    return () => {
      clearInterval(clockTimer);
      clearInterval(telemetryTimer);
    };
  }, [marsTime.sol]);

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
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
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

    const waypointsCoords = (mission.targetWaypoints || [])
      .map((id) => [...SCIENTIFIC_TARGETS, ...userPOIs].find((t) => t.id === id)?.coordinates)
      .filter(Boolean);

    const profileKey = mission.recommendedMode === 'Shortest' 
      ? 'shortest' 
      : mission.recommendedMode === 'Science' 
      ? 'science' 
      : 'safest';
    setSelectedProfileId(profileKey);

    calculateTraverseRoutes(mission.startCoords, mission.destCoords, profileKey, waypointsCoords);
    setActiveTab('planner');
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
  };

  const handlePlanUnchartedTraverse = (targetCoord) => {
    setDestCoord(targetCoord);
    setSelectedCoord(targetCoord);
    setPanToCoord(targetCoord);
    const data = inspectMarsLocation(targetCoord[0], targetCoord[1]);
    setInspectionData(data);
    setInteractionMode('default');
    setActiveTab('planner');
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
    calculateTraverseRoutes(startCoord, targetCoord, 'safest');
  };

  const handleResetView = () => {
    setPanToCoord([137.385, -4.785]);
  };

  const handleSaveAstronautPOI = (newPOI) => {
    const updated = saveAstronautPOI(newPOI);
    setUserPOIs(updated);
    setSelectedCoord(newPOI.coordinates);
    setPanToCoord(newPOI.coordinates);
    const data = inspectMarsLocation(newPOI.coordinates[0], newPOI.coordinates[1]);
    setInspectionData(data);
    setActiveTab('inspector');
  };

  const handleDeleteAstronautPOI = (id) => {
    const updated = deleteAstronautPOI(id);
    setUserPOIs(updated);
  };

  const handleSaveAndPlanCustomMission = (mission) => {
    const updated = saveCustomMission(mission);
    setCustomMissions(updated);
    handleLoadAndPlanMission(mission);
  };

  const handleDeleteCustomMission = (id) => {
    const updated = deleteCustomMission(id);
    setCustomMissions(updated);
  };

  const allCombinedTargets = [...SCIENTIFIC_TARGETS, ...userPOIs];

  if (viewMode === 'landing') {
    return (
      <LandingPage
        marsTime={marsTime}
        liveTelemetry={liveTelemetry}
        onLaunchApp={() => setViewMode('map')}
        onSelectMissionAndLaunch={(mission) => {
          setViewMode('map');
          handleLoadAndPlanMission(mission);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-ares-bg text-ares-text overflow-hidden select-none relative font-sans">
      <Header
        allTargets={allCombinedTargets}
        onSelectTarget={handleSelectPOI}
        marsTime={marsTime}
        liveTelemetry={liveTelemetry}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenRadiation={() => setIsRadiationOpen(true)}
        onResetView={handleResetView}
        onOpenAddPOI={(coord) => {
          setAddPOICoords(coord || selectedCoord || [137.3880, -4.7310]);
          setIsAddPOIOpen(true);
        }}
        onToggleUnchartedMode={() => {
          setInteractionMode((prev) => (prev === 'explore_uncharted' ? 'default' : 'explore_uncharted'));
        }}
        interactionMode={interactionMode}
        onOpenDirections={() => {
          setActiveTab('planner');
          if (isSidebarCollapsed) setIsSidebarCollapsed(false);
        }}
        onToggleLandingPage={() => setViewMode('landing')}
        isLandingPage={false}
      />

      <div className="flex-1 relative w-full h-full">
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
          userPOIs={userPOIs}
          interactionMode={interactionMode}
          onPlanUnchartedTraverse={handlePlanUnchartedTraverse}
        />

        <div className="absolute top-20 right-4 z-20">
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
          userPOIs={userPOIs}
          onOpenAddPOI={(coord) => {
            setAddPOICoords(coord || selectedCoord || [137.3880, -4.7310]);
            setIsAddPOIOpen(true);
          }}
          onDeleteUserPOI={handleDeleteAstronautPOI}
          customMissions={customMissions}
          onOpenCreateMission={() => setIsCreateMissionOpen(true)}
          onDeleteCustomMission={handleDeleteCustomMission}
          onPlanUnchartedTraverse={handlePlanUnchartedTraverse}
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

      <CustomMissionModal
        isOpen={isCreateMissionOpen}
        onClose={() => setIsCreateMissionOpen(false)}
        onSaveAndPlan={handleSaveAndPlanCustomMission}
        userPOIs={userPOIs}
        currentStartCoord={startCoord}
        currentDestCoord={destCoord}
      />

      <AddPOIModal
        isOpen={isAddPOIOpen}
        onClose={() => setIsAddPOIOpen(false)}
        initialCoords={addPOICoords}
        onSavePOI={handleSaveAstronautPOI}
      />
    </div>
  );
}
