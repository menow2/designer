export function getLocationSearch() {
  return location.search.replace(/\?/, '')
}