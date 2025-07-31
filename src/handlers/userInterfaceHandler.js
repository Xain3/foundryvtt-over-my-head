// ./src/handlers/userInterfaceHandler.js

import Handler from '../baseClasses/managers/handler.js'

class UserInterfaceHandler extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.moduleID = this.moduleConstants.ID;
        this.flags = {
            alsoFade: 'alsoFade',
            showFadeToggle: 'showFadeToggle'
        }
        
    }

    /**
     * Adds the "Also Fade" UI element to the tile configuration interface.
     *
     * @param {Object} app - The application instance.
     * @param {Object} html - The HTML content of the application.
     * @param {Object} data - The data object for the application.
     * @returns {Promise<void>} A promise that resolves when the UI element has been added.
     */
    async addRoofVisionFadeUI(app, html, data) {
        // get also fade setting for tile
        let alsoFade = await app.object.getFlag(`${this.moduleID}`, this.flags.alsoFade);
        // get the occlusion mode select dropdown
        let select = html.find('[name="occlusion.mode"]');

        let showAlsoFadeUI = false;
        if(select[0].value === `${CONSTANTS.TILE_OCCLUSION_MODES.VISION}`)  // CONSTANTS is defined in the FoundryVTT API
        {
            // show the also fade checkbox on the tile config UI
            showAlsoFadeUI = true;
        }
       
        // add also fade section to the tile congif UI
        select.closest(".form-group").after(
            `<div class="form-group ${this.moduleID}-also-fade ${showAlsoFadeUI ? 'active' : ''}">
                <label>${game.i18n.localize(`${this.moduleID}.tile-config.also-fade.name`)}</label>
                <div class="form-fields">
                    <input type="checkbox" name="flags.${this.moduleID}.${this.flags.alsoFade}" ${alsoFade ? "checked" : ""} >
                </div>
                <p class="notes">${game.i18n.localize(`${this.moduleID}.tile-config.also-fade.description`)}</p>
            </div>`
        );
        app.setPosition({height: "auto"});
    
        // register change event listener for occlusion mode select
        select.on('change', (event) => {
            this.changeOcclusionMode(event, app, html);
        });    
    }

    
    /**
     * Handles the change of occlusion mode for a tile and updates the UI accordingly.
     *
     * @param {Event} event - The event object triggered by the change.
     * @param {Object} app - The application instance.
     * @param {Object} html - The HTML content of the application.
     *
     * @returns {Promise<void>} - A promise that resolves when the occlusion mode change is complete.
     */
    async changeOcclusionMode(event, app, html)
    {
        // get also fade UI section on tile config
        let section = html.find(`.${this.moduleID}-also-fade`);

        if(event.target.value === `${CONSTANTS.TILE_OCCLUSION_MODES.VISION}`) {
            // show also face UI if occlusion mode is "Vision"
            section.addClass("active");
        }
        else{
            // hide also face UI if occlusion mode is not "Vision"
            section.removeClass("active");
            // clear out the value if occlusion mode is not "Vision"
            let checkbox = html.find(`input[name="flags.${this.moduleID}.${this.flags.alsoFade}"]`);
            checkbox[0].checked = false;
        }

        // resize the tile config box to account for dynamic also fade section
        app.setPosition({height: "auto"});
    }

    /**
     * Registers a hook for the Tile Config UI to add roof vision fade functionality.
     * 
     * This method sets up an event listener for the "renderTileConfig" hook, which is triggered
     * when the Tile Config UI is rendered. When the hook is triggered, it calls the 
     * `addRoofVisionFadeUI` method to add additional UI elements or functionality related to 
     * roof vision fade.
     * 
     * @async
     * @method startUIListener
     */
    startUIListener() {
        // Register the hook for the Tile Config UI
        Hooks.on("renderTileConfig", async (app, html, data) => {
            await this.addRoofVisionFadeUI(app, html, data);
        });
    }
}

export default UserInterfaceHandler;