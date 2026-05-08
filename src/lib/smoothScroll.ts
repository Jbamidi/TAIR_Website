/** Smooth scroll to a target section with offset for fixed navbar */
export function smoothScrollTo(href: string) {
  if (!href.startsWith("#")) return;
  const target = document.querySelector(href);
  if (!target) return;

  const offset = 80;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/** onClick handler for anchor-like elements */
export function handleSmoothScroll(
  e: React.MouseEvent<HTMLElement>,
  href: string
) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  smoothScrollTo(href);
}
