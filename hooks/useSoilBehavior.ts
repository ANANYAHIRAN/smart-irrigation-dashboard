import { useState, useEffect } from 'react';

export type SoilType = 'sandy-like' | 'loamy-like' | 'clay-like' | 'analyzing';

export interface SoilBehaviorData {
  soilType: SoilType;
  dryingRate: number; // % per hour
  hoursPassed: number;
  initialMoisture: number;
  currentMoisture: number;
  lastIrrigationTime: Date | null;
  irrigationAdjustmentTip: string;
}

interface PostIrrigationData {
  initialMoisture: number;
  irrigationStopTime: number;
}

export const useSoilBehavior = (
  currentMoisture: number,
  pumpStatus: 'ON' | 'OFF'
): SoilBehaviorData => {
  const [soilData, setSoilData] = useState<SoilBehaviorData>({
    soilType: 'analyzing',
    dryingRate: 0,
    hoursPassed: 0,
    initialMoisture: 0,
    currentMoisture,
    lastIrrigationTime: null,
    irrigationAdjustmentTip: 'Waiting for irrigation cycle to complete...',
  });

  const [postIrrigation, setPostIrrigation] = useState<PostIrrigationData | null>(null);
  const [previousPumpStatus, setPreviousPumpStatus] = useState<'ON' | 'OFF'>(pumpStatus);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // DEMO MODE: Initialize with simulated past irrigation for immediate display
  useEffect(() => {
    if (!isDemoMode) return;
    
    // Simulate an irrigation that happened 3 hours ago with loamy-like drying
    const simulatedInitialMoisture = Math.min(currentMoisture + 12, 85);
    const simulatedStopTime = Date.now() - (3 * 60 * 60 * 1000); // 3 hours ago
    
    setPostIrrigation({
      initialMoisture: simulatedInitialMoisture,
      irrigationStopTime: simulatedStopTime,
    });
    
    // Calculate immediately with demo data
    const hoursPassed = 3;
    const moistureLost = simulatedInitialMoisture - currentMoisture;
    const dryingRate = moistureLost / hoursPassed;
    
    let soilType: SoilType;
    let irrigationAdjustmentTip: string;

    if (dryingRate > 6) {
      soilType = 'sandy-like';
      irrigationAdjustmentTip = 'High drainage detected. Increase irrigation frequency with shorter durations to prevent water loss.';
    } else if (dryingRate >= 3) {
      soilType = 'loamy-like';
      irrigationAdjustmentTip = 'Balanced retention. Maintain current irrigation schedule for optimal moisture levels.';
    } else {
      soilType = 'clay-like';
      irrigationAdjustmentTip = 'Slow drainage detected. Reduce irrigation frequency and increase duration to prevent runoff and ensure deep penetration.';
    }

    setSoilData({
      soilType,
      dryingRate: Math.round(dryingRate * 100) / 100,
      hoursPassed,
      initialMoisture: simulatedInitialMoisture,
      currentMoisture,
      lastIrrigationTime: new Date(simulatedStopTime),
      irrigationAdjustmentTip,
    });
  }, [isDemoMode, currentMoisture]);

  // Detect pump status change from ON to OFF (irrigation completed) - switches to real mode
  useEffect(() => {
    if (previousPumpStatus === 'ON' && pumpStatus === 'OFF') {
      setIsDemoMode(false); // Switch to real mode
      setPostIrrigation({
        initialMoisture: currentMoisture,
        irrigationStopTime: Date.now(),
      });
      setSoilData(prev => ({
        ...prev,
        soilType: 'analyzing',
        initialMoisture: currentMoisture,
        lastIrrigationTime: new Date(),
        irrigationAdjustmentTip: 'Analyzing soil drying pattern...',
      }));
    }
    setPreviousPumpStatus(pumpStatus);
  }, [pumpStatus, currentMoisture, previousPumpStatus]);

  // Continuously calculate drying rate after irrigation
  useEffect(() => {
    if (!postIrrigation) return;

    const calculateSoilBehavior = () => {
      const now = Date.now();
      const hoursPassed = (now - postIrrigation.irrigationStopTime) / (1000 * 60 * 60);
      
      // Need at least 30 minutes of data for meaningful calculation
      if (hoursPassed < 0.5) {
        setSoilData(prev => ({
          ...prev,
          hoursPassed: Math.round(hoursPassed * 10) / 10,
          currentMoisture,
        }));
        return;
      }

      const moistureLost = postIrrigation.initialMoisture - currentMoisture;
      const dryingRate = moistureLost / hoursPassed;

      // Classify soil based on drying rate
      let soilType: SoilType;
      let irrigationAdjustmentTip: string;

      if (dryingRate > 6) {
        soilType = 'sandy-like';
        irrigationAdjustmentTip = 'High drainage detected. Increase irrigation frequency with shorter durations to prevent water loss.';
      } else if (dryingRate >= 3) {
        soilType = 'loamy-like';
        irrigationAdjustmentTip = 'Balanced retention. Maintain current irrigation schedule for optimal moisture levels.';
      } else {
        soilType = 'clay-like';
        irrigationAdjustmentTip = 'Slow drainage detected. Reduce irrigation frequency and increase duration to prevent runoff and ensure deep penetration.';
      }

      setSoilData({
        soilType,
        dryingRate: Math.round(dryingRate * 100) / 100,
        hoursPassed: Math.round(hoursPassed * 10) / 10,
        initialMoisture: postIrrigation.initialMoisture,
        currentMoisture,
        lastIrrigationTime: new Date(postIrrigation.irrigationStopTime),
        irrigationAdjustmentTip,
      });
    };

    // Calculate immediately and every minute
    calculateSoilBehavior();
    const interval = setInterval(calculateSoilBehavior, 60000);

    return () => clearInterval(interval);
  }, [postIrrigation, currentMoisture]);

  // Reset when new irrigation starts
  useEffect(() => {
    if (pumpStatus === 'ON') {
      setSoilData(prev => ({
        ...prev,
        soilType: 'analyzing',
        irrigationAdjustmentTip: 'Irrigation in progress...',
      }));
    }
  }, [pumpStatus]);

  return soilData;
};
