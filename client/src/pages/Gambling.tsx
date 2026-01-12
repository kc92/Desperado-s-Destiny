/**
 * Gambling Page - Redirect
 * This page has been decomposed into the gambling/ directory.
 * This file redirects to the new GamblingHub for backward compatibility.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

export const Gambling: React.FC = () => {
  return <Navigate to="/game/gambling" replace />;
};

export default Gambling;
