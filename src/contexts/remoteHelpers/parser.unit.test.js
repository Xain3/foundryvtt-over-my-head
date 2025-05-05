import KeyPathParser from './parser';

describe('KeyPathParser', () => {
    describe('parse', () => {
        it('should parse dot-separated string into array of keys', () => {
            expect(KeyPathParser.parse('a.b.c')).toEqual(['a', 'b', 'c']);
            expect(KeyPathParser.parse('key')).toEqual(['key']);
            expect(KeyPathParser.parse('')).toEqual(['']);
        });

        it('should return the array as is if input is an array', () => {
            expect(KeyPathParser.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
            expect(KeyPathParser.parse([1, 2, 3])).toEqual([1, 2, 3]);
            expect(KeyPathParser.parse(['a', 2, Symbol('s')])).toEqual(['a', 2, expect.any(Symbol)]);
        });

        it('should wrap a single number or symbol in an array', () => {
            expect(KeyPathParser.parse(42)).toEqual([42]);
            const sym = Symbol('foo');
            expect(KeyPathParser.parse(sym)).toEqual([sym]);
        });

        it('should throw an error for invalid types', () => {
            expect(() => KeyPathParser.parse({})).toThrow(/Invalid keyOrPath type/);
            expect(() => KeyPathParser.parse(null)).toThrow(/Invalid keyOrPath type/);
            expect(() => KeyPathParser.parse(undefined)).toThrow(/Invalid keyOrPath type/);
            expect(() => KeyPathParser.parse(true)).toThrow(/Invalid keyOrPath type/);
            expect(() => KeyPathParser.parse(() => {})).toThrow(/Invalid keyOrPath type/);
        });
    });

    it('should expose validKeyTypes as static property', () => {
        expect(KeyPathParser.validKeyTypes).toEqual(['string', 'number', 'symbol']);
    });
});