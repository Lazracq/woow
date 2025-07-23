import type { JSX } from 'react';
import React from 'react';
import { Globe, Code, UploadCloud, HelpCircle, GitBranch, Repeat, GitMerge, Clock, Shuffle, Play } from 'lucide-react';

const globeIcon = <Globe className="h-4 w-4 text-blue-500" />;
const codeIcon = <Code className="h-4 w-4 text-purple-500" />;
const uploadCloudIcon = <UploadCloud className="h-4 w-4 text-green-500" />;
const helpCircleIcon = <HelpCircle className="h-4 w-4 text-yellow-500" />;
const gitBranchIcon = <GitBranch className="h-4 w-4 text-pink-500" />;
const repeatIcon = <Repeat className="h-4 w-4 text-blue-400" />;
const gitMergeIcon = <GitMerge className="h-4 w-4 text-gray-500" />;
const clockIcon = <Clock className="h-4 w-4 text-orange-500" />;
const shuffleRedIcon = <Shuffle className="h-4 w-4 text-red-500" />;
const shufflePurpleIcon = <Shuffle className="h-4 w-4 text-purple-500" />;
const codeTealIcon = <Code className="h-4 w-4 text-teal-500" />;
const playIcon = <Play className="h-4 w-4 text-green-600" />;

export const NODE_TYPE_STYLES: Record<string, { border: string; bg: string; icon: JSX.Element }> = {
  HttpCallout: {
    border: 'border-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: globeIcon,
  },
  ScriptExecution: {
    border: 'border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: codeIcon,
  },
  StoragePush: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: uploadCloudIcon,
  },
  Conditional: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: helpCircleIcon,
  },
  Split: {
    border: 'border-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    icon: gitBranchIcon,
  },
  Iteration: {
    border: 'border-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: repeatIcon,
  },
  Merge: {
    border: 'border-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    icon: gitMergeIcon,
  },
  Delay: {
    border: 'border-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: clockIcon,
  },
  Batch: {
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: shuffleRedIcon,
  },
  Parallel: {
    border: 'border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: shufflePurpleIcon,
  },
  DataTransformation: {
    border: 'border-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    icon: codeTealIcon,
  },
  start: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: playIcon,
  },
};

export const getNodeDescription = (type: string, config: Record<string, unknown>) => {
  if (config?.userDescription && typeof config.userDescription === 'string' && config.userDescription.trim()) {
    return config.userDescription;
  }
  switch (type) {
    case 'Delay':
      return `Pause workflow for ${(config?.durationMilliseconds as number) || 1000} ms.`;
    case 'HttpCallout':
      return `Call ${(config?.url as string) || 'an API endpoint'} (${(config?.method as string) || 'GET'})`;
    case 'ScriptExecution':
      return `Run a ${(config?.Language as string) || 'script'} script.`;
    case 'StoragePush':
      return `Push data to ${(config?.DestinationType as string) || 'SFTP'}`;
    case 'Conditional':
      return `If ${(config?.Expression as string) || 'condition'}`;
    case 'Split':
      return `Split into ${(config?.Branches as number) || 2} branches.`;
    case 'Iteration':
      return `For each in ${(config?.Collection as string) || 'items'}`;
    case 'Merge':
      return `Merge branches.`;
    case 'Batch':
      return `Run tasks in batch.`;
    case 'Parallel':
      return `Run tasks in parallel.`;
    case 'DataTransformation':
      return `Transform data using ${(config?.Language as string) || 'script'}`;
    default:
      return '';
  }
};