import PlaceableChecker from './placeableChecker.mjs';

class TokenChecker extends PlaceableChecker {
  constructor(config, context, utils, placeableGetter) {
    super(config, context, utils, placeableGetter);
  }

  /**
   * Determines if a token is fully owned by the user.
   * @param {Object} token - The token to check.
   * @returns {boolean} True if the token is owned, else false.
   */
  isOwned(token) {
    try {
      if ('isOwner' in token) return token.isOwner;
      throw new Error('Token does not have isOwner property or method');
    } catch (error) {
      this.logger?.error(`Error checking if token is owned: ${error.message}`);
      return false;
    }
  }

  /**
   * Determines if a token is both owned and selected by the user.
   * @param {Object} token - The token to check.
   * @returns {boolean} True if the token is owned and selected, else false.
   */
  isOwnedAndControlled(token) {
    if (!this.isOwned(token)) return false;
    return super.isControlled(token);
  }

  /**
   * Determines if a token is both owned and selected by the user.
   * Delegates to isOwnedAndControlled for consistency.
   */
  isOwnedAndSelected(token) {
    return this.isOwnedAndControlled(token);
  }
}

export default TokenChecker;
