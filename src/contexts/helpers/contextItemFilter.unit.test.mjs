import ItemFilter from './contextItemFilter.mjs';

/**
 * @file contextItemFilter.unit.test.js
 * @description Unit tests for the ItemFilter class
 * @path src/contexts/helpers/contextItemFilter.unit.test.js

 */


describe('ItemFilter', () => {
  let sourceItem;
  let targetItem;

  beforeEach(() => {
    sourceItem = {
      value: 'source value',
      timestamp: Date.now(),
      modifiedAt: new Date(),
      version: '1.0.0'
    };

    targetItem = {
      value: 'target value',
      timestamp: Date.now() - 1000,
      modifiedAt: new Date(Date.now() - 1000),
      version: '0.9.0'
    };
  });

  describe('allowOnly()', () => {
    it('should create filter that allows only specified paths', () => {
      const filter = ItemFilter.allowOnly(['data.inventory', 'settings.volume']);

      expect(filter(sourceItem, targetItem, 'data.inventory.weapons')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.other')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'state.ui')).toBe(targetItem);
    });

    it('should handle exact path matches', () => {
      const filter = ItemFilter.allowOnly(['data.player']);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'mydata.player')).toBe(sourceItem);
    });

    it('should handle empty paths array', () => {
      const filter = ItemFilter.allowOnly([]);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, '')).toBe(targetItem);
    });

    it('should handle single path', () => {
      const filter = ItemFilter.allowOnly(['data.inventory']);

      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.inventory.weapons')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.settings')).toBe(targetItem);
    });

    it('should handle complex nested paths', () => {
      const filter = ItemFilter.allowOnly(['game.player.stats.level', 'config.ui.theme']);

      expect(filter(sourceItem, targetItem, 'game.player.stats.level')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'game.player.stats.levelData')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'config.ui.theme.dark')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'game.player.inventory')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'config.audio')).toBe(targetItem);
    });

    it('should be case sensitive', () => {
      const filter = ItemFilter.allowOnly(['Data.Inventory']);

      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'Data.Inventory')).toBe(sourceItem);
    });

    it('should handle special characters in paths', () => {
      const filter = ItemFilter.allowOnly(['data.items-list', 'config.ui_theme']);

      expect(filter(sourceItem, targetItem, 'data.items-list')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'config.ui_theme')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.items_list')).toBe(targetItem);
    });

    it('should return function that accepts correct parameters', () => {
      const filter = ItemFilter.allowOnly(['test']);

      expect(typeof filter).toBe('function');
      expect(filter.length).toBe(5); // Enhanced to accept: sourceItem, targetItem, itemPath, sourceComponent, targetComponent
    });
  });

  describe('blockOnly()', () => {
    it('should create filter that blocks specified paths', () => {
      const filter = ItemFilter.blockOnly(['data.temp', 'state.cache']);

      expect(filter(sourceItem, targetItem, 'data.temp.something')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'state.cache')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
    });

    it('should handle exact path matches', () => {
      const filter = ItemFilter.blockOnly(['data.cache']);

      expect(filter(sourceItem, targetItem, 'data.cache')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.cacheData')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'mydata.cache')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
    });

    it('should handle empty paths array', () => {
      const filter = ItemFilter.blockOnly([]);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.temp')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, '')).toBe(sourceItem);
    });

    it('should handle single path', () => {
      const filter = ItemFilter.blockOnly(['data.temp']);

      expect(filter(sourceItem, targetItem, 'data.temp')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.temp.cache')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
    });

    it('should handle multiple blocking paths', () => {
      const filter = ItemFilter.blockOnly(['temp', 'cache', 'debug']);

      expect(filter(sourceItem, targetItem, 'data.temp')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'state.cache')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'app.debug')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.inventory')).toBe(sourceItem);
    });

    it('should be case sensitive', () => {
      const filter = ItemFilter.blockOnly(['Data.Temp']);

      expect(filter(sourceItem, targetItem, 'data.temp')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'Data.Temp')).toBe(targetItem);
    });

    it('should handle overlapping paths correctly', () => {
      const filter = ItemFilter.blockOnly(['data.player', 'data.player.stats']);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.player.stats')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.player.inventory')).toBe(targetItem);
    });

    it('should return function that accepts correct parameters', () => {
      const filter = ItemFilter.blockOnly(['test']);

      expect(typeof filter).toBe('function');
      expect(filter.length).toBe(5); // Enhanced to accept: sourceItem, targetItem, itemPath, sourceComponent, targetComponent
    });
  });

  describe('matchPattern()', () => {
    it('should create filter that matches regex patterns', () => {
      const filter = ItemFilter.matchPattern(/data\.player/);

      expect(filter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.playerInventory')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'settings.player')).toBe(targetItem);
    });

    it('should handle complex regex patterns', () => {
      const filter = ItemFilter.matchPattern(/settings\..*volume$/);

      expect(filter(sourceItem, targetItem, 'settings.audio.volume')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.ui.volume')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.audio.quality')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'settings.volume.high')).toBe(targetItem);
    });

    it('should handle case-sensitive patterns', () => {
      const filter = ItemFilter.matchPattern(/Data\.Player/);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'Data.Player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'Data.PlayerStats')).toBe(sourceItem);
    });

    it('should handle case-insensitive patterns', () => {
      const filter = ItemFilter.matchPattern(/data\.player/i);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'Data.Player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'DATA.PLAYER')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(targetItem);
    });

    it('should handle start and end anchors', () => {
      const filter = ItemFilter.matchPattern(/^data\.player$/);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.playerStats')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'app.data.player')).toBe(targetItem);
    });

    it('should handle character classes and quantifiers', () => {
      const filter = ItemFilter.matchPattern(/data\.[a-z]+\d+/);

      expect(filter(sourceItem, targetItem, 'data.item1')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.player123')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.ITEM1')).toBe(targetItem);
      expect(filter(sourceItem, targetItem, 'data.item')).toBe(targetItem);
    });

    it('should handle special regex characters in paths', () => {
      const filter = ItemFilter.matchPattern(/data\.\w+\[\d+\]/);

      expect(filter(sourceItem, targetItem, 'data.items[0]')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.weapons[123]')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.items.0')).toBe(targetItem);
    });

    it('should handle empty string matches', () => {
      const filter = ItemFilter.matchPattern(/^$/);

      expect(filter(sourceItem, targetItem, '')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'any')).toBe(targetItem);
    });

    it('should handle global flag correctly', () => {
      const filter = ItemFilter.matchPattern(/data/g);

      expect(filter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'metadata.config')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'settings.volume')).toBe(targetItem);
    });

    it('should return function that accepts correct parameters', () => {
      const filter = ItemFilter.matchPattern(/test/);

      expect(typeof filter).toBe('function');
      expect(filter.length).toBe(3);
    });
  });

  describe('custom()', () => {
    it('should create filter based on custom condition', () => {
      const conditionFn = jest.fn((source, target, path) => {
        return source.timestamp > target.timestamp;
      });
      const filter = ItemFilter.custom(conditionFn);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(sourceItem);
      expect(conditionFn).toHaveBeenCalledWith(sourceItem, targetItem, 'any.path');
    });

    it('should return target when condition is false', () => {
      const conditionFn = () => false;
      const filter = ItemFilter.custom(conditionFn);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
    });

    it('should return source when condition is true', () => {
      const conditionFn = () => true;
      const filter = ItemFilter.custom(conditionFn);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(sourceItem);
    });

    it('should pass all parameters to condition function', () => {
      const conditionFn = jest.fn().mockReturnValue(true);
      const filter = ItemFilter.custom(conditionFn);
      const testPath = 'test.path.value';

      filter(sourceItem, targetItem, testPath);

      expect(conditionFn).toHaveBeenCalledWith(sourceItem, targetItem, testPath);
      expect(conditionFn).toHaveBeenCalledTimes(1);
    });

    it('should handle complex custom logic', () => {
      const conditionFn = (source, target, path) => {
        if (path.includes('critical')) return true;
        if (path.includes('temp')) return false;
        return source.version > target.version;
      };
      const filter = ItemFilter.custom(conditionFn);

      expect(filter(sourceItem, targetItem, 'data.critical.config')).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'data.temp.cache')).toBe(targetItem);

      const olderSource = { ...sourceItem, version: '0.8.0' };
      expect(filter(olderSource, targetItem, 'data.normal')).toBe(targetItem);
    });

    it('should handle condition function that throws error', () => {
      const conditionFn = () => {
        throw new Error('Condition error');
      };
      const filter = ItemFilter.custom(conditionFn);

      expect(() => {
        filter(sourceItem, targetItem, 'any.path');
      }).toThrow('Condition error');
    });

    it('should handle condition function with null/undefined return', () => {
      const conditionFn = () => null;
      const filter = ItemFilter.custom(conditionFn);

      expect(filter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
    });

    it('should handle condition function with truthy/falsy values', () => {
      const truthyValues = [1, 'string', [], {}, true];
      const falsyValues = [0, '', null, undefined, false, NaN];

      truthyValues.forEach(value => {
        const filter = ItemFilter.custom(() => value);
        expect(filter(sourceItem, targetItem, 'test')).toBe(sourceItem);
      });

      falsyValues.forEach(value => {
        const filter = ItemFilter.custom(() => value);
        expect(filter(sourceItem, targetItem, 'test')).toBe(targetItem);
      });
    });

    it('should return function that accepts correct parameters', () => {
      const conditionFn = () => true;
      const filter = ItemFilter.custom(conditionFn);

      expect(typeof filter).toBe('function');
      expect(filter.length).toBe(3);
    });
  });

  describe('and()', () => {
    it('should combine filters with AND logic', () => {
      const filter1 = ItemFilter.allowOnly(['data.player']);
      const filter2 = ItemFilter.custom(() => true);
      const combinedFilter = ItemFilter.and(filter1, filter2);

      expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
    });

    it('should short-circuit on first rejection', () => {
      const filter1 = ItemFilter.allowOnly(['data.other']);
      const filter2 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.and(filter1, filter2);

      const result = combinedFilter(sourceItem, targetItem, 'data.player');

      expect(result).toBe(targetItem);
      expect(filter2).not.toHaveBeenCalled();
    });

    it('should continue evaluation until rejection', () => {
      const filter1 = jest.fn(() => sourceItem);
      const filter2 = jest.fn(() => sourceItem);
      const filter3 = jest.fn(() => targetItem);
      const filter4 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.and(filter1, filter2, filter3, filter4);

      const result = combinedFilter(sourceItem, targetItem, 'test.path');

      expect(result).toBe(targetItem);
      expect(filter1).toHaveBeenCalled();
      expect(filter2).toHaveBeenCalled();
      expect(filter3).toHaveBeenCalled();
      expect(filter4).not.toHaveBeenCalled();
    });

    it('should return source when all filters accept', () => {
      const filter1 = ItemFilter.allowOnly(['data']);
      const filter2 = ItemFilter.matchPattern(/data\.player/);
      const filter3 = ItemFilter.custom(() => true);
      const combinedFilter = ItemFilter.and(filter1, filter2, filter3);

      expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
    });

    it('should handle empty filters array', () => {
      const combinedFilter = ItemFilter.and();

      expect(combinedFilter(sourceItem, targetItem, 'any.path')).toBe(sourceItem);
    });

    it('should handle single filter', () => {
      const filter1 = ItemFilter.allowOnly(['data.player']);
      const combinedFilter = ItemFilter.and(filter1);

      expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
    });

    it('should handle multiple rejections', () => {
      const filter1 = ItemFilter.blockOnly(['data']);
      const filter2 = ItemFilter.blockOnly(['test']);
      const combinedFilter = ItemFilter.and(filter1, filter2);

      expect(combinedFilter(sourceItem, targetItem, 'data.player')).toBe(targetItem);
      expect(combinedFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
    });

    it('should pass correct parameters to all filters', () => {
      const filter1 = jest.fn(() => sourceItem);
      const filter2 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.and(filter1, filter2);
      const testPath = 'test.path';

      combinedFilter(sourceItem, targetItem, testPath);

      expect(filter1).toHaveBeenCalledWith(sourceItem, targetItem, testPath);
      expect(filter2).toHaveBeenCalledWith(sourceItem, targetItem, testPath);
    });

    it('should return function that accepts correct parameters', () => {
      const filter1 = ItemFilter.allowOnly(['test']);
      const combinedFilter = ItemFilter.and(filter1);

      expect(typeof combinedFilter).toBe('function');
      expect(combinedFilter.length).toBe(3);
    });
  });

  describe('or()', () => {
    it('should combine filters with OR logic', () => {
      const filter1 = ItemFilter.allowOnly(['data.player']);
      const filter2 = ItemFilter.allowOnly(['settings.volume']);
      const combinedFilter = ItemFilter.or(filter1, filter2);

      expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
    });

    it('should short-circuit on first acceptance', () => {
      const filter1 = ItemFilter.allowOnly(['data.player']);
      const filter2 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.or(filter1, filter2);

      const result = combinedFilter(sourceItem, targetItem, 'data.playerStats');

      expect(result).toBe(sourceItem);
      expect(filter2).not.toHaveBeenCalled();
    });

    it('should continue evaluation until acceptance', () => {
      const filter1 = jest.fn(() => targetItem);
      const filter2 = jest.fn(() => targetItem);
      const filter3 = jest.fn(() => sourceItem);
      const filter4 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.or(filter1, filter2, filter3, filter4);

      const result = combinedFilter(sourceItem, targetItem, 'test.path');

      expect(result).toBe(sourceItem);
      expect(filter1).toHaveBeenCalled();
      expect(filter2).toHaveBeenCalled();
      expect(filter3).toHaveBeenCalled();
      expect(filter4).not.toHaveBeenCalled();
    });

    it('should return target when all filters reject', () => {
      const filter1 = ItemFilter.allowOnly(['other']);
      const filter2 = ItemFilter.matchPattern(/other/);
      const filter3 = ItemFilter.custom(() => false);
      const combinedFilter = ItemFilter.or(filter1, filter2, filter3);

      expect(combinedFilter(sourceItem, targetItem, 'data.player')).toBe(targetItem);
    });

    it('should handle empty filters array', () => {
      const combinedFilter = ItemFilter.or();

      expect(combinedFilter(sourceItem, targetItem, 'any.path')).toBe(targetItem);
    });

    it('should handle single filter', () => {
      const filter1 = ItemFilter.allowOnly(['data.player']);
      const combinedFilter = ItemFilter.or(filter1);

      expect(combinedFilter(sourceItem, targetItem, 'data.playerStats')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'data.enemy')).toBe(targetItem);
    });

    it('should handle multiple acceptances', () => {
      const filter1 = ItemFilter.allowOnly(['data']);
      const filter2 = ItemFilter.allowOnly(['settings']);
      const combinedFilter = ItemFilter.or(filter1, filter2);

      expect(combinedFilter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'other.value')).toBe(targetItem);
    });

    it('should pass correct parameters to filters', () => {
      const filter1 = jest.fn(() => targetItem);
      const filter2 = jest.fn(() => sourceItem);
      const combinedFilter = ItemFilter.or(filter1, filter2);
      const testPath = 'test.path';

      combinedFilter(sourceItem, targetItem, testPath);

      expect(filter1).toHaveBeenCalledWith(sourceItem, targetItem, testPath);
      expect(filter2).toHaveBeenCalledWith(sourceItem, targetItem, testPath);
    });

    it('should return function that accepts correct parameters', () => {
      const filter1 = ItemFilter.allowOnly(['test']);
      const combinedFilter = ItemFilter.or(filter1);

      expect(typeof combinedFilter).toBe('function');
      expect(combinedFilter.length).toBe(3);
    });
  });

  describe('complex filter combinations', () => {
    it('should handle nested AND/OR combinations', () => {
      const playerFilter = ItemFilter.allowOnly(['data.player']);
      const settingsFilter = ItemFilter.allowOnly(['settings']);
      const orFilter = ItemFilter.or(playerFilter, settingsFilter);

      const notTempFilter = ItemFilter.blockOnly(['temp']);
      const combinedFilter = ItemFilter.and(orFilter, notTempFilter);

      expect(combinedFilter(sourceItem, targetItem, 'data.player.stats')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(combinedFilter(sourceItem, targetItem, 'data.temp.cache')).toBe(targetItem);
      expect(combinedFilter(sourceItem, targetItem, 'other.value')).toBe(targetItem);
    });

    it('should handle multiple levels of nesting', () => {
      const filter1 = ItemFilter.allowOnly(['data']);
      const filter2 = ItemFilter.matchPattern(/player/);
      const filter3 = ItemFilter.custom((source, target, path) => !path.includes('temp'));

      const andFilter = ItemFilter.and(filter1, filter2, filter3);
      const mainFilter = ItemFilter.or(andFilter, ItemFilter.allowOnly(['settings']));

      expect(mainFilter(sourceItem, targetItem, 'data.player.stats')).toBe(sourceItem);
      expect(mainFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(mainFilter(sourceItem, targetItem, 'data.temp.player')).toBe(targetItem);
    });

    it('should handle complex real-world scenarios', () => {
      // Allow player data or settings, but exclude temporary and cache data
      const importantDataFilter = ItemFilter.or(
        ItemFilter.allowOnly(['data.player']),
        ItemFilter.allowOnly(['settings'])
      );

      const excludeTempFilter = ItemFilter.blockOnly(['temp', 'cache', 'debug']);

      const finalFilter = ItemFilter.and(importantDataFilter, excludeTempFilter);

      expect(finalFilter(sourceItem, targetItem, 'data.player.inventory')).toBe(sourceItem);
      expect(finalFilter(sourceItem, targetItem, 'settings.audio.volume')).toBe(sourceItem);
      expect(finalFilter(sourceItem, targetItem, 'data.player.temp.stats')).toBe(targetItem);
      expect(finalFilter(sourceItem, targetItem, 'data.cache.player')).toBe(targetItem);
      expect(finalFilter(sourceItem, targetItem, 'data.enemy.stats')).toBe(targetItem);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined source items', () => {
      const filter = ItemFilter.allowOnly(['data']);

      expect(filter(null, targetItem, 'data.player')).toBe(null);
      expect(filter(undefined, targetItem, 'data.player')).toBe(undefined);
      expect(filter(null, targetItem, 'other.value')).toBe(targetItem);
    });

    it('should handle null/undefined target items', () => {
      const filter = ItemFilter.allowOnly(['data']);

      expect(filter(sourceItem, null, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, undefined, 'data.player')).toBe(sourceItem);
      expect(filter(sourceItem, null, 'other.value')).toBe(null);
    });

    it('should handle empty string paths', () => {
      const allowFilter = ItemFilter.allowOnly(['']);
      const blockFilter = ItemFilter.blockOnly(['']);
      const patternFilter = ItemFilter.matchPattern(/^$/);

      expect(allowFilter(sourceItem, targetItem, '')).toBe(sourceItem);
      expect(blockFilter(sourceItem, targetItem, '')).toBe(targetItem);
      expect(patternFilter(sourceItem, targetItem, '')).toBe(sourceItem);
    });

    it('should handle very long paths', () => {
      const longPath = 'a'.repeat(1000) + '.b'.repeat(1000);
      const filter = ItemFilter.allowOnly([longPath]);

      expect(filter(sourceItem, targetItem, longPath)).toBe(sourceItem);
      expect(filter(sourceItem, targetItem, 'short.path')).toBe(targetItem);
    });

    it('should handle paths with special characters', () => {
      const specialPaths = [
        'data.item-name',
        'data.item_name',
        'data.item@name',
        'data.item#name',
        'data.item$name',
        'data.item%name',
        'data[0].name',
        'data.item name'
      ];

      const filter = ItemFilter.allowOnly(specialPaths);

      specialPaths.forEach(path => {
        expect(filter(sourceItem, targetItem, path)).toBe(sourceItem);
      });
    });

    it('should handle unicode characters in paths', () => {
      const unicodePaths = [
        'データ.プレイヤー',
        'données.joueur',
        'дані.гравець',
        'data.玩家'
      ];

      const filter = ItemFilter.allowOnly(unicodePaths);

      unicodePaths.forEach(path => {
        expect(filter(sourceItem, targetItem, path)).toBe(sourceItem);
      });
    });

    it('should handle extremely nested filter combinations', () => {
      const deepFilter = ItemFilter.and(
        ItemFilter.or(
          ItemFilter.and(
            ItemFilter.allowOnly(['data']),
            ItemFilter.blockOnly(['temp'])
          ),
          ItemFilter.matchPattern(/settings/)
        ),
        ItemFilter.custom(() => true)
      );

      expect(deepFilter(sourceItem, targetItem, 'data.player')).toBe(sourceItem);
      expect(deepFilter(sourceItem, targetItem, 'settings.volume')).toBe(sourceItem);
      expect(deepFilter(sourceItem, targetItem, 'data.temp.cache')).toBe(targetItem);
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of allowed paths efficiently', () => {
      const manyPaths = Array.from({ length: 1000 }, (_, i) => `path${i}`);
      const filter = ItemFilter.allowOnly(manyPaths);

      const startTime = Date.now();
      filter(sourceItem, targetItem, 'path500.subpath');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should handle complex regex patterns efficiently', () => {
      const complexPattern = /^(data|settings)\.(player|audio|video)\.(stats|config|preferences)\./;
      const filter = ItemFilter.matchPattern(complexPattern);

      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        filter(sourceItem, targetItem, 'data.player.stats.level');
      }
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle many filter combinations efficiently', () => {
      const filters = Array.from({ length: 100 }, (_, i) =>
        ItemFilter.allowOnly([`path${i}`])
      );
      const combinedFilter = ItemFilter.or(...filters);

      const startTime = Date.now();
      combinedFilter(sourceItem, targetItem, 'path50.test');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be reasonably fast
    });
  });

  describe('real-world integration scenarios', () => {
    it('should support game save data filtering', () => {
      const playerDataFilter = ItemFilter.and(
        ItemFilter.allowOnly(['game.player', 'game.progress']),
        ItemFilter.blockOnly(['temp', 'cache'])
      );

      expect(playerDataFilter(sourceItem, targetItem, 'game.player.stats.level')).toBe(sourceItem);
      expect(playerDataFilter(sourceItem, targetItem, 'game.progress.achievements')).toBe(sourceItem);
      expect(playerDataFilter(sourceItem, targetItem, 'game.player.temp.position')).toBe(targetItem);
      expect(playerDataFilter(sourceItem, targetItem, 'game.world.state')).toBe(targetItem);
    });

    it('should support application settings sync', () => {
      const settingsFilter = ItemFilter.and(
        ItemFilter.matchPattern(/^settings\./),
        ItemFilter.blockOnly(['settings.debug', 'settings.temp'])
      );

      expect(settingsFilter(sourceItem, targetItem, 'settings.ui.theme')).toBe(sourceItem);
      expect(settingsFilter(sourceItem, targetItem, 'settings.audio.volume')).toBe(sourceItem);
      expect(settingsFilter(sourceItem, targetItem, 'settings.debug.logging')).toBe(targetItem);
      expect(settingsFilter(sourceItem, targetItem, 'data.user.preferences')).toBe(targetItem);
    });

    it('should support conditional version-based filtering', () => {
      const versionFilter = ItemFilter.custom((source, target, path) => {
        if (path.includes('compatibility')) return true;
        if (!source.version || !target.version) return false;
        const sourceVersion = parseFloat(source.version);
        const targetVersion = parseFloat(target.version);
        return sourceVersion > targetVersion;
      });

      const newerSource = { ...sourceItem, version: '2.0.0' };
      const olderSource = { ...sourceItem, version: '0.8.0' };

      expect(versionFilter(newerSource, targetItem, 'data.player')).toBe(newerSource);
      expect(versionFilter(olderSource, targetItem, 'data.player')).toBe(targetItem);
      expect(versionFilter(olderSource, targetItem, 'compatibility.layer')).toBe(olderSource);
    });

    it('should support multi-stage filtering pipeline', () => {
      // Stage 1: Only important data
      const importantFilter = ItemFilter.or(
        ItemFilter.allowOnly(['user', 'settings', 'progress']),
        ItemFilter.matchPattern(/critical/)
      );

      // Stage 2: Exclude temporary data
      const cleanFilter = ItemFilter.blockOnly(['temp', 'cache', 'debug']);

      // Stage 3: Custom business logic
      const businessFilter = ItemFilter.custom((source, target, path) => {
        if (path.includes('user.session')) return false; // Never sync sessions
        if (path.includes('progress.autosave')) return true; // Always sync autosaves
        return source.timestamp > target.timestamp; // Default to newer
      });

      // Combine all stages
      const pipelineFilter = ItemFilter.and(importantFilter, cleanFilter, businessFilter);

      expect(pipelineFilter(sourceItem, targetItem, 'user.profile.name')).toBe(sourceItem);
      expect(pipelineFilter(sourceItem, targetItem, 'progress.autosave.data')).toBe(sourceItem);
      expect(pipelineFilter(sourceItem, targetItem, 'user.session.token')).toBe(targetItem);
      expect(pipelineFilter(sourceItem, targetItem, 'data.temp.cache')).toBe(targetItem);
      expect(pipelineFilter(sourceItem, targetItem, 'system.logs')).toBe(targetItem);
    });
  });
});