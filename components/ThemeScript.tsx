/** Inline script to apply theme before paint and avoid flash / hydration mismatch */
export function ThemeScript() {
  const code = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
