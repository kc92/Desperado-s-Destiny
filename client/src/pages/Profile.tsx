/**
 * Profile Page
 * Public character profile view styled as a "Wanted Poster"
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Card, Button } from '@/components/ui';

interface ProfileData {
  name: string;
  faction: string;
  level: number;
  appearance: {
    bodyType: string;
    skinTone: number;
    facePreset: number;
    hairStyle: number;
    hairColor: number;
  };
  stats: {
    cunning: number;
    spirit: number;
    combat: number;
    craft: number;
  };
  combatRecord: {
    wins: number;
    losses: number;
  };
  wantedLevel: number;
  bountyAmount: number;
  isJailed: boolean;
  gang: {
    id: string;
    name: string;
    tag: string;
  } | null;
  lastActive: string;
  createdAt: string;
}

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format last active
const formatLastActive = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 5) return 'Online now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};

export const Profile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<{ data: { profile: ProfileData } }>(
          `/profiles/${encodeURIComponent(name)}`
        );
        setProfile(response.data.data.profile);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto"></div>
          <p className="text-desert-sand font-serif">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-4xl mb-4">🤠</p>
        <h2 className="text-xl font-western text-gold-light mb-2">Character Not Found</h2>
        <p className="text-desert-stone mb-6">{error || 'This character does not exist.'}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wanted Poster Header */}
      <div className="relative bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-8 border-4 border-amber-900/30 shadow-xl">
        {/* Wanted/Citizen Banner */}
        <h1 className="text-center font-western text-4xl text-amber-900 tracking-wider mb-4">
          {profile.wantedLevel > 0 ? '~ WANTED ~' : '~ CITIZEN ~'}
        </h1>

        {/* Character Avatar Placeholder */}
        <div className="flex justify-center my-6">
          <div className="w-32 h-32 bg-amber-900/20 rounded-full flex items-center justify-center border-4 border-amber-900/30">
            <span className="text-5xl">🤠</span>
          </div>
        </div>

        {/* Character Name */}
        <h2 className="text-center font-western text-3xl text-amber-900 mb-1">
          {profile.name}
        </h2>
        <p className="text-center text-amber-800 font-serif">
          Level {profile.level} • {profile.faction}
        </p>

        {/* Bounty Amount */}
        {profile.wantedLevel > 0 && (
          <div className="text-center mt-4">
            <span className="text-2xl font-western text-red-800">
              BOUNTY: {profile.bountyAmount.toLocaleString()} GOLD
            </span>
            <div className="flex justify-center mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl ${
                    i < profile.wantedLevel ? 'text-red-600' : 'text-amber-900/30'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jailed Status */}
        {profile.isJailed && (
          <div className="text-center mt-4">
            <span className="bg-red-600 text-white px-4 py-1 rounded font-bold text-sm">
              CURRENTLY JAILED
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card variant="leather" className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-light">
            {profile.combatRecord.wins}
          </div>
          <div className="text-xs text-desert-stone uppercase">Wins</div>
        </Card>
        <Card variant="leather" className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-light">
            {profile.combatRecord.losses}
          </div>
          <div className="text-xs text-desert-stone uppercase">Losses</div>
        </Card>
        <Card variant="leather" className="p-4 text-center">
          <div className="text-lg font-bold text-gold-light truncate">
            {profile.gang?.name || 'None'}
          </div>
          <div className="text-xs text-desert-stone uppercase">Gang</div>
        </Card>
        <Card variant="leather" className="p-4 text-center">
          <div className="text-sm font-bold text-gold-light">
            {formatDate(profile.createdAt)}
          </div>
          <div className="text-xs text-desert-stone uppercase">Joined</div>
        </Card>
      </div>

      {/* Character Stats */}
      <Card variant="wood" className="mt-6 p-6">
        <h3 className="font-western text-gold-light mb-4">Stats</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gold-light">
              {profile.stats.combat}
            </div>
            <div className="text-xs text-desert-stone">Combat</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gold-light">
              {profile.stats.cunning}
            </div>
            <div className="text-xs text-desert-stone">Cunning</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gold-light">
              {profile.stats.spirit}
            </div>
            <div className="text-xs text-desert-stone">Spirit</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gold-light">
              {profile.stats.craft}
            </div>
            <div className="text-xs text-desert-stone">Craft</div>
          </div>
        </div>
      </Card>

      {/* Activity & Actions */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-desert-stone">
          Last active: {formatLastActive(profile.lastActive)}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/game/combat?target=${profile.name}`)}
          >
            Challenge
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/game/mail?to=${profile.name}`)}
          >
            Send Mail
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
