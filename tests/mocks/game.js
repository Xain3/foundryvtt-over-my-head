class Game {
  static getGame() {
    return {
      id: 1,
      name: 'Test Game',
      description: 'This is a test game.',
      genre: 'Action',
      releaseDate: '2023-01-01',
      rating: 4.5,
    };
  }
  static l18n() {
    return {
      localize: (key) => {
        const translations = {
          'game.start': 'Game started',
          'game.end': 'Game ended',
        };
        return translations[key] || key;
      },
    };
  }
}

export default Game;