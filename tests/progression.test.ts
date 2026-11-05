import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionManager } from '../src/core/progression';
import { Persistence } from '../src/core/persistence';

describe('Shared Level Progression & Next Level Transition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('strictly follows lifecycle IDLE -> PLAYING -> COMPLETING -> COMPLETED -> LOADING_NEXT -> PLAYING', () => {
    let currentLvl = 1;
    let victoryCalled = false;

    const manager = new ProgressionManager('sudoku', 1, 20, {
      onLevelStart: (lvl) => {
        currentLvl = lvl;
      },
      onVictory: () => {
        victoryCalled = true;
      },
    });

    expect(manager.getState()).toBe('PLAYING');
    expect(manager.getCurrentLevel()).toBe(1);

    // Trigger completion
    const completeOk = manager.triggerCompletion(10, 45, 3);
    expect(completeOk).toBe(true);
    expect(victoryCalled).toBe(true);
    expect(manager.getState()).toBe('COMPLETED');

    // Duplicate completion should be blocked
    expect(manager.triggerCompletion(10, 45, 3)).toBe(false);

    // Advance to Next Level
    const advanceOk = manager.advanceToNextLevel();
    expect(advanceOk).toBe(true);
    expect(currentLvl).toBe(2);
    expect(manager.getCurrentLevel()).toBe(2);
    expect(manager.getState()).toBe('PLAYING');

    // Unlocked level in persistence must now be at least 2
    expect(Persistence.getInstance().getUnlockedLevel('sudoku')).toBe(2);
  });

  it('handles campaign completion at final level (level 20)', () => {
    let campaignFinished = false;

    const manager = new ProgressionManager('box-pusher', 20, 20, {
      onLevelStart: () => {},
      onVictory: (summary) => {
        expect(summary.isMaxLevel).toBe(true);
      },
      onCampaignComplete: () => {
        campaignFinished = true;
      },
    });

    manager.triggerCompletion(25, 60, 3);
    expect(manager.getState()).toBe('COMPLETED');

    // Attempting to advance beyond max level fires onCampaignComplete
    const advanced = manager.advanceToNextLevel();
    expect(advanced).toBe(false);
    expect(campaignFinished).toBe(true);
  });
});
