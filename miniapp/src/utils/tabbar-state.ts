export const listeners = new Set<() => void>()
export let currentSelected = 0

export function setTabBarSelected(index: number) {
  currentSelected = index
  listeners.forEach((fn) => fn())
}

export function getTabBarSelected() {
  return currentSelected
}

export function subscribeTabBar(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
