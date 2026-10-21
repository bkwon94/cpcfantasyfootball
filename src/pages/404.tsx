/**
 * The 404 page for the export. Next needs it here, because an app with no
 * app route does not export app/not-found.tsx as 404.html.
 */
export default function NotFoundPage() {
  return <p>This page does not exist.</p>;
}
