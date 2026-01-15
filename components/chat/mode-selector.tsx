'use client';

import type { Mode } from '@/lib/types';
import { MODE_DISPLAY_NAMES, MODE_DESCRIPTIONS } from '@/lib/prompts';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
}

export function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
  const modes: Mode[] = ['listen', 'clarify', 'challenge'];

  return (
    <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-800">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center mr-1">
        Mode:
      </span>
      {modes.map((mode) => {
        const isActive = currentMode === mode;

        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            disabled={disabled}
            title={MODE_DESCRIPTIONS[mode]}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${
                isActive
                  ? mode === 'listen'
                    ? 'bg-blue-500 text-white border-2 border-blue-600'
                    : mode === 'clarify'
                    ? 'bg-amber-500 text-white border-2 border-amber-600'
                    : 'bg-red-500 text-white border-2 border-red-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {MODE_DISPLAY_NAMES[mode]}
          </button>
        );
      })}
    </div>
  );
}
