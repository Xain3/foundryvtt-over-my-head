import RemoteContextOperator from "./operator";
import _ from 'lodash';

const defaultMode = 'item';
const defaultBehavior = 'set';

class RemoteContextSetter extends RemoteContextOperator {
    constructor({config, contextRootIdentifier = undefined}) {
        super({config, contextRootIdentifier});
    }

    set({ 
            mode = defaultMode,
            behavior = defaultBehavior,
            args = {
                source: this.remoteContextRoot,
                location: this.contextObjectPath,
                pathOrKey: null,
                value: null,
                behavior: undefined,
                timestamp: true
            } 
    }) {
        const { source, location, pathOrKey, value, behavior, timestamp } = args;
        switch (mode) {
            case 'item':
                return this.setItem({ source, location, key: pathOrKey, value, behavior, timestamp });
            case 'property':
                return this.setProperty({ source, location, path: pathOrKey, value, behavior, timestamp });
            case 'state':
                return this.setState({ state: value });
            case 'data':
                return this.setData({ source, location, pathOrKey, value, behavior, timestamp });
            case 'flags':
                return this.setFlags({ source, location, pathOrKey, value, behavior, timestamp });
            case 'settings':
                return this.setSettings({ source, location, pathOrKey, value, behavior, timestamp });
            default:
                throw new Error(`Invalid mode: ${mode}`);
        }

    }

    setTimestamp({ source = this.remoteContextRoot, location = this.contextObjectPath, timestampKey = this.defaultTimestampKey, value = Date.now() }) {
        const path = `${location}.${timestampKey}`;
        _.set(source, path, value);
        return value;
    }

    _replaceItemInArray(source, path, value) {
        let currentValue = _.get(source, path, []);
        if (Array.isArray(currentValue)) {
            findAndReplaceItem();
        } else {
            throw new Error(`Cannot replace in non-array value at ${path}.`);
        }

        function findAndReplaceItem() {
            const index = currentValue.findIndex(item => item.id === value.id);
            if (index !== -1) {
                currentValue[index] = value;
            } else {
                console.warn(`Cannot replace item with id ${value.id} at ${path}. Item not found.`);
            }
        }
    }

    _pushToArray(source, path, value) {
        let currentValue = _.get(source, path, []);
        if (Array.isArray(currentValue)) {
            currentValue.push(value);
            _.set(source, path, currentValue);
        } else {
            throw new Error(`Cannot push to non-array value at ${path}.`);
        }
    }

    _applyBehavior(behavior, source, path, value) {
        switch (behavior) {
            case 'set': // Set a specific value
                _.set(source, path, value);
                break;
            case 'push': // Push a value to an array, including if value did not exist
                this._pushToArray(source, path, value);
                break;
            case 'replace': // Replace an item in an array only if it exists
                this._replaceItemInArray(source, path, value);
                break;
            case 'setIfAbsent': // Only set if the value does not exist
                if (!_.get(source, path)) {
                    _.set(source, path, value);
                }
                break;
            default:
                throw new Error(`Invalid behavior specified: ${behavior}`);
        }
    }

    setItem({ source = this.remoteContextRoot, location = this.contextObjectPath, object = this.contextObjectPath, key, value, behavior = defaultBehavior, timestamp = true }) {
        const path = `${location}.${key}`;
        this._applyBehavior(behavior, source, path, value);
        if (timestamp) {
            this.setTimestamp({ source, object, timestampKey: this.defaultTimestampKey });
        }
        return value;
    }

    setProperty({ source = this.remoteContextRoot, location = this.contextObjectPath, object = this.contextObjectPath, path, value, behavior = defaultBehavior, timestamp = true }) {
        const fullPath = `${location}.${path}`;
        this._applyBehavior(behavior, source, fullPath, value);
        if (timestamp) {
            this.setTimestamp({ source, object, timestampKey: this.defaultTimestampKey });
        }
        return value;
    }

    _setAtPath({ 
        source = this.remoteContextRoot, 
        location,
        object = this.contextObjectPath, 
        pathOrKey = null, 
        value,
        behavior = defaultBehavior, 
        timestamp = true 
    }) {
        const fullPath = pathOrKey ? `${location}.${pathOrKey}` : location;
        this._applyBehavior(behavior, source, fullPath, value);
        if (timestamp) {
            this.setTimestamp({ source, location: object, timestampKey: this.defaultTimestampKey }); 
        }
        return value;
    }

    setData({ source = this.remoteContextRoot, location = this.dataPath, object = this.contextObjectPath, pathOrKey = null, value, behavior = defaultBehavior, timestamp = true }) {
        return this._setAtPath({ source, location, object, pathOrKey, value, behavior, timestamp });
    }
    
    setFlags({ source = this.remoteContextRoot, location = this.flagsPath, object = this.contextObjectPath, pathOrKey = null, value, behavior = defaultBehavior, timestamp = true }) {
        return this._setAtPath({ source, location, object, pathOrKey, value, behavior, timestamp });
    }

    setSettings({ source = this.remoteContextRoot, location = this.settingsPath, object = this.contextObjectPath, pathOrKey = null, value, behavior = defaultBehavior, timestamp = true }) {
        return this._setAtPath({ source, location, object, pathOrKey, value, behavior, timestamp });
    } 

    setState({ source = this.remoteContextRoot, location = this.statePath, object = this.contextObjectPath, pathOrKey = null, state, behavior = defaultBehavior, timestamp = true }) {
        // Pass 'state' as the 'value' parameter to the helper
        return this._setAtPath({ source, location, object, pathOrKey, value: state, behavior, timestamp });
    }
}

export default RemoteContextSetter;