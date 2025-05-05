import { ContextUnit, ContextProperty, ContextContainer } from './contextUnits';

// Mock Date.now() for consistent timestamps
const MOCK_DATE_NOW = 1678886400000; // Example fixed timestamp
jest.spyOn(Date, 'now').mockImplementation(() => MOCK_DATE_NOW);

// Dummy class for testing type enforcement
class DummyChild {}
class AnotherDummyChild {}

describe('ContextUnit', () => {
  let unit;
  const initialValue = { data: 'initial' };
  const initialOptions = { config: 'test' };
  const initialTimestamp = MOCK_DATE_NOW - 1000;

  beforeEach(() => {
    unit = new ContextUnit({
      value: initialValue,
      options: initialOptions,
      timestamp: initialTimestamp,
      acceptedChildrenTypes: ['DummyChild'],
      enforceChildrenType: true,
      enforceOnlyForObject: true,
      timestampBehavior: 'keep',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided values', () => {
      expect(unit.value).toBe(initialValue);
      expect(unit.options).toBe(initialOptions);
      expect(unit.timestamp).toBe(initialTimestamp);
      // Private properties are not directly testable, but their effects are tested via methods
    });

    it('should initialize with default values', () => {
      const defaultUnit = new ContextUnit({ value: 'test' });
      expect(defaultUnit.value).toBe('test');
      expect(defaultUnit.options).toEqual({});
      expect(defaultUnit.timestampModified).toBe(MOCK_DATE_NOW);
      // Check default private properties indirectly
      // Default enforceChildrenType is false, so setting any object should not throw type error initially
      // but setKey requires value to be an object.
      expect(() => defaultUnit.setKey({ key: 'a', value: new DummyChild() })).toThrow(/Invalid value in context property/);
      // Test setting value directly with default enforceChildrenType=false
      expect(() => defaultUnit.setValue({ value: new DummyChild() })).not.toThrow();
      // timestampBehavior defaults 'update'
      expect(defaultUnit.set(null, 'new value').timestampModified).toBe(MOCK_DATE_NOW);
    });
  });

  // Test the behavior of #ensureChildrenTypeIsAccepted indirectly via public methods
  describe('Children Type Enforcement (via set/setValue/setKey)', () => {
    let typeUnit;
    beforeEach(() => {
      typeUnit = new ContextUnit({
        value: {}, // Needs to be object for setKey
        acceptedChildrenTypes: ['DummyChild', 'AnotherDummyChild'],
        enforceChildrenType: true,
        enforceOnlyForObject: true, // Default, but explicit for clarity
      });
    });

    it('should allow setting accepted single child type via setKey', () => {
      expect(() => typeUnit.setKey({ key: 'test', value: new DummyChild() })).not.toThrow();
      expect(typeUnit.value.test).toBeInstanceOf(DummyChild);
    });

     it('should allow setting accepted single child type via setValue', () => {
      expect(() => typeUnit.setValue({ value: new DummyChild() })).not.toThrow();
      expect(typeUnit.value).toBeInstanceOf(DummyChild);
    });

    it('should allow setting accepted array of child types via setValue', () => {
       // Note: setValue replaces the whole value
      expect(() => typeUnit.setValue({ value: [new DummyChild(), new AnotherDummyChild()] })).not.toThrow();
      expect(Array.isArray(typeUnit.value)).toBe(true);
      expect(typeUnit.value[0]).toBeInstanceOf(DummyChild);
      expect(typeUnit.value[1]).toBeInstanceOf(AnotherDummyChild);
    });

    it('should throw when setting unaccepted single child type via setKey', () => {
      class UnacceptedChild {}
      expect(() => typeUnit.setKey({ key: 'test', value: new UnacceptedChild() })).toThrow(
        /Invalid child type: UnacceptedChild. Expected one of: DummyChild, AnotherDummyChild/
      );
    });

     it('should throw when setting unaccepted single child type via setValue', () => {
      class UnacceptedChild {}
      expect(() => typeUnit.setValue({ value: new UnacceptedChild() })).toThrow(
        /Invalid child type: UnacceptedChild. Expected one of: DummyChild, AnotherDummyChild/
      );
    });

    it('should throw when setting array with unaccepted child type via setValue', () => {
      class UnacceptedChild {}
      expect(() => typeUnit.setValue({ value: [new DummyChild(), new UnacceptedChild()] })).toThrow(
        /Invalid child type: UnacceptedChild. Expected one of: DummyChild, AnotherDummyChild/
      );
    });

    it('should allow setting non-object types when onlyForObject is true', () => {
      // Using setValue
      expect(() => typeUnit.setValue({ value: 'a string' })).not.toThrow();
      expect(typeUnit.value).toBe('a string');
      expect(() => typeUnit.setValue({ value: 123 })).not.toThrow();
      expect(typeUnit.value).toBe(123);
      // Using setKey (value must be object initially for setKey)
      typeUnit.value = {};
      expect(() => typeUnit.setKey({ key: 'str', value: 'a string' })).not.toThrow();
      expect(typeUnit.value.str).toBe('a string');
      expect(() => typeUnit.setKey({ key: 'num', value: 123 })).not.toThrow();
      expect(typeUnit.value.num).toBe(123);
      // Note: typeof null is 'object', so it *will* be checked if enforceOnlyForObject is true
      expect(() => typeUnit.setKey({ key: 'nullVal', value: null })).toThrow()
    });

    it('should check non-object types when onlyForObject is false', () => {
      typeUnit = new ContextUnit({
        value: {},
        acceptedChildrenTypes: ['String'], // Note: primitive constructor names are capitalized
        enforceChildrenType: true,
        enforceOnlyForObject: false,
      });
      // Using setKey
      expect(() => typeUnit.setKey({ key: 'num', value: 123 })).toThrow(/Invalid child type: Number/);
      expect(() => typeUnit.setKey({ key: 'str', value: 'hello' })).not.toThrow();
      expect(typeUnit.value.str).toBe('hello');
      // Using setValue
      expect(() => typeUnit.setValue({ value: 123 })).toThrow(/Invalid child type: Number/);
      expect(() => typeUnit.setValue({ value: 'hello' })).not.toThrow();
      expect(typeUnit.value).toBe('hello');
    });

     it('should use provided parameters over instance properties in setKey', () => {
        class TempChild {}
        const options = {
            key: 'temp',
            value: new TempChild(),
            enforceChildrenType: true, // Override instance default if needed
            acceptedChildrenTypes: ['TempChild'], // Override instance default
            enforceOnlyForObject: true // Override instance default if needed
        };
        // Check against different accepted types provided in options
        expect(() => typeUnit.setKey(options)).not.toThrow();
        expect(typeUnit.value.temp).toBeInstanceOf(TempChild);

        const invalidOptions = { ...options, acceptedChildrenTypes: ['WrongChild'] };
        expect(() => typeUnit.setKey(invalidOptions)).toThrow(/Invalid child type: TempChild/);

        // Check with onlyForObject = false provided in options
        const nonObjectOptions = {
            key: 'num',
            value: 123,
            enforceChildrenType: true,
            acceptedChildrenTypes: ['string'], // Should fail
            enforceOnlyForObject: false
        };
        expect(() => typeUnit.setKey(nonObjectOptions)).toThrow(/Invalid child type: Number/);
     });

     it('should use provided parameters over instance properties in setValue', () => {
        class TempChild {}
        const options = {
            value: new TempChild(),
            enforceChildrenType: true,
            acceptedChildrenTypes: ['TempChild'],
            enforceOnlyForObject: true
        };
        expect(() => typeUnit.setValue(options)).not.toThrow();
        expect(typeUnit.value).toBeInstanceOf(TempChild);

        const invalidOptions = { ...options, acceptedChildrenTypes: ['WrongChild'] };
        expect(() => typeUnit.setValue(invalidOptions)).toThrow(/Invalid child type: TempChild/);

        const nonObjectOptions = {
            value: 123,
            enforceChildrenType: true,
            acceptedChildrenTypes: ['string'],
            enforceOnlyForObject: false
        };
        expect(() => typeUnit.setValue(nonObjectOptions)).toThrow(/Invalid child type: Number/);
     });
  });

  describe('updateTimestamp', () => {
    it('should update timestamp to Date.now() by default', () => {
      unit.updateTimestamp();
      expect(unit.timestamp).toBe(MOCK_DATE_NOW);
    });

    it('should update timestamp to the provided value', () => {
      const newTimestamp = MOCK_DATE_NOW + 5000;
      unit.updateTimestamp(newTimestamp);
      expect(unit.timestamp).toBe(newTimestamp);
    });

    it('should throw if the provided timestamp is not a number', () => {
      expect(() => unit.updateTimestamp('not a number')).toThrow(/Invalid timestamp: not a number. Expected a number./);
    });

    it('should return the instance for chaining', () => {
      expect(unit.updateTimestamp()).toBe(unit);
    });
  });

  describe('#setTimestampBehavior (via set/setValue/setKey)', () => {
    it('should update timestamp when behavior is "update"', () => {
      const updateUnit = new ContextUnit({ value: 'test', timestampBehavior: 'update', timestamp: initialTimestamp });
      updateUnit.setValue({ value: 'new' });
      expect(updateUnit.timestampModified).toBe(MOCK_DATE_NOW);
    });

    it('should keep timestamp when behavior is "keep"', () => {
      const keepUnit = new ContextUnit({ value: 'test', timestampBehavior: 'keep', timestamp: initialTimestamp });
      keepUnit.setValue({ value: 'new' });
      expect(keepUnit.timestampModified).toBe(initialTimestamp);
    });

    it('should set timestamp to a specific number when behavior is a number', () => {
      const specificTimestamp = MOCK_DATE_NOW + 10000;
      const numberUnit = new ContextUnit({ value: 'test', timestampBehavior: 'update', timestamp: initialTimestamp }); // Behavior applies on set
      numberUnit.setValue({ value: 'new', timestamp: specificTimestamp }); // Override behavior for this call
      expect(numberUnit.timestampModified).toBe(specificTimestamp);
    });

    it('should throw for invalid timestamp behavior string', () => {
       const invalidUnit = new ContextUnit({ value: 'test' });
       expect(() => invalidUnit.setValue({ value: 'new', timestamp: 'invalid' })).toThrow(/Invalid timestamp behavior: invalid. Expected 'update', 'keep', or a timestamp number./);
    });
  });

  describe('setValue', () => {
    it('should set the value property', () => {
      unit.setEnforceChildrenType(false); // Disable type enforcement for this test
      const newValue = { completely: 'new' };
      unit.setValue({ value: newValue });
      expect(unit.value).toBe(newValue);
    });

    it('should update timestamp according to behavior', () => {
      unit.setValue({ value: 'a', timestamp: 'update' });
      expect(unit.timestamp).toBe(MOCK_DATE_NOW);
      const ts = unit.timestamp;
      unit.setValue({ value: 'b', timestamp: 'keep' });
      expect(unit.timestamp).toBe(ts);
      const newTs = MOCK_DATE_NOW + 2000;
      unit.setValue({ value: 'c', timestamp: newTs });
      expect(unit.timestamp).toBe(newTs);
    });

    it('should enforce children type if enabled', () => {
      const validChild = new DummyChild();
      // Use default enforceChildrenType=true from unit setup
      expect(() => unit.setValue({ value: validChild })).not.toThrow();
      expect(unit.value).toBe(validChild);

      class InvalidChild {}
      expect(() => unit.setValue({ value: new InvalidChild() })).toThrow(/Invalid child type: InvalidChild/);
    });

    it('should skip type enforcement if specified in options', () => {
      class InvalidChild {}
      expect(() => unit.setValue({ value: new InvalidChild(), enforceChildrenType: false })).not.toThrow();
      expect(unit.value).toBeInstanceOf(InvalidChild);
    });

    it('should use provided options over instance defaults', () => {
        // No direct spy on private method possible. Test behavior instead.
        const child = new AnotherDummyChild(); // Not in unit's default accepted types
        const options = {
            value: child,
            timestamp: 'update',
            enforceChildrenType: true,
            enforceOnlyForObject: false, // Change from unit default
            acceptedChildrenTypes: ['AnotherDummyChild'] // Change from unit default
        };
        expect(() => unit.setValue(options)).not.toThrow(); // Should not throw because options allow AnotherDummyChild
        expect(unit.value).toBe(child);
        expect(unit.timestamp).toBe(MOCK_DATE_NOW); // Timestamp updated as per options

        // Test that non-object is checked due to enforceOnlyForObject: false in options
        const nonObjectOptions = { ...options, value: 123 };
        expect(() => unit.setValue(nonObjectOptions)).toThrow(/Invalid child type: Number/); // Throws because 123 is not AnotherDummyChild
    });

    it('should return the instance for chaining', () => {
      expect(unit.setValue({ value: 'chain' })).toBe(unit);
    });
  });

  describe('setKey', () => {
    beforeEach(() => {
      // Ensure value is an object for setKey tests
      unit.value = { existing: 'value' };
    });

    it('should set a key-value pair on the value object', () => {
      unit.setKey({ key: 'newKey', value: 'newValue' });
      expect(unit.value.newKey).toBe('newValue');
      expect(unit.value.existing).toBe('value');
    });

    it('should throw if the value property is not an object', () => {
      unit.value = 'not an object';
      expect(() => unit.setKey({ key: 'a', value: 'b' })).toThrow(/Invalid value in context property: not an object. Expected an object./);
    });

    it('should throw if the value is undefined', () => {
      expect(() => unit.setKey({ key: 'a', value: undefined })).toThrow(/Invalid value: undefined. Expected a defined value./);
    });

    it('should throw if the key is not a string', () => {
      expect(() => unit.setKey({ key: 123, value: 'a' })).toThrow(/Invalid key: 123. Expected a string./);
      expect(() => unit.setKey({ key: null, value: 'a' })).toThrow(/Invalid key: null. Expected a string./);
    });

    it('should update timestamp according to behavior', () => {
      unit.setKey({ key: 'a', value: 1, timestamp: 'update' });
      expect(unit.timestamp).toBe(MOCK_DATE_NOW);
      const ts = unit.timestamp;
      unit.setKey({ key: 'b', value: 2, timestamp: 'keep' });
      expect(unit.timestamp).toBe(ts);
      const newTs = MOCK_DATE_NOW + 3000;
      unit.setKey({ key: 'c', value: 3, timestamp: newTs });
      expect(unit.timestamp).toBe(newTs);
    });

    it('should enforce children type if enabled', () => {
      const validChild = new DummyChild();
      // Use default enforceChildrenType=true from unit setup
      expect(() => unit.setKey({ key: 'valid', value: validChild })).not.toThrow();
      expect(unit.value.valid).toBe(validChild);

      class InvalidChild {}
      expect(() => unit.setKey({ key: 'invalid', value: new InvalidChild() })).toThrow(/Invalid child type: InvalidChild/);
    });

    it('should skip type enforcement if specified in options', () => {
      class InvalidChild {}
      expect(() => unit.setKey({ key: 'skipped', value: new InvalidChild(), enforceChildrenType: false })).not.toThrow();
      expect(unit.value.skipped).toBeInstanceOf(InvalidChild);
    });

     it('should use provided options over instance defaults', () => {
        // No direct spy on private method possible. Test behavior instead.
        const child = new AnotherDummyChild(); // Not in unit's default accepted types
        const options = {
            key: 'testKey',
            value: child,
            timestamp: 'update',
            enforceChildrenType: true,
            enforceOnlyForObject: false, // Change from unit default
            acceptedChildrenTypes: ['AnotherDummyChild'] // Change from unit default
        };
        expect(() => unit.setKey(options)).not.toThrow(); // Should not throw due to options
        expect(unit.value.testKey).toBe(child);
        expect(unit.timestamp).toBe(MOCK_DATE_NOW); // Timestamp updated

        // Test non-object check due to enforceOnlyForObject: false in options
        const nonObjectOptions = { ...options, value: 123 };
        expect(() => unit.setKey(nonObjectOptions)).toThrow(/Invalid child type: Number/);
    });

    it('should return the instance for chaining', () => {
      expect(unit.setKey({ key: 'chain', value: 'link' })).toBe(unit);
    });
  });

  describe('setAcceptedChildrenTypes', () => {
    it('should update the accepted children types (tested indirectly)', () => {
      const newTypes = ['TypeA', 'TypeB'];
      unit.setAcceptedChildrenTypes(newTypes);
      // Test indirectly via setKey (which uses the updated private field)
      expect(() => unit.setKey({ key: 'fail', value: new DummyChild() })).toThrow(/Expected one of: TypeA, TypeB/);
      class TypeA {}
      expect(() => unit.setKey({ key: 'pass', value: new TypeA() })).not.toThrow();
    });

    it('should throw if input is not an array', () => {
      expect(() => unit.setAcceptedChildrenTypes('not an array')).toThrow(/Invalid acceptedChildrenTypes: not an array. Expected an array./);
    });

    it('should return the instance for chaining', () => {
      expect(unit.setAcceptedChildrenTypes([])).toBe(unit);
    });
  });

  describe('setOptions', () => {
    it('should update the options property', () => {
      const newOptions = { newConfig: 'value' };
      unit.setOptions(newOptions);
      expect(unit.options).toBe(newOptions);
    });

    it('should throw if input is not an object', () => {
      expect(() => unit.setOptions('not an object')).toThrow(/Invalid options: not an object. Expected an object./);
      expect(() => unit.setOptions(null)).toThrow(/Invalid options: null. Expected an object./); // null is type object but invalid here
    });

    it('should return the instance for chaining', () => {
      expect(unit.setOptions({})).toBe(unit);
    });
  });

  describe('set', () => {
    it('should call setValue when key is null', () => {
      const spy = jest.spyOn(unit, 'setValue');
      const newValue = new DummyChild ();
      // Call set with key=null
      unit.set(null, newValue);
      expect(spy).toHaveBeenCalledWith({
        value: newValue, // Correctly passed
        timestamp: 'keep', // from unit's initial config
        enforceChildrenType: true, // from unit's initial config
        enforceOnlyForObject: true, // from unit's initial config
        acceptedChildrenTypes: ['DummyChild'], // from unit's initial config
      });
      expect(unit.value).toBe(newValue);
    });

    it('should call setKey when key is provided', () => {
      const spy = jest.spyOn(unit, 'setKey');
      const key = 'newKey';
      const value = 'newValue';
      // Call set with key and value
      unit.set(key, value);
      expect(spy).toHaveBeenCalledWith({
        key: key, // Correctly passed
        value: value, // Correctly passed
        timestamp: 'keep', // from unit's initial config
        enforceChildrenType: true, // from unit's initial config
        enforceOnlyForObject: true, // from unit's initial config
        acceptedChildrenTypes: ['DummyChild'], // from unit's initial config
      });
      expect(unit.value[key]).toBe(value);
    });

     it('should pass options correctly to setValue', () => {
        const spy = jest.spyOn(unit, 'setValue');
        const newValue = { newData: 'setWithOptions' };
        const options = {
            timestamp: 'update',
            enforceChildrenType: false,
            enforceOnlyForObject: false, // Pass through options
            acceptedChildrenTypes: ['AnotherDummyChild'], // Pass through options
        };
        // Call set with key=null, value, and options
        unit.set(null, newValue, options);
        expect(spy).toHaveBeenCalledWith({
            value: newValue, // Correctly passed
            timestamp: 'update',
            enforceChildrenType: false,
            enforceOnlyForObject: false,
            acceptedChildrenTypes: ['AnotherDummyChild'],
        });
     });

     it('should pass options correctly to setKey', () => {
        const spy = jest.spyOn(unit, 'setKey');
        const key = 'keyWithOptions';
        const value = 'valueWithOptions';
        const options = {
            timestamp: MOCK_DATE_NOW + 1,
            enforceChildrenType: false,
            enforceOnlyForObject: false, // Pass through options
            acceptedChildrenTypes: ['AnotherDummyChild'], // Pass through options
        };
        // Call set with key, value, and options
        unit.set(key, value, options);
        expect(spy).toHaveBeenCalledWith({
            key: key, // Correctly passed
            value: value, // Correctly passed
            timestamp: MOCK_DATE_NOW + 1,
            enforceChildrenType: false,
            enforceOnlyForObject: false,
            acceptedChildrenTypes: ['AnotherDummyChild'],
        });
     });

    it('should return the instance for chaining', () => {
      unit.setEnforceChildrenType(false); // Disable type enforcement for this test
      expect(unit.set(null, 'value')).toBe(unit);
      expect(unit.set(null, {test: 'value'})).toBe(unit);
      expect(unit.set('key', 'value')).toBe(unit);
    });
  });

  describe('get', () => {
    it('should call getValue when key is null', () => {
      const spy = jest.spyOn(unit, 'getValue');
      expect(unit.get()).toBe(initialValue);
      expect(spy).toHaveBeenCalled();
    });

    it('should call getKey when key is provided', () => {
      unit.value = { myKey: 'myValue' };
      const spy = jest.spyOn(unit, 'getKey');
      expect(unit.get('myKey')).toBe('myValue');
      expect(spy).toHaveBeenCalledWith('myKey');
    });
  });

  describe('getKey', () => {
     beforeEach(() => {
      unit.value = { existing: 'value', num: 123 };
    });

    it('should return the value for the specified key', () => {
      expect(unit.getKey('existing')).toBe('value');
      expect(unit.getKey('num')).toBe(123);
    });

    it('should throw if the key is not a string', () => {
      expect(() => unit.getKey(123)).toThrow(/Invalid key: 123. Expected a string./);
      expect(() => unit.getKey(null)).toThrow(/Invalid key: null. Expected a string./);
    });

    it('should throw if the key does not exist', () => {
      expect(() => unit.getKey('nonExistent')).toThrow(/Key "nonExistent" does not exist in the context property./);
    });

     it('should throw if value is not an object (implicitly tested by hasOwnProperty)', () => {
        unit.value = 'a string';
        // Accessing property on non-object might throw TypeError depending on JS engine,
        // but our check should catch it first. Using hasOwnProperty on string is valid but returns false for non-index keys.
        expect(() => unit.getKey('someKey')).toThrow(/Key "someKey" does not exist/);
     });
  });

  describe('getValue', () => {
    it('should return the current value', () => {
      expect(unit.getValue()).toBe(initialValue);
      unit.value = 'new value';
      expect(unit.getValue()).toBe('new value');
    });
  });

  describe('getTimestamp', () => {
    it('should return the current timestamp', () => {
      expect(unit.getTimestamp()).toBe(initialTimestamp);
      const newTs = MOCK_DATE_NOW + 5000;
      unit.timestamp = newTs;
      expect(unit.getTimestamp()).toBe(newTs);
    });
  });

  describe('getProperty', () => {
    it('should return value and timestamp by default', () => {
      expect(unit.getProperty()).toEqual({
        value: initialValue,
        timestamp: initialTimestamp,
      });
    });

    it('should return only value when specified', () => {
      expect(unit.getProperty(true, false, false)).toEqual({
        value: initialValue,
      });
    });

    it('should return only timestamp when specified', () => {
      expect(unit.getProperty(false, true, false)).toEqual({
        timestamp: initialTimestamp,
      });
    });

    it('should return only options when specified', () => {
      expect(unit.getProperty(false, false, true)).toEqual({
        options: initialOptions,
      });
    });

    it('should return all properties when specified', () => {
      expect(unit.getProperty(true, true, true)).toEqual({
        value: initialValue,
        timestamp: initialTimestamp,
        options: initialOptions,
      });
    });

    it('should return an empty object when all flags are false', () => {
      expect(unit.getProperty(false, false, false)).toEqual({});
    });
  });
});

describe('ContextProperty', () => {
  // Need to adjust the constructor call if enforceOnlyForObject was removed or changed
  // Assuming enforceOnlyForObject is still a valid, though unused, parameter for ContextUnit constructor
  const enforceOnlyForObject = true; // Or whatever default makes sense if it's still needed by ContextUnit

  it('should initialize correctly using ContextUnit constructor', () => {
    const value = { prop: 'data' };
    const options = { meta: 'info' };
    const timestamp = MOCK_DATE_NOW - 500;
    const prop = new ContextProperty({ value, options, timestamp, timestampBehavior: 'keep' });

    expect(prop.value).toBe(value);
    expect(prop.options).toBe(options);
    expect(prop.timestampModified).toBe(timestamp);
    expect(prop).toBeInstanceOf(ContextUnit);

    // Check defaults specific to ContextProperty (indirectly)
    // It should NOT enforce children type by default (enforceChildrenType: false passed to super)
    class AnyChild {}
    expect(() => prop.setValue({ value: new AnyChild() })).not.toThrow();
    expect(prop.value).toBeInstanceOf(AnyChild);

    // Timestamp behavior should be passed correctly
    const initialTs = prop.timestampModified;
    prop.setValue({ value: 'new value' }); // Behavior was 'keep'
    expect(prop.timestampModified).toBe(initialTs);
  });

   it('should inherit methods from ContextUnit', () => {
        const prop = new ContextProperty({ value: { key: 'val' } });
        expect(typeof prop.set).toBe('function');
        expect(typeof prop.get).toBe('function');
        expect(typeof prop.getKey).toBe('function');
        expect(typeof prop.getValue).toBe('function');
        expect(typeof prop.setKey).toBe('function');
        expect(typeof prop.setValue).toBe('function');
        expect(typeof prop.updateTimestamp).toBe('function');
        expect(typeof prop.getProperty).toBe('function');
        expect(prop.get('key')).toBe('val');
   });
});

describe('ContextContainer', () => {
  it('should initialize correctly using ContextUnit constructor', () => {
    const value = { child1: new ContextProperty({ value: 1 }) };
    const options = { containerMeta: 'info' };
    const timestamp = MOCK_DATE_NOW - 600;
    // Include 'Object' as accepted type to work around potential issue where the type checker
    // might incorrectly validate the container object itself when setValue is used with an object.
    const accepted = ['ContextProperty', 'Object']; // Override default for test clarity
    const container = new ContextContainer({ value, options, timestamp, acceptedChildrenTypes: accepted, timestampBehavior: 'keep' });

    expect(container.value).toBe(value);
    expect(container.options).toBe(options);
    expect(container.timestampModified).toBe(timestamp);
    expect(container).toBeInstanceOf(ContextUnit);

    // Check defaults specific to ContextContainer (indirectly)
    // It SHOULD enforce children type by default (enforceChildrenType: true passed to super)
    expect(() => container.setKey({ key: 'validChild', value: new ContextProperty({ value: 2 }) })).not.toThrow();
    // Uses the 'accepted' types defined above for this test instance
    expect(() => container.setKey({ key: 'invalidChild', value: new DummyChild() })).toThrow(/Invalid child type: DummyChild. Expected one of: ContextProperty/);

    // Timestamp behavior should be passed correctly
    const initialTs = container.timestampModified;
    // Need a valid child for setValue when enforcement is on
    container.setValue({ value: { newChild: new ContextProperty({ value: 3 }) } }); // Behavior was 'keep'
    expect(container.timestampModified).toBe(initialTs);
  });

  it('should enforce children type by default, including non-objects', () => {
     const container = new ContextContainer({ value: {} }); // Default accepted: ['ContextProperty', 'ContextContainer']
     // enforceOnlyForObject: false is passed to super by ContextContainer constructor
     expect(() => container.setKey({ key: 'prop', value: new ContextProperty({ value: 1 }) })).not.toThrow();
     expect(() => container.setKey({ key: 'cont', value: new ContextContainer({ value: {} }) })).not.toThrow();
     expect(() => container.setKey({ key: 'str', value: 'a string' })).toThrow(/Invalid child type: String/); // enforceOnlyForObject is false
     expect(() => container.setKey({ key: 'num', value: 123 })).toThrow(/Invalid child type: Number/);
     expect(() => container.setKey({ key: 'dum', value: new DummyChild() })).toThrow(/Invalid child type: DummyChild/);
  });

  it('should accept default children types ContextProperty and ContextContainer', () => {
    const container = new ContextContainer({ value: {} });
    const prop = new ContextProperty({ value: 'prop' });
    const nestedContainer = new ContextContainer({ value: {} });

    expect(() => container.setKey({ key: 'p1', value: prop })).not.toThrow();
    expect(() => container.setKey({ key: 'c1', value: nestedContainer })).not.toThrow();
    expect(container.value.p1).toBe(prop);
    expect(container.value.c1).toBe(nestedContainer);
  });

   it('should inherit methods from ContextUnit', () => {
        const container = new ContextContainer({ value: { key: new ContextProperty({ value: 'val' }) } });
        expect(typeof container.set).toBe('function');
        expect(typeof container.get).toBe('function');
        expect(typeof container.getKey).toBe('function');
        expect(typeof container.getValue).toBe('function');
        expect(typeof container.setKey).toBe('function');
        expect(typeof container.setValue).toBe('function');
        expect(typeof container.updateTimestamp).toBe('function');
        expect(typeof container.getProperty).toBe('function');
        expect(container.get('key')).toBeInstanceOf(ContextProperty);
   });
});