import { useEffect, useState } from 'react';
const ACTIVE_THEORY_CONFIG = {
  cacheKey: '1746999829739', // 原站构建缓存号，用于定位完全一致的 JS bundle。
  appScriptPath: '/assets/js/app.1746999829739.js', // 原站核心 WebGL 与页面动效入口。
  preloadLinkId: 'active-theory-app-preload', // 预加载标签 ID，避免 React 热更新重复创建。
  appScriptId: 'active-theory-app-script', // 主脚本标签 ID，避免重复执行原站 bundle。
  analyticsScriptId: 'active-theory-analytics-script', // 统计脚本标签 ID，保持原站加载顺序。
  analyticsScriptPath: '/vendor/www.googletagmanager.com/gtag/js_id=G-J7TMDT4F8N', // 本地化后的 Google Tag 脚本路径。
  analyticsId: 'G-J7TMDT4F8N', // 原站统计 ID，仅用于复刻原始运行环境。
  unsupportedPage: '/unsupported.html', // 原站低版本浏览器兜底页。
  uilStaticPath: '/assets/data/uil.1746999829739.json', // 原站静态 UI 数据文件。
} as const;

declare global {
  interface Window {
    _ENV_: 'production';
    _CMS_: string;
    _CACHE_: string;
    _UNSUPPORTED_PAGE_: string;
    UIL_STATIC_PATH: string;
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function ensurePreloadLink(id: string, href: string): void {
  if (document.getElementById(id)) {
    return;
  }

  const preloadLink = document.createElement('link');
  preloadLink.id = id;
  preloadLink.href = href;
  preloadLink.rel = 'preload';
  preloadLink.as = 'script';
  document.head.appendChild(preloadLink);
}

function ensureScript(id: string, src: string, async = true): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
}

function configureOriginalRuntime(): void {
  if (!(window as any)._audioPatched) {
    const OrigAudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (OrigAudioContext) {
      const contexts: any[] = [];
      function PatchedAudioContext(this: any, ...args: any[]) {
        const ctx = new (OrigAudioContext as any)(...args);
        contexts.push(ctx);
        return ctx;
      }
      PatchedAudioContext.prototype = OrigAudioContext.prototype;
      Object.setPrototypeOf(PatchedAudioContext, OrigAudioContext);
      window.AudioContext = PatchedAudioContext as any;
      if ((window as any).webkitAudioContext) (window as any).webkitAudioContext = PatchedAudioContext;
      const resumeAll = () => {
        contexts.forEach(ctx => {
          if (ctx.state === 'suspended') ctx.resume();
        });
      };
      window.addEventListener('click', resumeAll, { capture: true });
      window.addEventListener('touchstart', resumeAll, { capture: true });
      window.addEventListener('touchend', resumeAll, { capture: true });
      window.addEventListener('pointerdown', resumeAll, { capture: true });
    }
    (window as any)._audioPatched = true;
  }
  window._ENV_ = 'production';
  window._CMS_ = '%CMS%';
  window._CACHE_ = ACTIVE_THEORY_CONFIG.cacheKey;
  window._UNSUPPORTED_PAGE_ = ACTIVE_THEORY_CONFIG.unsupportedPage;
  window.UIL_STATIC_PATH = ACTIVE_THEORY_CONFIG.uilStaticPath;

  // Single cleanly installed interceptor
  if (!(window as any)._fetchIntercepted) {
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      let url = args[0];
        if (typeof url === 'string') {
          if (url.includes('storage.googleapis.com/activetheory-v6.appspot.com/cms/')) {
            if (url.includes('projects-')) url = '/assets/data/cms_projects.json?v=' + Date.now();
            else if (url.includes('metadata-')) url = '/assets/data/cms_metadata.json?v=' + Date.now();
            else if (url.includes('contact-')) url = '/assets/data/cms_contact.json?v=' + Date.now();
          }
          if (url.toLowerCase().includes('at_logo.bin')) {
            url = url + '?v=' + Date.now();
          }
        }
        args[0] = url;
        return origFetch.apply(this, args);
    };
    (window as any)._fetchIntercepted = true;
  }
}

function configureAnalytics(): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', ACTIVE_THEORY_CONFIG.analyticsId);
}

export default function App() {
  const [, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      configureOriginalRuntime();
      configureAnalytics();

      Promise.all([
        fetch('/assets/data/uil.1746999829739.json?v=' + Date.now()).then((res) => res.json()).catch(() => ({})),
        fetch('/assets/data/cms_projects.json?v=' + Date.now()).then((res) => res.json()).catch(() => []),
        fetch('/assets/data/cms_menu.json?v=' + Date.now()).then((res) => res.json()).catch(() => null),
        fetch('/assets/data/cms_settings.json?v=' + Date.now()).then((res) => res.json()).catch(() => null)
      ]).then(([json, projects, menu, settings]) => {
        
        if (settings && settings.logoScale !== undefined) {
           (ACTIVE_THEORY_CONFIG as any).logoScale = Number(settings.logoScale);
        }

        if (menu && menu.items && json) {
          json.menu_links = menu.items.length;
        }
        (window as any).UIL_DATA = json;
        (window as any).CMS_PROJECTS = projects;
        (window as any).CMS_MENU_DATA = menu;
        (window as any).CMS_SETTINGS = settings;

        const v = '?v=' + Date.now();
        ensurePreloadLink(ACTIVE_THEORY_CONFIG.preloadLinkId, ACTIVE_THEORY_CONFIG.appScriptPath + v);
        ensureScript(ACTIVE_THEORY_CONFIG.appScriptId, ACTIVE_THEORY_CONFIG.appScriptPath + v);
        ensureScript(ACTIVE_THEORY_CONFIG.analyticsScriptId, ACTIVE_THEORY_CONFIG.analyticsScriptPath);
        setReady(true);
      }).catch(err => {
        console.error("Critical fetch error in App.tsx:", err);
        ensurePreloadLink(ACTIVE_THEORY_CONFIG.preloadLinkId, ACTIVE_THEORY_CONFIG.appScriptPath);
        ensureScript(ACTIVE_THEORY_CONFIG.appScriptId, ACTIVE_THEORY_CONFIG.appScriptPath);
        ensureScript(ACTIVE_THEORY_CONFIG.analyticsScriptId, ACTIVE_THEORY_CONFIG.analyticsScriptPath);
        setReady(true);
      });
    }
    
    init();
  }, []);

  return null;
}
