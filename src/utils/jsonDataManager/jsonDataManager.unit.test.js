import JsonDataManager from './jsonDataManager';

describe('JsonDataManager', () => {
    let jsonDataManager;
    const mockUrl = 'https://example.com/data.json';

    beforeEach(() => {
        jsonDataManager = new JsonDataManager(mockUrl);
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided URL', () => {
            expect(jsonDataManager.url).toBe(mockUrl);
        });
    });

    describe('fetchJSON', () => {
        it('should fetch JSON data successfully', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockData)
            });

            const result = await jsonDataManager.fetchJSON();
            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith(mockUrl);
        });

        it('should return null if response is not ok', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const result = await jsonDataManager.fetchJSON();
            expect(result).toBeNull();
            expect(global.fetch).toHaveBeenCalledWith(mockUrl);
        });

        it('should return null and log error if fetch throws an exception', async () => {
            const error = new Error('Network error');
            global.fetch.mockRejectedValueOnce(error);
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const result = await jsonDataManager.fetchJSON();
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Error fetching JSON:', error);
        });
    });

    describe('getValueByKey', () => {
        it('should return the value for an existing key', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(mockData);

            const result = await jsonDataManager.getValueByKey('key1');
            expect(result).toBe('value1');
        });

        it('should return null if the key does not exist', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(mockData);

            const result = await jsonDataManager.getValueByKey('nonExistentKey');
            expect(result).toBeNull();
        });

        it('should return null if fetchJSON returns null', async () => {
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(null);

            const result = await jsonDataManager.getValueByKey('key1');
            expect(result).toBeNull();
        });
    });

    describe('setValueByKey', () => {
        it('should set a value for a key and return updated data', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(mockData);

            const result = await jsonDataManager.setValueByKey('key3', 'value3');
            expect(result).toEqual({
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
            });
        });

        it('should update an existing key and return updated data', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(mockData);

            const result = await jsonDataManager.setValueByKey('key1', 'newValue1');
            expect(result).toEqual({
                key1: 'newValue1',
                key2: 'value2'
            });
        });

        it('should return null if fetchJSON returns null', async () => {
            jest.spyOn(jsonDataManager, 'fetchJSON').mockResolvedValueOnce(null);

            const result = await jsonDataManager.setValueByKey('key1', 'value1');
            expect(result).toBeNull();
        });
    });
});