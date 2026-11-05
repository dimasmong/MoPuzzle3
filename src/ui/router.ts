import { RouteName, RouteParams } from '../core/types';

type RouteListener = (route: RouteName, params: RouteParams) => void;

export class Router {
  private static currentRoute: RouteName = 'home';
  private static currentParams: RouteParams = {};
  private static listeners: RouteListener[] = [];
  private static isInitialized = false;

  public static init(listener: RouteListener): void {
    this.listeners.push(listener);
    if (this.isInitialized) return;
    this.isInitialized = true;

    window.addEventListener('popstate', () => {
      this.parseHash();
      this.notify();
    });
    window.addEventListener('hashchange', () => {
      this.parseHash();
      this.notify();
    });

    this.parseHash();
    this.notify();
  }

  public static getRoute(): RouteName {
    return this.currentRoute;
  }

  public static getParams(): RouteParams {
    return { ...this.currentParams };
  }

  public static navigate(route: RouteName, params: RouteParams = {}): void {
    this.currentRoute = route;
    this.currentParams = { ...params };

    // Update URL hash
    let hash = `#${route}`;
    const queryParts: string[] = [];
    if (params.gameId) queryParts.push(`game=${params.gameId}`);
    if (params.level) queryParts.push(`level=${params.level}`);
    if (params.difficulty) queryParts.push(`diff=${params.difficulty}`);

    if (queryParts.length > 0) {
      hash += `?${queryParts.join('&')}`;
    }

    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }

    this.notify();
    window.scrollTo(0, 0);
  }

  public static refreshCurrentPage(): void {
    this.notify();
  }

  private static parseHash(): void {
    const rawHash = window.location.hash.slice(1);
    if (!rawHash) {
      this.currentRoute = 'home';
      this.currentParams = {};
      return;
    }

    const [routePart, queryPart] = rawHash.split('?');
    const validRoutes: RouteName[] = [
      'home',
      'details',
      'levelselect',
      'play',
      'stats',
      'achievements',
      'settings',
      'about',
      'faq',
    ];

    if (validRoutes.includes(routePart as RouteName)) {
      this.currentRoute = routePart as RouteName;
    } else {
      this.currentRoute = 'home';
    }

    this.currentParams = {};
    if (queryPart) {
      const sp = new URLSearchParams(queryPart);
      if (sp.has('game')) this.currentParams.gameId = sp.get('game') as any;
      if (sp.has('level')) this.currentParams.level = parseInt(sp.get('level')!, 10);
      if (sp.has('diff')) this.currentParams.difficulty = sp.get('diff')!;
    }
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentRoute, this.currentParams);
    }
  }
}
