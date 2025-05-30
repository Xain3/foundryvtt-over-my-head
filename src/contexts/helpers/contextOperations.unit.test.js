/**
 * @file contextOperations.unit.test.js
 * @description Unit tests for ContextOperations class with bulk operations and multi-source/target support.
 * @path /src/contexts/helpers/contextOperations.unit.test.js
 */

import ContextOperations from './contextOperations.js';
import Context from '../context.js';
import { ContextContainer } from './contextContainer.js';
import { ContextItem } from './contextItem.js';

// Mock ContextMerger since it's thoroughly tested separately
jest.mock('./contextMerger.js', () => {
  const mockResult = {
    success: true,
    itemsProcessed: 5,
    conflicts: 2,
    changes: [
      { action: 'added', path: 'data.test1', timestamp: Date.now() },
      { action: 'updated', path: 'data.test2', timestamp: Date.now() }
    ],
    statistics: {
      additions: 1,
      updates: 1,
      replacements: 0,
      skipped: 3
    }
  };

  return {
    __esModule: true,
    default: {
      merge: jest.fn().mockReturnValue(mockResult),
      mergeOnly: jest.fn().mockReturnValue(mockResult),
      analyze: jest.fn().mockReturnValue(mockResult)
    },
    ItemFilter: {
      allowOnly: jest.fn().mockReturnValue(() => true),
      blockOnly: jest.fn().mockReturnValue(() => false),
      and: jest.fn().mockReturnValue(() => true),
      or: jest.fn().mockReturnValue(() => true)
    }
  };
});

describe('ContextOperations', () => {
  let sourceContext;
  let targetContext;
  let context2;
  let context3;

  beforeEach(() => {
    // Create test contexts
    sourceContext = new Context();
    targetContext = new Context();
    context2 = new Context();
    context3 = new Context();

    // Add some test data
    sourceContext.data.setItem('testItem1', 'value1');
    sourceContext.data.setItem('testItem2', 'value2');
    
    targetContext.data.setItem('testItem1', 'oldValue1');
    targetContext.settings.setItem('volume', 0.8);

    context2.data.setItem('context2Item', 'context2Value');
    context3.data.setItem('context3Item', 'context3Value');
  });

  describe('Basic Operations', () => {
    describe('pushContext', () => {
      it('should push context using default strategy', () => {
        const result = ContextOperations.pushContext(sourceContext, targetContext);
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.itemsProcessed).toBe(5);
      });

      it('should push context with custom strategy', () => {
        const result = ContextOperations.pushContext(
          sourceContext, 
          targetContext, 
          'mergeSourcePriority'
        );
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error for missing source', () => {
        expect(() => {
          ContextOperations.pushContext(null, targetContext);
        }).toThrow('Source and target contexts must be provided');
      });

      it('should throw error for missing target', () => {
        expect(() => {
          ContextOperations.pushContext(sourceContext, null);
        }).toThrow('Source and target contexts must be provided');
      });
    });

    describe('pullContext', () => {
      it('should pull context using default strategy', () => {
        const result = ContextOperations.pullContext(sourceContext, targetContext);
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error for missing contexts', () => {
        expect(() => {
          ContextOperations.pullContext(null, targetContext);
        }).toThrow('Source and target contexts must be provided');
      });
    });
  });

  describe('Multi-Source Operations', () => {
    describe('pushFromMultipleSources', () => {
      it('should push from multiple sources successfully', () => {
        const sources = [sourceContext, context2, context3];
        const results = ContextOperations.pushFromMultipleSources(sources, targetContext);
        
        expect(results).toHaveLength(3);
        expect(results[0].sourceIndex).toBe(0);
        expect(results[0].success).toBe(true);
        expect(results[0].result).toBeDefined();
        
        expect(results[1].sourceIndex).toBe(1);
        expect(results[1].success).toBe(true);
        
        expect(results[2].sourceIndex).toBe(2);
        expect(results[2].success).toBe(true);
      });

      it('should handle errors gracefully', () => {
        const ContextMerger = require('./contextMerger.js').default;
        ContextMerger.merge.mockImplementationOnce(() => {
          throw new Error('Test error');
        });

        const sources = [sourceContext];
        const results = ContextOperations.pushFromMultipleSources(sources, targetContext);
        
        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(false);
        expect(results[0].error).toBe('Test error');
        expect(results[0].result).toBeNull();
      });

      it('should throw error for empty sources array', () => {
        expect(() => {
          ContextOperations.pushFromMultipleSources([], targetContext);
        }).toThrow('Sources must be a non-empty array of contexts');
      });

      it('should throw error for non-array sources', () => {
        expect(() => {
          ContextOperations.pushFromMultipleSources(sourceContext, targetContext);
        }).toThrow('Sources must be a non-empty array of contexts');
      });

      it('should throw error for missing target', () => {
        expect(() => {
          ContextOperations.pushFromMultipleSources([sourceContext], null);
        }).toThrow('Target context must be provided');
      });
    });
  });

  describe('Multi-Target Operations', () => {
    describe('pushToMultipleTargets', () => {
      it('should push to multiple targets successfully', () => {
        const targets = [targetContext, context2, context3];
        const results = ContextOperations.pushToMultipleTargets(sourceContext, targets);
        
        expect(results).toHaveLength(3);
        expect(results[0].targetIndex).toBe(0);
        expect(results[0].success).toBe(true);
        expect(results[0].result).toBeDefined();
        
        expect(results[1].targetIndex).toBe(1);
        expect(results[1].success).toBe(true);
        
        expect(results[2].targetIndex).toBe(2);
        expect(results[2].success).toBe(true);
      });

      it('should handle errors gracefully', () => {
        const ContextMerger = require('./contextMerger.js').default;
        ContextMerger.merge.mockImplementationOnce(() => {
          throw new Error('Target error');
        });

        const targets = [targetContext];
        const results = ContextOperations.pushToMultipleTargets(sourceContext, targets);
        
        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(false);
        expect(results[0].error).toBe('Target error');
        expect(results[0].result).toBeNull();
      });

      it('should throw error for missing source', () => {
        expect(() => {
          ContextOperations.pushToMultipleTargets(null, [targetContext]);
        }).toThrow('Source context must be provided');
      });

      it('should throw error for empty targets array', () => {
        expect(() => {
          ContextOperations.pushToMultipleTargets(sourceContext, []);
        }).toThrow('Targets must be a non-empty array of contexts');
      });
    });
  });

  describe('Item-Specific Operations', () => {
    describe('pushItems', () => {
      it('should push specific items successfully', () => {
        const itemPaths = ['data.testItem1', 'settings.volume'];
        const result = ContextOperations.pushItems(
          sourceContext, 
          targetContext, 
          itemPaths
        );
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error for empty item paths', () => {
        expect(() => {
          ContextOperations.pushItems(sourceContext, targetContext, []);
        }).toThrow('Item paths must be a non-empty array');
      });

      it('should throw error for missing contexts', () => {
        expect(() => {
          ContextOperations.pushItems(null, targetContext, ['data.test']);
        }).toThrow('Source and target contexts must be provided');
      });
    });

    describe('pullItems', () => {
      it('should pull specific items successfully', () => {
        const itemPaths = ['data.testItem1', 'settings.volume'];
        const result = ContextOperations.pullItems(
          sourceContext, 
          targetContext, 
          itemPaths
        );
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw error for empty item paths', () => {
        expect(() => {
          ContextOperations.pullItems(sourceContext, targetContext, []);
        }).toThrow('Item paths must be a non-empty array');
      });
    });

    describe('pushItemsBulk', () => {
      it('should push items from multiple sources to multiple targets', () => {
        const sources = [sourceContext, context2];
        const targets = [targetContext, context3];
        const itemPaths = ['data.testItem1'];
        
        const results = ContextOperations.pushItemsBulk(
          sources, 
          targets, 
          itemPaths
        );
        
        expect(results).toHaveLength(2); // 2 sources
        expect(results[0]).toHaveLength(2); // 2 targets for first source
        expect(results[1]).toHaveLength(2); // 2 targets for second source
        
        expect(results[0][0].sourceIndex).toBe(0);
        expect(results[0][0].targetIndex).toBe(0);
        expect(results[0][0].success).toBe(true);
        
        expect(results[1][1].sourceIndex).toBe(1);
        expect(results[1][1].targetIndex).toBe(1);
        expect(results[1][1].success).toBe(true);
      });

      it('should handle errors in bulk operations', () => {
        const ContextMerger = require('./contextMerger.js').default;
        ContextMerger.mergeOnly.mockImplementationOnce(() => {
          throw new Error('Bulk error');
        });

        const sources = [sourceContext];
        const targets = [targetContext];
        const itemPaths = ['data.testItem1'];
        
        const results = ContextOperations.pushItemsBulk(sources, targets, itemPaths);
        
        expect(results[0][0].success).toBe(false);
        expect(results[0][0].error).toBe('Bulk error');
      });

      it('should validate all required parameters', () => {
        expect(() => {
          ContextOperations.pushItemsBulk([], [targetContext], ['data.test']);
        }).toThrow('Sources must be a non-empty array of contexts');

        expect(() => {
          ContextOperations.pushItemsBulk([sourceContext], [], ['data.test']);
        }).toThrow('Targets must be a non-empty array of contexts');

        expect(() => {
          ContextOperations.pushItemsBulk([sourceContext], [targetContext], []);
        }).toThrow('Item paths must be a non-empty array');
      });
    });
  });

  describe('Advanced Operations', () => {
    describe('synchronizeBidirectional', () => {
      it('should synchronize contexts bidirectionally', () => {
        const result = ContextOperations.synchronizeBidirectional(
          sourceContext, 
          targetContext,
          {
            context1Priority: ['data.testItem1'],
            context2Priority: ['settings.volume'],
            excludePaths: ['data.temp']
          }
        );
        
        expect(result.success).toBe(true);
        expect(result.context1ToContext2).toBeDefined();
        expect(result.context2ToContext1).toBeDefined();
        expect(result.totalItemsProcessed).toBe(10); // 5 + 5
        expect(result.totalConflicts).toBe(4); // 2 + 2
      });

      it('should handle sync errors gracefully', () => {
        const ContextMerger = require('./contextMerger.js').default;
        ContextMerger.merge.mockReturnValueOnce({
          success: false,
          itemsProcessed: 0,
          conflicts: 0
        });

        const result = ContextOperations.synchronizeBidirectional(
          sourceContext, 
          targetContext
        );
        
        expect(result.success).toBe(false);
      });
    });

    describe('consolidateContexts', () => {
      it('should consolidate multiple contexts successfully', () => {
        const sources = [sourceContext, context2, context3];
        const result = ContextOperations.consolidateContexts(
          sources, 
          targetContext,
          {
            priorities: { 0: 'high', 1: 'medium', 2: 'low' },
            excludePaths: ['data.temp']
          }
        );
        
        expect(result.success).toBe(true);
        expect(result.results).toHaveLength(3);
        expect(result.totalItemsProcessed).toBe(15); // 5 * 3
        expect(result.totalConflicts).toBe(6); // 2 * 3
        expect(result.consolidatedSources).toBe(3);
      });

      it('should sort sources by priority', () => {
        const sources = [sourceContext, context2, context3];
        const result = ContextOperations.consolidateContexts(
          sources, 
          targetContext,
          {
            priorities: { 2: 'high', 0: 'low', 1: 'medium' }
          }
        );
        
        expect(result.success).toBe(true);
        expect(result.results).toHaveLength(3);
        // Verify that sources were processed (order might be changed due to priority)
        expect(result.results.some(r => r.sourceIndex === 2)).toBe(true);
        expect(result.results.some(r => r.sourceIndex === 1)).toBe(true);
        expect(result.results.some(r => r.sourceIndex === 0)).toBe(true);
      });

      it('should handle consolidation errors', () => {
        const ContextMerger = require('./contextMerger.js').default;
        ContextMerger.merge.mockImplementationOnce(() => {
          throw new Error('Consolidation error');
        });

        const sources = [sourceContext];
        const result = ContextOperations.consolidateContexts(sources, targetContext);
        
        expect(result.success).toBe(false);
        expect(result.results[0].success).toBe(false);
        expect(result.results[0].error).toBe('Consolidation error');
      });

      it('should validate consolidation parameters', () => {
        expect(() => {
          ContextOperations.consolidateContexts([], targetContext);
        }).toThrow('Sources must be a non-empty array of contexts');

        expect(() => {
          ContextOperations.consolidateContexts([sourceContext], null);
        }).toThrow('Target context must be provided');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle contexts with no data', () => {
      const emptySource = new Context();
      const emptyTarget = new Context();
      
      const result = ContextOperations.pushContext(emptySource, emptyTarget);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle single item in arrays', () => {
      const results = ContextOperations.pushFromMultipleSources(
        [sourceContext], 
        targetContext
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should handle custom merge strategies', () => {
      const customStrategy = 'customStrategy';
      const result = ContextOperations.pushContext(
        sourceContext, 
        targetContext, 
        customStrategy
      );
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle complex consolidation scenarios', () => {
      const manySources = Array.from({ length: 5 }, () => new Context());
      const result = ContextOperations.consolidateContexts(
        manySources, 
        targetContext
      );
      
      expect(result.success).toBe(true);
      expect(result.consolidatedSources).toBe(5);
    });
  });

  describe('Integration with ItemFilter', () => {
    it('should use ItemFilter in synchronization', () => {
      const { ItemFilter } = require('./contextMerger.js');
      
      ContextOperations.synchronizeBidirectional(
        sourceContext, 
        targetContext,
        {
          excludePaths: ['data.temp']
        }
      );
      
      expect(ItemFilter.and).toHaveBeenCalled();
      expect(ItemFilter.blockOnly).toHaveBeenCalledWith(['data.temp']);
      expect(ItemFilter.or).toHaveBeenCalled();
    });

    it('should use ItemFilter in consolidation', () => {
      const { ItemFilter } = require('./contextMerger.js');
      
      ContextOperations.consolidateContexts(
        [sourceContext], 
        targetContext,
        {
          excludePaths: ['data.cache']
        }
      );
      
      expect(ItemFilter.blockOnly).toHaveBeenCalledWith(['data.cache']);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle game session synchronization', () => {
      // Simulate player contexts from different sessions
      const playerContext1 = new Context();
      const playerContext2 = new Context();
      const serverContext = new Context();
      
      playerContext1.data.setItem('inventory', ['sword', 'potion']);
      playerContext1.data.setItem('level', 15);
      
      playerContext2.data.setItem('inventory', ['bow', 'arrow']);
      playerContext2.data.setItem('level', 12);
      
      const result = ContextOperations.consolidateContexts(
        [playerContext1, playerContext2],
        serverContext,
        {
          priorities: { 0: 'high', 1: 'medium' }
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.consolidatedSources).toBe(2);
    });

    it('should handle configuration synchronization', () => {
      const clientConfig = new Context();
      const serverConfig = new Context();
      
      clientConfig.settings.setItem('theme', 'dark');
      clientConfig.settings.setItem('language', 'en');
      
      serverConfig.settings.setItem('maxPlayers', 10);
      serverConfig.settings.setItem('difficulty', 'normal');
      
      const result = ContextOperations.synchronizeBidirectional(
        clientConfig,
        serverConfig,
        {
          context1Priority: ['settings.theme', 'settings.language'],
          context2Priority: ['settings.maxPlayers', 'settings.difficulty']
        }
      );
      
      expect(result.success).toBe(true);
      expect(result.totalItemsProcessed).toBeGreaterThan(0);
    });
  });
});
