# PHP

- Always use curly braces for control structures, even single-line.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. No empty zero-parameter `__construct()` methods unless private constructor.
- Use explicit return types + param type hints: `function isAccessible(User $user, ?string $path = null): bool`
- TitleCase Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Inline comments only for complex logic.
- Use array shape type definitions in PHPDoc blocks.