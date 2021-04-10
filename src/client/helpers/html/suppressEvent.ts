export function suppressEvent(e: any) {
  e.preventDefault();
  e.stopPropagation();
}

export function stopPropagation(e: any) {
  e?.stopPropagation?.();
}
