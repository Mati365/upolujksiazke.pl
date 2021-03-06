export function suppressEvent(e: any) {
  e.preventDefault();
  e.stopPropagation();
}
