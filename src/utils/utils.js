import StaticUtils from "./static/static";
import Logger from "./logger";
import HookFormatter from "./hookFormatter";
import Initializer from "./initializer";
import Context from "@contexts/context";

class Utilities {
  constructor(constants, manifest) {
    this.static = StaticUtils;
    this.constants = constants;
    this.manifest = manifest;
    this.formatError = this.static.formatError.bind(this.static);
    this.logger = new Logger(this.constants, this.manifest, this.formatError);
    this.hookFormatter = new HookFormatter(this.constants, this.manifest, this.formatError);
    this.initializer = new Initializer(this.constants, this.manifest, this.logger, this.formatError, Context);

    // Convenience methods
    this.formatHookName = this.hookFormatter.formatHookName.bind(this.hookFormatter);
    this.initializeContext = this.initializer.initializeContextObject.bind(this.initializer);
  }
}

export default Utilities;