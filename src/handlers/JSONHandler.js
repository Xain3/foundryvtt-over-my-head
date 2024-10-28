// ./src/handlers/JSONHandler.js

class JSONHandler {
    constructor(url) {
        this.url = url;
    }

    async fetchJSON() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching JSON:', error);
            return null;
        }
    }

    async getValueByKey(key) {
        const jsonData = await this.fetchJSON();
        if (jsonData && key in jsonData) {
            return jsonData[key];
        }
        return null;
    }

    async setValueByKey(key, value) {
        const jsonData = await this.fetchJSON();
        if (jsonData) {
            jsonData[key] = value;
            return jsonData;
        }
        return null;
    }
}

export default JSONHandler;