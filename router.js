export class Router {
  constructor({ base = "", afterNavigate = null } = {}) {
    this.routes = [];
    this.middlewares = [];
    this.notFoundHandler = null;
    this.afterNavigate = afterNavigate;
    this.base = this._normalizeBase(base);
    this.currentRoute = null;
    this.params = {};
    this.query = {};
    this._initialized = false;
  }

  route(path, handler, meta = {}) {
    const normalized = this._normalizePath(path);
    this.routes.push({
      handler,
      meta,
      path: normalized,
      ...this._compile(normalized),
    });
    return this;
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  navigate(path) {
    return this._dispatch(path, "push");
  }

  replace(path) {
    return this._dispatch(path, "replace");
  }

  async init() {
    if (this._initialized) return this;
    window.addEventListener("popstate", () => {
      this._dispatch(
        window.location.pathname + window.location.search,
        "none",
      );
    });
    await this._dispatch(
      window.location.pathname + window.location.search,
      "replace",
    );
    this._initialized = true;
    return this;
  }

  get path() {
    return this._normalizePath(
      this._stripBase(window.location.pathname || "/"),
    );
  }

  get href() {
    return (window.location.pathname || "/") + window.location.search;
  }

  _normalizeBase(base) {
    if (!base) return "";
    const value = String(base);
    const withLeading = value.startsWith("/") ? value : `/${value}`;
    return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  }

  _applyBase(path) {
    if (!this.base) return path;
    return this.base.replace(/\/$/, "") + path;
  }

  _stripBase(pathname) {
    if (!this.base) return pathname;
    const base = this.base.replace(/\/$/, "");
    if (pathname === base) return "/";
    if (pathname.startsWith(this.base)) return `/${pathname.slice(this.base.length)}`;
    return pathname;
  }

  _resolve(path) {
    if (!this.base) return path;
    const url = new URL(path, window.location.origin);
    const base = this.base.replace(/\/$/, "");
    if (
      url.pathname === this.base ||
      url.pathname === base ||
      url.pathname.startsWith(this.base)
    ) {
      return path;
    }
    return this._applyBase(url.pathname) + url.search + url.hash;
  }

  _normalizePath(pathname) {
    if (!pathname || pathname === "/") return "/";
    return pathname.replace(/\/+$/, "") || "/";
  }

  _compile(path) {
    const paramNames = [];
    const source = path
      .replace(/\//g, "\\/")
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });
    return { paramNames, regex: new RegExp(`^${source}$`) };
  }

  _parseQuery(search) {
    const query = {};
    for (const [key, value] of new URLSearchParams(search)) {
      query[key] = value;
    }
    return query;
  }

  _match(routePath) {
    const path = this._normalizePath(routePath);
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (!match) continue;
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1]);
      });
      return { route, params };
    }
    return null;
  }

  async _dispatch(path, historyMode = "push") {
    const url = new URL(this._resolve(path), window.location.origin);
    const absolute = url.pathname || "/";
    const routePath = this._normalizePath(this._stripBase(absolute));
    const query = this._parseQuery(url.search);
    const from = this.currentRoute;
    const matched = this._match(routePath);

    if (!matched) {
      this.notFoundHandler?.(routePath);
      return false;
    }

    const to = {
      path: matched.route.path,
      pathname: routePath,
      params: matched.params,
      query,
      meta: matched.route.meta,
    };

    for (const middleware of this.middlewares) {
      if ((await middleware(to, from)) === false) return false;
    }

    const fullUrl = absolute + url.search;
    if (historyMode === "push") {
      if (window.location.pathname + window.location.search !== fullUrl) {
        window.history.pushState({ path: absolute }, "", fullUrl);
      }
    } else if (historyMode === "replace") {
      if (window.location.pathname + window.location.search !== fullUrl) {
        window.history.replaceState({ path: absolute }, "", fullUrl);
      }
    }

    this.currentRoute = to;
    this.params = matched.params;
    this.query = query;

    if (to.meta.title) {
      const title =
        typeof to.meta.title === "function"
          ? to.meta.title(to.params, to.query)
          : to.meta.title;
      if (title) document.title = title;
    }

    await matched.route.handler(matched.params, query);
    await this.afterNavigate?.(to, from);
    return true;
  }
}

export class LoadingManager {
  constructor({ logo = "/logo.svg" } = {}) {
    this.loadingEl = document.getElementById("loading-screen") || null;
    this.logo = logo;
    this.minDuration = 420;
    this.startTime = this.loadingEl ? Date.now() : 0;
  }

  show(type = "app", custom = {}) {
    this.startTime = Date.now();
    const screens = {
      app: ["SkillXChange", "Preparing your experience"],
      login: ["Signing you in", "Connecting to your account"],
      signup: ["Creating account", "Setting up your profile"],
      logout: ["Signing out", "See you next time"],
      page: ["Opening page", "Loading view"],
      data: ["Loading data", "Fetching your information"],
    };
    const [defaultTitle, defaultSubtitle] = screens[type] || screens.app;
    const title = custom.text ?? defaultTitle;
    const subtitle = custom.subtext ?? defaultSubtitle;

    const existing = document.getElementById("loading-screen");
    if (existing) {
      this.loadingEl = existing;
      existing.dataset.loadingType = type;
      existing.classList.remove("hiding");
      existing.classList.add("visible");
      this.updateText(title, subtitle);
      document.documentElement.classList.add("loading-lock");
      return;
    }

    document.body.insertAdjacentHTML(
      "afterbegin",
      this._markup(title, subtitle, type),
    );
    this.loadingEl = document.getElementById("loading-screen");
    this.loadingEl.classList.add("instant");
    void this.loadingEl.offsetHeight;
    this.loadingEl.classList.add("visible");
    document.documentElement.classList.add("loading-lock");
    setTimeout(() => this.loadingEl?.classList.remove("instant"), 50);
  }

  async hide(immediate = false) {
    const el = this.loadingEl || document.getElementById("loading-screen");
    if (!el) {
      document.documentElement.classList.remove("loading-lock");
      return;
    }

    if (!immediate) {
      const elapsed = Date.now() - this.startTime;
      if (elapsed < this.minDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.minDuration - elapsed),
        );
      }
    }

    if (immediate) {
      el.remove();
      this.loadingEl = null;
      document.documentElement.classList.remove("loading-lock");
      return;
    }

    el.classList.remove("visible");
    el.classList.add("hiding");
    await new Promise((resolve) => setTimeout(resolve, 260));
    el.remove();
    if (this.loadingEl === el) this.loadingEl = null;
    document.documentElement.classList.remove("loading-lock");
  }

  updateText(title, subtitle = "") {
    const el = this.loadingEl || document.getElementById("loading-screen");
    if (!el) return;
    const titleEl = el.querySelector(".loading-title");
    const subtitleEl = el.querySelector(".loading-subtitle");
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) {
      subtitleEl.textContent = subtitle;
      subtitleEl.style.display = subtitle ? "" : "none";
    } else if (subtitle) {
      const wrap = el.querySelector(".loading-text");
      if (!wrap) return;
      const span = document.createElement("span");
      span.className = "loading-subtitle";
      span.textContent = subtitle;
      wrap.appendChild(span);
    }
  }

  _markup(title, subtitle, type) {
    return `<div class="loading-screen visible" id="loading-screen" data-loading-type="${type}" role="status" aria-live="polite"><div class="loading-content"><div class="loading-brand"><div class="loading-logo"><img class="loading-mark" src="${this.logo}" alt="" aria-hidden="true" /><div class="loading-ring"></div><div class="loading-ring ring-2"></div></div></div><div class="loading-text"><span class="loading-title">${title}</span>${subtitle ? `<span class="loading-subtitle">${subtitle}</span>` : ""}</div><div class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></div></div></div>`;
  }
}

export function setupLinkInterceptor(router) {
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      !href ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }
    event.preventDefault();
    router.navigate(href.replace(/^\.\//, "/"));
  });
}
