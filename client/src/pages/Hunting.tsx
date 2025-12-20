/**
 * Hunting Page
 * Track, hunt, and harvest wild animals across the frontier
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, ProgressBar } from '@/components/ui';
import {
  huntingService,
  HuntAvailability,
  HuntingTrip,
  HuntingStatistics,
  HuntingGround,
  HuntingWeapon,
  ShotPlacement,
  AnimalSpecies,
  KillQuality,
} from '@/services/hunting.service';
import { logger } from '@/services/logger.service';

type HuntingPhase = 'idle' | 'select-ground' | 'select-weapon' | 'tracking' | 'aiming' | 'result';

export function Hunting() {
  const navigate = useNavigate();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<HuntAvailability | null>(null);
  const [currentTrip, setCurrentTrip] = useState<HuntingTrip | null>(null);
  const [statistics, setStatistics] = useState<HuntingStatistics | null>(null);
  const [phase, setPhase] = useState<HuntingPhase>('idle');

  // Selection state
  const [selectedGround, setSelectedGround] = useState<HuntingGround | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<HuntingWeapon>(HuntingWeapon.PISTOL);

  // Tracking state
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [foundAnimal, setFoundAnimal] = useState<AnimalSpecies | null>(null);
  const [animalDistance, setAnimalDistance] = useState<number | null>(null);

  // Result state
  const [lastResult, setLastResult] = useState<{
    hit: boolean;
    quality?: KillQuality;
    xpEarned?: number;
    goldEarned?: number;
    animal?: AnimalSpecies;
  } | null>(null);

  // ===== Data Loading =====
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [availabilityData, tripData, statsData] = await Promise.all([
        huntingService.checkAvailability(),
        huntingService.getCurrentTrip().catch(() => null),
        huntingService.getStatistics().catch(() => null),
      ]);

      setAvailability(availabilityData);
      setSelectedWeapon(availabilityData.equipment.weapon);

      if (tripData) {
        setCurrentTrip(tripData);
        // Restore phase based on trip status
        if (tripData.status === 'tracking') {
          setPhase('tracking');
          setTrackingProgress(tripData.trackingProgress || 0);
        } else if (tripData.status === 'aiming' && tripData.targetAnimal) {
          setPhase('aiming');
          setFoundAnimal(tripData.targetAnimal);
        }
      }

      if (statsData) {
        setStatistics(statsData);
      }
    } catch (err) {
      logger.error('Failed to load hunting data', err);
      setError('Failed to load hunting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== Actions =====
  const handleSelectGround = (ground: HuntingGround) => {
    setSelectedGround(ground);
    setPhase('select-weapon');
  };

  const handleStartHunt = async () => {
    if (!selectedGround) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await huntingService.startHunt(selectedGround.locationId, selectedWeapon);
      if (result.success && result.trip) {
        setCurrentTrip(result.trip);
        setPhase('tracking');
        setTrackingProgress(0);
      } else {
        setError(result.message || 'Failed to start hunt');
      }
    } catch (err) {
      logger.error('Failed to start hunt', err);
      setError('Failed to start hunt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await huntingService.trackAnimal();
      if (result.success) {
        setTrackingProgress(result.trackingProgress || 0);
        if (result.animalFound && result.animal) {
          setFoundAnimal(result.animal);
          setAnimalDistance(result.distance || 50);
          setPhase('aiming');
        }
      } else {
        setError(result.error || 'Tracking failed');
      }
    } catch (err) {
      logger.error('Failed to track', err);
      setError('Failed to track animal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoot = async (placement: ShotPlacement) => {
    if (!foundAnimal) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await huntingService.takeShot(placement);

      setLastResult({
        hit: result.hit || false,
        quality: result.quality,
        xpEarned: result.xpEarned,
        goldEarned: result.goldEarned,
        animal: foundAnimal,
      });

      setPhase('result');
    } catch (err) {
      logger.error('Failed to shoot', err);
      setError('Shot failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandon = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await huntingService.abandonHunt();

      // Reset state
      setPhase('idle');
      setCurrentTrip(null);
      setSelectedGround(null);
      setTrackingProgress(0);
      setFoundAnimal(null);
      setAnimalDistance(null);
      setLastResult(null);
    } catch (err) {
      logger.error('Failed to abandon hunt', err);
      setError('Failed to abandon hunt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewHunt = () => {
    setPhase('select-ground');
    setSelectedGround(null);
    setTrackingProgress(0);
    setFoundAnimal(null);
    setAnimalDistance(null);
    setLastResult(null);
  };

  // ===== Render Helpers =====
  const renderGroundSelection = () => {
    const grounds = availability?.availableGrounds || [];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Select Hunting Ground</h2>
        {grounds.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-400">No hunting grounds available. Please try again later.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grounds.map(ground => {
            const terrain = huntingService.getTerrainInfo(ground.terrain);
            return (
              <Card
                key={ground.locationId}
                className="p-4 cursor-pointer hover:border-amber-500 transition-colors"
                onClick={() => handleSelectGround(ground)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{ground.name}</h3>
                  <span className="text-2xl">{terrain.icon}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{ground.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Terrain:</span>
                    <span>{terrain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Danger:</span>
                    <span className={ground.dangerLevel > 5 ? 'text-red-400' : 'text-green-400'}>
                      {ground.dangerLevel}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Energy:</span>
                    <span className="text-blue-400">{ground.energyCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Level:</span>
                    <span>{ground.minLevel}+</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Animals: </span>
                  <span className="text-xs text-gray-300">
                    {ground.availableAnimals.slice(0, 3).map(a => huntingService.getAnimalName(a)).join(', ')}
                    {ground.availableAnimals.length > 3 && '...'}
                  </span>
                </div>
              </Card>
            );
          })}
          </div>
        )}
        <Button variant="ghost" onClick={() => setPhase('idle')}>
          Back
        </Button>
      </div>
    );
  };

  const renderWeaponSelection = () => {
    const weapons = [
      { weapon: HuntingWeapon.PISTOL, name: 'Pistol', desc: 'Basic weapon, low accuracy' },
      { weapon: HuntingWeapon.VARMINT_RIFLE, name: 'Varmint Rifle', desc: 'Good for small game' },
      { weapon: HuntingWeapon.HUNTING_RIFLE, name: 'Hunting Rifle', desc: 'Best for large game' },
      { weapon: HuntingWeapon.BOW, name: 'Bow', desc: 'Silent, good quality kills' },
      { weapon: HuntingWeapon.SHOTGUN, name: 'Shotgun', desc: 'High damage, close range' },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Select Weapon</h2>
        {selectedGround && (
          <p className="text-gray-400">Hunting at: <span className="text-white">{selectedGround.name}</span></p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {weapons.map(({ weapon, name, desc }) => (
            <Card
              key={weapon}
              className={`p-4 cursor-pointer transition-colors ${
                selectedWeapon === weapon ? 'border-amber-500 bg-amber-900/20' : 'hover:border-gray-600'
              }`}
              onClick={() => setSelectedWeapon(weapon)}
            >
              <h3 className="font-bold">{name}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </Card>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setPhase('select-ground')}>
            Back
          </Button>
          <Button variant="primary" onClick={handleStartHunt} disabled={isLoading}>
            {isLoading ? 'Starting...' : 'Start Hunt'}
          </Button>
        </div>
      </div>
    );
  };

  const renderTracking = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-amber-400">Tracking...</h2>
      {selectedGround && (
        <p className="text-gray-400">Location: <span className="text-white">{selectedGround.name}</span></p>
      )}

      <Card className="p-6">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Tracking Progress</span>
            <span className="text-amber-400">{trackingProgress}%</span>
          </div>
          <ProgressBar value={trackingProgress} max={100} color="amber" />
        </div>

        <p className="text-center text-gray-400 mb-4">
          {trackingProgress < 30 && "Looking for fresh tracks..."}
          {trackingProgress >= 30 && trackingProgress < 60 && "Following a trail..."}
          {trackingProgress >= 60 && trackingProgress < 90 && "Getting closer..."}
          {trackingProgress >= 90 && "Almost there!"}
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="primary" onClick={handleTrack} disabled={isLoading}>
            {isLoading ? 'Tracking...' : 'Track'}
          </Button>
          <Button variant="danger" onClick={handleAbandon} disabled={isLoading}>
            Abandon Hunt
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAiming = () => {
    const shots = [
      { placement: ShotPlacement.HEAD, name: 'Head', difficulty: 'Very Hard', reward: 'Highest' },
      { placement: ShotPlacement.HEART, name: 'Heart', difficulty: 'Hard', reward: 'High' },
      { placement: ShotPlacement.LUNGS, name: 'Lungs', difficulty: 'Medium', reward: 'Normal' },
      { placement: ShotPlacement.BODY, name: 'Body', difficulty: 'Easy', reward: 'Low' },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-amber-400">Animal Spotted!</h2>

        <Card className="p-6 text-center">
          <div className="text-4xl mb-2">
            {foundAnimal === AnimalSpecies.RABBIT && '🐰'}
            {foundAnimal === AnimalSpecies.WHITE_TAILED_DEER && '🦌'}
            {foundAnimal === AnimalSpecies.TURKEY && '🦃'}
            {foundAnimal === AnimalSpecies.BLACK_BEAR && '🐻'}
            {foundAnimal === AnimalSpecies.ELK && '🦌'}
            {!foundAnimal?.includes('BEAR') && !foundAnimal?.includes('DEER') && !foundAnimal?.includes('RABBIT') && !foundAnimal?.includes('TURKEY') && !foundAnimal?.includes('ELK') && '🎯'}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {foundAnimal ? huntingService.getAnimalName(foundAnimal) : 'Unknown Animal'}
          </h3>
          {animalDistance && (
            <p className="text-gray-400">Distance: {animalDistance} yards</p>
          )}
        </Card>

        <div className="space-y-2">
          <h3 className="font-bold text-amber-400">Choose Your Shot</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {shots.map(({ placement, name, difficulty, reward }) => (
              <Button
                key={placement}
                variant="secondary"
                className="p-4 h-auto flex-col items-start"
                onClick={() => handleShoot(placement)}
                disabled={isLoading}
              >
                <span className="font-bold text-lg">{name} Shot</span>
                <span className="text-sm text-gray-400">
                  Difficulty: {difficulty} | Reward: {reward}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Button variant="danger" onClick={handleAbandon} disabled={isLoading}>
          Let It Go
        </Button>
      </div>
    );
  };

  const renderResult = () => {
    if (!lastResult) return null;

    const qualityInfo = lastResult.quality ? huntingService.getQualityInfo(lastResult.quality) : null;

    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          {lastResult.hit ? (
            <>
              <div className="text-6xl mb-4">
                {qualityInfo?.name === 'Perfect' && '🏆'}
                {qualityInfo?.name === 'Excellent' && '⭐'}
                {qualityInfo?.name === 'Good' && '👍'}
                {qualityInfo?.name === 'Common' && '✓'}
                {qualityInfo?.name === 'Poor' && '💨'}
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Successful Hunt!</h2>
              <p className="text-gray-400 mb-4">
                You bagged a {lastResult.animal ? huntingService.getAnimalName(lastResult.animal) : 'animal'}!
              </p>

              {qualityInfo && (
                <div className={`text-xl font-bold mb-4 ${qualityInfo.color}`}>
                  {qualityInfo.name} Quality
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                {lastResult.xpEarned && (
                  <div className="bg-purple-900/30 rounded-lg p-3">
                    <div className="text-purple-400 text-sm">XP Earned</div>
                    <div className="text-xl font-bold text-white">+{lastResult.xpEarned}</div>
                  </div>
                )}
                {lastResult.goldEarned && (
                  <div className="bg-yellow-900/30 rounded-lg p-3">
                    <div className="text-yellow-400 text-sm">Gold Earned</div>
                    <div className="text-xl font-bold text-white">+{lastResult.goldEarned}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💨</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Missed!</h2>
              <p className="text-gray-400">
                The {lastResult.animal ? huntingService.getAnimalName(lastResult.animal) : 'animal'} escaped!
              </p>
            </>
          )}
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="primary" onClick={handleNewHunt}>
            Hunt Again
          </Button>
          <Button variant="ghost" onClick={() => navigate('/game/location')}>
            Return to Town
          </Button>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Card className="p-4">
        <h3 className="font-bold text-amber-400 mb-3">Your Hunting Stats</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Total Hunts:</span>
            <span className="ml-2 text-white">{statistics.totalHunts}</span>
          </div>
          <div>
            <span className="text-gray-500">Successful:</span>
            <span className="ml-2 text-green-400">{statistics.successfulHunts}</span>
          </div>
          <div>
            <span className="text-gray-500">Perfect Kills:</span>
            <span className="ml-2 text-yellow-400">{statistics.perfectKills}</span>
          </div>
          <div>
            <span className="text-gray-500">Gold Earned:</span>
            <span className="ml-2 text-yellow-400">${statistics.totalGoldEarned}</span>
          </div>
        </div>
        {statistics.largestKill && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <span className="text-gray-500 text-sm">Largest Kill: </span>
            <span className="text-white text-sm">
              {huntingService.getAnimalName(statistics.largestKill.species)}
              ({huntingService.getQualityInfo(statistics.largestKill.quality).name})
            </span>
          </div>
        )}
      </Card>
    );
  };

  // ===== Main Render =====
  if (isLoading && phase === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Hunting</h1>
        <p className="text-gray-400">
          Track and hunt wild animals across the frontier for gold and resources.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <Button
            variant="secondary"
            onClick={loadData}
            className="mt-2"
            size="sm"
          >
            Retry
          </Button>
        </div>
      )}

      {!availability?.canHunt && availability?.reason && phase === 'idle' && (
        <Card className="p-4 mb-4 border-yellow-500">
          <p className="text-yellow-400">{availability.reason}</p>
        </Card>
      )}

      {phase === 'idle' && (
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2">Ready to Hunt?</h2>
            <p className="text-gray-400 mb-4">
              Choose a hunting ground, select your weapon, and track down your prey.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setPhase('select-ground')}
              disabled={!availability?.canHunt}
            >
              Start Hunting
            </Button>
          </Card>

          {/* Equipment Status */}
          {availability?.equipment && (
            <Card className="p-4">
              <h3 className="font-bold text-amber-400 mb-3">Your Equipment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.weapon !== HuntingWeapon.PISTOL ? 'text-green-400' : 'text-gray-500'}>
                    {huntingService.getWeaponName(availability.equipment.weapon)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.hasBinoculars ? 'text-green-400' : 'text-gray-500'}>
                    {availability.equipment.hasBinoculars ? '✓' : '✗'} Binoculars
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.hasCamouflage ? 'text-green-400' : 'text-gray-500'}>
                    {availability.equipment.hasCamouflage ? '✓' : '✗'} Camouflage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.hasAnimalCalls ? 'text-green-400' : 'text-gray-500'}>
                    {availability.equipment.hasAnimalCalls ? '✓' : '✗'} Animal Calls
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.hasScentBlocker ? 'text-green-400' : 'text-gray-500'}>
                    {availability.equipment.hasScentBlocker ? '✓' : '✗'} Scent Blocker
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={availability.equipment.hasHuntingKnife ? 'text-green-400' : 'text-gray-500'}>
                    {availability.equipment.hasHuntingKnife ? '✓' : '✗'} Hunting Knife
                  </span>
                </div>
              </div>
            </Card>
          )}

          {renderStatistics()}
        </div>
      )}

      {phase === 'select-ground' && renderGroundSelection()}
      {phase === 'select-weapon' && renderWeaponSelection()}
      {phase === 'tracking' && renderTracking()}
      {phase === 'aiming' && renderAiming()}
      {phase === 'result' && renderResult()}
    </div>
  );
}

export default Hunting;
