(function(g,f){if(typeof define=="function"&&define.amd){define(f)}else if(typeof exports=="object" && typeof module<"u"){module.exports=f()}else{var m=f();for(var i in m) g[i]=m[i]}}(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : this,function(){var exports={};var __exports=exports;var module={exports};
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i7 = decorators.length - 1, decorator; i7 >= 0; i7--)
    if (decorator = decorators[i7])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// libs/embed-libs/embed/src/index.ts
var index_exports = {};
__export(index_exports, {
  LuzmoEmbedDashboard: () => LuzmoEmbedDashboard,
  LuzmoEmbedVizItem: () => LuzmoEmbedVizItem,
  LuzmoIQEmbedAnswerComponent: () => LuzmoIQEmbedAnswerComponent,
  LuzmoIQEmbedChatComponent: () => LuzmoIQEmbedChatComponent,
  addJSONSchemas: () => addJSONSchemas,
  fetchJSONSchema: () => fetchJSONSchema,
  getCachedJSONSchema: () => getCachedJSONSchema,
  getCachedJSONSchemas: () => getCachedJSONSchemas,
  getJSONSchemaUrl: () => getJSONSchemaUrl,
  luzmoRefParserOptions: () => luzmoRefParserOptions,
  preloadDashboard: () => preloadDashboard,
  preloadIQ: () => preloadIQ,
  preloadVizItem: () => preloadVizItem,
  selectedDataUtils: () => selectedDataUtils
});
module.exports = __toCommonJS(index_exports);

// libs/embed-libs/embed/src/lib/shared/helpers/error.ts
var _handleError = (errorMessage, parameters) => {
  let message = "The dashboard component encountered an error";
  if (typeof parameters?.dashboardId === "string") {
    message += ` for dashboard with id ${parameters.dashboardId}`;
  }
  if (typeof parameters?.dashboardSlug === "string") {
    message += ` for dashboard with slug ${parameters.dashboardSlug}`;
  }
  if (typeof parameters?.container === "string") {
    message += ` in container ${parameters.container}`;
  }
  if (errorMessage) {
    message += `:
${errorMessage}`;
    console.warn(message);
  }
};

// libs/embed-libs/embed/src/lib/shared/helpers/browser-check.ts
var _browserCheck = (dashboardComponent) => {
  let hasError = false;
  let errorMessage = "";
  const document_ = document.body || document.documentElement;
  const style = document_.style;
  const browserCheck = {
    svg: !!("createElementNS" in document && document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect),
    flexbox: style.webkitFlexWrap === "" || style.flexWrap === "",
    postMessage: !!window.postMessage
  };
  const browserCheckKeys = ["svg", "flexbox", "postMessage"];
  for (const key of browserCheckKeys) {
    if (!browserCheck[key]) {
      hasError = true;
      dashboardComponent.browserNotSupported = dashboardComponent.browserNotSupported || [];
      dashboardComponent.browserNotSupported.push(key);
      errorMessage += `Your browser does not support: ${key}
`;
    }
  }
  const ua = window.navigator.userAgent;
  const msie = ua.includes("MSIE");
  const trident = ua.includes("Trident/");
  if (msie || trident) {
    hasError = true;
    errorMessage = "IE is not supported.";
  }
  if (hasError) {
    _handleError(errorMessage);
  }
};

// libs/embed-libs/embed/src/lib/shared/helpers/default-parameters.ts
var DEFAULT_PARAMETERS = {
  appServer: "https://app.luzmo.com/",
  apiHost: "https://api.luzmo.com/",
  dashboardId: null,
  dashboardSlug: null,
  container: null,
  key: null,
  token: null,
  language: "auto",
  editorLanguage: "auto",
  editMode: null,
  screenMode: null,
  switchScreenModeOnResize: true,
  itemId: null,
  theme: "",
  mainColor: "",
  itemDimensions: {
    width: "auto",
    height: "auto"
  },
  loaderBackground: "#f9f9f9",
  loaderFontColor: "#5a5a5a",
  loaderSpinnerColor: "rgb(68, 52, 255)",
  loaderSpinnerBackground: "rgba(169, 169, 169, 0.14)",
  timezoneId: null,
  contextId: null
};

// libs/embed-libs/embed/src/lib/shared/helpers/extents.ts
var EXTENTS = [
  { mode: "mobile", width: [150, 767] },
  { mode: "tablet", width: [768, 1199] },
  { mode: "desktop", width: [1200, 1599] },
  { mode: "largeScreen", width: [1600, 9999] },
  { mode: "fixed", width: [] }
];

// libs/embed-libs/embed/src/lib/shared/helpers/translations.ts
var TRANSLATIONS = {
  initializing: {
    en: "Initializing...",
    nl: "Laden...",
    fr: "Chargement...",
    de: "Initialisiere...",
    es: "Inicializando..."
  },
  errorDashboard: {
    en: "Oops, we could not load this dashboard!",
    nl: "Oeps, we konden het dashboard niet laden.",
    fr: "Le chargement a echou\xE9.",
    de: "Hoppla, wir konnten dieses Dashboard nicht laden!",
    es: "\xA1Ups! No pudimos cargar este tablero."
  },
  errorItem: {
    en: "Oops, we could not load this item!",
    nl: "Oeps, we konden de grafiek niet laden.",
    fr: "Le chargement a echou\xE9.",
    de: "Hoppla, wir konnten dieses Diagramm nicht laden!",
    es: "\xA1Ups! No pudimos cargar este elemento."
  }
};
var translations_default = TRANSLATIONS;

// libs/embed-libs/embed/src/lib/shared/helpers/utils.ts
var addTrailingSlash = (serverUrl) => {
  if (!serverUrl) {
    return "";
  }
  return serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`;
};
var removeTrailingSlash = (serverUrl) => {
  if (!serverUrl) {
    return "";
  }
  return serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
};
var formatDashboardList = (dashboards, integrationId, user, dashboardComponent) => {
  const combineRights = (securable, accessUser) => {
    const matchingUser = securable.users.find((u3) => u3.id === accessUser.id);
    const securableAccessRights = matchingUser && matchingUser.userAccessRight ? {
      flagRead: matchingUser.userAccessRight.flagRead,
      flagUse: matchingUser.userAccessRight.flagUse,
      flagModify: matchingUser.userAccessRight.flagModify,
      flagOwn: matchingUser.userAccessRight.flagOwn
    } : {
      flagRead: false,
      flagUse: false,
      flagModify: false,
      flagOwn: false
    };
    const groups = securable.groups.filter(
      (group) => accessUser.userGroups.includes(group.id) || group.public === true
    );
    const groupsAccess = groups.map((group) => {
      if (group.groupAccessRight) {
        return group.groupAccessRight;
      }
    });
    for (const groupAccess of groupsAccess) {
      if (!securableAccessRights.flagRead && groupAccess.flagRead) {
        securableAccessRights.flagRead = groupAccess.flagRead;
      }
      if (!securableAccessRights.flagUse && groupAccess.flagUse) {
        securableAccessRights.flagUse = groupAccess.flagUse;
      }
      if (!securableAccessRights.flagModify && groupAccess.flagModify) {
        securableAccessRights.flagModify = groupAccess.flagModify;
      }
      if (!securableAccessRights.flagOwn && groupAccess.flagOwn) {
        securableAccessRights.flagOwn = groupAccess.flagOwn;
      }
    }
    const integrationsAccess = securable.integrations?.length > 0 ? securable.integrations.map((integration) => {
      if (integration.integrationAccessRight) {
        return integration.integrationAccessRight;
      }
    }) : [];
    for (const integrationAccess of integrationsAccess) {
      if (!securableAccessRights.flagRead && integrationAccess.flagRead) {
        securableAccessRights.flagRead = integrationAccess.flagRead;
      }
      if (!securableAccessRights.flagUse && integrationAccess.flagUse) {
        securableAccessRights.flagUse = integrationAccess.flagUse;
      }
      if (!securableAccessRights.flagModify && integrationAccess.flagModify) {
        securableAccessRights.flagModify = integrationAccess.flagModify;
      }
    }
    return securableAccessRights;
  };
  const localize = (item, locale) => {
    if (item === null || item === void 0) {
      return "";
    }
    if (typeof item !== "object" || Object.keys(item).length === 0) {
      if (typeof item === "object" && Object.keys(item).length === 0) {
        return "";
      }
      return item;
    }
    let localizedItem;
    localizedItem = locale && item[locale] ? item[locale] : item[Object.keys(item)[0]];
    if (localizedItem === void 0 || localizedItem === null) {
      localizedItem = "";
    }
    return localizedItem;
  };
  const treatedDashboards = [];
  for (const dashboard of dashboards) {
    const treatedDashboard = {
      accessibleBy: [],
      accessRights: combineRights(dashboard, user),
      id: dashboard.id,
      modifiedAt: dashboard.modified_at,
      name: localize(dashboard.name, dashboardComponent.language),
      slug: null,
      tags: dashboard.tags.map((t4) => t4.tag).sort((t1, t22) => t1.localeCompare(t22))
    };
    const currentIntegration = dashboard.integrations.find(
      (i7) => i7.id === integrationId
    );
    if (currentIntegration?.integrationAccessRight?.slug) {
      treatedDashboard.slug = currentIntegration.integrationAccessRight.slug;
    }
    const users = dashboard.users.map((u3) => ({
      model: "User",
      id: u3.id,
      name: localize(u3.name, user.locale_id)
    }));
    const groups = dashboard.groups.map((g2) => ({
      model: "Group",
      id: g2.id,
      name: localize(g2.name, user.locale_id) || {}
    }));
    const integrations = dashboard.integrations.map((i7) => ({
      model: "Integration",
      id: i7.id,
      name: localize(i7.name, user.locale_id) || {}
    }));
    treatedDashboard.accessibleBy = [...users, ...groups, ...integrations];
    treatedDashboards.push(treatedDashboard);
  }
  return treatedDashboards;
};
var VERSION = "0.0.0-unknown-luzmo";
var sanitizeUrl = (url) => {
  const invalidPrototcolRegex = /^(%20|\s)*(javascript|data)/im;
  const ctrlCharactersRegex = /[^\u0020-\u007E]/gim;
  const urlSchemeRegex = /^([^:]+):/gm;
  const relativeFirstCharacters = /* @__PURE__ */ new Set([".", "/"]);
  const isRelativeUrlWithoutProtocol = (relativeUrl) => relativeFirstCharacters.has(relativeUrl[0]);
  if (!url) {
    return "about:blank";
  }
  const sanitizedUrl = url.replaceAll(ctrlCharactersRegex, "").trim();
  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl;
  }
  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
  if (!urlSchemeParseResults) {
    return sanitizedUrl;
  }
  const urlScheme = urlSchemeParseResults[0];
  if (invalidPrototcolRegex.test(urlScheme)) {
    return "about:blank";
  }
  return sanitizedUrl;
};
var isObject = (o7) => o7 && typeof o7 === "object";
var defaultsDeep = (target, defaults) => {
  Object.entries(defaults).forEach(([k2, v2]) => {
    if (k2 in target) {
      if (target[k2] === void 0) {
        target[k2] = v2;
      } else {
        target[k2] = isObject(v2) ? defaultsDeep(
          target[k2],
          v2
        ) : target[k2];
      }
    } else {
      target[k2] = v2;
    }
  });
  return target;
};
var uuidv4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, function(c4) {
  const r6 = Math.trunc(Math.random() * 16);
  const v2 = c4 === "x" ? r6 : r6 & 3 | 8;
  return v2.toString(16);
});

// libs/embed-libs/embed/src/lib/shared/helpers/iframe-url.ts
var createIframeUrl = (dashboardContent) => {
  const searchString = [];
  const {
    appServer,
    language,
    editorLanguage,
    loaderBackground,
    loaderSpinnerColor,
    loaderSpinnerBackground,
    loaderFontColor,
    screenMode,
    key,
    token,
    timezoneId,
    itemEmbedding,
    itemDimensions,
    dashboardId,
    dashboardSlug,
    itemId,
    theme,
    mainColor,
    editMode
  } = dashboardContent.params;
  if (language && language !== "auto") {
    searchString.push(`language=${language}`);
  }
  if (editorLanguage && editorLanguage !== "auto") {
    searchString.push(`editorLanguage=${editorLanguage}`);
  }
  if (loaderBackground) {
    searchString.push(`ldrbg=${loaderBackground}`);
  }
  if (loaderFontColor) {
    searchString.push(`ldrftclr=${loaderFontColor}`);
  }
  if (loaderSpinnerColor) {
    searchString.push(`ldrspclr=${loaderSpinnerColor}`);
  }
  if (loaderSpinnerBackground) {
    searchString.push(`ldrspbg=${loaderSpinnerBackground}`);
  }
  if (theme) {
    searchString.push(`theme=${theme}`);
  }
  if (mainColor) {
    searchString.push(`mainColor=${mainColor}`);
  }
  if (screenMode && screenMode !== "auto") {
    searchString.push(`screenMode=${screenMode}`);
  }
  if (timezoneId) {
    searchString.push("timezoneId=" + timezoneId);
  }
  if (itemEmbedding && itemDimensions && itemDimensions.width) {
    searchString.push("width=" + itemDimensions.width);
  }
  if (itemEmbedding && itemDimensions && itemDimensions.height) {
    searchString.push("height=" + itemDimensions.height);
  }
  if (editMode) {
    searchString.push("editMode=" + editMode);
  }
  const keyTokenUrlAnchor = key && token ? "#" + key + ":" + token : "";
  searchString.push("version=" + (dashboardContent.libVersion || VERSION));
  const appServerWithSlash = addTrailingSlash(appServer);
  const iframeUrl = itemEmbedding ? `${appServerWithSlash}i/${dashboardId || dashboardSlug}/${itemId}?${encodeURIComponent(
    searchString.join("&")
  )}${keyTokenUrlAnchor}` : `${appServerWithSlash}i/${dashboardId || dashboardSlug}?${encodeURIComponent(
    searchString.join("&")
  )}${keyTokenUrlAnchor}`;
  return sanitizeUrl(iframeUrl);
};

// libs/embed-libs/embed/src/lib/shared/helpers/get-loader.ts
var getLoader = (dashboardComponent) => {
  let errorMsg;
  if (dashboardComponent.params?.error || (dashboardComponent.browserNotSupported?.length ?? 0) > 0) {
    if (dashboardComponent.params) {
      dashboardComponent.params.error = true;
    }
    if (dashboardComponent.browserNotSupported) {
      errorMsg = "Browser is not supported.";
    }
  }
  const language = dashboardComponent.params?.language;
  const loadingMsg = (language ? translations_default.initializing[language] : void 0) || translations_default.initializing.en;
  return dashboardComponent.browserNotSupported || dashboardComponent.params?.error ? { loadingMsg, errorMsg } : { loadingMsg, errorMsg: "" };
};

// libs/embed-libs/embed/src/lib/shared/helpers/promise-dispatch.ts
function resolvePromise(dashboardComponent, requestId, data) {
  const promises = dashboardComponent.promises;
  if (promises?.[requestId]) {
    promises[requestId].resolve(data);
    delete promises[requestId];
  }
}
function rejectPromise(dashboardComponent, requestId, data) {
  const promises = dashboardComponent.promises;
  if (promises?.[requestId]) {
    promises[requestId].reject(data);
    delete promises[requestId];
  }
}

// libs/embed-libs/embed/src/lib/shared/helpers/styles.ts
function containerStyles(dashboardComponent) {
  const styles = {};
  if (dashboardComponent.params?.loaderBackground && !dashboardComponent.iframeLoaded) {
    styles.background = dashboardComponent.params.loaderBackground;
  }
  return styles;
}
function containerLoaderStyles(dashboardComponent) {
  const height = dashboardComponent.params?.itemDimensions?.height || DEFAULT_PARAMETERS.itemDimensions.height;
  const chartHeightDefined = dashboardComponent.params?.itemEmbedding && height !== "auto";
  const display = dashboardComponent.iframeLoaded ? "none" : "";
  return {
    display,
    height: `${chartHeightDefined ? height : dashboardComponent.minHeight}px`
  };
}
function loaderStyles(dashboardComponent) {
  const background = dashboardComponent.params?.loaderBackground || DEFAULT_PARAMETERS.loaderBackground;
  if (dashboardComponent.params?.itemEmbedding) {
    dashboardComponent.loaderSize = 24;
    dashboardComponent.borderWidth = 4;
    dashboardComponent.minHeight = 200;
    const width = dashboardComponent.params.itemDimensions?.width || DEFAULT_PARAMETERS.itemDimensions.width;
    const height = dashboardComponent.params.itemDimensions?.height || DEFAULT_PARAMETERS.itemDimensions.height;
    const chartWidthDefined = width !== "auto";
    const chartHeightDefined = height !== "auto";
    return {
      background,
      width: chartWidthDefined ? `${width}px` : "100%",
      height: `${chartHeightDefined ? height : "200"}px`,
      "min-height": chartHeightDefined ? "" : "200px"
    };
  }
  return {
    background
  };
}
function generateBorderStyle(borderWidth, color) {
  return `${borderWidth}px solid ${color}`;
}
function plStyles(dashboardComponent) {
  const {
    loaderSpinnerColor: defaultSpinnerColor,
    loaderSpinnerBackground: defaultSpinnerBackground
  } = DEFAULT_PARAMETERS;
  const spinnerColorBorder = generateBorderStyle(
    dashboardComponent.borderWidth,
    dashboardComponent.params?.loaderSpinnerColor || defaultSpinnerColor
  );
  const spinnerBackgroundBorder = generateBorderStyle(
    dashboardComponent.borderWidth,
    dashboardComponent.params?.loaderSpinnerBackground || defaultSpinnerBackground
  );
  const size = `${dashboardComponent.loaderSize}px`;
  return {
    "border-top": spinnerColorBorder,
    "border-right": spinnerColorBorder,
    "border-bottom": spinnerBackgroundBorder,
    "border-left": spinnerBackgroundBorder,
    width: size,
    height: size
  };
}
function lcStyles(dashboardComponent) {
  const height = dashboardComponent.params?.itemDimensions?.height || DEFAULT_PARAMETERS.itemDimensions.height;
  const chartHeightDefined = dashboardComponent.params?.itemEmbedding && height !== "auto";
  const getPaddingStr = (value) => `${((value ?? Number.NaN) - (dashboardComponent.loaderSize ?? Number.NaN) - 32) / 2}px`;
  const verticalPadding = dashboardComponent.params?.itemId ? chartHeightDefined ? getPaddingStr(Number.parseInt(`${height}`, 10)) : getPaddingStr(dashboardComponent.minHeight) : "128px";
  return {
    padding: `${verticalPadding} 16px`
  };
}
function calculateIframeStyles(dashboardComponent) {
  const height = dashboardComponent.params?.itemDimensions?.height || DEFAULT_PARAMETERS.itemDimensions.height;
  const width = dashboardComponent.params?.itemDimensions?.width || DEFAULT_PARAMETERS.itemDimensions.width;
  const editMode = dashboardComponent.params?.editMode;
  if (dashboardComponent.params?.itemEmbedding && height !== "auto") {
    dashboardComponent.iframeHeight = `${height}px`;
  } else if (dashboardComponent.params?.itemEmbedding) {
    dashboardComponent.iframeHeight = "200px";
  } else if (editMode != null && ["editFull", "editLimited"].includes(editMode)) {
    dashboardComponent.iframeHeight = "100%";
  } else {
    dashboardComponent.iframeHeight = "400px";
  }
  dashboardComponent.iframeWidth = dashboardComponent.params?.itemEmbedding && width !== "auto" ? `${width}px` : "100%";
  const styles = {
    height: dashboardComponent.iframeHeight,
    width: dashboardComponent.iframeWidth
  };
  if (dashboardComponent.iframeLoaded) {
    styles.opacity = 1;
  } else if (dashboardComponent.error) {
    styles.opacity = 1;
    styles.width = "100%";
    styles.height = "400px";
  } else {
    styles.opacity = 0;
  }
  return styles;
}

// libs/embed-libs/embed/src/lib/shared/helpers/update-iframe-url.ts
var updateIframeUrl = (iframe, iframeUrl) => {
  if (iframe?.contentWindow && iframeUrl !== void 0) {
    iframe.contentWindow.location.replace(iframeUrl);
  }
};

// libs/embed-libs/embed/src/lib/shared/helpers/set-selected-data-utils.ts
var selectedDataUtils = {
  merge(...filters) {
    return filters.reduce((acc, filter) => {
      (acc.and ??= []).push(...filter.and ?? []);
      return acc;
    }, {
      and: []
    });
  },
  isIn(slot, values, otherOptions) {
    return {
      and: [{
        expression: "? in ?",
        parameters: [
          {
            slot,
            ...otherOptions
          },
          values
        ]
      }]
    };
  },
  between(slot, values, otherOptions) {
    return {
      and: [{
        expression: "? between ?",
        parameters: [
          {
            slot,
            ...otherOptions
          },
          [values[0], values[1]]
        ]
      }]
    };
  },
  range(slot, values, otherOptions) {
    const expressions = otherOptions?.expressions ?? ["? >= ?", "? < ?"];
    return {
      and: [{
        expression: expressions[0],
        parameters: [
          {
            slot,
            ...otherOptions
          },
          [values[0]]
        ]
      }, {
        expression: expressions[1],
        parameters: [
          {
            slot,
            ...otherOptions
          },
          [values[1]]
        ]
      }]
    };
  }
};

// libs/embed-libs/embed/src/lib/shared/methods/export-dashboard.ts
var exportDashboard = (dashboardComponent, iframe, format) => {
  const requestId = uuidv4();
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  iframe.contentWindow.postMessage(
    {
      action: "exportDashboard",
      format: format || "png",
      _version: dashboardComponent.libVersion,
      requestId
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "exportDashboard request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 12e5);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/get-accessible-dashboards.ts
var getAccessibleDashboards = async (dashboardComponent) => {
  await dashboardComponent.updateComplete;
  if ((dashboardComponent.currentAuthKey ?? dashboardComponent.authKey) && (dashboardComponent.currentAuthToken ?? dashboardComponent.authToken) && dashboardComponent.params) {
    const { params } = dashboardComponent;
    const fetchUser = new Promise((resolve, reject) => {
      void (() => {
        try {
          const responsePromise = window.fetch(
            // With embedMode="webComponent" URLs remove the trailing slash, since the web component expects them to not have it.
            // Fixes incorrect url with embedMode="webComponent"
            `${addTrailingSlash(params.apiHost)}0.1.0/authorization`,
            {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              headers: { "Content-Type": "application/json" },
              redirect: "follow",
              body: JSON.stringify({
                action: "get",
                version: "0.1.0",
                key: dashboardComponent.currentAuthKey ?? dashboardComponent.authKey,
                token: dashboardComponent.currentAuthToken ?? dashboardComponent.authToken,
                find: {
                  where: { id: dashboardComponent.authKey },
                  attributes: ["id", "integration_id"],
                  include: [
                    {
                      model: "User",
                      attributes: ["id", "name", "locale_id"],
                      include: [{ model: "Group" }]
                    }
                  ]
                }
              })
            }
          );
          responsePromise.then((response) => response.json()).then((data) => {
            if (!data || !data.rows || data.rows.length === 0 || !data.rows[0].user) {
              reject("Authorization failed, please check authKey and authToken. If the problem persists, please contact support@luzmo.com.");
            } else {
              data.rows[0].user.userGroups = data.rows[0].user.groups.map(
                (group) => group.id
              );
              delete data.rows[0].user.groups;
              resolve({
                integrationId: data.rows[0].integration_id,
                user: data.rows[0].user
              });
            }
          });
        } catch (error3) {
          reject(error3);
        }
      })();
    });
    return new Promise((resolve, reject) => {
      void (() => {
        try {
          fetchUser.then((authorizationData) => {
            const responsePromise = window.fetch(
              // With embedMode="webComponent" URLs remove the trailing slash, since the web component expects them to not have it.
              // Fixes incorrect url with embedMode="webComponent"
              `${addTrailingSlash(params.apiHost)}0.1.0/securable`,
              {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
                body: JSON.stringify({
                  action: "get",
                  version: "0.1.0",
                  key: dashboardComponent.currentAuthKey ?? dashboardComponent.authKey,
                  token: dashboardComponent.currentAuthToken ?? dashboardComponent.authToken,
                  find: {
                    where: { type: "dashboard", is_variant: false },
                    attributes: ["id", "name", "modified_at"],
                    order: [["modified_at", "desc"]],
                    include: [
                      { model: "Tag", attributes: ["tag"] },
                      { model: "User", attributes: ["id", "name"] },
                      {
                        model: "Group",
                        attributes: ["id", "name", "public"]
                      },
                      { model: "Integration", attributes: ["id", "name"] }
                    ]
                  }
                })
              }
            );
            responsePromise.then((response) => response.json()).then((data) => {
              const dashboardList = data.rows.length > 0 ? formatDashboardList(
                data.rows,
                authorizationData.integrationId,
                authorizationData.user,
                dashboardComponent
              ) : [];
              resolve(dashboardList);
            });
          }).catch((error3) => {
            reject(error3);
          });
        } catch (error3) {
          reject(error3);
        }
      })();
    });
  }
  throw new Error("No authKey or authToken found in the luzmo-dashboard component.");
};

// libs/embed-libs/embed/src/lib/shared/methods/get-dashboard-context.ts
var getDashboardContext = (dashboardComponent, iframe) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    { action: "getDashboardContext", _version: dashboardComponent.libVersion, requestId },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "getDashboardContext request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 2e3);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/get-data.ts
var getData = (dashboardComponent, iframe, itemId) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    {
      action: "getData",
      id: itemId,
      _version: dashboardComponent.libVersion,
      requestId
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "getData request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 2e3);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/get-filters.ts
var getFilters = (dashboardComponent, iframe) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    { action: "getFilters", _version: dashboardComponent.libVersion, requestId },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "getFilters request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 2e3);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/get-insights.ts
var getInsights = (dashboardComponent, iframe, options = {}) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    {
      action: "getInsights",
      options,
      _version: dashboardComponent.libVersion,
      requestId
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        promises[requestId].reject(new Error("getInsights request timed out."));
        delete promises[requestId];
      }
    }, 6e4);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/refresh-data.ts
var refreshData = (dashboardComponent, iframe, itemId) => {
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        action: "refreshData",
        id: itemId ?? null,
        _version: dashboardComponent.libVersion
      },
      "*"
    );
    return Promise.resolve();
  }
  return Promise.reject(new Error("Cannot retrieve contentWindow."));
};

// libs/embed-libs/embed/src/lib/shared/methods/reload-dashboard.ts
var reloadDashboard = (dashboardComponent, iframe) => {
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      { action: "reloadDashboard", _version: dashboardComponent.libVersion },
      "*"
    );
    return Promise.resolve();
  }
  return Promise.reject(new Error("Cannot retrieve contentWindow."));
};

// libs/embed-libs/embed/src/lib/shared/methods/send-export-email.ts
var sendExportEmail = (dashboardComponent, iframe, type, subject, message) => {
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        action: "sendExportEmail",
        type: type || "once",
        subject,
        message,
        _version: dashboardComponent.libVersion
      },
      "*"
    );
    return Promise.resolve();
  }
  return Promise.reject(new Error("Cannot retrieve contentWindow."));
};

// libs/embed-libs/embed/src/lib/shared/methods/set-authorization.ts
var setAuthorization = (dashboardComponent, iframe, key, token) => {
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        action: "setAuthorization",
        key,
        token,
        _version: dashboardComponent.libVersion
      },
      "*"
    );
    return Promise.resolve();
  }
  return Promise.reject(new Error("Cannot retrieve contentWindow."));
};

// libs/embed-libs/embed/src/lib/shared/methods/set-edit-mode.ts
var setEditMode = (dashboardComponent, iframe, editMode) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { params, promises } = dashboardComponent;
  if (!params || !promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  if (params.editMode === editMode) {
    return Promise.reject(
      new Error("editMode parameter is currently already set to " + editMode)
    );
  } else if (editMode !== "editFull" && editMode !== "editLimited" && editMode !== "view") {
    return Promise.reject(
      new Error(
        "The editMode parameter must be one of the following values: 'editFull', 'editLimited' or 'view'."
      )
    );
  }
  iframe.contentWindow.postMessage(
    {
      action: "setEditMode",
      editMode,
      _version: dashboardComponent.libVersion,
      requestId
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/set-preview.ts
var setPreview = (dashboardComponent, iframe, preview) => {
  if (!iframe?.contentWindow) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject(new Error("Cannot retrieve contentWindow."));
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    {
      action: "setPreview",
      preview,
      requestId,
      _version: dashboardComponent.libVersion
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "setPreview request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 2e3);
  });
};

// libs/embed-libs/embed/src/lib/shared/methods/set-selected-data.ts
var setSelectedData = (dashboardComponent, iframe, itemId, filters) => {
  if (!iframe?.contentWindow) {
    return Promise.reject();
  }
  const { promises } = dashboardComponent;
  if (!promises) {
    return Promise.reject();
  }
  const requestId = uuidv4();
  iframe.contentWindow.postMessage(
    {
      action: "setSelectedData",
      itemId,
      filters,
      _version: dashboardComponent.libVersion,
      requestId
    },
    "*"
  );
  return new Promise((resolve, reject) => {
    promises[requestId] = { resolve, reject };
    setTimeout(() => {
      if (promises[requestId]) {
        const errorMessage = "setSelectedData request timed out.";
        promises[requestId].reject(new Error(errorMessage));
        delete promises[requestId];
      }
    }, 2e3);
  });
};

// libs/embed-libs/embed/src/lib/shared/service/calculate-dimensions.ts
var _setCalculatedDimensions = (dashboardComponent) => {
  if (!dashboardComponent.dimensions) {
    dashboardComponent.params.error = true;
    _handleError("Got no valid dimensions.", dashboardComponent.params);
    return;
  }
  const dashboardDimensionKeys = Object.keys(
    dashboardComponent.dimensions
  );
  const availableScreenModeExtents = [];
  let currentMode;
  let currentWidth = 0;
  let currentHeight = 0;
  if (!dashboardComponent.params.switchScreenModeOnResize && dashboardComponent.currentScreenMode) {
    dashboardComponent.params.screenMode = dashboardComponent.currentScreenMode;
  }
  if (dashboardComponent.dimensions && dashboardDimensionKeys?.[0] === "fixed") {
    currentMode = "fixed";
    currentWidth = dashboardComponent.dimensions.fixed[0];
    currentHeight = dashboardComponent.dimensions.fixed[1];
  } else {
    const screenModes = [
      "mobile",
      "tablet",
      "desktop",
      "largeScreen"
    ];
    if (dashboardComponent.params.itemEmbedding) {
      const [firstMatch] = dashboardDimensionKeys;
      let match = firstMatch;
      for (const screenMode of screenModes) {
        const found = dashboardDimensionKeys.find((key) => key === screenMode);
        if (found) {
          match = found;
        } else {
          dashboardComponent.dimensions[screenMode] = dashboardComponent.dimensions[match];
        }
      }
    }
    for (const key of dashboardDimensionKeys) {
      if (screenModes.includes(key)) {
        const screenMode = EXTENTS.find((extent) => extent.mode === key);
        if (!screenMode) {
          continue;
        }
        availableScreenModeExtents.push({
          ...screenMode,
          height: dashboardComponent.dimensions[key][1] || 50
        });
      }
    }
    if (!availableScreenModeExtents.map((screenModeExtent) => screenModeExtent.mode).includes(dashboardComponent.params.screenMode)) {
      dashboardComponent.params.screenMode = "auto";
    }
    if (dashboardComponent.params.screenMode === "auto") {
      availableScreenModeExtents.sort(
        (a3, b3) => screenModes.indexOf(a3.mode) - screenModes.indexOf(b3.mode)
      );
      for (const screenModeExtent of availableScreenModeExtents) {
        const [screenModeExtentMinWidth, screenModeExtentMaxWidth] = screenModeExtent.width;
        if (dashboardComponent.params.itemEmbedding && dashboardComponent.params.itemDimensions && dashboardComponent.params.itemDimensions.width !== "auto" && dashboardComponent.params.itemDimensions.height === "auto") {
          if (screenModeExtentMinWidth < dashboardComponent.params.itemDimensions.width) {
            currentMode = screenModeExtent.mode;
            currentWidth = Number.parseInt(
              dashboardComponent.params.itemDimensions.width,
              10
            );
            currentHeight = dashboardComponent.dimensions[currentMode][1];
          }
        } else {
          if (screenModeExtentMinWidth < dashboardComponent.containerWidth) {
            currentMode = screenModeExtent.mode;
            if (dashboardComponent.params.itemEmbedding) {
              currentWidth = dashboardComponent.params.itemDimensions?.width && dashboardComponent.params.itemDimensions?.width !== "auto" ? Number.parseInt(
                dashboardComponent.params.itemDimensions.width,
                10
              ) : Math.min(
                dashboardComponent.containerWidth,
                screenModeExtentMaxWidth
              );
              currentHeight = dashboardComponent.params.itemDimensions?.height && dashboardComponent.params.itemDimensions?.height !== "auto" ? Number.parseInt(
                dashboardComponent.params.itemDimensions.height,
                10
              ) : dashboardComponent.dimensions[currentMode][1];
              if (dashboardComponent.params.itemDimensions && dashboardComponent.params.itemDimensions.width !== "auto" && dashboardComponent.params.itemDimensions.height === "auto") {
                currentWidth = Number.parseInt(
                  dashboardComponent.params.itemDimensions.width,
                  10
                );
                currentHeight = dashboardComponent.dimensions[currentMode][1];
              }
            } else {
              currentWidth = Math.max(
                Math.min(
                  screenModeExtentMaxWidth,
                  dashboardComponent.containerWidth
                ),
                screenModeExtentMinWidth
              );
              currentHeight = screenModeExtent.height ?? 0;
            }
          }
        }
      }
    } else {
      const chosenModeExtent = availableScreenModeExtents.find(
        (d3) => d3.mode === dashboardComponent.params.screenMode
      );
      if (chosenModeExtent) {
        const {
          height: chosenModeHeight,
          width: [chosenModeMinWidth, chosenModeMaxWidth]
        } = chosenModeExtent;
        currentMode = dashboardComponent.params.screenMode;
        currentWidth = Math.max(
          Math.min(chosenModeMaxWidth, dashboardComponent.containerWidth),
          chosenModeMinWidth
        );
        currentHeight = chosenModeHeight ?? 0;
      }
      if (dashboardComponent.params.itemEmbedding) {
        if (dashboardComponent.params.itemDimensions?.width && dashboardComponent.params.itemDimensions?.width !== "auto") {
          currentWidth = Number.parseInt(
            dashboardComponent.params.itemDimensions.width,
            10
          );
        }
        if (dashboardComponent.params.itemDimensions?.height && dashboardComponent.params.itemDimensions?.height !== "auto") {
          currentHeight = Number.parseInt(
            dashboardComponent.params.itemDimensions.height,
            10
          );
        }
      }
    }
    if (!currentMode && availableScreenModeExtents.length > 0) {
      const [lowestModeExtent] = availableScreenModeExtents;
      currentMode = lowestModeExtent.mode;
      currentWidth = lowestModeExtent.width[0];
      currentHeight = lowestModeExtent.height ?? 0;
    }
  }
  dashboardComponent.currentScreenMode = currentMode;
  const style = {
    height: currentHeight === 0 ? "100%" : `${String(currentHeight)}px`,
    width: currentWidth === 0 ? "100%" : `${String(currentWidth)}px`,
    opacity: 1
  };
  const dashboardEditModes = ["editFull", "editLimited"];
  if (dashboardEditModes.includes(dashboardComponent.params.editMode)) {
    style.height = "100%";
    style.width = "100%";
  } else if (dashboardComponent.params.itemEmbedding && dashboardComponent.params.itemDimensions) {
    style.height = dashboardComponent.params.itemDimensions.height === "auto" ? style.height : `${String(dashboardComponent.params.itemDimensions.height).replace(
      "px",
      ""
    )}px`;
    style.width = dashboardComponent.params.itemDimensions.width === "auto" ? style.width : `${String(dashboardComponent.params.itemDimensions.width).replace(
      "px",
      ""
    )}px`;
  } else {
    style.height = currentHeight === 0 ? "100%" : `${String(currentHeight)}px`;
    style.width = currentWidth === 0 ? "100%" : `${String(currentWidth)}px`;
  }
  dashboardComponent.currentScreenMode = currentMode;
  dashboardComponent.iframeStyle = style;
};

// libs/embed-libs/embed/src/lib/shared/service/extend-and-validate.ts
var _extendAndValidate = (dashboardContent) => {
  const defaultKeys = Object.keys(
    DEFAULT_PARAMETERS
  );
  const errorMessages = [];
  const requiredStringParams = [
    "appServer",
    "language",
    "apiHost"
  ];
  const requiredStringOrEmptyParams = [
    "key",
    "token",
    "screenMode",
    "timezoneId",
    "itemId",
    "container",
    "loaderBackground",
    "loaderFontColor",
    "loaderSpinnerColor",
    "loaderSpinnerBackground"
  ];
  const objectParams = ["itemDimensions"];
  const screenModes = [
    "mobile",
    "tablet",
    "desktop",
    "largeScreen",
    "fixed",
    "auto"
  ];
  if (!dashboardContent.params) {
    dashboardContent.params = {};
  }
  for (const key of defaultKeys) {
    if (dashboardContent.params[key] === null) {
      delete dashboardContent.params[key];
    }
  }
  dashboardContent.params = defaultsDeep(
    dashboardContent.params,
    DEFAULT_PARAMETERS
  );
  if ((!dashboardContent.params.dashboardId || typeof dashboardContent.params.dashboardId !== "string") && (!dashboardContent.params.dashboardSlug || typeof dashboardContent.params.dashboardSlug !== "string")) {
    delete dashboardContent.params.dashboardId;
    delete dashboardContent.params.dashboardSlug;
  }
  for (const key of requiredStringParams) {
    if (typeof dashboardContent.params[key] !== "string") {
      delete dashboardContent.params[key];
      errorMessages.push(`${key} needs to be of type string.`);
    }
  }
  for (const key of requiredStringOrEmptyParams) {
    if (typeof dashboardContent.params[key] !== "string" && dashboardContent.params[key] !== null && dashboardContent.params[key] !== void 0) {
      delete dashboardContent.params[key];
      errorMessages.push(`${key} needs to be of type string or empty.`);
    }
  }
  if (dashboardContent.params.screenMode && !screenModes.includes(dashboardContent.params.screenMode)) {
    const validTypesString = screenModes.map((mode) => `"${mode}"`).join(", ");
    errorMessages.push(
      `"screenMode" needs should be one of these types: ${validTypesString}`
    );
    dashboardContent.params.screenMode = "auto";
  }
  if (dashboardContent.params.itemId) {
    dashboardContent.params.itemEmbedding = true;
  }
  for (const key of objectParams) {
    if (typeof dashboardContent.params[key] !== "object" && dashboardContent.params[key] !== null) {
      delete dashboardContent.params[key];
      errorMessages.push(`${key} needs to be of type object or empty.`);
    }
  }
  if (typeof dashboardContent.params.switchScreenModeOnResize !== "boolean") {
    errorMessages.push("switchScreenModeOnResize needs to be of type boolean.");
    dashboardContent.params.switchScreenModeOnResize = true;
  }
  if (dashboardContent.params.itemDimensions) {
    const itemDimensionsKeys = [
      "width",
      "height"
    ];
    for (const key of itemDimensionsKeys) {
      if (!["string", "number"].includes(
        typeof dashboardContent.params.itemDimensions[key]
      ) && dashboardContent.params.itemDimensions[key] !== null) {
        errorMessages.push(
          `itemDimensions ${key} needs to be of type string, number or empty.`
        );
      }
    }
  }
  dashboardContent.params = defaultsDeep(
    dashboardContent.params,
    DEFAULT_PARAMETERS
  );
  if (dashboardContent.params.screenMode && dashboardContent.params.screenMode !== "auto") {
    dashboardContent.params.switchScreenModeOnResize = false;
  }
  const itemDimensions = dashboardContent.params.itemDimensions;
  if (itemDimensions) {
    if (itemDimensions.width !== "auto") {
      itemDimensions.width = Number.parseInt(
        `${itemDimensions.width}`.replace("px", ""),
        10
      ) || "auto";
    }
    if (itemDimensions.height !== "auto") {
      itemDimensions.height = Number.parseInt(
        `${itemDimensions.height}`.replace("px", ""),
        10
      ) || "auto";
    }
  }
  dashboardContent.params.itemEmbedding = !!dashboardContent.params.itemId;
  if (dashboardContent.params.error || errorMessages.length > 0) {
    _handleError(errorMessages.join("\n"), dashboardContent.params);
  }
};

// libs/embed-libs/embed/src/lib/shared/models/viz-item.model.ts
var libraryTypeToWebComponentTypeMapping = {
  type: "type",
  slots: "slots",
  inlineData: "inline-data",
  options: "options",
  appServer: "app-server",
  apiHost: "api-host",
  authKey: "auth-key",
  authToken: "auth-token",
  contextId: "context-id",
  canFilter: "can-filter",
  filters: "filters",
  dashboardId: "dashboard-id",
  itemId: "item-id",
  aiMessageAssetId: "ai-message-asset-id",
  dashboardContentsVersion: "dashboard-contents-version",
  libVersion: "lib-version"
};

// libs/embed-libs/embed/src/lib/shared/constants/class-constants.ts
var luzmoEmbedContainerClass = "luzmo-embed-container";

// node_modules/@module-federation/sdk/dist/constant.js
var MANIFEST_EXT = ".json";
var BROWSER_LOG_KEY = "FEDERATION_DEBUG";
var NameTransformSymbol = {
  AT: "@",
  HYPHEN: "-",
  SLASH: "/"
};
var NameTransformMap = {
  [NameTransformSymbol.AT]: "scope_",
  [NameTransformSymbol.HYPHEN]: "_",
  [NameTransformSymbol.SLASH]: "__"
};
var EncodedNameTransformMap = {
  [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
  [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
  [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH
};
var SEPARATOR = ":";
var TreeShakingStatus = /* @__PURE__ */ (function(TreeShakingStatus2) {
  TreeShakingStatus2[TreeShakingStatus2["UNKNOWN"] = 1] = "UNKNOWN";
  TreeShakingStatus2[TreeShakingStatus2["CALCULATED"] = 2] = "CALCULATED";
  TreeShakingStatus2[TreeShakingStatus2["NO_USE"] = 0] = "NO_USE";
  return TreeShakingStatus2;
})({});

// node_modules/@module-federation/sdk/dist/env.js
var isBrowserEnvValue = typeof ENV_TARGET !== "undefined" ? ENV_TARGET === "web" : typeof window !== "undefined" && typeof window.document !== "undefined";
function isBrowserEnv() {
  return isBrowserEnvValue;
}
function isReactNativeEnv() {
  return typeof navigator !== "undefined" && navigator?.product === "ReactNative";
}
function isBrowserDebug() {
  try {
    if (isBrowserEnv() && window.localStorage) return Boolean(localStorage.getItem(BROWSER_LOG_KEY));
  } catch (error3) {
    return false;
  }
  return false;
}
function isDebugMode() {
  if (typeof process !== "undefined" && process.env && process.env["FEDERATION_DEBUG"]) return Boolean(process.env["FEDERATION_DEBUG"]);
  if (typeof FEDERATION_DEBUG !== "undefined" && Boolean(FEDERATION_DEBUG)) return true;
  return isBrowserDebug();
}

// node_modules/@module-federation/sdk/dist/utils.js
var LOG_CATEGORY = "[ Federation Runtime ]";
var composeKeyWithSeparator = function(...args) {
  if (!args.length) return "";
  return args.reduce((sum, cur) => {
    if (!cur) return sum;
    if (!sum) return cur;
    return `${sum}${SEPARATOR}${cur}`;
  }, "");
};
function getResourceUrl(module2, sourceUrl) {
  if ("getPublicPath" in module2) {
    let publicPath;
    if (!module2.getPublicPath.startsWith("function")) publicPath = new Function(module2.getPublicPath)();
    else publicPath = new Function("return " + module2.getPublicPath)()();
    return `${publicPath}${sourceUrl}`;
  } else if ("publicPath" in module2) {
    if (!isBrowserEnv() && !isReactNativeEnv() && "ssrPublicPath" in module2 && typeof module2.ssrPublicPath === "string") return `${module2.ssrPublicPath}${sourceUrl}`;
    return `${module2.publicPath}${sourceUrl}`;
  } else {
    console.warn("Cannot get resource URL. If in debug mode, please ignore.", module2, sourceUrl);
    return "";
  }
}
var warn = (msg) => {
  console.warn(`${LOG_CATEGORY}: ${msg}`);
};
function safeToString(info) {
  try {
    return JSON.stringify(info, null, 2);
  } catch (e7) {
    return "";
  }
}

// node_modules/@module-federation/sdk/dist/generateSnapshotFromManifest.js
var simpleJoinRemoteEntry = (rPath, rName) => {
  if (!rPath) return rName;
  const transformPath = (str) => {
    if (str === ".") return "";
    if (str.startsWith("./")) return str.replace("./", "");
    if (str.startsWith("/")) {
      const strWithoutSlash = str.slice(1);
      if (strWithoutSlash.endsWith("/")) return strWithoutSlash.slice(0, -1);
      return strWithoutSlash;
    }
    return str;
  };
  const transformedPath = transformPath(rPath);
  if (!transformedPath) return rName;
  if (transformedPath.endsWith("/")) return `${transformedPath}${rName}`;
  return `${transformedPath}/${rName}`;
};
function inferAutoPublicPath(url) {
  return url.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
}
function generateSnapshotFromManifest(manifest, options = {}) {
  const { remotes = {}, overrides = {}, version: version2 } = options;
  let remoteSnapshot;
  const getPublicPath = () => {
    if ("publicPath" in manifest.metaData) {
      if ((manifest.metaData.publicPath === "auto" || manifest.metaData.publicPath === "") && version2) return inferAutoPublicPath(version2);
      return manifest.metaData.publicPath;
    } else return manifest.metaData.getPublicPath;
  };
  const overridesKeys = Object.keys(overrides);
  let remotesInfo = {};
  if (!Object.keys(remotes).length) remotesInfo = manifest.remotes?.reduce((res, next) => {
    let matchedVersion;
    const name = next.federationContainerName;
    if (overridesKeys.includes(name)) matchedVersion = overrides[name];
    else if ("version" in next) matchedVersion = next.version;
    else matchedVersion = next.entry;
    res[name] = { matchedVersion };
    return res;
  }, {}) || {};
  Object.keys(remotes).forEach((key) => remotesInfo[key] = { matchedVersion: overridesKeys.includes(key) ? overrides[key] : remotes[key] });
  const { remoteEntry: { path: remoteEntryPath, name: remoteEntryName, type: remoteEntryType }, types: remoteTypes = {
    path: "",
    name: "",
    zip: "",
    api: ""
  }, buildInfo: { buildVersion }, globalName, ssrRemoteEntry } = manifest.metaData;
  const { exposes } = manifest;
  let basicRemoteSnapshot = {
    version: version2 ? version2 : "",
    buildVersion,
    globalName,
    remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
    remoteEntryType,
    remoteTypes: simpleJoinRemoteEntry(remoteTypes.path, remoteTypes.name),
    remoteTypesZip: remoteTypes.zip || "",
    remoteTypesAPI: remoteTypes.api || "",
    remotesInfo,
    shared: manifest?.shared.map((item) => ({
      assets: item.assets,
      sharedName: item.name,
      version: item.version,
      usedExports: item.referenceExports || []
    })),
    modules: exposes?.map((expose) => ({
      moduleName: expose.name,
      modulePath: expose.path,
      assets: expose.assets
    }))
  };
  if ("publicPath" in manifest.metaData) {
    remoteSnapshot = {
      ...basicRemoteSnapshot,
      publicPath: getPublicPath()
    };
    if (typeof manifest.metaData.ssrPublicPath === "string") remoteSnapshot.ssrPublicPath = manifest.metaData.ssrPublicPath;
  } else remoteSnapshot = {
    ...basicRemoteSnapshot,
    getPublicPath: getPublicPath()
  };
  if (ssrRemoteEntry) {
    const fullSSRRemoteEntry = simpleJoinRemoteEntry(ssrRemoteEntry.path, ssrRemoteEntry.name);
    remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
    remoteSnapshot.ssrRemoteEntryType = ssrRemoteEntry.type || "commonjs-module";
  }
  return remoteSnapshot;
}
function isManifestProvider(moduleInfo) {
  if ("remoteEntry" in moduleInfo && moduleInfo.remoteEntry.includes(MANIFEST_EXT)) return true;
  else return false;
}

// node_modules/@module-federation/sdk/dist/logger.js
var PREFIX = "[ Module Federation ]";
var DEFAULT_DELEGATE = console;
var LOGGER_STACK_SKIP_TOKENS = [
  "logger.ts",
  "logger.js",
  "captureStackTrace",
  "Logger.emit",
  "Logger.log",
  "Logger.info",
  "Logger.warn",
  "Logger.error",
  "Logger.debug"
];
function captureStackTrace() {
  try {
    const stack = (/* @__PURE__ */ new Error()).stack;
    if (!stack) return;
    const [, ...rawLines] = stack.split("\n");
    const filtered = rawLines.filter((line) => !LOGGER_STACK_SKIP_TOKENS.some((token) => line.includes(token)));
    if (!filtered.length) return;
    return `Stack trace:
${filtered.slice(0, 5).join("\n")}`;
  } catch {
    return;
  }
}
var Logger = class {
  constructor(prefix, delegate = DEFAULT_DELEGATE) {
    this.prefix = prefix;
    this.delegate = delegate ?? DEFAULT_DELEGATE;
  }
  setPrefix(prefix) {
    this.prefix = prefix;
  }
  setDelegate(delegate) {
    this.delegate = delegate ?? DEFAULT_DELEGATE;
  }
  emit(method, args) {
    const delegate = this.delegate;
    const stackTrace = isDebugMode() ? captureStackTrace() : void 0;
    const enrichedArgs = stackTrace ? [...args, stackTrace] : args;
    const order = (() => {
      switch (method) {
        case "log":
          return ["log", "info"];
        case "info":
          return ["info", "log"];
        case "warn":
          return [
            "warn",
            "info",
            "log"
          ];
        case "error":
          return [
            "error",
            "warn",
            "log"
          ];
        default:
          return ["debug", "log"];
      }
    })();
    for (const candidate of order) {
      const handler = delegate[candidate];
      if (typeof handler === "function") {
        handler.call(delegate, this.prefix, ...enrichedArgs);
        return;
      }
    }
    for (const candidate of order) {
      const handler = DEFAULT_DELEGATE[candidate];
      if (typeof handler === "function") {
        handler.call(DEFAULT_DELEGATE, this.prefix, ...enrichedArgs);
        return;
      }
    }
  }
  log(...args) {
    this.emit("log", args);
  }
  warn(...args) {
    this.emit("warn", args);
  }
  error(...args) {
    this.emit("error", args);
  }
  success(...args) {
    this.emit("info", args);
  }
  info(...args) {
    this.emit("info", args);
  }
  ready(...args) {
    this.emit("info", args);
  }
  debug(...args) {
    if (isDebugMode()) this.emit("debug", args);
  }
};
function createLogger(prefix) {
  return new Logger(prefix);
}
function createInfrastructureLogger(prefix) {
  const infrastructureLogger2 = new Logger(prefix);
  Object.defineProperty(infrastructureLogger2, "__mf_infrastructure_logger__", {
    value: true,
    enumerable: false,
    configurable: false
  });
  return infrastructureLogger2;
}
var logger = createLogger(PREFIX);
var infrastructureLogger = createInfrastructureLogger(PREFIX);

// node_modules/@module-federation/sdk/dist/dom.js
async function safeWrapper(callback, disableWarn) {
  try {
    return await callback();
  } catch (e7) {
    !disableWarn && warn(e7);
    return;
  }
}
function isStaticResourcesEqual(url1, url2) {
  const REG_EXP = /^(https?:)?\/\//i;
  return url1.replace(REG_EXP, "").replace(/\/$/, "") === url2.replace(REG_EXP, "").replace(/\/$/, "");
}
function createScript(info) {
  let script = null;
  let needAttach = true;
  let timeout = 2e4;
  let timeoutId;
  const scripts = document.getElementsByTagName("script");
  for (let i7 = 0; i7 < scripts.length; i7++) {
    const s4 = scripts[i7];
    const scriptSrc = s4.getAttribute("src");
    if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
      script = s4;
      needAttach = false;
      break;
    }
  }
  if (!script) {
    const attrs = info.attrs;
    script = document.createElement("script");
    script.type = attrs?.["type"] === "module" ? "module" : "text/javascript";
    let createScriptRes = void 0;
    if (info.createScriptHook) {
      createScriptRes = info.createScriptHook(info.url, info.attrs);
      if (createScriptRes instanceof HTMLScriptElement) script = createScriptRes;
      else if (typeof createScriptRes === "object") {
        if ("script" in createScriptRes && createScriptRes.script) script = createScriptRes.script;
        if ("timeout" in createScriptRes && createScriptRes.timeout) timeout = createScriptRes.timeout;
      }
    }
    if (!script.src) script.src = info.url;
    if (attrs && !createScriptRes) Object.keys(attrs).forEach((name) => {
      if (script) {
        if (name === "async" || name === "defer") script[name] = attrs[name];
        else if (!script.getAttribute(name)) script.setAttribute(name, attrs[name]);
      }
    });
  }
  let executionError = null;
  const executionErrorHandler = typeof window !== "undefined" ? (evt) => {
    if (evt.filename && isStaticResourcesEqual(evt.filename, info.url)) {
      const err = /* @__PURE__ */ new Error(`ScriptExecutionError: Script "${info.url}" loaded but threw a runtime error during execution: ${evt.message} (${evt.filename}:${evt.lineno}:${evt.colno})`);
      err.name = "ScriptExecutionError";
      executionError = err;
    }
  } : null;
  if (executionErrorHandler) window.addEventListener("error", executionErrorHandler);
  const onScriptComplete = async (prev, event) => {
    clearTimeout(timeoutId);
    if (executionErrorHandler) window.removeEventListener("error", executionErrorHandler);
    const onScriptCompleteCallback = () => {
      if (event?.type === "error") {
        const networkError = /* @__PURE__ */ new Error(event?.isTimeout ? `ScriptNetworkError: Script "${info.url}" timed out.` : `ScriptNetworkError: Failed to load script "${info.url}" - the script URL is unreachable or the server returned an error (network failure, 404, CORS, etc.)`);
        networkError.name = "ScriptNetworkError";
        info?.onErrorCallback && info?.onErrorCallback(networkError);
      } else if (executionError) info?.onErrorCallback && info?.onErrorCallback(executionError);
      else info?.cb && info?.cb();
    };
    if (script) {
      script.onerror = null;
      script.onload = null;
      safeWrapper(() => {
        const { needDeleteScript = true } = info;
        if (needDeleteScript) script?.parentNode && script.parentNode.removeChild(script);
      });
      if (prev && typeof prev === "function") {
        const result = prev(event);
        if (result instanceof Promise) {
          const res = await result;
          onScriptCompleteCallback();
          return res;
        }
        onScriptCompleteCallback();
        return result;
      }
    }
    onScriptCompleteCallback();
  };
  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);
  timeoutId = setTimeout(() => {
    onScriptComplete(null, {
      type: "error",
      isTimeout: true
    });
  }, timeout);
  return {
    script,
    needAttach
  };
}
function createLink(info) {
  let link = null;
  let needAttach = true;
  let timeout = 2e4;
  let timeoutId;
  const links = document.getElementsByTagName("link");
  for (let i7 = 0; i7 < links.length; i7++) {
    const l3 = links[i7];
    const linkHref = l3.getAttribute("href");
    const linkRel = l3.getAttribute("rel");
    if (linkHref && isStaticResourcesEqual(linkHref, info.url) && linkRel === info.attrs["rel"]) {
      link = l3;
      needAttach = false;
      break;
    }
  }
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("href", info.url);
    let createLinkRes = void 0;
    let shouldApplyAttrs = true;
    const attrs = info.attrs;
    if (info.createLinkHook) {
      createLinkRes = info.createLinkHook(info.url, attrs);
      if (createLinkRes instanceof HTMLLinkElement) {
        link = createLinkRes;
        shouldApplyAttrs = false;
      } else if (typeof createLinkRes === "object") {
        if ("link" in createLinkRes && createLinkRes.link) {
          link = createLinkRes.link;
          shouldApplyAttrs = false;
        }
        if ("timeout" in createLinkRes && createLinkRes.timeout) timeout = createLinkRes.timeout;
      }
    }
    if (attrs && shouldApplyAttrs) Object.keys(attrs).forEach((name) => {
      if (link && !link.getAttribute(name)) link.setAttribute(name, attrs[name]);
    });
  }
  if (!needAttach) {
    Promise.resolve().then(() => {
      info?.cb && info?.cb();
    });
    return {
      link,
      needAttach
    };
  }
  const onLinkComplete = (prev, event) => {
    if (timeoutId) clearTimeout(timeoutId);
    const onLinkCompleteCallback = () => {
      if (event?.type === "error") {
        const linkError = /* @__PURE__ */ new Error(event?.isTimeout ? `LinkNetworkError: Link "${info.url}" timed out.` : `LinkNetworkError: Failed to load link "${info.url}" - the URL is unreachable or the server returned an error.`);
        linkError.name = "LinkNetworkError";
        info?.onErrorCallback && info?.onErrorCallback(linkError);
      } else info?.cb && info?.cb();
    };
    if (link) {
      link.onerror = null;
      link.onload = null;
      safeWrapper(() => {
        const { needDeleteLink = true } = info;
        if (needDeleteLink) link?.parentNode && link.parentNode.removeChild(link);
      });
      if (prev) {
        const res = prev(event);
        onLinkCompleteCallback();
        return res;
      }
    }
    onLinkCompleteCallback();
  };
  link.onerror = onLinkComplete.bind(null, link.onerror);
  link.onload = onLinkComplete.bind(null, link.onload);
  timeoutId = setTimeout(() => {
    onLinkComplete(null, {
      type: "error",
      isTimeout: true
    });
  }, timeout);
  return {
    link,
    needAttach
  };
}
function loadScript(url, info) {
  const { attrs = {}, createScriptHook } = info;
  return new Promise((resolve, reject) => {
    const { script, needAttach } = createScript({
      url,
      cb: resolve,
      onErrorCallback: reject,
      attrs: {
        fetchpriority: "high",
        ...attrs
      },
      createScriptHook,
      needDeleteScript: true
    });
    needAttach && document.head.appendChild(script);
  });
}

// node_modules/@module-federation/sdk/dist/node.js
var sdkImportCache = /* @__PURE__ */ new Map();
function importNodeModule(name) {
  if (!name) throw new Error("import specifier is required");
  if (sdkImportCache.has(name)) return sdkImportCache.get(name);
  const promise = new Function("name", `return import(name)`)(name).then((res) => res).catch((error3) => {
    console.error(`Error importing module ${name}:`, error3);
    sdkImportCache.delete(name);
    throw error3;
  });
  sdkImportCache.set(name, promise);
  return promise;
}
var lazyLoaderHookFetch = async (input, init, loaderHook) => {
  const hook = (url, init2) => {
    return loaderHook.lifecycle.fetch.emit(url, init2);
  };
  const res = await hook(input, init || {});
  if (!res || !(res instanceof Response)) return fetch(input, init || {});
  return res;
};
var createScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, cb, attrs, loaderHook) => {
  if (loaderHook?.createScriptHook) {
    const hookResult = loaderHook.createScriptHook(url);
    if (hookResult && typeof hookResult === "object" && "url" in hookResult) url = hookResult.url;
  }
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e7) {
    console.error("Error constructing URL:", e7);
    cb(/* @__PURE__ */ new Error(`Invalid URL: ${e7}`));
    return;
  }
  const getFetch = async () => {
    if (loaderHook?.fetch) return (input, init) => lazyLoaderHookFetch(input, init, loaderHook);
    return fetch;
  };
  const handleScriptFetch = async (f3, urlObj2) => {
    try {
      const res = await f3(urlObj2.href);
      const data = await res.text();
      const [path, vm] = await Promise.all([importNodeModule("path"), importNodeModule("vm")]);
      const scriptContext = {
        exports: {},
        module: { exports: {} }
      };
      const urlDirname = urlObj2.pathname.split("/").slice(0, -1).join("/");
      const filename = path.basename(urlObj2.pathname);
      const script = new vm.Script(`(function(exports, module, require, __dirname, __filename) {${data}
})`, {
        filename,
        importModuleDynamically: vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule
      });
      let requireFn;
      requireFn = (await importNodeModule("node:module")).createRequire(urlObj2.protocol === "file:" || urlObj2.protocol === "node:" ? urlObj2.href : path.join(process.cwd(), "__mf_require_base__.js"));
      script.runInThisContext()(scriptContext.exports, scriptContext.module, requireFn, urlDirname, filename);
      const exportedInterface = scriptContext.module.exports || scriptContext.exports;
      if (attrs && exportedInterface && attrs["globalName"]) {
        cb(void 0, exportedInterface[attrs["globalName"]] || exportedInterface);
        return;
      }
      cb(void 0, exportedInterface);
    } catch (e7) {
      cb(e7 instanceof Error ? e7 : /* @__PURE__ */ new Error(`Script execution error: ${e7}`));
    }
  };
  getFetch().then(async (f3) => {
    if (attrs?.["type"] === "esm" || attrs?.["type"] === "module") return loadModule(urlObj.href, {
      fetch: f3,
      vm: await importNodeModule("vm")
    }).then(async (module2) => {
      await module2.evaluate();
      cb(void 0, module2.namespace);
    }).catch((e7) => {
      cb(e7 instanceof Error ? e7 : /* @__PURE__ */ new Error(`Script execution error: ${e7}`));
    });
    handleScriptFetch(f3, urlObj);
  }).catch((err) => {
    cb(err);
  });
} : (url, cb, attrs, loaderHook) => {
  cb(/* @__PURE__ */ new Error("createScriptNode is disabled in non-Node.js environment"));
};
var loadScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, info) => {
  return new Promise((resolve, reject) => {
    createScriptNode(url, (error3, scriptContext) => {
      if (error3) reject(error3);
      else {
        const remoteEntryKey = info?.attrs?.["globalName"] || `__FEDERATION_${info?.attrs?.["name"]}:custom__`;
        resolve(globalThis[remoteEntryKey] = scriptContext);
      }
    }, info.attrs, info.loaderHook);
  });
} : (url, info) => {
  throw new Error("loadScriptNode is disabled in non-Node.js environment");
};
var esmModuleCache = /* @__PURE__ */ new Map();
var isFetchableRemoteModuleUrl = (url) => url.startsWith("http:") || url.startsWith("https:");
var isBareModuleSpecifier = (specifier) => !specifier.startsWith("./") && !specifier.startsWith("../") && !specifier.startsWith("/") && !specifier.includes(":");
function encodeRemoteModulePath(url) {
  const remoteUrl = new URL(url);
  const encodedProtocol = encodeURIComponent(remoteUrl.protocol.slice(0, -1));
  const encodedHost = encodeURIComponent(remoteUrl.host);
  const encodedPathname = remoteUrl.pathname.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  const encodedSearchHash = encodeURIComponent(`${remoteUrl.search}${remoteUrl.hash}`);
  return `/${encodedProtocol}/${encodedHost}${encodedPathname}${encodedSearchHash ? `/${encodedSearchHash}` : ""}`;
}
function createImportMetaUrl(url, baseFileUrl) {
  const baseUrl = baseFileUrl.endsWith("/") ? baseFileUrl : `${baseFileUrl}/`;
  return new URL(`__module_federation_remote__${encodeRemoteModulePath(url)}`, baseUrl).href;
}
async function isNodeBuiltinSpecifier(specifier) {
  if (specifier.startsWith("node:")) return true;
  if (!isBareModuleSpecifier(specifier)) return false;
  return (await importNodeModule("node:module")).builtinModules.includes(specifier);
}
function getSyntheticModuleExports(moduleExports) {
  const namespaceObject = moduleExports && (typeof moduleExports === "object" || typeof moduleExports === "function") ? moduleExports : { default: moduleExports };
  const effectiveExports = { ...namespaceObject };
  if (!Object.prototype.hasOwnProperty.call(effectiveExports, "default")) effectiveExports.default = namespaceObject;
  return effectiveExports;
}
async function createSyntheticModuleFromExports(identifier, moduleExports, vm) {
  if (typeof vm.SyntheticModule !== "function") throw new Error("vm.SyntheticModule is required to load Node.js built-in modules in ESM remote entries.");
  const effectiveExports = getSyntheticModuleExports(moduleExports);
  const exportNames = Object.keys(effectiveExports);
  const syntheticModule = new vm.SyntheticModule(exportNames, function setSyntheticModuleExports() {
    for (const name of exportNames) this.setExport(name, effectiveExports[name]);
  }, { identifier });
  esmModuleCache.set(identifier, syntheticModule);
  await syntheticModule.link(async () => {
    throw new Error(`Node.js built-in module "${identifier}" should not request child modules.`);
  });
  await syntheticModule.evaluate();
  return syntheticModule;
}
async function loadNodeBuiltinModule(specifier, vm) {
  const cacheKey = `node-builtin:${specifier}`;
  if (esmModuleCache.has(cacheKey)) return esmModuleCache.get(cacheKey);
  return createSyntheticModuleFromExports(cacheKey, await importNodeModule(specifier), vm);
}
async function loadResolvedModule(specifier, parentUrl, options) {
  if (await isNodeBuiltinSpecifier(specifier)) return loadNodeBuiltinModule(specifier, options.vm);
  if (isBareModuleSpecifier(specifier)) throw new Error(`Unsupported ESM module specifier "${specifier}". Only relative or absolute http(s) remote modules and Node.js built-in modules are supported.`);
  const resolvedUrl = new URL(specifier, parentUrl).href;
  if (!isFetchableRemoteModuleUrl(resolvedUrl)) throw new Error(`Unsupported ESM module specifier "${specifier}" resolved to "${resolvedUrl}". Only http(s) remote modules and Node.js built-in modules are supported.`);
  return loadModule(resolvedUrl, options);
}
async function evaluateDynamicModule(module2) {
  if (module2.status === "linked") await module2.evaluate();
  if (module2.status === "errored") throw module2.error;
  return module2;
}
async function loadModule(url, options) {
  if (esmModuleCache.has(url)) return esmModuleCache.get(url);
  const { fetch: fetch2, vm } = options;
  if (!isFetchableRemoteModuleUrl(url)) throw new Error(`Unsupported ESM module URL "${url}". Only http(s) remote modules and Node.js built-in modules are supported.`);
  const code = await (await fetch2(url)).text();
  const cwdFileUrl = (await importNodeModule("node:url")).pathToFileURL(process.cwd()).href;
  const sourceTextModule = new vm.SourceTextModule(code, {
    identifier: url,
    initializeImportMeta: (meta) => {
      meta.url = createImportMetaUrl(url, cwdFileUrl);
    },
    importModuleDynamically: async (specifier) => {
      return evaluateDynamicModule(await loadResolvedModule(specifier, url, options));
    }
  });
  esmModuleCache.set(url, sourceTextModule);
  await sourceTextModule.link(async (specifier) => {
    return loadResolvedModule(specifier, url, options);
  });
  return sourceTextModule;
}

// node_modules/@module-federation/error-codes/dist/getShortErrorMsg.mjs
var getDocsUrl = (errorCode) => {
  return `View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/${errorCode.split("-")[0].toLowerCase()}#${errorCode.toLowerCase()}`;
};
var getShortErrorMsg = (errorCode, errorDescMap2, args, originalErrorMsg) => {
  const msg = [`${[errorDescMap2[errorCode]]} #${errorCode}`];
  args && msg.push(`args: ${JSON.stringify(args)}`);
  msg.push(getDocsUrl(errorCode));
  originalErrorMsg && msg.push(`Original Error Message:
 ${originalErrorMsg}`);
  return msg.join("\n");
};

// node_modules/@module-federation/error-codes/dist/browser.mjs
function logAndReport(code, descMap, args, logger3, originalErrorMsg, context) {
  return logger3(getShortErrorMsg(code, descMap, args, originalErrorMsg));
}

// node_modules/@module-federation/runtime-core/dist/utils/logger.js
var LOG_CATEGORY2 = "[ Federation Runtime ]";
var logger2 = createLogger(LOG_CATEGORY2);
function assert2(condition, msgOrCode, descMap, args, context) {
  if (!condition) if (descMap !== void 0) error2(msgOrCode, descMap, args, void 0, context);
  else error2(msgOrCode);
}
function error2(msgOrCode, descMap, args, originalErrorMsg, context) {
  if (descMap !== void 0) return logAndReport(msgOrCode, descMap, args ?? {}, (msg2) => {
    throw new Error(`${LOG_CATEGORY2}: ${msg2}`);
  }, originalErrorMsg, context);
  const msg = msgOrCode;
  if (msg instanceof Error) {
    if (!msg.message.startsWith(LOG_CATEGORY2)) msg.message = `${LOG_CATEGORY2}: ${msg.message}`;
    throw msg;
  }
  throw new Error(`${LOG_CATEGORY2}: ${msg}`);
}
function warn$1(msg) {
  if (msg instanceof Error) {
    if (!msg.message.startsWith(LOG_CATEGORY2)) msg.message = `${LOG_CATEGORY2}: ${msg.message}`;
    logger2.warn(msg);
  } else logger2.warn(msg);
}

// node_modules/@module-federation/runtime-core/dist/utils/tool.js
function addUniqueItem(arr, item) {
  if (arr.findIndex((name) => name === item) === -1) arr.push(item);
  return arr;
}
function getFMId(remoteInfo) {
  if ("version" in remoteInfo && remoteInfo.version) return `${remoteInfo.name}:${remoteInfo.version}`;
  else if ("entry" in remoteInfo && remoteInfo.entry) return `${remoteInfo.name}:${remoteInfo.entry}`;
  else return `${remoteInfo.name}`;
}
function isRemoteInfoWithEntry(remote) {
  return typeof remote.entry !== "undefined";
}
function isPureRemoteEntry(remote) {
  return !remote.entry.includes(".json");
}
function isObject2(val) {
  return val && typeof val === "object";
}
var objectToString = Object.prototype.toString;
function isPlainObject(val) {
  return objectToString.call(val) === "[object Object]";
}
function arrayOptions(options) {
  return Array.isArray(options) ? options : [options];
}
function getRemoteEntryInfoFromSnapshot(snapshot) {
  const defaultRemoteEntryInfo = {
    url: "",
    type: "global",
    globalName: ""
  };
  if (isBrowserEnvValue || isReactNativeEnv() || !("ssrRemoteEntry" in snapshot)) return "remoteEntry" in snapshot ? {
    url: snapshot.remoteEntry,
    type: snapshot.remoteEntryType,
    globalName: snapshot.globalName
  } : defaultRemoteEntryInfo;
  if ("ssrRemoteEntry" in snapshot) return {
    url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
    type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
    globalName: snapshot.globalName
  };
  return defaultRemoteEntryInfo;
}
var processModuleAlias = (name, subPath) => {
  let moduleName;
  if (name.endsWith("/")) moduleName = name.slice(0, -1);
  else moduleName = name;
  if (subPath.startsWith(".")) subPath = subPath.slice(1);
  moduleName = moduleName + subPath;
  return moduleName;
};

// node_modules/@module-federation/runtime-core/dist/global.js
var MAX_PRELOADED_ASSETS = 2e3;
var CurrentGlobal = typeof globalThis === "object" ? globalThis : window;
var nativeGlobal = (() => {
  try {
    return document.defaultView;
  } catch {
    return CurrentGlobal;
  }
})();
var Global = nativeGlobal;
function definePropertyGlobalVal(target, key, val) {
  Object.defineProperty(target, key, {
    value: val,
    configurable: false,
    writable: true
  });
}
function includeOwnProperty(target, key) {
  return Object.hasOwnProperty.call(target, key);
}
if (!includeOwnProperty(CurrentGlobal, "__GLOBAL_LOADING_REMOTE_ENTRY__")) definePropertyGlobalVal(CurrentGlobal, "__GLOBAL_LOADING_REMOTE_ENTRY__", {});
var globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
function setGlobalDefaultVal(target) {
  if (includeOwnProperty(target, "__VMOK__") && !includeOwnProperty(target, "__FEDERATION__")) definePropertyGlobalVal(target, "__FEDERATION__", target.__VMOK__);
  if (!includeOwnProperty(target, "__FEDERATION__")) {
    definePropertyGlobalVal(target, "__FEDERATION__", {
      __GLOBAL_PLUGIN__: [],
      __INSTANCES__: [],
      moduleInfo: {},
      __SHARE__: {},
      __MANIFEST_LOADING__: {},
      __PRELOADED_MAP__: /* @__PURE__ */ new Map(),
      __PRELOADED_ASSETS__: /* @__PURE__ */ new Set()
    });
    definePropertyGlobalVal(target, "__VMOK__", target.__FEDERATION__);
  }
  target.__FEDERATION__.__GLOBAL_PLUGIN__ ??= [];
  target.__FEDERATION__.__INSTANCES__ ??= [];
  target.__FEDERATION__.moduleInfo ??= {};
  target.__FEDERATION__.__SHARE__ ??= {};
  target.__FEDERATION__.__MANIFEST_LOADING__ ??= {};
  target.__FEDERATION__.__PRELOADED_MAP__ ??= /* @__PURE__ */ new Map();
  target.__FEDERATION__.__PRELOADED_ASSETS__ ??= /* @__PURE__ */ new Set();
}
setGlobalDefaultVal(CurrentGlobal);
setGlobalDefaultVal(nativeGlobal);
function setGlobalFederationInstance(FederationInstance) {
  CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
}
function getGlobalFederationConstructor() {
  return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
}
function setGlobalFederationConstructor(FederationConstructor, isDebug = isDebugMode()) {
  if (isDebug) {
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = FederationConstructor;
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = "2.9.0";
  }
}
function getInfoWithoutType(target, key) {
  if (typeof key === "string") if (target[key]) return {
    value: target[key],
    key
  };
  else {
    const targetKeys = Object.keys(target);
    for (const targetKey of targetKeys) {
      const [targetTypeOrName, _2] = targetKey.split(":");
      const nKey = `${targetTypeOrName}:${key}`;
      const typeWithKeyRes = target[nKey];
      if (typeWithKeyRes) return {
        value: typeWithKeyRes,
        key: nKey
      };
    }
    return {
      value: void 0,
      key
    };
  }
  else error2(`getInfoWithoutType: "key" must be a string, got ${typeof key} (${JSON.stringify(key)}).`);
}
var getGlobalSnapshot = () => nativeGlobal.__FEDERATION__.moduleInfo;
var getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot) => {
  const getModuleInfo = getInfoWithoutType(snapshot, getFMId(moduleInfo)).value;
  if (getModuleInfo && !getModuleInfo.version && "version" in moduleInfo && moduleInfo["version"]) getModuleInfo.version = moduleInfo["version"];
  if (getModuleInfo) return getModuleInfo;
  if ("version" in moduleInfo && moduleInfo["version"]) {
    const { version: version2, ...resModuleInfo } = moduleInfo;
    const moduleKeyWithoutVersion = getFMId(resModuleInfo);
    const getModuleInfoWithoutVersion = getInfoWithoutType(nativeGlobal.__FEDERATION__.moduleInfo, moduleKeyWithoutVersion).value;
    if (getModuleInfoWithoutVersion?.version === version2) return getModuleInfoWithoutVersion;
  }
};
var getGlobalSnapshotInfoByModuleInfo = (moduleInfo) => getTargetSnapshotInfoByModuleInfo(moduleInfo, nativeGlobal.__FEDERATION__.moduleInfo);
var setGlobalSnapshotInfoByModuleInfo = (remoteInfo, moduleDetailInfo) => {
  const moduleKey = getFMId(remoteInfo);
  nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
  return nativeGlobal.__FEDERATION__.moduleInfo;
};
var addGlobalSnapshot = (moduleInfos) => {
  nativeGlobal.__FEDERATION__.moduleInfo = {
    ...nativeGlobal.__FEDERATION__.moduleInfo,
    ...moduleInfos
  };
  return () => {
    const keys = Object.keys(moduleInfos);
    for (const key of keys) delete nativeGlobal.__FEDERATION__.moduleInfo[key];
  };
};
var getRemoteEntryExports = (name, globalName) => {
  const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
  return {
    remoteEntryKey,
    entryExports: CurrentGlobal[remoteEntryKey]
  };
};
var getGlobalHostPlugins = () => nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
var getPreloaded = (id) => CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
var setPreloaded = (id) => CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
var getPreloadedAsset = (url) => CurrentGlobal.__FEDERATION__.__PRELOADED_ASSETS__.has(url);
var setPreloadedAsset = (url) => {
  const preloadedAssets = CurrentGlobal.__FEDERATION__.__PRELOADED_ASSETS__;
  preloadedAssets.add(url);
  if (preloadedAssets.size > MAX_PRELOADED_ASSETS) {
    const oldestUrl = preloadedAssets.values().next().value;
    if (oldestUrl !== void 0) preloadedAssets.delete(oldestUrl);
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/semver/constants.js
var buildIdentifier = "[0-9A-Za-z-]+";
var build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
var numericIdentifier = "0|[1-9]\\d*";
var numericIdentifierLoose = "[0-9]+";
var nonNumericIdentifier = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
var preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
var preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
var preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
var preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
var xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
var xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
var hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`;
var loosePlain = `[v=\\s]*${`(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`}${preReleaseLoose}?${build}?`;
var gtlt = "((?:<|>)?=?)";
var comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`;
var loneTilde = "(?:~>?)";
var tildeTrim = `(\\s*)${loneTilde}\\s+`;
var loneCaret = "(?:\\^)";
var caretTrim = `(\\s*)${loneCaret}\\s+`;
var star = "(<|>)?=?\\s*\\*";
var caret = `^${loneCaret}${xRangePlain}$`;
var fullPlain = `v?${`(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`}${preRelease}?${build}?`;
var tilde = `^${loneTilde}${xRangePlain}$`;
var xRange = `^${gtlt}\\s*${xRangePlain}$`;
var comparator = `^${gtlt}\\s*(${fullPlain})$|^$`;
var gte0 = "^\\s*>=\\s*0.0.0\\s*$";

// node_modules/@module-federation/runtime-core/dist/utils/semver/utils.js
function parseRegex(source) {
  return new RegExp(source);
}
function isXVersion(version2) {
  return !version2 || version2.toLowerCase() === "x" || version2 === "*";
}
function pipe(...fns) {
  return (x2) => fns.reduce((v2, f3) => f3(v2), x2);
}
function extractComparator(comparatorString) {
  return comparatorString.match(parseRegex(comparator));
}
function combineVersion(major, minor, patch, preRelease2) {
  const mainVersion = `${major}.${minor}.${patch}`;
  if (preRelease2) return `${mainVersion}-${preRelease2}`;
  return mainVersion;
}

// node_modules/@module-federation/runtime-core/dist/utils/semver/parser.js
function parseHyphen(range) {
  return range.replace(parseRegex(hyphenRange), (_range, from, fromMajor, fromMinor, fromPatch, _fromPreRelease, _fromBuild, to, toMajor, toMinor, toPatch, toPreRelease) => {
    if (isXVersion(fromMajor)) from = "";
    else if (isXVersion(fromMinor)) from = `>=${fromMajor}.0.0`;
    else if (isXVersion(fromPatch)) from = `>=${fromMajor}.${fromMinor}.0`;
    else from = `>=${from}`;
    if (isXVersion(toMajor)) to = "";
    else if (isXVersion(toMinor)) to = `<${Number(toMajor) + 1}.0.0-0`;
    else if (isXVersion(toPatch)) to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
    else if (toPreRelease) to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
    else to = `<=${to}`;
    return `${from} ${to}`.trim();
  });
}
function parseComparatorTrim(range) {
  return range.replace(parseRegex(comparatorTrim), "$1$2$3");
}
function parseTildeTrim(range) {
  return range.replace(parseRegex(tildeTrim), "$1~");
}
function parseCaretTrim(range) {
  return range.replace(parseRegex(caretTrim), "$1^");
}
function parseCarets(range) {
  return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(parseRegex(caret), (_2, major, minor, patch, preRelease2) => {
    if (isXVersion(major)) return "";
    else if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
    else if (isXVersion(patch)) if (major === "0") return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
    else return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
    else if (preRelease2) if (major === "0") if (minor === "0") return `>=${major}.${minor}.${patch}-${preRelease2} <${major}.${minor}.${Number(patch) + 1}-0`;
    else return `>=${major}.${minor}.${patch}-${preRelease2} <${major}.${Number(minor) + 1}.0-0`;
    else return `>=${major}.${minor}.${patch}-${preRelease2} <${Number(major) + 1}.0.0-0`;
    else {
      if (major === "0") if (minor === "0") return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
      else return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
      return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
    }
  })).join(" ");
}
function parseTildes(range) {
  return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(parseRegex(tilde), (_2, major, minor, patch, preRelease2) => {
    if (isXVersion(major)) return "";
    else if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
    else if (isXVersion(patch)) return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
    else if (preRelease2) return `>=${major}.${minor}.${patch}-${preRelease2} <${major}.${Number(minor) + 1}.0-0`;
    return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
  })).join(" ");
}
function parseXRanges(range) {
  return range.split(/\s+/).map((rangeVersion) => rangeVersion.trim().replace(parseRegex(xRange), (ret, gtlt2, major, minor, patch, preRelease2) => {
    const isXMajor = isXVersion(major);
    const isXMinor = isXMajor || isXVersion(minor);
    const isXPatch = isXMinor || isXVersion(patch);
    if (gtlt2 === "=" && isXPatch) gtlt2 = "";
    preRelease2 = "";
    if (isXMajor) if (gtlt2 === ">" || gtlt2 === "<") return "<0.0.0-0";
    else return "*";
    else if (gtlt2 && isXPatch) {
      if (isXMinor) minor = 0;
      patch = 0;
      if (gtlt2 === ">") {
        gtlt2 = ">=";
        if (isXMinor) {
          major = Number(major) + 1;
          minor = 0;
          patch = 0;
        } else {
          minor = Number(minor) + 1;
          patch = 0;
        }
      } else if (gtlt2 === "<=") {
        gtlt2 = "<";
        if (isXMinor) major = Number(major) + 1;
        else minor = Number(minor) + 1;
      }
      if (gtlt2 === "<") preRelease2 = "-0";
      return `${gtlt2 + major}.${minor}.${patch}${preRelease2}`;
    } else if (isXMinor) return `>=${major}.0.0${preRelease2} <${Number(major) + 1}.0.0-0`;
    else if (isXPatch) return `>=${major}.${minor}.0${preRelease2} <${major}.${Number(minor) + 1}.0-0`;
    return ret;
  })).join(" ");
}
function parseStar(range) {
  return range.trim().replace(parseRegex(star), "");
}
function parseGTE0(comparatorString) {
  return comparatorString.trim().replace(parseRegex(gte0), "");
}

// node_modules/@module-federation/runtime-core/dist/utils/semver/compare.js
function compareAtom(rangeAtom, versionAtom) {
  rangeAtom = Number(rangeAtom) || rangeAtom;
  versionAtom = Number(versionAtom) || versionAtom;
  if (rangeAtom > versionAtom) return 1;
  if (rangeAtom === versionAtom) return 0;
  return -1;
}
function comparePreRelease(rangeAtom, versionAtom) {
  const { preRelease: rangePreRelease } = rangeAtom;
  const { preRelease: versionPreRelease } = versionAtom;
  if (rangePreRelease === void 0 && Boolean(versionPreRelease)) return 1;
  if (Boolean(rangePreRelease) && versionPreRelease === void 0) return -1;
  if (rangePreRelease === void 0 && versionPreRelease === void 0) return 0;
  for (let i7 = 0, n6 = rangePreRelease.length; i7 <= n6; i7++) {
    const rangeElement = rangePreRelease[i7];
    const versionElement = versionPreRelease[i7];
    if (rangeElement === versionElement) continue;
    if (rangeElement === void 0 && versionElement === void 0) return 0;
    if (!rangeElement) return 1;
    if (!versionElement) return -1;
    return compareAtom(rangeElement, versionElement);
  }
  return 0;
}
function compareVersion(rangeAtom, versionAtom) {
  return compareAtom(rangeAtom.major, versionAtom.major) || compareAtom(rangeAtom.minor, versionAtom.minor) || compareAtom(rangeAtom.patch, versionAtom.patch) || comparePreRelease(rangeAtom, versionAtom);
}
function eq(rangeAtom, versionAtom) {
  return rangeAtom.version === versionAtom.version;
}
function compare(rangeAtom, versionAtom) {
  switch (rangeAtom.operator) {
    case "":
    case "=":
      return eq(rangeAtom, versionAtom);
    case ">":
      return compareVersion(rangeAtom, versionAtom) < 0;
    case ">=":
      return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) < 0;
    case "<":
      return compareVersion(rangeAtom, versionAtom) > 0;
    case "<=":
      return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) > 0;
    case void 0:
      return true;
    default:
      return false;
  }
}

// node_modules/@module-federation/runtime-core/dist/utils/semver/index.js
function parseComparatorString(range) {
  return pipe(parseCarets, parseTildes, parseXRanges, parseStar)(range);
}
function parseRange(range) {
  return pipe(parseHyphen, parseComparatorTrim, parseTildeTrim, parseCaretTrim)(range.trim()).split(/\s+/).join(" ");
}
function satisfy(version2, range) {
  if (!version2) return false;
  const extractedVersion = extractComparator(version2);
  if (!extractedVersion) return false;
  const [, versionOperator, , versionMajor, versionMinor, versionPatch, versionPreRelease] = extractedVersion;
  const versionAtom = {
    operator: versionOperator,
    version: combineVersion(versionMajor, versionMinor, versionPatch, versionPreRelease),
    major: versionMajor,
    minor: versionMinor,
    patch: versionPatch,
    preRelease: versionPreRelease?.split(".")
  };
  const orRanges = range.split("||");
  for (const orRange of orRanges) {
    const trimmedOrRange = orRange.trim();
    if (!trimmedOrRange) return true;
    if (trimmedOrRange === "*" || trimmedOrRange === "x") return true;
    try {
      const parsedSubRange = parseRange(trimmedOrRange);
      if (!parsedSubRange.trim()) return true;
      const parsedComparatorString = parsedSubRange.split(" ").map((rangeVersion) => parseComparatorString(rangeVersion)).join(" ");
      if (!parsedComparatorString.trim()) return true;
      const comparators = parsedComparatorString.split(/\s+/).map((comparator2) => parseGTE0(comparator2)).filter(Boolean);
      if (comparators.length === 0) continue;
      let subRangeSatisfied = true;
      for (const comparator2 of comparators) {
        const extractedComparator = extractComparator(comparator2);
        if (!extractedComparator) {
          subRangeSatisfied = false;
          break;
        }
        const [, rangeOperator, , rangeMajor, rangeMinor, rangePatch, rangePreRelease] = extractedComparator;
        if (!compare({
          operator: rangeOperator,
          version: combineVersion(rangeMajor, rangeMinor, rangePatch, rangePreRelease),
          major: rangeMajor,
          minor: rangeMinor,
          patch: rangePatch,
          preRelease: rangePreRelease?.split(".")
        }, versionAtom)) {
          subRangeSatisfied = false;
          break;
        }
      }
      if (subRangeSatisfied) return true;
    } catch (e7) {
      console.error(`[semver] Error processing range part "${trimmedOrRange}":`, e7);
      continue;
    }
  }
  return false;
}

// node_modules/@module-federation/runtime-core/dist/constant.js
var DEFAULT_SCOPE = "default";
var DEFAULT_REMOTE_TYPE = "global";

// node_modules/@module-federation/runtime-core/dist/utils/share.js
function formatShare(shareArgs, from, name, shareStrategy) {
  let get;
  if ("get" in shareArgs) get = shareArgs.get;
  else if ("lib" in shareArgs) get = () => Promise.resolve(shareArgs.lib);
  else get = () => Promise.resolve(() => {
    error2(`Cannot get shared "${name}" from "${from}": neither "get" nor "lib" is provided in the share config.`);
  });
  if (shareArgs.shareConfig?.eager && shareArgs.treeShaking?.mode) error2(`Invalid shared config for "${name}" from "${from}": cannot use both "eager: true" and "treeShaking.mode" simultaneously. Choose one strategy.`);
  return {
    deps: [],
    useIn: [],
    from,
    loading: null,
    ...shareArgs,
    shareConfig: {
      requiredVersion: `^${shareArgs.version}`,
      singleton: false,
      eager: false,
      strictVersion: false,
      ...shareArgs.shareConfig
    },
    get,
    loaded: shareArgs?.loaded || "lib" in shareArgs ? true : void 0,
    version: shareArgs.version ?? "0",
    scope: Array.isArray(shareArgs.scope) ? shareArgs.scope : [shareArgs.scope ?? "default"],
    strategy: (shareArgs.strategy ?? shareStrategy) || "version-first",
    treeShaking: shareArgs.treeShaking ? {
      ...shareArgs.treeShaking,
      mode: shareArgs.treeShaking.mode ?? "server-calc",
      status: shareArgs.treeShaking.status ?? TreeShakingStatus.UNKNOWN,
      useIn: []
    } : void 0
  };
}
function formatShareConfigs(prevOptions, newOptions) {
  const shareArgs = newOptions.shared || {};
  const from = newOptions.name;
  const newShareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
    const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
    res[pkgName] = res[pkgName] || [];
    arrayShareArgs.forEach((shareConfig) => {
      res[pkgName].push(formatShare(shareConfig, from, pkgName, newOptions.shareStrategy));
    });
    return res;
  }, {});
  const allShareInfos = { ...prevOptions.shared };
  Object.keys(newShareInfos).forEach((shareKey) => {
    if (!allShareInfos[shareKey]) allShareInfos[shareKey] = newShareInfos[shareKey];
    else newShareInfos[shareKey].forEach((newUserSharedOptions) => {
      if (!allShareInfos[shareKey].find((sharedVal) => sharedVal.version === newUserSharedOptions.version)) allShareInfos[shareKey].push(newUserSharedOptions);
    });
  });
  return {
    allShareInfos,
    newShareInfos
  };
}
function shouldUseTreeShaking(treeShaking, usedExports) {
  if (!treeShaking) return false;
  const { status, mode } = treeShaking;
  if (status === TreeShakingStatus.NO_USE) return false;
  if (status === TreeShakingStatus.CALCULATED) return true;
  if (mode === "runtime-infer") {
    if (!usedExports) return true;
    return isMatchUsedExports(treeShaking, usedExports);
  }
  return false;
}
function versionLt(a3, b3) {
  const transformInvalidVersion = (version2) => {
    if (!Number.isNaN(Number(version2))) {
      const splitArr = version2.split(".");
      let validVersion = version2;
      for (let i7 = 0; i7 < 3 - splitArr.length; i7++) validVersion += ".0";
      return validVersion;
    }
    return version2;
  };
  if (satisfy(transformInvalidVersion(a3), `<=${transformInvalidVersion(b3)}`)) return true;
  else return false;
}
var findVersion = (shareVersionMap, cb) => {
  const callback = cb || function(prev, cur) {
    return versionLt(prev, cur);
  };
  return Object.keys(shareVersionMap).reduce((prev, cur) => {
    if (!prev) return cur;
    if (callback(prev, cur)) return cur;
    if (prev === "0") return cur;
    return prev;
  }, 0);
};
var isLoaded = (shared) => {
  return Boolean(shared.loaded) || typeof shared.lib === "function";
};
var isLoading = (shared) => {
  return Boolean(shared.loading);
};
var isMatchUsedExports = (treeShaking, usedExports) => {
  if (!treeShaking || !usedExports) return false;
  const { usedExports: treeShakingUsedExports } = treeShaking;
  if (!treeShakingUsedExports) return false;
  if (usedExports.every((e7) => treeShakingUsedExports.includes(e7))) return true;
  return false;
};
function findSingletonVersionOrderByVersion(shareScopeMap, scope, pkgName, treeShaking) {
  const versions = shareScopeMap[scope][pkgName];
  let version2 = "";
  let useTreesShaking = shouldUseTreeShaking(treeShaking);
  const callback = function(prev, cur) {
    if (useTreesShaking) {
      if (!versions[prev].treeShaking) return true;
      if (!versions[cur].treeShaking) return false;
      return !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur);
    }
    return !isLoaded(versions[prev]) && versionLt(prev, cur);
  };
  if (useTreesShaking) {
    version2 = findVersion(shareScopeMap[scope][pkgName], callback);
    if (version2) return {
      version: version2,
      useTreesShaking
    };
    useTreesShaking = false;
  }
  return {
    version: findVersion(shareScopeMap[scope][pkgName], callback),
    useTreesShaking
  };
}
var isLoadingOrLoaded = (shared) => {
  return isLoaded(shared) || isLoading(shared);
};
function findSingletonVersionOrderByLoaded(shareScopeMap, scope, pkgName, treeShaking) {
  const versions = shareScopeMap[scope][pkgName];
  let version2 = "";
  let useTreesShaking = shouldUseTreeShaking(treeShaking);
  const callback = function(prev, cur) {
    if (useTreesShaking) {
      if (!versions[prev].treeShaking) return true;
      if (!versions[cur].treeShaking) return false;
      if (isLoadingOrLoaded(versions[cur].treeShaking)) if (isLoadingOrLoaded(versions[prev].treeShaking)) return Boolean(versionLt(prev, cur));
      else return true;
      if (isLoadingOrLoaded(versions[prev].treeShaking)) return false;
    }
    if (isLoadingOrLoaded(versions[cur])) if (isLoadingOrLoaded(versions[prev])) return Boolean(versionLt(prev, cur));
    else return true;
    if (isLoadingOrLoaded(versions[prev])) return false;
    return versionLt(prev, cur);
  };
  if (useTreesShaking) {
    version2 = findVersion(shareScopeMap[scope][pkgName], callback);
    if (version2) return {
      version: version2,
      useTreesShaking
    };
    useTreesShaking = false;
  }
  return {
    version: findVersion(shareScopeMap[scope][pkgName], callback),
    useTreesShaking
  };
}
function getFindShareFunction(strategy) {
  if (strategy === "loaded-first") return findSingletonVersionOrderByLoaded;
  return findSingletonVersionOrderByVersion;
}
function getRegisteredShare(localShareScopeMap, pkgName, shareInfo, resolveShare, loadContext) {
  if (!localShareScopeMap) return;
  const { shareConfig, scope = DEFAULT_SCOPE, strategy, treeShaking } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];
  for (const sc of scopes) if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
    const { requiredVersion } = shareConfig;
    const { version: maxOrSingletonVersion, useTreesShaking } = getFindShareFunction(strategy)(localShareScopeMap, sc, pkgName, treeShaking);
    const defaultResolver = () => {
      const shared = localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
      if (shareConfig.singleton) {
        if (typeof requiredVersion === "string" && !satisfy(maxOrSingletonVersion, requiredVersion)) {
          const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && shared.from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
          if (shareConfig.strictVersion) error2(msg);
          else warn$1(msg);
        }
        return {
          shared,
          useTreesShaking
        };
      } else {
        if (requiredVersion === false || requiredVersion === "*") return {
          shared,
          useTreesShaking
        };
        if (satisfy(maxOrSingletonVersion, requiredVersion)) return {
          shared,
          useTreesShaking
        };
        const _usedTreeShaking = shouldUseTreeShaking(treeShaking);
        if (_usedTreeShaking) for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])) {
          if (!shouldUseTreeShaking(versionValue.treeShaking, treeShaking?.usedExports)) continue;
          if (satisfy(versionKey, requiredVersion)) return {
            shared: versionValue,
            useTreesShaking: _usedTreeShaking
          };
        }
        for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])) if (satisfy(versionKey, requiredVersion)) return {
          shared: versionValue,
          useTreesShaking: false
        };
      }
    };
    const params = {
      shareScopeMap: localShareScopeMap,
      scope: sc,
      pkgName,
      version: maxOrSingletonVersion,
      GlobalFederation: Global.__FEDERATION__,
      shareInfo,
      resolver: defaultResolver,
      loadContext
    };
    return (resolveShare.emit(params) || params).resolver();
  }
}
function getGlobalShareScope() {
  return Global.__FEDERATION__.__SHARE__;
}
function getTargetSharedOptions(options) {
  const { pkgName, extraOptions, shareInfos } = options;
  const defaultResolver = (sharedOptions) => {
    if (!sharedOptions) return;
    const shareVersionMap = {};
    sharedOptions.forEach((shared) => {
      shareVersionMap[shared.version] = shared;
    });
    const callback = function(prev, cur) {
      return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
    };
    return shareVersionMap[findVersion(shareVersionMap, callback)];
  };
  const resolver = extraOptions?.resolver ?? defaultResolver;
  const isPlainObject2 = (val) => {
    return val !== null && typeof val === "object" && !Array.isArray(val);
  };
  const merge = (...sources) => {
    const out = {};
    for (const src of sources) {
      if (!src) continue;
      for (const [key, value] of Object.entries(src)) {
        const prev = out[key];
        if (isPlainObject2(prev) && isPlainObject2(value)) out[key] = merge(prev, value);
        else if (value !== void 0) out[key] = value;
      }
    }
    return out;
  };
  return merge(resolver(shareInfos[pkgName]), extraOptions?.customShareInfo);
}
var addUseIn = (shared, from) => {
  if (!shared.useIn) shared.useIn = [];
  addUniqueItem(shared.useIn, from);
};
function directShare(shared, useTreesShaking) {
  if (useTreesShaking && shared.treeShaking) return shared.treeShaking;
  return shared;
}

// node_modules/@module-federation/runtime-core/dist/utils/manifest.js
function composeRemoteRequestId(remoteName, expose) {
  if (!expose || expose === ".") return remoteName;
  return `${remoteName}/${expose.replace(/^\.\//, "")}`;
}
function matchRemoteWithNameAndExpose(remotes, id) {
  for (const remote of remotes) {
    const isNameMatched = id.startsWith(remote.name);
    let expose = id.replace(remote.name, "");
    if (isNameMatched) {
      if (expose.startsWith("/")) {
        const pkgNameOrAlias = remote.name;
        expose = `.${expose}`;
        return {
          pkgNameOrAlias,
          expose,
          remote
        };
      } else if (expose === "") return {
        pkgNameOrAlias: remote.name,
        expose: ".",
        remote
      };
    }
    const isAliasMatched = remote.alias && id.startsWith(remote.alias);
    let exposeWithAlias = remote.alias && id.replace(remote.alias, "");
    if (remote.alias && isAliasMatched) {
      if (exposeWithAlias && exposeWithAlias.startsWith("/")) {
        const pkgNameOrAlias = remote.alias;
        exposeWithAlias = `.${exposeWithAlias}`;
        return {
          pkgNameOrAlias,
          expose: exposeWithAlias,
          remote
        };
      } else if (exposeWithAlias === "") return {
        pkgNameOrAlias: remote.alias,
        expose: ".",
        remote
      };
    }
  }
}
function matchRemote(remotes, nameOrAlias) {
  for (const remote of remotes) {
    if (nameOrAlias === remote.name) return remote;
    if (remote.alias && nameOrAlias === remote.alias) return remote;
  }
}

// node_modules/@module-federation/error-codes/dist/error-codes.mjs
var RUNTIME_001 = "RUNTIME-001";
var RUNTIME_002 = "RUNTIME-002";
var RUNTIME_003 = "RUNTIME-003";
var RUNTIME_004 = "RUNTIME-004";
var RUNTIME_005 = "RUNTIME-005";
var RUNTIME_006 = "RUNTIME-006";
var RUNTIME_007 = "RUNTIME-007";
var RUNTIME_008 = "RUNTIME-008";
var RUNTIME_009 = "RUNTIME-009";
var RUNTIME_010 = "RUNTIME-010";
var RUNTIME_011 = "RUNTIME-011";
var RUNTIME_012 = "RUNTIME-012";
var RUNTIME_013 = "RUNTIME-013";
var RUNTIME_014 = "RUNTIME-014";
var RUNTIME_015 = "RUNTIME-015";
var TYPE_001 = "TYPE-001";
var BUILD_001 = "BUILD-001";
var BUILD_002 = "BUILD-002";

// node_modules/@module-federation/error-codes/dist/desc.mjs
var runtimeDescMap = {
  [RUNTIME_001]: "Failed to get remoteEntry exports.",
  [RUNTIME_002]: 'The remote entry interface does not contain "init"',
  [RUNTIME_003]: "Failed to get manifest.",
  [RUNTIME_004]: "Failed to locate remote.",
  [RUNTIME_005]: "Invalid loadShareSync function call from bundler runtime",
  [RUNTIME_006]: "Invalid loadShareSync function call from runtime",
  [RUNTIME_007]: "Failed to get remote snapshot.",
  [RUNTIME_008]: "Failed to load script resources.",
  [RUNTIME_009]: "Please call createInstance first.",
  [RUNTIME_010]: 'The name option cannot be changed after initialization. If you want to create a new instance with a different name, please use "createInstance" api.',
  [RUNTIME_011]: "The remoteEntry URL is missing from the remote snapshot.",
  [RUNTIME_012]: 'The getter for the shared module is not a function. This may be caused by setting "shared.import: false" without the host providing the corresponding lib.',
  [RUNTIME_013]: "The manifest is not a valid Module Federation manifest.",
  [RUNTIME_014]: "The remote does not expose the requested module.",
  [RUNTIME_015]: "Remote container initialization failed."
};
var typeDescMap = { [TYPE_001]: "Failed to generate type declaration. Execute the below cmd to reproduce and fix the error." };
var buildDescMap = {
  [BUILD_001]: "Failed to find expose module.",
  [BUILD_002]: "PublicPath is required in prod mode."
};
var errorDescMap = {
  ...runtimeDescMap,
  ...typeDescMap,
  ...buildDescMap
};

// node_modules/@module-federation/runtime-core/dist/utils/load.js
var importCallback = ".then(callbacks[0]).catch(callbacks[1])";
var remoteEntryLoadingOrigins = /* @__PURE__ */ new WeakMap();
var esmRemoteEntryLoadErrorMessages = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module"
];
function isEsmRemoteEntryLoadError(err) {
  if (!(err instanceof TypeError)) return false;
  return esmRemoteEntryLoadErrorMessages.some((loadErrorMessage) => err.message.includes(loadErrorMessage));
}
function isEsmRemoteType(type) {
  return type === "esm" || type === "module";
}
async function loadEsmEntry({ entry, remoteEntryExports, name, getEntryUrl }) {
  return new Promise((resolve, reject) => {
    const rejectEntry = (loadError) => {
      if (isEsmRemoteEntryLoadError(loadError)) {
        const originalMsg = loadError instanceof Error ? loadError.message : String(loadError);
        try {
          error2(RUNTIME_008, runtimeDescMap, {
            remoteName: name,
            resourceUrl: url
          }, originalMsg);
        } catch (runtimeError) {
          reject(runtimeError);
          return;
        }
      }
      reject(loadError);
    };
    const url = getEntryUrl ? getEntryUrl(entry) : entry;
    try {
      if (!remoteEntryExports) if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== "undefined") new Function("callbacks", `import("${url}")${importCallback}`)([resolve, rejectEntry]);
      else import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        url
      ).then(resolve).catch(rejectEntry);
      else resolve(remoteEntryExports);
    } catch (e7) {
      error2(`Failed to load ESM entry from "${url}". ${e7 instanceof Error ? e7.message : String(e7)}`);
    }
  });
}
async function loadSystemJsEntry({ entry, remoteEntryExports }) {
  return new Promise((resolve, reject) => {
    try {
      if (!remoteEntryExports) if (typeof __system_context__ === "undefined") System.import(entry).then(resolve).catch(reject);
      else new Function("callbacks", `System.import("${entry}")${importCallback}`)([resolve, reject]);
      else resolve(remoteEntryExports);
    } catch (e7) {
      error2(`Failed to load SystemJS entry from "${entry}". ${e7 instanceof Error ? e7.message : String(e7)}`);
    }
  });
}
function handleRemoteEntryLoaded(name, globalName, entry) {
  const { remoteEntryKey, entryExports } = getRemoteEntryExports(name, globalName);
  if (!entryExports) error2(RUNTIME_001, runtimeDescMap, {
    remoteName: name,
    remoteEntryUrl: entry,
    remoteEntryKey
  });
  return entryExports;
}
async function loadEntryScript({ name, globalName, entry, remoteInfo, loaderHook, getEntryUrl, resourceContext }) {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
  if (remoteEntryExports) return remoteEntryExports;
  const url = getEntryUrl ? getEntryUrl(entry) : entry;
  return loadScript(url, {
    attrs: {},
    createScriptHook: (url2, attrs) => {
      const res = loaderHook.lifecycle.createScript.emit({
        url: url2,
        attrs,
        remoteInfo,
        resourceContext: resourceContext ? {
          ...resourceContext,
          url: url2
        } : void 0
      });
      if (!res) return;
      if (res instanceof HTMLScriptElement) return res;
      if ("script" in res || "timeout" in res) return res;
    }
  }).then(() => {
    return handleRemoteEntryLoaded(name, globalName, entry);
  }, (loadError) => {
    const originalMsg = loadError instanceof Error ? loadError.message : String(loadError);
    error2(RUNTIME_008, runtimeDescMap, {
      remoteName: name,
      resourceUrl: url
    }, originalMsg);
  });
}
async function loadEntryDom({ remoteInfo, remoteEntryExports, loaderHook, getEntryUrl, resourceContext }) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  if (isEsmRemoteType(type)) return loadEsmEntry({
    entry,
    remoteEntryExports,
    name,
    getEntryUrl
  });
  if (type === "system") return loadSystemJsEntry({
    entry,
    remoteEntryExports
  });
  return loadEntryScript({
    entry,
    globalName,
    name,
    remoteInfo,
    loaderHook,
    getEntryUrl,
    resourceContext
  });
}
async function loadEntryNode({ remoteInfo, loaderHook, resourceContext }) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
  if (remoteEntryExports) return remoteEntryExports;
  return loadScriptNode(entry, {
    attrs: {
      name,
      globalName,
      type
    },
    loaderHook: { createScriptHook: (url, attrs = {}) => {
      const res = loaderHook.lifecycle.createScript.emit({
        url,
        attrs,
        remoteInfo,
        resourceContext: resourceContext ? {
          ...resourceContext,
          url
        } : void 0
      });
      if (!res) return;
      if ("url" in res) return res;
    } }
  }).then(() => {
    return handleRemoteEntryLoaded(name, globalName, entry);
  }).catch((e7) => {
    error2(`Failed to load Node.js entry for remote "${name}" from "${entry}". ${e7 instanceof Error ? e7.message : String(e7)}`);
  });
}
function getRemoteEntryUniqueKey(remoteInfo) {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}
async function getRemoteEntry(params) {
  const { origin, remoteEntryExports, remoteInfo, getEntryUrl, resourceContext, _inErrorHandling = false } = params;
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    await origin.loaderHook.lifecycle.afterLoadEntry.emit({
      origin,
      remoteInfo,
      remoteEntryExports,
      resourceContext,
      cached: true
    });
    return remoteEntryExports;
  }
  if (!globalLoading[uniqueKey]) {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    const loaderHook = origin.loaderHook;
    globalLoading[uniqueKey] = loadEntryHook.emit({
      origin,
      loaderHook,
      remoteInfo,
      remoteEntryExports,
      resourceContext
    }).then((res) => {
      if (res) return res;
      return (typeof ENV_TARGET !== "undefined" ? ENV_TARGET === "web" : isBrowserEnvValue) ? loadEntryDom({
        remoteInfo,
        remoteEntryExports,
        loaderHook,
        getEntryUrl,
        resourceContext
      }) : loadEntryNode({
        remoteInfo,
        loaderHook,
        resourceContext
      });
    }).then(async (res) => {
      await origin.loaderHook.lifecycle.afterLoadEntry.emit({
        origin,
        remoteInfo,
        remoteEntryExports: res,
        resourceContext
      });
      return res;
    }).catch(async (loadError) => {
      const isScriptExecutionError = loadError instanceof Error && loadError.message.includes("ScriptExecutionError");
      if (loadError instanceof Error && loadError.message.includes(RUNTIME_008) && !isScriptExecutionError && !_inErrorHandling) {
        const wrappedGetRemoteEntry = (params2) => {
          return getRemoteEntry({
            ...params2,
            _inErrorHandling: true
          });
        };
        const recoveredRemoteEntryExports = await origin.loaderHook.lifecycle.loadEntryError.emit({
          getRemoteEntry: wrappedGetRemoteEntry,
          origin,
          remoteInfo,
          remoteEntryExports,
          globalLoading,
          uniqueKey
        });
        if (recoveredRemoteEntryExports) {
          await origin.loaderHook.lifecycle.afterLoadEntry.emit({
            origin,
            remoteInfo,
            remoteEntryExports: recoveredRemoteEntryExports,
            resourceContext,
            error: loadError,
            recovered: true
          });
          return recoveredRemoteEntryExports;
        }
      }
      await origin.loaderHook.lifecycle.afterLoadEntry.emit({
        origin,
        remoteInfo,
        resourceContext,
        error: loadError
      });
      throw loadError;
    });
    remoteEntryLoadingOrigins.set(globalLoading[uniqueKey], origin);
  }
  const remoteEntryLoading = globalLoading[uniqueKey];
  if (remoteEntryLoadingOrigins.get(remoteEntryLoading) !== origin) try {
    const result = await remoteEntryLoading;
    await origin.loaderHook.lifecycle.afterLoadEntry.emit({
      origin,
      remoteInfo,
      remoteEntryExports: result,
      resourceContext
    });
    return result;
  } catch (loadError) {
    await origin.loaderHook.lifecycle.afterLoadEntry.emit({
      origin,
      remoteInfo,
      resourceContext,
      error: loadError
    });
    throw loadError;
  }
  return remoteEntryLoading;
}
function getRemoteInfo(remote) {
  return {
    ...remote,
    entry: "entry" in remote ? remote.entry : "",
    type: remote.type || DEFAULT_REMOTE_TYPE,
    entryGlobalName: remote.entryGlobalName || remote.name,
    shareScope: remote.shareScope || DEFAULT_SCOPE
  };
}

// node_modules/@module-federation/runtime-core/dist/utils/env.js
function getBuilderId() {
  return typeof FEDERATION_BUILD_IDENTIFIER !== "undefined" ? FEDERATION_BUILD_IDENTIFIER : "";
}

// node_modules/@module-federation/runtime-core/dist/utils/plugin.js
function getPluginsToRegister(plugins) {
  const pluginsByName = /* @__PURE__ */ new Map();
  [...plugins || [], ...getGlobalHostPlugins()].forEach((plugin) => {
    if (!plugin) return;
    assert2(isPlainObject(plugin), "Plugin configuration is invalid.");
    assert2(plugin.name, "A name must be provided by the plugin.");
    if (!pluginsByName.has(plugin.name)) pluginsByName.set(plugin.name, plugin);
  });
  return Array.from(pluginsByName.values());
}
function getInstancePlugin(plugin, instanceHooks) {
  if (instanceHooks === void 0) return plugin;
  return {
    ...instanceHooks,
    name: plugin.name,
    version: plugin.version
  };
}
function registerPlugins(plugins, instance) {
  const registeredPlugins = /* @__PURE__ */ new Map();
  instance.options.plugins.forEach((plugin) => {
    if (plugin) registeredPlugins.set(plugin.name, plugin);
  });
  const hookInstances = [
    instance.hooks,
    instance.remoteHandler.hooks,
    instance.sharedHandler.hooks,
    instance.snapshotHandler.hooks,
    instance.loaderHook,
    instance.bridgeHook
  ];
  getPluginsToRegister(plugins).forEach((plugin) => {
    registeredPlugins.set(plugin.name, plugin);
    if (instance.hooks.registerPlugins[plugin.name]) return;
    const instancePlugin = getInstancePlugin(plugin, plugin.apply?.(instance));
    hookInstances.forEach((hookInstance) => {
      hookInstance.applyPlugin(instancePlugin);
    });
  });
  return Array.from(registeredPlugins.values());
}

// node_modules/@module-federation/runtime-core/dist/utils/context.js
function remoteToEntry(r6) {
  return {
    name: r6.name,
    alias: r6.alias,
    entry: "entry" in r6 ? r6.entry : void 0,
    version: "version" in r6 ? r6.version : void 0,
    type: r6.type,
    entryGlobalName: r6.entryGlobalName,
    shareScope: r6.shareScope
  };
}
function optionsToMFContext(options) {
  const shared = {};
  for (const [pkgName, versions] of Object.entries(options.shared)) {
    const first = versions[0];
    if (first) shared[pkgName] = {
      version: first.version,
      singleton: first.shareConfig?.singleton,
      requiredVersion: first.shareConfig?.requiredVersion === false ? false : first.shareConfig?.requiredVersion,
      eager: first.eager,
      strictVersion: first.shareConfig?.strictVersion
    };
  }
  return {
    project: {
      name: options.name,
      mfRole: options.remotes?.length > 0 ? "host" : "unknown"
    },
    mfConfig: {
      name: options.name,
      remotes: options.remotes?.map(remoteToEntry) ?? [],
      shared
    }
  };
}

// node_modules/@module-federation/runtime-core/dist/utils/preload.js
function defaultPreloadArgs(preloadConfig) {
  return {
    resourceCategory: "sync",
    share: true,
    depsRemote: true,
    recordPreloadedAssets: true,
    ...preloadConfig
  };
}
function formatPreloadArgs(remotes, preloadArgs) {
  return preloadArgs.map((args) => {
    const remoteInfo = matchRemote(remotes, args.nameOrAlias);
    assert2(remoteInfo, `Unable to preload ${args.nameOrAlias} as it is not included in ${!remoteInfo && safeToString({
      remoteInfo,
      remotes
    })}`);
    return {
      remote: remoteInfo,
      preloadConfig: defaultPreloadArgs(args)
    };
  });
}
function normalizePreloadExposes(exposes) {
  if (!exposes) return [];
  return exposes.map((expose) => {
    if (expose === ".") return expose;
    if (expose.startsWith("./")) return expose.replace("./", "");
    return expose;
  });
}
function isTimeoutError(error3) {
  if (!(error3 instanceof Error)) return false;
  return error3.message.includes("timed out") || error3.name.includes("Timeout");
}
function createAssetResult(context, url, status, error3) {
  return {
    url,
    status,
    resourceType: context.resourceType,
    initiator: context.initiator,
    id: context.id,
    error: error3
  };
}
function preloadAssetOnce(context, url, recordPreloadedAssets, preload) {
  if (!recordPreloadedAssets) return preload();
  if (getPreloadedAsset(url)) return Promise.resolve(createAssetResult(context, url, "cached"));
  setPreloadedAsset(url);
  return preload();
}
async function waitForRemoteEntryPreload(host, remoteInfo, entryRemoteInfo, context) {
  const cachedRemote = host.moduleCache.get(entryRemoteInfo.name);
  const url = entryRemoteInfo.entry;
  if (cachedRemote?.remoteEntryExports) return createAssetResult(context, url, "cached");
  try {
    if (!await getRemoteEntry({
      origin: host,
      remoteInfo: entryRemoteInfo,
      remoteEntryExports: cachedRemote?.remoteEntryExports,
      resourceContext: {
        ...context,
        url
      }
    })) throw new Error(`Failed to load remoteEntry "${url}".`);
    return createAssetResult(context, url, "success");
  } catch (error3) {
    return createAssetResult(context, url, isTimeoutError(error3) ? "timeout" : "error", error3);
  }
}
function waitForLinkPreload({ host, remoteInfo, url, attrs, context, needDeleteLink }) {
  return new Promise((resolve) => {
    const { link, needAttach } = createLink({
      url,
      cb: () => {
        resolve(createAssetResult(context, url, needAttach ? "success" : "cached"));
      },
      onErrorCallback: (error3) => {
        resolve(createAssetResult(context, url, isTimeoutError(error3) ? "timeout" : "error", error3));
      },
      attrs,
      createLinkHook: (hookUrl, hookAttrs) => {
        const res = host.loaderHook.lifecycle.createLink.emit({
          url: hookUrl,
          attrs: hookAttrs,
          remoteInfo,
          resourceContext: {
            ...context,
            url: hookUrl
          }
        });
        if (res instanceof HTMLLinkElement) return res;
        return res;
      },
      needDeleteLink
    });
    needAttach && document.head.appendChild(link);
  });
}
function waitForScriptPreload({ host, remoteInfo, url, attrs, context }) {
  return new Promise((resolve) => {
    const { script, needAttach } = createScript({
      url,
      cb: () => {
        resolve(createAssetResult(context, url, needAttach ? "success" : "cached"));
      },
      onErrorCallback: (error3) => {
        resolve(createAssetResult(context, url, isTimeoutError(error3) ? "timeout" : "error", error3));
      },
      attrs,
      createScriptHook: (hookUrl, hookAttrs) => {
        const res = host.loaderHook.lifecycle.createScript.emit({
          url: hookUrl,
          attrs: hookAttrs,
          remoteInfo,
          resourceContext: {
            ...context,
            url: hookUrl
          }
        });
        if (res instanceof HTMLScriptElement) return res;
        return res;
      },
      needDeleteScript: true
    });
    needAttach && document.head.appendChild(script);
  });
}
function createResourceContext(baseContext, resourceType) {
  return {
    ...baseContext,
    resourceType
  };
}
function preloadAssets(remoteInfo, host, assets, useLinkPreload = true, baseContext = {
  initiator: "preloadRemote",
  id: remoteInfo.name
}, recordPreloadedAssets = true) {
  const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
  const results = [];
  if (host.options.inBrowser) {
    entryAssets.forEach((asset) => {
      const { moduleInfo: entryRemoteInfo } = asset;
      results.push(waitForRemoteEntryPreload(host, remoteInfo, entryRemoteInfo, createResourceContext(baseContext, "remoteEntry")));
    });
    if (useLinkPreload) {
      const defaultAttrs2 = {
        rel: "preload",
        as: "style"
      };
      cssAssets.forEach((cssUrl) => {
        const context = createResourceContext(baseContext, "css");
        results.push(preloadAssetOnce(context, cssUrl, recordPreloadedAssets, () => waitForLinkPreload({
          host,
          remoteInfo,
          url: cssUrl,
          attrs: defaultAttrs2,
          context
        })));
      });
    } else {
      const defaultAttrs2 = {
        rel: "stylesheet",
        type: "text/css"
      };
      cssAssets.forEach((cssUrl) => {
        const context = createResourceContext(baseContext, "css");
        results.push(preloadAssetOnce(context, cssUrl, recordPreloadedAssets, () => waitForLinkPreload({
          host,
          remoteInfo,
          url: cssUrl,
          attrs: defaultAttrs2,
          needDeleteLink: false,
          context
        })));
      });
    }
    let preloadJsAsset = waitForScriptPreload;
    let defaultAttrs = {
      fetchpriority: "high",
      type: "text/javascript"
    };
    if (useLinkPreload) {
      preloadJsAsset = waitForLinkPreload;
      defaultAttrs = {
        rel: "preload",
        as: "script"
      };
    } else if (isEsmRemoteType(remoteInfo.type)) {
      preloadJsAsset = waitForLinkPreload;
      defaultAttrs = {
        rel: "modulepreload",
        fetchpriority: "high"
      };
    }
    jsAssetsWithoutEntry.forEach((jsUrl) => {
      const context = createResourceContext(baseContext, "js");
      results.push(preloadAssetOnce(context, jsUrl, recordPreloadedAssets, () => preloadJsAsset({
        host,
        remoteInfo,
        url: jsUrl,
        attrs: defaultAttrs,
        context
      })));
    });
  }
  return Promise.all(results);
}

// node_modules/@module-federation/runtime-core/dist/module/index.js
function getAvailableExposeNames(remoteSnapshot) {
  if (!remoteSnapshot || !("modules" in remoteSnapshot) || !Array.isArray(remoteSnapshot.modules)) return;
  const exposes = remoteSnapshot.modules.map((module2) => module2.moduleName).filter(Boolean);
  return exposes.length ? exposes.join(",") : void 0;
}
function createRemoteEntryInitOptions(remoteInfo, hostShareScopeMap, rawInitScope) {
  const localShareScopeMap = hostShareScopeMap;
  const shareScopeKeys = Array.isArray(remoteInfo.shareScope) ? remoteInfo.shareScope : [remoteInfo.shareScope];
  if (!shareScopeKeys.length) shareScopeKeys.push("default");
  shareScopeKeys.forEach((shareScopeKey) => {
    if (!localShareScopeMap[shareScopeKey]) localShareScopeMap[shareScopeKey] = {};
  });
  const remoteEntryInitOptions = {
    version: remoteInfo.version || "",
    shareScopeKeys: Array.isArray(remoteInfo.shareScope) ? shareScopeKeys : remoteInfo.shareScope || "default"
  };
  Object.defineProperty(remoteEntryInitOptions, "shareScopeMap", {
    value: localShareScopeMap,
    enumerable: false
  });
  return {
    remoteEntryInitOptions,
    shareScope: localShareScopeMap[shareScopeKeys[0]],
    initScope: rawInitScope ?? []
  };
}
var Module$1 = class {
  constructor({ remoteInfo, host }) {
    this.inited = false;
    this.initing = false;
    this.lib = void 0;
    this.remoteInfo = remoteInfo;
    this.host = host;
  }
  async getEntry(expose, resourceContext) {
    const effectiveResourceContext = resourceContext || {
      initiator: "loadRemote",
      id: composeRemoteRequestId(this.remoteInfo.name, expose),
      resourceType: "remoteEntry",
      url: this.remoteInfo.entry,
      expose
    };
    const remoteEntryExports = await getRemoteEntry({
      origin: this.host,
      remoteInfo: this.remoteInfo,
      remoteEntryExports: this.remoteEntryExports,
      resourceContext: effectiveResourceContext
    });
    assert2(remoteEntryExports, `remoteEntryExports is undefined 
 ${safeToString(this.remoteInfo)}`);
    this.remoteEntryExports = remoteEntryExports;
    return this.remoteEntryExports;
  }
  async init(id, remoteSnapshot, rawInitScope, expose, resourceContext) {
    const remoteEntryExports = await this.getEntry(expose, resourceContext);
    if (this.inited) {
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        cached: true,
        origin: this.host
      });
      return remoteEntryExports;
    }
    if (this.initPromise) {
      try {
        await this.initPromise;
        await this.host.loaderHook.lifecycle.afterInitRemote.emit({
          id,
          remoteInfo: this.remoteInfo,
          remoteSnapshot,
          remoteEntryExports,
          cached: true,
          origin: this.host
        });
      } catch (initError) {
        await this.host.loaderHook.lifecycle.afterInitRemote.emit({
          id,
          remoteInfo: this.remoteInfo,
          remoteSnapshot,
          remoteEntryExports,
          error: initError,
          cached: true,
          origin: this.host
        });
        throw initError;
      }
      return remoteEntryExports;
    }
    this.initing = true;
    this.initPromise = (async () => {
      await this.host.loaderHook.lifecycle.beforeInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        origin: this.host
      });
      const { remoteEntryInitOptions, shareScope, initScope } = createRemoteEntryInitOptions(this.remoteInfo, this.host.shareScopeMap, rawInitScope);
      const initContainerOptions = await this.host.hooks.lifecycle.beforeInitContainer.emit({
        shareScope,
        remoteEntryInitOptions,
        initScope,
        remoteInfo: this.remoteInfo,
        origin: this.host
      });
      if (typeof remoteEntryExports?.init === "undefined") error2(RUNTIME_002, runtimeDescMap, {
        hostName: this.host.name,
        remoteName: this.remoteInfo.name,
        remoteEntryUrl: this.remoteInfo.entry,
        remoteEntryKey: this.remoteInfo.entryGlobalName
      }, void 0, optionsToMFContext(this.host.options));
      try {
        await remoteEntryExports.init(initContainerOptions.shareScope, initContainerOptions.initScope, initContainerOptions.remoteEntryInitOptions);
      } catch (initError) {
        error2(RUNTIME_015, runtimeDescMap, {
          hostName: this.host.name,
          remoteName: this.remoteInfo.name,
          remoteEntryUrl: this.remoteInfo.entry,
          remoteEntryKey: this.remoteInfo.entryGlobalName,
          shareScope: this.remoteInfo.shareScope
        }, `${initError}`, optionsToMFContext(this.host.options));
      }
      await this.host.hooks.lifecycle.initContainer.emit({
        ...initContainerOptions,
        id,
        remoteSnapshot,
        remoteEntryExports
      });
      this.inited = true;
    })();
    try {
      await this.initPromise;
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        origin: this.host
      });
    } catch (initError) {
      await this.host.loaderHook.lifecycle.afterInitRemote.emit({
        id,
        remoteInfo: this.remoteInfo,
        remoteSnapshot,
        remoteEntryExports,
        error: initError,
        origin: this.host
      });
      throw initError;
    } finally {
      this.initing = false;
      this.initPromise = void 0;
    }
    return remoteEntryExports;
  }
  async get(id, expose, options, remoteSnapshot) {
    const { loadFactory = true } = options || { loadFactory: true };
    const remoteEntryExports = await this.init(id, remoteSnapshot, void 0, expose);
    this.lib = remoteEntryExports;
    await this.host.loaderHook.lifecycle.beforeGetExpose.emit({
      id,
      expose,
      moduleInfo: this.remoteInfo,
      remoteEntryExports,
      origin: this.host
    });
    let moduleFactory;
    try {
      const hookModuleFactory = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
        remoteEntryExports,
        expose,
        moduleInfo: this.remoteInfo
      });
      moduleFactory = typeof hookModuleFactory === "function" ? hookModuleFactory : void 0;
      if (!moduleFactory) moduleFactory = await remoteEntryExports.get(expose);
      if (!moduleFactory) error2(RUNTIME_014, runtimeDescMap, {
        hostName: this.host.name,
        remoteName: this.remoteInfo.name,
        remoteEntryUrl: this.remoteInfo.entry,
        expose,
        requestId: id,
        availableExposes: getAvailableExposeNames(remoteSnapshot)
      }, void 0, optionsToMFContext(this.host.options));
      await this.host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        remoteEntryExports,
        moduleFactory,
        origin: this.host
      });
    } catch (getExposeError) {
      await this.host.loaderHook.lifecycle.afterGetExpose.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        remoteEntryExports,
        error: getExposeError,
        origin: this.host
      });
      throw getExposeError;
    }
    const symbolName = processModuleAlias(this.remoteInfo.name, expose);
    const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);
    if (!loadFactory) return wrapModuleFactory;
    await this.host.loaderHook.lifecycle.beforeExecuteFactory.emit({
      id,
      expose,
      moduleInfo: this.remoteInfo,
      loadFactory,
      origin: this.host
    });
    try {
      const exposeContent = await wrapModuleFactory();
      await this.host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        loadFactory,
        exposeModule: exposeContent,
        origin: this.host
      });
      return exposeContent;
    } catch (executeFactoryError) {
      await this.host.loaderHook.lifecycle.afterExecuteFactory.emit({
        id,
        expose,
        moduleInfo: this.remoteInfo,
        loadFactory,
        error: executeFactoryError,
        origin: this.host
      });
      throw executeFactoryError;
    }
  }
  wraperFactory(moduleFactory, id) {
    function defineModuleId(res, id2) {
      if (res && typeof res === "object" && Object.isExtensible(res) && !Object.getOwnPropertyDescriptor(res, /* @__PURE__ */ Symbol.for("mf_module_id"))) Object.defineProperty(res, /* @__PURE__ */ Symbol.for("mf_module_id"), {
        value: id2,
        enumerable: false
      });
    }
    return () => {
      const res = moduleFactory();
      if (res instanceof Promise) return res.then((asyncRes) => {
        defineModuleId(asyncRes, id);
        return asyncRes;
      });
      defineModuleId(res, id);
      return res;
    };
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/hooks/pluginSystem.js
var PluginSystem = class {
  constructor(lifecycle) {
    this.registerPlugins = {};
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }
  applyPlugin(plugin) {
    assert2(isPlainObject(plugin), "Plugin configuration is invalid.");
    const pluginName = plugin.name;
    assert2(pluginName, "A name must be provided by the plugin.");
    if (!this.registerPlugins[pluginName]) {
      this.registerPlugins[pluginName] = plugin;
      this.lifecycleKeys.forEach((key) => {
        const pluginLife = plugin[key];
        if (pluginLife) this.lifecycle[key].on(pluginLife);
      });
    }
  }
  removePlugin(pluginName) {
    assert2(pluginName, "A name is required.");
    const plugin = this.registerPlugins[pluginName];
    assert2(plugin, `The plugin "${pluginName}" is not registered.`);
    this.lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (pluginLife) this.lifecycle[key].remove(pluginLife);
    });
    delete this.registerPlugins[pluginName];
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/hooks/syncHook.js
var SyncHook = class {
  constructor(type) {
    this.type = "";
    this.listeners = /* @__PURE__ */ new Set();
    if (type) this.type = type;
  }
  on(fn) {
    if (typeof fn === "function") this.listeners.add(fn);
  }
  once(fn) {
    const self = this;
    this.on(function wrapper(...args) {
      self.remove(wrapper);
      return fn.apply(null, args);
    });
  }
  emit(...data) {
    let result;
    if (this.listeners.size > 0) this.listeners.forEach((fn) => {
      const nextResult = fn(...data);
      if (nextResult !== void 0) result = nextResult;
    });
    return result;
  }
  remove(fn) {
    this.listeners.delete(fn);
  }
  removeAll() {
    this.listeners.clear();
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/hooks/asyncHook.js
var AsyncHook = class extends SyncHook {
  emit(...data) {
    let result;
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i7 = 0;
      const call = (prev) => {
        if (prev === false) return false;
        else if (i7 < ls.length) return Promise.resolve(ls[i7++].apply(null, data)).then((result2) => {
          if (result2 === void 0 || data.length === 1 && result2 === data[0]) return call(prev);
          return call(result2);
        });
        else return prev;
      };
      result = call();
    }
    return Promise.resolve(result);
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/hooks/syncWaterfallHook.js
function checkReturnData(originalData, returnedData) {
  if (!isObject2(returnedData)) return false;
  if (originalData !== returnedData) {
    for (const key in originalData) if (!(key in returnedData)) return false;
  }
  return true;
}
var SyncWaterfallHook = class extends SyncHook {
  constructor(type) {
    super();
    this.onerror = error2;
    this.type = type;
  }
  emit(data) {
    if (!isObject2(data)) error2(`The data for the "${this.type}" hook should be an object.`);
    for (const fn of this.listeners) try {
      const tempData = fn(data);
      if (tempData === void 0) continue;
      if (checkReturnData(data, tempData)) data = tempData;
      else {
        this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
        break;
      }
    } catch (e7) {
      warn$1(e7);
      this.onerror(e7);
    }
    return data;
  }
};

// node_modules/@module-federation/runtime-core/dist/utils/hooks/asyncWaterfallHooks.js
var AsyncWaterfallHook = class extends SyncHook {
  constructor(type) {
    super();
    this.onerror = error2;
    this.type = type;
  }
  emit(data) {
    if (!isObject2(data)) error2(`The response data for the "${this.type}" hook must be an object.`);
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i7 = 0;
      const processError = (e7) => {
        warn$1(e7);
        this.onerror(e7);
        return data;
      };
      const call = (prevData) => {
        if (prevData !== void 0 && checkReturnData(data, prevData)) data = prevData;
        else if (prevData !== void 0) {
          this.onerror(`A plugin returned an incorrect value for the "${this.type}" type.`);
          return data;
        }
        if (i7 < ls.length) try {
          return Promise.resolve(ls[i7++](data)).then(call, processError);
        } catch (e7) {
          return processError(e7);
        }
        return data;
      };
      return Promise.resolve(call(data));
    }
    return Promise.resolve(data);
  }
};

// node_modules/@module-federation/runtime-core/dist/remote/disabled.js
var REMOTE_DISABLED_MESSAGE = "Remote loading is disabled by experiments.optimization.disableRemote.";
var DisabledRemoteHandler = class {
  constructor() {
    this.hooks = new PluginSystem({});
  }
  formatAndRegisterRemote() {
    return [];
  }
  loadRemote() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
  preloadRemote() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
  registerRemotes() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
  getRemoteModuleAndOptions() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
  initRawContainer() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
};

// node_modules/@module-federation/runtime-core/dist/plugins/snapshot/index.js
function assignRemoteInfo(remoteInfo, remoteSnapshot) {
  const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
  if (!remoteEntryInfo.url) error2(RUNTIME_011, runtimeDescMap, { remoteName: remoteInfo.name });
  let entryUrl = getResourceUrl(remoteSnapshot, remoteEntryInfo.url);
  if (!isBrowserEnvValue && !entryUrl.startsWith("http")) entryUrl = `https:${entryUrl}`;
  remoteInfo.type = remoteEntryInfo.type;
  remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
  remoteInfo.entry = entryUrl;
  remoteInfo.version = remoteSnapshot.version;
  remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}
function snapshotPlugin() {
  return {
    name: "snapshot-plugin",
    async afterResolve(args) {
      const { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } = args;
      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        const { remoteSnapshot, globalSnapshot } = await origin.snapshotHandler.loadRemoteSnapshotInfo({
          moduleInfo: remote,
          id: composeRemoteRequestId(remote.name, expose)
        });
        assignRemoteInfo(remoteInfo, remoteSnapshot);
        const preloadOps = [{
          nameOrAlias: pkgNameOrAlias,
          exposes: [expose],
          resourceCategory: "sync",
          share: false,
          depsRemote: false,
          recordPreloadedAssets: true
        }];
        await origin.remoteHandler.hooks.lifecycle.beforePreloadRemote.emit({
          preloadOps,
          options: origin.options,
          origin
        });
        const [preloadConfig] = preloadOps;
        if (preloadConfig) {
          const preloadOptions = {
            remote,
            preloadConfig
          };
          const assets = await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
            origin,
            preloadOptions,
            remoteInfo,
            remote,
            remoteSnapshot,
            globalSnapshot
          });
          if (assets) preloadAssets(remoteInfo, origin, assets, false, {
            initiator: "loadRemote",
            id
          }, preloadConfig.recordPreloadedAssets).catch(() => void 0);
        }
        return {
          ...args,
          remoteSnapshot
        };
      }
      return args;
    }
  };
}

// node_modules/@module-federation/runtime-core/dist/plugins/generate-preload-assets.js
function splitId(id) {
  const splitInfo = id.split(":");
  if (splitInfo.length === 1) return {
    name: splitInfo[0],
    version: void 0
  };
  else if (splitInfo.length === 2) return {
    name: splitInfo[0],
    version: splitInfo[1]
  };
  else return {
    name: splitInfo[1],
    version: splitInfo[2]
  };
}
function traverseModuleInfo(globalSnapshot, remoteInfo, traverse, isRoot, memo = {}, remoteSnapshot) {
  const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, getFMId(remoteInfo));
  const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
  if (effectiveRemoteSnapshot && !isManifestProvider(effectiveRemoteSnapshot)) {
    traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
    if (effectiveRemoteSnapshot.remotesInfo) {
      const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
      for (const key of remoteKeys) {
        if (memo[key]) continue;
        memo[key] = true;
        const subRemoteInfo = splitId(key);
        const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
        traverseModuleInfo(globalSnapshot, {
          name: subRemoteInfo.name,
          version: remoteValue.matchedVersion
        }, traverse, false, memo, void 0);
      }
    }
  }
}
var isExisted = (type, url) => {
  return document.querySelector(`${type}[${type === "link" ? "href" : "src"}="${url}"]`);
};
function generatePreloadAssets(origin, preloadOptions, remote, globalSnapshot, remoteSnapshot) {
  const cssAssets = [];
  const jsAssets = [];
  const entryAssets = [];
  const loadedSharedJsAssets = /* @__PURE__ */ new Set();
  const loadedSharedCssAssets = /* @__PURE__ */ new Set();
  const { options } = origin;
  const { preloadConfig: rootPreloadConfig } = preloadOptions;
  const { depsRemote } = rootPreloadConfig;
  traverseModuleInfo(globalSnapshot, remote, (moduleInfoSnapshot, remoteInfo, isRoot) => {
    let preloadConfig;
    if (isRoot) preloadConfig = rootPreloadConfig;
    else if (Array.isArray(depsRemote)) {
      const findPreloadConfig = depsRemote.find((remoteConfig) => {
        if (remoteConfig.nameOrAlias === remoteInfo.name || remoteConfig.nameOrAlias === remoteInfo.alias) return true;
        return false;
      });
      if (!findPreloadConfig) return;
      preloadConfig = defaultPreloadArgs(findPreloadConfig);
    } else if (depsRemote === true) preloadConfig = rootPreloadConfig;
    else return;
    const remoteEntryUrl = getResourceUrl(moduleInfoSnapshot, getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url);
    if (remoteEntryUrl) entryAssets.push({
      name: remoteInfo.name,
      moduleInfo: {
        name: remoteInfo.name,
        entry: remoteEntryUrl,
        type: "remoteEntryType" in moduleInfoSnapshot ? moduleInfoSnapshot.remoteEntryType : "global",
        entryGlobalName: "globalName" in moduleInfoSnapshot ? moduleInfoSnapshot.globalName : remoteInfo.name,
        shareScope: "",
        version: "version" in moduleInfoSnapshot ? moduleInfoSnapshot.version : void 0
      },
      url: remoteEntryUrl
    });
    let moduleAssetsInfo = "modules" in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
    const normalizedPreloadExposes = normalizePreloadExposes(preloadConfig.exposes);
    if (normalizedPreloadExposes.length && "modules" in moduleInfoSnapshot) moduleAssetsInfo = moduleInfoSnapshot?.modules?.reduce((assets, moduleAssetInfo) => {
      if (normalizedPreloadExposes?.indexOf(moduleAssetInfo.moduleName) !== -1) assets.push(moduleAssetInfo);
      return assets;
    }, []);
    function handleAssets(assets) {
      const assetsRes = assets.map((asset) => getResourceUrl(moduleInfoSnapshot, asset));
      if (preloadConfig.filter) return assetsRes.filter(preloadConfig.filter);
      return assetsRes;
    }
    if (moduleAssetsInfo) {
      const assetsLength = moduleAssetsInfo.length;
      for (let index = 0; index < assetsLength; index++) {
        const assetsInfo = moduleAssetsInfo[index];
        const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
        origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
          id: assetsInfo.moduleName === "." ? remoteInfo.name : exposeFullPath,
          name: remoteInfo.name,
          remoteSnapshot: moduleInfoSnapshot,
          preloadConfig,
          remote: remoteInfo,
          origin
        });
        if (getPreloaded(exposeFullPath)) continue;
        if (preloadConfig.resourceCategory === "all") {
          cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
          cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
          jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
          jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
        } else if (preloadConfig.resourceCategory === "sync") {
          cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
          jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
        }
        setPreloaded(exposeFullPath);
      }
    }
  }, true, {}, remoteSnapshot);
  if (remoteSnapshot.shared && remoteSnapshot.shared.length > 0) {
    const collectSharedAssets = (shareInfo, snapshotShared) => {
      const { shared: registeredShared } = getRegisteredShare(origin.shareScopeMap, snapshotShared.sharedName, shareInfo, origin.sharedHandler.hooks.lifecycle.resolveShare) || {};
      if (registeredShared && typeof registeredShared.lib === "function") {
        snapshotShared.assets.js.sync.forEach((asset) => {
          loadedSharedJsAssets.add(asset);
        });
        snapshotShared.assets.css.sync.forEach((asset) => {
          loadedSharedCssAssets.add(asset);
        });
      }
    };
    remoteSnapshot.shared.forEach((shared) => {
      const shareInfos = options.shared?.[shared.sharedName];
      if (!shareInfos) return;
      const sharedOptions = shared.version ? shareInfos.find((s4) => s4.version === shared.version) : shareInfos;
      if (!sharedOptions) return;
      arrayOptions(sharedOptions).forEach((s4) => {
        collectSharedAssets(s4, shared);
      });
    });
  }
  const needPreloadJsAssets = jsAssets.filter((asset) => !loadedSharedJsAssets.has(asset) && !isExisted("script", asset));
  return {
    cssAssets: cssAssets.filter((asset) => !loadedSharedCssAssets.has(asset) && !isExisted("link", asset)),
    jsAssetsWithoutEntry: needPreloadJsAssets,
    entryAssets: entryAssets.filter((entry) => !isExisted("script", entry.url))
  };
}
var generatePreloadAssetsPlugin = function() {
  return {
    name: "generate-preload-assets-plugin",
    async generatePreloadAssets(args) {
      const { origin, preloadOptions, remoteInfo, remote, globalSnapshot, remoteSnapshot } = args;
      if (!isBrowserEnvValue) return {
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: []
      };
      if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) return {
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [{
          name: remote.name,
          url: remote.entry,
          moduleInfo: {
            name: remoteInfo.name,
            entry: remote.entry,
            type: remoteInfo.type || "global",
            entryGlobalName: "",
            shareScope: ""
          }
        }]
      };
      assignRemoteInfo(remoteInfo, remoteSnapshot);
      return generatePreloadAssets(origin, preloadOptions, remoteInfo, globalSnapshot, remoteSnapshot);
    }
  };
};

// node_modules/@module-federation/runtime-core/dist/plugins/snapshot/SnapshotHandler.js
function getGlobalRemoteInfo(moduleInfo, origin) {
  const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
    name: origin.name,
    version: origin.options.version
  });
  const globalRemoteInfo = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name).value;
  if (globalRemoteInfo && globalRemoteInfo.matchedVersion) return {
    hostGlobalSnapshot,
    globalSnapshot: getGlobalSnapshot(),
    remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
      name: moduleInfo.name,
      version: globalRemoteInfo.matchedVersion
    })
  };
  return {
    hostGlobalSnapshot: void 0,
    globalSnapshot: getGlobalSnapshot(),
    remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
      name: moduleInfo.name,
      version: "version" in moduleInfo ? moduleInfo.version : void 0
    })
  };
}
var SnapshotHandler = class {
  constructor(HostInstance) {
    this.loadingHostSnapshot = null;
    this.manifestCache = /* @__PURE__ */ new Map();
    this.hooks = new PluginSystem({
      beforeLoadRemoteSnapshot: new AsyncHook("beforeLoadRemoteSnapshot"),
      loadSnapshot: new AsyncWaterfallHook("loadGlobalSnapshot"),
      loadRemoteSnapshot: new AsyncWaterfallHook("loadRemoteSnapshot"),
      afterLoadSnapshot: new AsyncWaterfallHook("afterLoadSnapshot"),
      beforeLoadManifest: new AsyncHook("beforeLoadManifest"),
      afterLoadManifest: new AsyncHook("afterLoadManifest")
    });
    this.manifestLoading = Global.__FEDERATION__.__MANIFEST_LOADING__;
    this.HostInstance = HostInstance;
    this.loaderHook = HostInstance.loaderHook;
  }
  async loadRemoteSnapshotInfo({ moduleInfo, id, initiator = "loadRemote" }) {
    const { options } = this.HostInstance;
    await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
      options,
      moduleInfo,
      origin: this.HostInstance
    });
    let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
      name: this.HostInstance.options.name,
      version: this.HostInstance.options.version
    });
    if (!hostSnapshot) {
      hostSnapshot = {
        version: this.HostInstance.options.version || "",
        remoteEntry: "",
        remotesInfo: {}
      };
      addGlobalSnapshot({ [this.HostInstance.options.name]: hostSnapshot });
    }
    if (hostSnapshot && "remotesInfo" in hostSnapshot && !getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name).value) {
      if ("version" in moduleInfo || "entry" in moduleInfo) hostSnapshot.remotesInfo = {
        ...hostSnapshot?.remotesInfo,
        [moduleInfo.name]: { matchedVersion: "version" in moduleInfo ? moduleInfo.version : moduleInfo.entry }
      };
    }
    const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } = this.getGlobalRemoteInfo(moduleInfo);
    const { remoteSnapshot: globalRemoteSnapshot, globalSnapshot: globalSnapshotRes } = await this.hooks.lifecycle.loadSnapshot.emit({
      options,
      moduleInfo,
      hostGlobalSnapshot,
      remoteSnapshot,
      globalSnapshot
    });
    let mSnapshot;
    let gSnapshot;
    if (globalRemoteSnapshot) if (isManifestProvider(globalRemoteSnapshot)) {
      const remoteEntry = isBrowserEnvValue ? globalRemoteSnapshot.remoteEntry : globalRemoteSnapshot.ssrRemoteEntry || globalRemoteSnapshot.remoteEntry || "";
      const moduleSnapshot = await this.loadManifestSnapshot(remoteEntry, moduleInfo, {}, {
        initiator,
        id: id || moduleInfo.name
      });
      const globalSnapshotRes2 = setGlobalSnapshotInfoByModuleInfo({
        ...moduleInfo,
        entry: remoteEntry
      }, moduleSnapshot);
      mSnapshot = moduleSnapshot;
      gSnapshot = globalSnapshotRes2;
    } else {
      const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
        options: this.HostInstance.options,
        moduleInfo,
        remoteSnapshot: globalRemoteSnapshot,
        from: "global"
      });
      mSnapshot = remoteSnapshotRes;
      gSnapshot = globalSnapshotRes;
    }
    else if (isRemoteInfoWithEntry(moduleInfo)) {
      const moduleSnapshot = await this.loadManifestSnapshot(moduleInfo.entry, moduleInfo, {}, {
        initiator,
        id: id || moduleInfo.name
      });
      const globalSnapshotRes2 = setGlobalSnapshotInfoByModuleInfo(moduleInfo, moduleSnapshot);
      mSnapshot = moduleSnapshot;
      gSnapshot = globalSnapshotRes2;
    } else error2(RUNTIME_007, runtimeDescMap, {
      remoteName: moduleInfo.name,
      remoteVersion: moduleInfo.version,
      hostName: this.HostInstance.options.name,
      globalSnapshot: JSON.stringify(globalSnapshotRes)
    }, void 0, optionsToMFContext(this.HostInstance.options));
    await this.hooks.lifecycle.afterLoadSnapshot.emit({
      id,
      host: this.HostInstance,
      options,
      moduleInfo,
      remoteSnapshot: mSnapshot
    });
    return {
      remoteSnapshot: mSnapshot,
      globalSnapshot: gSnapshot
    };
  }
  getGlobalRemoteInfo(moduleInfo) {
    return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
  }
  async getManifestJson(manifestUrl, moduleInfo, extraOptions, resourceOptions) {
    const getManifest = async () => {
      const remoteInfo = getRemoteInfo(moduleInfo);
      let manifestJson = this.manifestCache.get(manifestUrl);
      if (manifestJson) {
        await this.hooks.lifecycle.afterLoadManifest.emit({
          manifestUrl,
          moduleInfo,
          resourceOptions,
          manifestJson,
          cached: true,
          origin: this.HostInstance
        });
        return manifestJson;
      }
      await this.hooks.lifecycle.beforeLoadManifest.emit({
        manifestUrl,
        moduleInfo,
        resourceOptions,
        origin: this.HostInstance
      });
      let response;
      let loadError;
      let recovered = false;
      try {
        let res = await this.loaderHook.lifecycle.fetch.emit(manifestUrl, {}, remoteInfo, resourceOptions ? {
          ...resourceOptions,
          url: manifestUrl,
          resourceType: "manifest"
        } : void 0);
        if (!res || !(res instanceof Response)) res = await fetch(manifestUrl, {});
        response = res;
        manifestJson = await res.json();
      } catch (err) {
        loadError = err;
        manifestJson = await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
          id: manifestUrl,
          error: err,
          from: "runtime",
          lifecycle: "afterResolve",
          remote: remoteInfo,
          origin: this.HostInstance
        });
        if (!manifestJson) {
          delete this.manifestLoading[manifestUrl];
          await this.hooks.lifecycle.afterLoadManifest.emit({
            manifestUrl,
            moduleInfo,
            resourceOptions,
            response,
            error: err,
            origin: this.HostInstance
          });
          error2(RUNTIME_003, runtimeDescMap, {
            manifestUrl,
            moduleName: moduleInfo.name,
            hostName: this.HostInstance.options.name
          }, `${err}`, optionsToMFContext(this.HostInstance.options));
        }
        recovered = true;
      }
      const missingRequiredFields = [
        !manifestJson.metaData && "metaData",
        !manifestJson.exposes && "exposes",
        !manifestJson.shared && "shared"
      ].filter(Boolean);
      const validationError = missingRequiredFields.length > 0 ? /* @__PURE__ */ new Error(`"${manifestUrl}" is not a valid federation manifest for remote "${moduleInfo.name}". Missing required fields: ${missingRequiredFields.join(", ")}.`) : void 0;
      if (validationError) await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
        id: manifestUrl,
        error: validationError,
        from: "runtime",
        lifecycle: "afterResolve",
        remote: remoteInfo,
        origin: this.HostInstance
      });
      await this.hooks.lifecycle.afterLoadManifest.emit({
        manifestUrl,
        moduleInfo,
        resourceOptions,
        manifestJson,
        response,
        error: validationError || loadError,
        recovered: validationError ? void 0 : recovered || void 0,
        origin: this.HostInstance
      });
      if (validationError) error2(RUNTIME_013, runtimeDescMap, {
        manifestUrl,
        moduleName: moduleInfo.name,
        hostName: this.HostInstance.options.name,
        missingFields: missingRequiredFields.join(",")
      }, void 0, optionsToMFContext(this.HostInstance.options));
      this.manifestCache.set(manifestUrl, manifestJson);
      return manifestJson;
    };
    return getManifest();
  }
  async loadManifestSnapshot(manifestUrl, moduleInfo, extraOptions, resourceOptions) {
    const asyncLoadProcess = async () => {
      const manifestJson = await this.getManifestJson(manifestUrl, moduleInfo, extraOptions, resourceOptions);
      const remoteSnapshot = generateSnapshotFromManifest(manifestJson, { version: manifestUrl });
      const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
        options: this.HostInstance.options,
        moduleInfo,
        manifestJson,
        remoteSnapshot,
        manifestUrl,
        from: "manifest"
      });
      return remoteSnapshotRes;
    };
    if (!this.manifestLoading[manifestUrl]) this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res) => res);
    return this.manifestLoading[manifestUrl];
  }
};

// node_modules/@module-federation/runtime-core/dist/plugins/snapshot/disabled.js
var DisabledSnapshotHandler = class {
  constructor() {
    this.hooks = new PluginSystem({});
  }
};

// node_modules/@module-federation/runtime-core/dist/shared/index.js
var SharedHandler = class {
  constructor(host) {
    this.hooks = new PluginSystem({
      beforeRegisterShare: new SyncWaterfallHook("beforeRegisterShare"),
      afterRegisterShare: new SyncHook("afterRegisterShare"),
      afterResolve: new AsyncWaterfallHook("afterResolve"),
      beforeLoadShare: new AsyncWaterfallHook("beforeLoadShare"),
      loadShare: new AsyncHook(),
      afterLoadShare: new SyncHook("afterLoadShare"),
      errorLoadShare: new SyncHook("errorLoadShare"),
      resolveShare: new SyncWaterfallHook("resolveShare"),
      initContainerShareScopeMap: new SyncWaterfallHook("initContainerShareScopeMap")
    });
    this.host = host;
    this.shareScopeMap = {};
    this.initTokens = {};
    this._setGlobalShareScopeMap(host.options);
  }
  emitAfterRegisterShare(pkgName, input) {
    this.hooks.lifecycle.afterRegisterShare.emit({
      pkgName,
      ...input,
      shareScopeMap: this.shareScopeMap,
      origin: this.host
    });
  }
  emitAfterLoadShare({ lifecycle, pkgName, shareInfo, selectedShared, loadContext }) {
    try {
      this.hooks.lifecycle.afterLoadShare.emit({
        pkgName,
        shareInfo,
        selectedShared,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        loadContext,
        origin: this.host
      });
    } catch (error3) {
      warn$1(error3);
    }
  }
  emitErrorLoadShare({ lifecycle, pkgName, shareInfo, error: error3, recovered, loadContext }) {
    try {
      this.hooks.lifecycle.errorLoadShare.emit({
        pkgName,
        shareInfo,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        origin: this.host,
        error: error3,
        recovered,
        loadContext
      });
    } catch (hookError) {
      warn$1(hookError);
    }
  }
  registerShared(globalOptions, userOptions) {
    const { newShareInfos, allShareInfos } = formatShareConfigs(globalOptions, userOptions);
    Object.keys(newShareInfos).forEach((sharedKey) => {
      newShareInfos[sharedKey].forEach((sharedVal) => {
        sharedVal.scope.forEach((sc) => {
          this.hooks.lifecycle.beforeRegisterShare.emit({
            origin: this.host,
            pkgName: sharedKey,
            shared: sharedVal
          });
          const registeredShared = this.shareScopeMap[sc]?.[sharedKey];
          const previousAtVersion = registeredShared?.[sharedVal.version];
          if (!registeredShared) this.setShared({
            pkgName: sharedKey,
            lib: sharedVal.lib,
            get: sharedVal.get,
            loaded: sharedVal.loaded || Boolean(sharedVal.lib),
            shared: sharedVal,
            from: userOptions.name
          });
          this.emitAfterRegisterShare(sharedKey, {
            scope: sc,
            shared: sharedVal,
            previousShared: previousAtVersion,
            registeredShared: this.shareScopeMap[sc]?.[sharedKey]?.[sharedVal.version],
            trigger: "runtime"
          });
        });
      });
    });
    return {
      newShareInfos,
      allShareInfos
    };
  }
  async loadShare(pkgName, extraOptions) {
    const { host } = this;
    let loadContext = extraOptions?.context;
    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared
    });
    let shareOptionsRes = shareOptions;
    try {
      if (shareOptions?.scope) await Promise.all(shareOptions.scope.map(async (shareScope) => {
        await Promise.all(this.initializeSharing(shareScope, {
          strategy: shareOptions.strategy,
          context: loadContext
        }));
      }));
      const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
        pkgName,
        shareInfo: shareOptions,
        shared: host.options.shared,
        origin: host,
        loadContext
      });
      shareOptionsRes = loadShareRes.shareInfo;
      loadContext = loadShareRes.loadContext || loadContext;
      assert2(shareOptionsRes, `Cannot find shared "${pkgName}" in host "${host.options.name}". Ensure the shared config for "${pkgName}" is declared in the federation plugin options and the host has been initialized before loading shares.`);
      const resolvedShareOptions = shareOptionsRes;
      const { shared: registeredShared, useTreesShaking } = getRegisteredShare(this.shareScopeMap, pkgName, shareOptionsRes, this.hooks.lifecycle.resolveShare, loadContext) || {};
      if (registeredShared) {
        const targetShared = directShare(registeredShared, useTreesShaking);
        if (targetShared.lib) {
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: "loadShare",
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext
          });
          return targetShared.lib;
        } else if (targetShared.loading && !targetShared.loaded) {
          const factory = await targetShared.loading;
          targetShared.loaded = true;
          if (!targetShared.lib) targetShared.lib = factory;
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: "loadShare",
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext
          });
          return factory;
        } else {
          const asyncLoadProcess = async () => {
            const factory2 = await targetShared.get();
            addUseIn(targetShared, host.options.name);
            targetShared.loaded = true;
            targetShared.lib = factory2;
            return factory2;
          };
          const loading = asyncLoadProcess();
          this.setShared({
            pkgName,
            loaded: false,
            shared: registeredShared,
            from: host.options.name,
            lib: null,
            loading,
            treeShaking: useTreesShaking ? targetShared : void 0
          });
          const factory = await loading;
          this.emitAfterLoadShare({
            lifecycle: "loadShare",
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext
          });
          return factory;
        }
      } else {
        if (extraOptions?.customShareInfo) {
          this.emitErrorLoadShare({
            lifecycle: "loadShare",
            pkgName,
            shareInfo: resolvedShareOptions,
            recovered: true,
            loadContext
          });
          return false;
        }
        const _useTreeShaking = shouldUseTreeShaking(resolvedShareOptions.treeShaking);
        const targetShared = directShare(resolvedShareOptions, _useTreeShaking);
        const asyncLoadProcess = async () => {
          const factory2 = await targetShared.get();
          targetShared.lib = factory2;
          targetShared.loaded = true;
          addUseIn(targetShared, host.options.name);
          const { shared: gShared, useTreesShaking: gUseTreeShaking } = getRegisteredShare(this.shareScopeMap, pkgName, resolvedShareOptions, this.hooks.lifecycle.resolveShare, loadContext) || {};
          if (gShared) {
            const targetGShared = directShare(gShared, gUseTreeShaking);
            targetGShared.lib = factory2;
            targetGShared.loaded = true;
            gShared.from = resolvedShareOptions.from;
          }
          return factory2;
        };
        const loading = asyncLoadProcess();
        this.setShared({
          pkgName,
          loaded: false,
          shared: resolvedShareOptions,
          from: host.options.name,
          lib: null,
          loading,
          treeShaking: _useTreeShaking ? targetShared : void 0
        });
        const factory = await loading;
        this.emitAfterLoadShare({
          lifecycle: "loadShare",
          pkgName,
          shareInfo: resolvedShareOptions,
          selectedShared: resolvedShareOptions,
          loadContext
        });
        return factory;
      }
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: "loadShare",
        pkgName,
        shareInfo: shareOptionsRes,
        error: shareError,
        loadContext
      });
      throw shareError;
    }
  }
  /**
  * This function initializes the sharing sequence (executed only once per share scope).
  * It accepts one argument, the name of the share scope.
  * If the share scope does not exist, it creates one.
  */
  initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
    const { host } = this;
    const from = extraOptions?.from;
    const strategy = extraOptions?.strategy;
    const trigger = extraOptions?.context?.trigger || from || "runtime";
    let initScope = extraOptions?.initScope;
    const promises = [];
    if (from !== "build") {
      const { initTokens } = this;
      if (!initScope) initScope = [];
      let initToken = initTokens[shareScopeName];
      if (!initToken) initToken = initTokens[shareScopeName] = { from: this.host.name };
      if (initScope.indexOf(initToken) >= 0) return promises;
      initScope.push(initToken);
    }
    const shareScope = this.shareScopeMap;
    const hostName = host.options.name;
    if (!shareScope[shareScopeName]) shareScope[shareScopeName] = {};
    const scope = shareScope[shareScopeName];
    const register = (name, shared) => {
      const { version: version2, eager } = shared;
      scope[name] = scope[name] || {};
      const versions = scope[name];
      const existingShared = versions[version2];
      const activeVersion = existingShared && directShare(existingShared);
      const activeVersionEager = Boolean(activeVersion && ("eager" in activeVersion && activeVersion.eager || "shareConfig" in activeVersion && activeVersion.shareConfig?.eager));
      if (Boolean(!activeVersion || activeVersion.strategy !== "loaded-first" && !activeVersion.loaded && (Boolean(!eager) !== !activeVersionEager ? eager : hostName > versions[version2].from))) versions[version2] = shared;
      this.emitAfterRegisterShare(name, {
        scope: shareScopeName,
        shared,
        previousShared: existingShared,
        registeredShared: versions[version2],
        trigger
      });
    };
    const initRemoteModule = async (key) => {
      const { module: module2 } = await host.remoteHandler.getRemoteModuleAndOptions({ id: key });
      let remoteEntryExports = void 0;
      const resourceContext = {
        initiator: "loadShare",
        id: key,
        resourceType: "remoteEntry",
        url: module2.remoteInfo.entry
      };
      try {
        remoteEntryExports = await module2.getEntry(void 0, resourceContext);
      } catch (error3) {
        remoteEntryExports = await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
          id: key,
          error: error3,
          from: "runtime",
          lifecycle: "beforeLoadShare",
          remote: module2.remoteInfo,
          origin: host
        });
        if (!remoteEntryExports) return;
      } finally {
        if (remoteEntryExports?.init && !module2.initing) {
          module2.remoteEntryExports = remoteEntryExports;
          await module2.init(void 0, void 0, initScope, void 0, resourceContext);
        }
      }
    };
    Object.keys(host.options.shared).forEach((shareName) => {
      host.options.shared[shareName].forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) register(shareName, shared);
      });
    });
    if (host.options.shareStrategy === "version-first" || strategy === "version-first") host.options.remotes.forEach((remote) => {
      if (remote.shareScope === shareScopeName) promises.push(initRemoteModule(remote.name));
    });
    return promises;
  }
  loadShareSync(pkgName, extraOptions) {
    const { host } = this;
    const loadContext = extraOptions?.context;
    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared
    });
    try {
      if (shareOptions?.scope) shareOptions.scope.forEach((shareScope) => {
        this.initializeSharing(shareScope, {
          strategy: shareOptions.strategy,
          from: extraOptions?.from,
          context: loadContext
        });
      });
      const { shared: registeredShared } = getRegisteredShare(this.shareScopeMap, pkgName, shareOptions, this.hooks.lifecycle.resolveShare, loadContext) || {};
      if (registeredShared) {
        if (typeof registeredShared.lib === "function") {
          addUseIn(registeredShared, host.options.name);
          if (!registeredShared.loaded) {
            registeredShared.loaded = true;
            if (registeredShared.from === host.options.name) shareOptions.loaded = true;
          }
          this.emitAfterLoadShare({
            lifecycle: "loadShareSync",
            pkgName,
            shareInfo: shareOptions,
            selectedShared: registeredShared,
            loadContext
          });
          return registeredShared.lib;
        }
        if (typeof registeredShared.get === "function") {
          const module2 = registeredShared.get();
          if (!(module2 instanceof Promise)) {
            addUseIn(registeredShared, host.options.name);
            this.setShared({
              pkgName,
              loaded: true,
              from: host.options.name,
              lib: module2,
              shared: registeredShared
            });
            this.emitAfterLoadShare({
              lifecycle: "loadShareSync",
              pkgName,
              shareInfo: shareOptions,
              selectedShared: registeredShared,
              loadContext
            });
            return module2;
          }
        }
      }
      if (shareOptions.lib) {
        if (!shareOptions.loaded) shareOptions.loaded = true;
        this.emitAfterLoadShare({
          lifecycle: "loadShareSync",
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          loadContext
        });
        return shareOptions.lib;
      }
      if (shareOptions.get) {
        const module2 = shareOptions.get();
        if (module2 instanceof Promise) error2(extraOptions?.from === "build" ? RUNTIME_005 : RUNTIME_006, runtimeDescMap, {
          hostName: host.options.name,
          sharedPkgName: pkgName
        }, void 0, optionsToMFContext(host.options));
        shareOptions.lib = module2;
        this.setShared({
          pkgName,
          loaded: true,
          from: host.options.name,
          lib: shareOptions.lib,
          shared: shareOptions
        });
        this.emitAfterLoadShare({
          lifecycle: "loadShareSync",
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          loadContext
        });
        return shareOptions.lib;
      }
      error2(RUNTIME_006, runtimeDescMap, {
        hostName: host.options.name,
        sharedPkgName: pkgName
      }, void 0, optionsToMFContext(host.options));
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: "loadShareSync",
        pkgName,
        shareInfo: shareOptions,
        error: shareError,
        loadContext
      });
      throw shareError;
    }
  }
  initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
    const { host } = this;
    this.shareScopeMap[scopeName] = shareScope;
    this.hooks.lifecycle.initContainerShareScopeMap.emit({
      shareScope,
      options: host.options,
      origin: host,
      scopeName,
      hostShareScopeMap: extraOptions.hostShareScopeMap
    });
  }
  setShared({ pkgName, shared, from, lib, loading, loaded, get, treeShaking }) {
    const { version: version2, scope = "default", ...shareInfo } = shared;
    const scopes = Array.isArray(scope) ? scope : [scope];
    const mergeAttrs = (shared2) => {
      const merge = (s4, key, val) => {
        if (val && !s4[key]) s4[key] = val;
      };
      const targetShared = treeShaking ? shared2.treeShaking : shared2;
      merge(targetShared, "loaded", loaded);
      merge(targetShared, "loading", loading);
      merge(targetShared, "get", get);
      merge(targetShared, "lib", lib);
    };
    scopes.forEach((sc) => {
      if (!this.shareScopeMap[sc]) this.shareScopeMap[sc] = {};
      if (!this.shareScopeMap[sc][pkgName]) this.shareScopeMap[sc][pkgName] = {};
      if (!this.shareScopeMap[sc][pkgName][version2]) this.shareScopeMap[sc][pkgName][version2] = {
        version: version2,
        scope: [sc],
        ...shareInfo,
        lib
      };
      const registeredShared = this.shareScopeMap[sc][pkgName][version2];
      mergeAttrs(registeredShared);
      if (from && registeredShared.from !== from) registeredShared.from = from;
    });
  }
  _setGlobalShareScopeMap(hostOptions) {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = hostOptions.id || hostOptions.name;
    if (identifier && !globalShareScopeMap[identifier]) globalShareScopeMap[identifier] = this.shareScopeMap;
  }
};

// node_modules/@module-federation/runtime-core/dist/shared/disabled.js
var DisabledSharedHandler = class {
  constructor() {
    this.shareScopeMap = {};
    this.hooks = new PluginSystem({ afterResolve: new AsyncWaterfallHook("afterResolve") });
  }
  registerShared() {
    return {
      newShareInfos: {},
      allShareInfos: {}
    };
  }
  loadShare() {
    throw new Error("Shared dependency loading is disabled by experiments.optimization.disableShared.");
  }
  loadShareSync() {
    throw new Error("Shared dependency loading is disabled by experiments.optimization.disableShared.");
  }
  initializeSharing() {
    return [];
  }
  initShareScopeMap(scopeName, shareScope) {
    this.shareScopeMap[scopeName] = shareScope;
  }
};

// node_modules/@module-federation/runtime-core/dist/remote/index.js
var RemoteHandler = class {
  constructor(host) {
    this.hooks = new PluginSystem({
      beforeRegisterRemote: new SyncWaterfallHook("beforeRegisterRemote"),
      registerRemote: new SyncWaterfallHook("registerRemote"),
      beforeRequest: new AsyncWaterfallHook("beforeRequest"),
      afterMatchRemote: new AsyncHook("afterMatchRemote"),
      onLoad: new AsyncHook("onLoad"),
      afterLoadRemote: new AsyncHook("afterLoadRemote"),
      handlePreloadModule: new SyncHook("handlePreloadModule"),
      errorLoadRemote: new AsyncHook("errorLoadRemote"),
      beforePreloadRemote: new AsyncHook("beforePreloadRemote"),
      generatePreloadAssets: new AsyncHook("generatePreloadAssets"),
      afterPreloadRemote: new AsyncHook("afterPreloadRemote"),
      loadEntry: new AsyncHook()
    });
    this.host = host;
    this.idToRemoteMap = {};
  }
  formatAndRegisterRemote(globalOptions, userOptions) {
    return (userOptions.remotes || []).reduce((res, remote) => {
      this.registerRemote(remote, res, { force: false });
      return res;
    }, globalOptions.remotes);
  }
  setIdToRemoteMap(id, remoteMatchInfo) {
    const { remote, expose } = remoteMatchInfo;
    const { name, alias } = remote;
    this.idToRemoteMap[id] = {
      name: remote.name,
      expose
    };
    if (alias && id.startsWith(name)) {
      const idWithAlias = id.replace(name, alias);
      this.idToRemoteMap[idWithAlias] = {
        name: remote.name,
        expose
      };
      return;
    }
    if (alias && id.startsWith(alias)) {
      const idWithName = id.replace(alias, name);
      this.idToRemoteMap[idWithName] = {
        name: remote.name,
        expose
      };
    }
  }
  async loadRemote(id, options) {
    const { host } = this;
    const startMatchInfo = matchRemoteWithNameAndExpose(host.options.remotes, id);
    let completeRequestId = id;
    let completeExpose = startMatchInfo?.expose;
    let completeRemote = startMatchInfo ? getRemoteInfo(startMatchInfo.remote) : void 0;
    let afterLoadRemoteArgs;
    try {
      const { loadFactory = true } = options || { loadFactory: true };
      const { module: module2, moduleOptions, remoteMatchInfo } = await this.getRemoteModuleAndOptions({ id });
      const { pkgNameOrAlias, remote, expose, id: idRes, remoteSnapshot } = remoteMatchInfo;
      completeRequestId = idRes;
      completeExpose = expose;
      completeRemote = getRemoteInfo(remote);
      const moduleOrFactory = await module2.get(idRes, expose, options, remoteSnapshot);
      const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
        id: idRes,
        pkgNameOrAlias,
        expose,
        exposeModule: loadFactory ? moduleOrFactory : void 0,
        exposeModuleFactory: loadFactory ? void 0 : moduleOrFactory,
        remote,
        options: moduleOptions,
        moduleInstance: module2,
        origin: host
      });
      this.setIdToRemoteMap(id, remoteMatchInfo);
      afterLoadRemoteArgs = {
        id: completeRequestId,
        expose: completeExpose,
        remote: completeRemote,
        options,
        origin: host
      };
      if (typeof moduleWrapper === "function") return moduleWrapper;
      return moduleOrFactory;
    } catch (error3) {
      const { from = "runtime" } = options || { from: "runtime" };
      let failOver;
      try {
        failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
          id,
          error: error3,
          from,
          lifecycle: "onLoad",
          expose: completeExpose,
          remote: completeRemote,
          origin: host
        });
      } catch (hookError) {
        afterLoadRemoteArgs = {
          id: completeRequestId,
          expose: completeExpose,
          remote: completeRemote,
          options,
          error: hookError,
          origin: host
        };
        throw hookError;
      }
      if (!failOver) {
        afterLoadRemoteArgs = {
          id: completeRequestId,
          expose: completeExpose,
          remote: completeRemote,
          options,
          error: error3,
          origin: host
        };
        throw error3;
      }
      afterLoadRemoteArgs = {
        id: completeRequestId,
        expose: completeExpose,
        remote: completeRemote,
        options,
        error: error3,
        origin: host,
        recovered: true
      };
      return failOver;
    } finally {
      if (afterLoadRemoteArgs) await this.hooks.lifecycle.afterLoadRemote.emit(afterLoadRemoteArgs);
    }
  }
  async preloadRemote(preloadOptions) {
    const { host } = this;
    const preloadResults = [];
    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOps: preloadOptions,
      options: host.options,
      origin: host
    });
    const preloadOps = formatPreloadArgs(host.options.remotes, preloadOptions);
    const createPreloadAssetOps = (ops) => {
      const { preloadConfig, remote } = ops;
      const exposes = preloadConfig.exposes || [];
      if (!exposes.length) return [{
        ops,
        id: `${remote.name}/*`
      }];
      return exposes.map((expose) => ({
        ops: {
          ...ops,
          preloadConfig: {
            ...preloadConfig,
            exposes: [expose]
          }
        },
        id: composeRemoteRequestId(remote.name, expose)
      }));
    };
    let preloadError;
    await Promise.all(preloadOps.flatMap(createPreloadAssetOps).map(async (assetOps) => {
      const { ops, id: preloadId } = assetOps;
      const { remote, preloadConfig } = ops;
      const remoteInfo = getRemoteInfo(remote);
      try {
        const { globalSnapshot, remoteSnapshot } = await host.snapshotHandler.loadRemoteSnapshotInfo({
          moduleInfo: remote,
          id: preloadId,
          initiator: "preloadRemote"
        });
        const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
          origin: host,
          preloadOptions: ops,
          remote,
          remoteInfo,
          globalSnapshot,
          remoteSnapshot
        });
        if (!assets) return;
        const results = await preloadAssets(remoteInfo, host, assets, true, {
          initiator: "preloadRemote",
          id: preloadId
        }, preloadConfig.recordPreloadedAssets);
        preloadResults.push({
          remote,
          remoteInfo,
          preloadConfig,
          id: preloadId,
          results
        });
      } catch (error3) {
        preloadResults.push({
          remote,
          remoteInfo,
          preloadConfig,
          id: preloadId,
          results: [{
            url: remoteInfo.entry,
            status: "error",
            resourceType: /\.json(?:$|[?#])/i.test(remoteInfo.entry) ? "manifest" : "remoteEntry",
            initiator: "preloadRemote",
            id: preloadId,
            error: error3
          }]
        });
      }
    }));
    const failedResults = preloadResults.flatMap((preloadResult) => preloadResult.results.filter((result) => result.status === "error" || result.status === "timeout"));
    if (failedResults.length > 0) {
      preloadError = /* @__PURE__ */ new Error(`preloadRemote failed to load ${failedResults.length} resource(s).`);
      Object.assign(preloadError, {
        results: preloadResults,
        failedResults
      });
    }
    await this.hooks.lifecycle.afterPreloadRemote.emit({
      preloadOps: preloadOptions,
      options: host.options,
      origin: host,
      results: preloadResults,
      error: preloadError
    });
    if (preloadError) throw preloadError;
  }
  registerRemotes(remotes, options) {
    const { host } = this;
    remotes.forEach((remote) => {
      this.registerRemote(remote, host.options.remotes, { force: options?.force });
    });
  }
  initRawContainer(name, url, container) {
    const { host } = this;
    const module2 = new Module$1({
      host,
      remoteInfo: getRemoteInfo({
        name,
        entry: url
      })
    });
    module2.remoteEntryExports = container;
    host.moduleCache.set(name, module2);
    return module2;
  }
  async getRemoteModuleAndOptions(options) {
    const { host } = this;
    const { id } = options;
    let loadRemoteArgs;
    try {
      loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
        id,
        options: host.options,
        origin: host
      });
    } catch (error3) {
      loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        options: host.options,
        origin: host,
        from: "runtime",
        error: error3,
        lifecycle: "beforeRequest"
      });
      if (!loadRemoteArgs) throw error3;
    }
    const { id: idRes } = loadRemoteArgs;
    const remoteSplitInfo = matchRemoteWithNameAndExpose(host.options.remotes, idRes);
    if (!remoteSplitInfo) try {
      error2(RUNTIME_004, runtimeDescMap, {
        hostName: host.options.name,
        requestId: idRes
      }, void 0, optionsToMFContext(host.options));
    } catch (matchError) {
      await this.hooks.lifecycle.afterMatchRemote.emit({
        id: idRes,
        options: host.options,
        error: matchError,
        origin: host
      });
      throw matchError;
    }
    const { remote: rawRemote } = remoteSplitInfo;
    const remoteInfo = getRemoteInfo(rawRemote);
    await this.hooks.lifecycle.afterMatchRemote.emit({
      id: idRes,
      ...remoteSplitInfo,
      options: host.options,
      remoteInfo,
      origin: host
    });
    const matchInfo = await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
      id: idRes,
      ...remoteSplitInfo,
      options: host.options,
      origin: host,
      remoteInfo
    });
    const { remote, expose } = matchInfo;
    assert2(remote && expose, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`);
    let module2 = host.moduleCache.get(remote.name);
    const moduleOptions = {
      host,
      remoteInfo
    };
    if (!module2) {
      module2 = new Module$1(moduleOptions);
      host.moduleCache.set(remote.name, module2);
    }
    return {
      module: module2,
      moduleOptions,
      remoteMatchInfo: matchInfo
    };
  }
  registerRemote(remote, targetRemotes, options) {
    const { host } = this;
    const normalizeRemote = () => {
      if (remote.alias) {
        const findEqual = targetRemotes.find((item) => remote.alias && (item.name.startsWith(remote.alias) || item.alias?.startsWith(remote.alias)));
        assert2(!findEqual, `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`);
      }
      if ("entry" in remote) {
        if (isBrowserEnvValue && typeof window !== "undefined" && !remote.entry.startsWith("http")) remote.entry = new URL(remote.entry, window.location.origin).href;
      }
      if (!remote.shareScope) remote.shareScope = DEFAULT_SCOPE;
      if (!remote.type) remote.type = DEFAULT_REMOTE_TYPE;
    };
    this.hooks.lifecycle.beforeRegisterRemote.emit({
      remote,
      origin: host
    });
    const registeredRemote = targetRemotes.find((item) => item.name === remote.name);
    if (!registeredRemote) {
      normalizeRemote();
      targetRemotes.push(remote);
      this.hooks.lifecycle.registerRemote.emit({
        remote,
        origin: host
      });
    } else {
      const messages = [`The remote "${remote.name}" is already registered.`, "Please note that overriding it may cause unexpected errors."];
      if (options?.force) {
        this.removeRemote(registeredRemote);
        normalizeRemote();
        targetRemotes.push(remote);
        this.hooks.lifecycle.registerRemote.emit({
          remote,
          origin: host
        });
        warn(messages.join(" "));
      }
    }
  }
  removeRemote(remote) {
    try {
      const { host } = this;
      const { name } = remote;
      const remoteIndex = host.options.remotes.findIndex((item) => item.name === name);
      if (remoteIndex !== -1) host.options.remotes.splice(remoteIndex, 1);
      const globalSnapshotKey = getInfoWithoutType(CurrentGlobal.__FEDERATION__.moduleInfo, getFMId(remote)).key;
      delete CurrentGlobal.__FEDERATION__.moduleInfo[globalSnapshotKey];
      if ("entry" in remote) {
        host.snapshotHandler.manifestCache.delete(remote.entry);
        delete Global.__FEDERATION__.__MANIFEST_LOADING__[remote.entry];
      }
      const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
      if (hostGlobalSnapshot) {
        const remoteKey = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
        if (remoteKey) delete hostGlobalSnapshot.remotesInfo[remoteKey];
      }
      const loadedModule = host.moduleCache.get(remote.name);
      if (loadedModule) {
        const remoteInfo = loadedModule.remoteInfo;
        const key = remoteInfo.entryGlobalName;
        if (CurrentGlobal[key]) if (Object.getOwnPropertyDescriptor(CurrentGlobal, key)?.configurable) delete CurrentGlobal[key];
        else CurrentGlobal[key] = void 0;
        const remoteEntryUniqueKey = getRemoteEntryUniqueKey(loadedModule.remoteInfo);
        if (globalLoading[remoteEntryUniqueKey]) delete globalLoading[remoteEntryUniqueKey];
        let remoteInsId = remoteInfo.buildVersion ? composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
        const remoteInsIndex = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins) => {
          if (remoteInfo.buildVersion) return ins.options.id === remoteInsId;
          else return ins.name === remoteInsId;
        });
        if (remoteInsIndex !== -1) {
          const remoteIns = CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
          remoteInsId = remoteIns.options.id || remoteInsId;
          const globalShareScopeMap = getGlobalShareScope();
          let isAllSharedNotUsed = true;
          const needDeleteKeys = [];
          Object.keys(globalShareScopeMap).forEach((instId) => {
            const shareScopeMap = globalShareScopeMap[instId];
            shareScopeMap && Object.keys(shareScopeMap).forEach((shareScope) => {
              const shareScopeVal = shareScopeMap[shareScope];
              shareScopeVal && Object.keys(shareScopeVal).forEach((shareName) => {
                const sharedPkgs = shareScopeVal[shareName];
                sharedPkgs && Object.keys(sharedPkgs).forEach((shareVersion) => {
                  const shared = sharedPkgs[shareVersion];
                  if (shared && typeof shared === "object" && shared.from === remoteInfo.name) if (shared.loaded || shared.loading) {
                    shared.useIn = shared.useIn.filter((usedHostName) => usedHostName !== remoteInfo.name);
                    if (shared.useIn.length) isAllSharedNotUsed = false;
                    else needDeleteKeys.push([
                      instId,
                      shareScope,
                      shareName,
                      shareVersion
                    ]);
                  } else needDeleteKeys.push([
                    instId,
                    shareScope,
                    shareName,
                    shareVersion
                  ]);
                });
              });
            });
          });
          if (isAllSharedNotUsed) {
            remoteIns.shareScopeMap = {};
            delete globalShareScopeMap[remoteInsId];
          }
          needDeleteKeys.forEach(([insId, shareScope, shareName, shareVersion]) => {
            delete globalShareScopeMap[insId]?.[shareScope]?.[shareName]?.[shareVersion];
          });
          CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
        }
        host.moduleCache.delete(remote.name);
      }
    } catch (err) {
      logger2.error(`removeRemote failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

// node_modules/@module-federation/runtime-core/dist/core.js
var USE_SNAPSHOT = typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === "boolean" ? !FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN : true;
var USE_REMOTE = typeof FEDERATION_OPTIMIZE_NO_REMOTE === "boolean" ? !FEDERATION_OPTIMIZE_NO_REMOTE : true;
var USE_SHARED = typeof FEDERATION_OPTIMIZE_NO_SHARED === "boolean" ? !FEDERATION_OPTIMIZE_NO_SHARED : true;
var ModuleFederation = class {
  constructor(userOptions) {
    this.hooks = new PluginSystem({
      beforeInit: new SyncWaterfallHook("beforeInit"),
      init: new SyncHook(),
      beforeInitContainer: new AsyncWaterfallHook("beforeInitContainer"),
      initContainer: new AsyncWaterfallHook("initContainer")
    });
    this.version = "2.9.0";
    this.moduleCache = /* @__PURE__ */ new Map();
    this.loaderHook = new PluginSystem({
      getModuleInfo: new SyncHook(),
      createScript: new SyncHook(),
      createLink: new SyncHook(),
      fetch: new AsyncHook(),
      loadEntryError: new AsyncHook(),
      afterLoadEntry: new AsyncHook("afterLoadEntry"),
      beforeInitRemote: new AsyncHook("beforeInitRemote"),
      afterInitRemote: new AsyncHook("afterInitRemote"),
      beforeGetExpose: new AsyncHook("beforeGetExpose"),
      afterGetExpose: new AsyncHook("afterGetExpose"),
      beforeExecuteFactory: new AsyncHook("beforeExecuteFactory"),
      afterExecuteFactory: new AsyncHook("afterExecuteFactory"),
      getModuleFactory: new AsyncHook()
    });
    this.bridgeHook = new PluginSystem({
      beforeBridgeRender: new SyncHook(),
      afterBridgeRender: new SyncHook(),
      beforeBridgeDestroy: new SyncHook(),
      afterBridgeDestroy: new SyncHook(),
      afterBridgeRouteSync: new SyncHook()
    });
    const plugins = USE_REMOTE && USE_SNAPSHOT ? [snapshotPlugin(), generatePreloadAssetsPlugin()] : [];
    const defaultOptions = {
      id: getBuilderId(),
      name: userOptions.name,
      plugins,
      remotes: [],
      shared: {},
      inBrowser: isBrowserEnvValue
    };
    this.name = userOptions.name;
    this.options = defaultOptions;
    this.snapshotHandler = USE_REMOTE ? new SnapshotHandler(this) : new DisabledSnapshotHandler();
    this.sharedHandler = USE_SHARED ? new SharedHandler(this) : new DisabledSharedHandler();
    this.remoteHandler = USE_REMOTE ? new RemoteHandler(this) : new DisabledRemoteHandler();
    this.shareScopeMap = this.sharedHandler.shareScopeMap;
    this.registerPlugins([...defaultOptions.plugins, ...userOptions.plugins || []]);
    this.options = this.formatOptions(defaultOptions, userOptions);
  }
  initOptions(userOptions) {
    if (userOptions.name && userOptions.name !== this.options.name) error2(getShortErrorMsg(RUNTIME_010, runtimeDescMap));
    this.registerPlugins(userOptions.plugins);
    const options = this.formatOptions(this.options, userOptions);
    this.options = options;
    return options;
  }
  async loadShare(pkgName, extraOptions) {
    return this.sharedHandler.loadShare(pkgName, extraOptions);
  }
  loadShareSync(pkgName, extraOptions) {
    return this.sharedHandler.loadShareSync(pkgName, extraOptions);
  }
  initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
    return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
  }
  initRawContainer(name, url, container) {
    return this.remoteHandler.initRawContainer(name, url, container);
  }
  async loadRemote(id, options) {
    return this.remoteHandler.loadRemote(id, options);
  }
  async preloadRemote(preloadOptions) {
    return this.remoteHandler.preloadRemote(preloadOptions);
  }
  initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
    this.sharedHandler.initShareScopeMap(scopeName, shareScope, extraOptions);
  }
  formatOptions(globalOptions, userOptions) {
    const shared = USE_SHARED ? formatShareConfigs(globalOptions, userOptions).allShareInfos : {};
    const { userOptions: userOptionsRes, options: globalOptionsRes } = this.hooks.lifecycle.beforeInit.emit({
      origin: this,
      userOptions,
      options: globalOptions,
      shareInfo: shared
    });
    const remotes = this.remoteHandler.formatAndRegisterRemote(globalOptionsRes, userOptionsRes);
    const { allShareInfos } = this.sharedHandler.registerShared(globalOptionsRes, userOptionsRes);
    const plugins = [...globalOptionsRes.plugins];
    if (userOptionsRes.plugins) userOptionsRes.plugins.forEach((plugin) => {
      if (!plugins.includes(plugin)) plugins.push(plugin);
    });
    const optionsRes = {
      ...globalOptions,
      ...userOptions,
      plugins,
      remotes,
      shared: allShareInfos,
      id: userOptionsRes.id || globalOptions.id
    };
    this.hooks.lifecycle.init.emit({
      origin: this,
      options: optionsRes
    });
    return optionsRes;
  }
  registerPlugins(plugins) {
    this.options.plugins = registerPlugins(plugins, this);
  }
  registerRemotes(remotes, options) {
    return this.remoteHandler.registerRemotes(remotes, options);
  }
  registerShared(shared) {
    this.sharedHandler.registerShared(this.options, {
      ...this.options,
      shared
    });
  }
};

// node_modules/@module-federation/runtime/dist/index.js
function createInstance(options) {
  const instance = new (getGlobalFederationConstructor() || ModuleFederation)({
    id: `${options.name}@${options.version || Date.now()}`,
    ...options
  });
  setGlobalFederationInstance(instance);
  return instance;
}
setGlobalFederationConstructor(ModuleFederation);

// libs/embed-libs/embed/src/lib/shared/helpers/remote-federation.ts
var federationRuntime = createInstance({
  name: "luzmo-embed-runtime",
  remotes: []
});
var remoteCache = /* @__PURE__ */ new Map();
var remoteCounter = 0;
var preconnectedOrigins = /* @__PURE__ */ new Set();
function injectPreconnect(appServer) {
  if (typeof document === "undefined") {
    return;
  }
  let origin;
  try {
    origin = new URL(removeTrailingSlash(appServer)).origin;
  } catch {
    return;
  }
  if (preconnectedOrigins.has(origin)) {
    return;
  }
  preconnectedOrigins.add(origin);
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = origin;
  link.crossOrigin = "anonymous";
  (document.head ?? document.documentElement).append(link);
}
function getManifestEntry(appServer, componentName) {
  const baseUrl = removeTrailingSlash(appServer);
  if (appServer.startsWith("http://localhost")) {
    return `${baseUrl}/mf-manifest.json`;
  }
  switch (componentName) {
    case "DashboardApp":
    case "VizItemApp": {
      return `${baseUrl}/dashboard-app/mf-manifest.json`;
    }
    case "IQApp": {
      return `${baseUrl}/iq-app/mf-manifest.json`;
    }
  }
}
function getCacheKey(appServer, componentName) {
  return `${appServer}|${componentName}`;
}
function getOrCreateRemote(appServer, componentName) {
  const cacheKey = getCacheKey(appServer, componentName);
  const cachedRemote = remoteCache.get(cacheKey);
  if (cachedRemote) {
    return cachedRemote;
  }
  const remote = {
    entry: getManifestEntry(appServer, componentName),
    registered: false,
    remoteName: `luzmo_embed_${remoteCounter++}`
  };
  remoteCache.set(cacheKey, remote);
  return remote;
}
function loadLibrary(appServer, componentName = "DashboardApp") {
  injectPreconnect(appServer);
  const remote = getOrCreateRemote(appServer, componentName);
  if (remote.module) {
    return Promise.resolve(remote.module);
  }
  if (remote.loadPromise) {
    return remote.loadPromise;
  }
  if (!remote.registered) {
    federationRuntime.registerRemotes([
      {
        name: remote.remoteName,
        entry: remote.entry
      }
    ]);
    remote.registered = true;
  }
  remote.loadPromise = federationRuntime.loadRemote(`${remote.remoteName}/${componentName}`).then((module2) => {
    if (!module2) {
      throw new Error(`Failed to load "${componentName}" from "${remote.entry}".`);
    }
    remote.module = module2;
    return module2;
  }).finally(() => {
    remote.loadPromise = void 0;
  });
  return remote.loadPromise;
}
function preloadDashboard(appServer = "https://app.luzmo.com") {
  loadLibrary(appServer, "DashboardApp").catch(() => {
  });
}
function preloadVizItem(appServer = "https://app.luzmo.com") {
  loadLibrary(appServer, "VizItemApp").catch(() => {
  });
}
function preloadIQ(appServer = "https://app.luzmo.com") {
  loadLibrary(appServer, "IQApp").catch(() => {
  });
}

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e7, o7) {
    if (this._$cssResult$ = true, o7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e7;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e7 = void 0 !== s4 && 1 === s4.length;
      e7 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e7 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e7) => {
  const o7 = 1 === t4.length ? t4[0] : e7.reduce((e8, s4, o8) => e8 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o8 + 1], t4[0]);
  return new n(o7, t4, s);
};
var S = (s4, o7) => {
  if (e) s4.adoptedStyleSheets = o7.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e7 of o7) {
    const o8 = document.createElement("style"), n6 = t.litNonce;
    void 0 !== n6 && o8.setAttribute("nonce", n6), o8.textContent = e7.cssText, s4.appendChild(o8);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e7 = "";
  for (const s4 of t5.cssRules) e7 += s4.cssText;
  return r(e7);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i7 = t4;
  switch (s4) {
    case Boolean:
      i7 = null !== t4;
      break;
    case Number:
      i7 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i7 = JSON.parse(t4);
      } catch (t5) {
        i7 = null;
      }
  }
  return i7;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i7 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i7, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i7) {
    const { get: e7, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e7, set(s5) {
      const h3 = e7?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i7);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i7 of s4) this.createProperty(i7, t5[i7]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i7] of s4) this.elementProperties.set(t5, i7);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i7 = this._$Eu(t5, s4);
      void 0 !== i7 && this._$Eh.set(i7, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i7 = [];
    if (Array.isArray(s4)) {
      const e7 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e7) i7.unshift(c(s5));
    } else void 0 !== s4 && i7.push(c(s4));
    return i7;
  }
  static _$Eu(t4, s4) {
    const i7 = s4.attribute;
    return false === i7 ? void 0 : "string" == typeof i7 ? i7 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i7 of s4.keys()) this.hasOwnProperty(i7) && (t4.set(i7, this[i7]), delete this[i7]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i7) {
    this._$AK(t4, i7);
  }
  _$ET(t4, s4) {
    const i7 = this.constructor.elementProperties.get(t4), e7 = this.constructor._$Eu(t4, i7);
    if (void 0 !== e7 && true === i7.reflect) {
      const h3 = (void 0 !== i7.converter?.toAttribute ? i7.converter : u).toAttribute(s4, i7.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e7) : this.setAttribute(e7, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i7 = this.constructor, e7 = i7._$Eh.get(t4);
    if (void 0 !== e7 && this._$Em !== e7) {
      const t5 = i7.getPropertyOptions(e7), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e7;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e7] = r6 ?? this._$Ej?.get(e7) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i7, e7 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e7 && (h3 = this[t4]), i7 ??= r6.getPropertyOptions(t4), !((i7.hasChanged ?? f)(h3, s4) || i7.useDefault && i7.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i7)))) return;
      this.C(t4, s4, i7);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i7, reflect: e7, wrapped: h3 }, r6) {
    i7 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i7 || (s4 = void 0), this._$AL.set(t4, s4)), true === e7 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i7] of t5) {
        const { wrapped: t6 } = i7, e7 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e7 || this.C(s5, void 0, i7, e7);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i7, ...s4) => ({ _$litType$: t4, strings: i7, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i7) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i7) : i7;
}
var N = (t4, i7) => {
  const s4 = t4.length - 1, e7 = [];
  let n6, l3 = 2 === i7 ? "<svg>" : 3 === i7 ? "<math>" : "", c4 = v;
  for (let i8 = 0; i8 < s4; i8++) {
    const s5 = t4[i8];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n6 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n6 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n6 = void 0);
    const x2 = c4 === p2 && t4[i8 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e7.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i8 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i7 ? "</svg>" : 3 === i7 ? "</math>" : "")), e7];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i7 }, e7) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i7);
    if (this.el = _S.createElement(f3, e7), P.currentNode = this.el.content, 2 === i7 || 3 === i7) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i8 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e8 = /([.?@])?(.*)/.exec(i8);
          d3.push({ type: 1, index: l3, name: e8[2], strings: s4, ctor: "." === e8[1] ? I : "?" === e8[1] ? L : "@" === e8[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i8 = t5.length - 1;
          if (i8 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i8; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i8], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i7) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i7, s4 = t4, e7) {
  if (i7 === E) return i7;
  let h3 = void 0 !== e7 ? s4._$Co?.[e7] : s4._$Cl;
  const o7 = a2(i7) ? void 0 : i7._$litDirective$;
  return h3?.constructor !== o7 && (h3?._$AO?.(false), void 0 === o7 ? h3 = void 0 : (h3 = new o7(t4), h3._$AT(t4, s4, e7)), void 0 !== e7 ? (s4._$Co ??= [])[e7] = h3 : s4._$Cl = h3), void 0 !== h3 && (i7 = M(t4, h3._$AS(t4, i7.values), h3, e7)), i7;
}
var R = class {
  constructor(t4, i7) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i7 }, parts: s4 } = this._$AD, e7 = (t4?.creationScope ?? l2).importNode(i7, true);
    P.currentNode = e7;
    let h3 = P.nextNode(), o7 = 0, n6 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o7 === r6.index) {
        let i8;
        2 === r6.type ? i8 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i8 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i8 = new Z(h3, this, t4)), this._$AV.push(i8), r6 = s4[++n6];
      }
      o7 !== r6?.index && (h3 = P.nextNode(), o7++);
    }
    return P.currentNode = l2, e7;
  }
  p(t4) {
    let i7 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i7), i7 += s4.strings.length - 2) : s4._$AI(t4[i7])), i7++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i7, s4, e7) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i7, this._$AM = s4, this.options = e7, this._$Cv = e7?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i7 = this._$AM;
    return void 0 !== i7 && 11 === t4?.nodeType && (t4 = i7.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i7 = this) {
    t4 = M(this, t4, i7), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i7, _$litType$: s4 } = t4, e7 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e7) this._$AH.p(i7);
    else {
      const t5 = new R(e7, this), s5 = t5.u(this.options);
      t5.p(i7), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i7 = C.get(t4.strings);
    return void 0 === i7 && C.set(t4.strings, i7 = new S2(t4)), i7;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s4, e7 = 0;
    for (const h3 of t4) e7 === i7.length ? i7.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i7[e7], s4._$AI(h3), e7++;
    e7 < i7.length && (this._$AR(s4 && s4._$AB.nextSibling, e7), i7.length = e7);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i7, s4, e7, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i7, this._$AM = e7, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i7 = this, s4, e7) {
    const h3 = this.strings;
    let o7 = false;
    if (void 0 === h3) t4 = M(this, t4, i7, 0), o7 = !a2(t4) || t4 !== this._$AH && t4 !== E, o7 && (this._$AH = t4);
    else {
      const e8 = t4;
      let n6, r6;
      for (t4 = h3[0], n6 = 0; n6 < h3.length - 1; n6++) r6 = M(this, e8[s4 + n6], i7, n6), r6 === E && (r6 = this._$AH[n6]), o7 ||= !a2(r6) || r6 !== this._$AH[n6], r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n6 + 1]), this._$AH[n6] = r6;
    }
    o7 && !e7 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i7, s4, e7, h3) {
    super(t4, i7, s4, e7, h3), this.type = 5;
  }
  _$AI(t4, i7 = this) {
    if ((t4 = M(this, t4, i7, 0) ?? A) === E) return;
    const s4 = this._$AH, e7 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e7);
    e7 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i7, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.2");
var D = (t4, i7, s4) => {
  const e7 = s4?.renderBefore ?? i7;
  let h3 = e7._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e7._$litPart$ = h3 = new k(i7.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e7, r6) => {
  const { kind: n6, metadata: i7 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i7);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i7, s4 = /* @__PURE__ */ new Map()), "setter" === n6 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n6) {
    const { name: o7 } = r6;
    return { set(r7) {
      const n7 = e7.get.call(this);
      e7.set.call(this, r7), this.requestUpdate(o7, n7, t4, true, r7);
    }, init(e8) {
      return void 0 !== e8 && this.C(o7, void 0, t4, e8), e8;
    } };
  }
  if ("setter" === n6) {
    const { name: o7 } = r6;
    return function(r7) {
      const n7 = this[o7];
      e7.call(this, r7), this.requestUpdate(o7, n7, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n6);
};
function n4(t4) {
  return (e7, o7) => "object" == typeof o7 ? r4(t4, e7, o7) : ((t5, e8, o8) => {
    const r6 = e8.hasOwnProperty(o8);
    return e8.constructor.createProperty(o8, t5), r6 ? Object.getOwnPropertyDescriptor(e8, o8) : void 0;
  })(t4, e7, o7);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/base.js
var e4 = (e7, t4, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t4 && Object.defineProperty(e7, t4, c4), c4);

// node_modules/@lit/reactive-element/decorators/query.js
function e5(e7, r6) {
  return (n6, s4, i7) => {
    const o7 = (t4) => t4.renderRoot?.querySelector(e7) ?? null;
    if (r6) {
      const { get: e8, set: r7 } = "object" == typeof s4 ? n6 : i7 ?? /* @__PURE__ */ (() => {
        const t4 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t4];
        }, set(e9) {
          this[t4] = e9;
        } };
      })();
      return e4(n6, s4, { get() {
        let t4 = e8.call(this);
        return void 0 === t4 && (t4 = o7(this), (null !== t4 || this.hasUpdated) && r7.call(this, t4)), t4;
      } });
    }
    return e4(n6, s4, { get() {
      return o7(this);
    } });
  };
}

// node_modules/lit-html/directive.js
var t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e6 = (t4) => (...e7) => ({ _$litDirective$: t4, values: e7 });
var i5 = class {
  constructor(t4) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t4, e7, i7) {
    this._$Ct = t4, this._$AM = e7, this._$Ci = i7;
  }
  _$AS(t4, e7) {
    return this.update(t4, e7);
  }
  update(t4, e7) {
    return this.render(...e7);
  }
};

// node_modules/lit-html/directives/style-map.js
var n5 = "important";
var i6 = " !" + n5;
var o6 = e6(class extends i5 {
  constructor(t4) {
    if (super(t4), t4.type !== t3.ATTRIBUTE || "style" !== t4.name || t4.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t4) {
    return Object.keys(t4).reduce((e7, r6) => {
      const s4 = t4[r6];
      return null == s4 ? e7 : e7 + `${r6 = r6.includes("-") ? r6 : r6.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s4};`;
    }, "");
  }
  update(e7, [r6]) {
    const { style: s4 } = e7.element;
    if (void 0 === this.ft) return this.ft = new Set(Object.keys(r6)), this.render(r6);
    for (const t4 of this.ft) null == r6[t4] && (this.ft.delete(t4), t4.includes("-") ? s4.removeProperty(t4) : s4[t4] = null);
    for (const t4 in r6) {
      const e8 = r6[t4];
      if (null != e8) {
        this.ft.add(t4);
        const r7 = "string" == typeof e8 && e8.endsWith(i6);
        t4.includes("-") || r7 ? s4.setProperty(t4, r7 ? e8.slice(0, -11) : e8, r7 ? n5 : "") : s4[t4] = e8;
      }
    }
    return E;
  }
});

// libs/embed-libs/embed/package.json
var version = "8.1.0";

// libs/embed-libs/embed/src/lib/utils/embed-error.utils.ts
function buildEmbedErrorDetail(errorMsg) {
  const payload = {
    type: "error",
    errorMsg,
    error: { msg: errorMsg }
  };
  return { ...payload, data: payload };
}
function firstString(...values) {
  return values.find((value) => typeof value === "string" && value.length > 0);
}
function normalizeEmbedErrorDetail(detail) {
  const wrapped = detail;
  const fromWrapped = wrapped?.data;
  const fromDetail = detail && typeof detail === "object" ? detail : void 0;
  const raw = fromWrapped ?? fromDetail ?? {};
  const errorMsg = firstString(raw.errorMsg, raw.error?.msg) ?? "Unknown error";
  return buildEmbedErrorDetail(errorMsg);
}

// libs/embed-libs/embed/src/lib/luzmo-service.ts
var LuzmoDashboardService = class {
  constructor() {
    this._dashboardComponents = [];
  }
};
var luzmo_service_default = new LuzmoDashboardService();

// libs/embed-libs/embed/src/lib/utils/event-bus-handler.ts
var _setEventHandler = () => {
  if (typeof window.__luzmoMessageHandler === "function") {
    return;
  }
  window.__luzmoMessageHandler = (event) => {
    const dashboardComponent = luzmo_service_default._dashboardComponents.find(
      (c4) => event.data.name === c4._iframeId
    );
    if (!dashboardComponent) {
      return;
    }
    switch (event.data?.type) {
      case "load": {
        dashboardComponent.dispatchEvent(
          new CustomEvent("load", { detail: { data: event.data } })
        );
        if (dashboardComponent._loadTimeoutHandle) {
          clearTimeout(dashboardComponent._loadTimeoutHandle);
          dashboardComponent._loadTimeoutHandle = void 0;
        }
        dashboardComponent.iframeLoaded = true;
        dashboardComponent.dimensions = event.data.dimensions;
        dashboardComponent._calculateDimAfterDashboardLoaded();
        break;
      }
      case "error": {
        dashboardComponent._handleEmbedError(event.data);
        break;
      }
      case "data": {
        resolvePromise(
          dashboardComponent,
          event.data.requestId,
          event.data.data
        );
        break;
      }
      case "filters": {
        resolvePromise(
          dashboardComponent,
          event.data.requestId,
          event.data.filters
        );
        break;
      }
      case "insights": {
        if (event.data.error) {
          rejectPromise(
            dashboardComponent,
            event.data.requestId,
            new Error(event.data.error.message)
          );
        } else {
          resolvePromise(
            dashboardComponent,
            event.data.requestId,
            event.data.summary
          );
        }
        break;
      }
      case "dashboardContext": {
        resolvePromise(
          dashboardComponent,
          event.data.requestId,
          event.data.context
        );
        break;
      }
      case "getAccessibleDashboards": {
        resolvePromise(
          dashboardComponent,
          event.data.requestId,
          event.data.accessibleDashboards
        );
        break;
      }
      case "dashboardAction": {
        dashboardComponent.dispatchEvent(
          new CustomEvent("dashboardAction", { detail: { data: event.data } })
        );
        break;
      }
      case "export": {
        if (event.data.error) {
          rejectPromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        } else {
          dashboardComponent.dispatchEvent(
            new CustomEvent("exported", { detail: { data: event.data } })
          );
          resolvePromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        }
        break;
      }
      case "changedFilters": {
        dashboardComponent.dispatchEvent(
          new CustomEvent("changedFilters", { detail: { data: event.data } })
        );
        break;
      }
      case "contextChanged": {
        dashboardComponent.dispatchEvent(
          new CustomEvent("contextChanged", { detail: { data: event.data } })
        );
        break;
      }
      case "customEvent": {
        dashboardComponent.dispatchEvent(
          new CustomEvent("customEvent", { detail: { data: event.data } })
        );
        break;
      }
      case "chartsRendered":
      // TODO remove once chartsRendered is changed to itemsRendered in FE app
      case "itemsRendered": {
        event.data.type = "itemsRendered";
        dashboardComponent.dispatchEvent(
          new CustomEvent("itemsRendered", { detail: { data: event.data } })
        );
        break;
      }
      case "setEditMode": {
        if (event.data.error) {
          rejectPromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        } else {
          resolvePromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
          dashboardComponent.params.editMode = event.data.editMode;
          dashboardComponent._containerStyle = containerStyles(dashboardComponent);
          if (dashboardComponent.dimensions) {
            _setCalculatedDimensions(dashboardComponent);
          }
        }
        break;
      }
      case "calculatedDimensions": {
        dashboardComponent.dimensions = event.data.dimensions;
        _setCalculatedDimensions(dashboardComponent);
        break;
      }
      case "trackViewport": {
        if (event.data.enabled) {
          dashboardComponent._startViewportTracking();
        } else {
          dashboardComponent._stopViewportTracking();
        }
        break;
      }
      case "setSelectedData":
      case "setFilters": {
        if (event.data.error) {
          rejectPromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        } else {
          resolvePromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        }
        break;
      }
      case "setPreview": {
        if (event.data.error) {
          rejectPromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        } else {
          resolvePromise(
            dashboardComponent,
            event.data.requestId,
            event.data
          );
        }
        break;
      }
    }
  };
  window.addEventListener("message", window.__luzmoMessageHandler, false);
};

// libs/embed-libs/embed/src/lib/dashboard/dashboard-styles.ts
var dashboardStyles = i`
  :host {
    display: block;
    height: 100%;
  }

  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  :host {
    position: relative;
    width: 100%;
  }

  .luzmo-embed-dashboard {
    background: transparent;
    padding: 0;
    border: 0;
  }

  .luzmo-embed-dashboard-ede {
  }

  .luzmo-embed-container-ede {
    width: 100%;
    height: 100%;
  }

  /*
   * Web component mode: the dashboard app renders directly (no iframe). Make its host fill the
   * sized .dashboard-container so the app's internal height:100% chain resolves to the calculated
   * dashboard height - exactly like the iframe gets its height. Without this the app collapses to
   * its intrinsic size and its inner scroll container produces a second scrollbar, and content can
   * spill outside the container.
   */
  #dashboard-wc-container {
    width: 100%;
    height: 100%;
  }

  #dashboard-wc-container dashboard-component {
    display: block;
    width: 100%;
    height: 100%;
  }

  .luzmo-container-loader {
    width: 100%;
    position: relative;
  }

  .luzmo-lc {
    margin: 0 auto;
  }

  .luzmo-embed-container:not(.luzmo-embed-container-ede) .luzmo-container-loader {
    height: 100% !important;
  }

  .luzmo-embed-container:not(.luzmo-embed-container-ede) .luzmo-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .luzmo-embed-container:not(.luzmo-embed-container-ede) .luzmo-lc {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 !important;
  }

  .luzmo-embed-container:not(.luzmo-embed-container-ede) .luzmo-loading-message {
    height: auto;
    margin: 12px 0 0;
    line-height: 1.5;
    font-weight: 300;
  }

  .luzmo-loading-message {
    width: 100%;
    height: 20px;
    text-align: center;
    margin-bottom: 16px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 14px;
  }

  .luzmo-loading-circle {
    box-sizing: border-box;
    margin: 16px auto;
    position: relative;
    text-indent: -9999em;
    animation: spin 0.6s infinite linear;
  }

  .luzmo-loading-circle,
  .luzmo-loading-circle:after {
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }

  .itemEmbedding:after {
    width: 24px;
    height: 24px;
  }

  .luzmo-error {
    background: transparent;
    padding: 48px 0;
    margin: 0 auto;
    width: 80%;
    border: 0;
    text-align: center;
    min-height: 192px;
  }

  .dashboard-error {
    font-size: 30px;
    background: transparent;
    padding: 48px 0;
    margin: 0 auto;
    width: 80%;
    border: 0;
    text-align: center;
    min-height: 192px;
  }

  .luzmo-loader {
    top: 0;
    left: 0;
    width: 100%;
    min-height: 400px;
    position: absolute;
    transition-duration: 0.3s;
  }
`;

// libs/embed-libs/embed/src/lib/dashboard/dashboard-base.ts
var dashboardRemote = "DashboardApp";
var LuzmoDashboard = class extends i4 {
  constructor() {
    super();
    this.language = "auto";
    this.editorLanguage = "auto";
    this.screenMode = "auto";
    this.switchScreenModeOnResize = true;
    this.editMode = "view";
    this.embedMode = "webComponent";
    this.iframeStyle = {};
    this._containerStyle = {};
    this._loaderStyle = {};
    this._lcStyle = {};
    this._loadingCircleStyle = {};
    this._containerLoaderStyle = {};
    this._loaderMsg = "";
    this._itemEmbedding = false;
    this.browserError = false;
    this.browserErrorMsg = "";
    this.dashboardError = false;
    this.dashboardErrorMsg = "";
    this.browserNotSupported = [];
    this.libVersion = version + "-wc-luzmo";
    this.isLibraryLoaded = false;
    this.currentAuthKey = void 0;
    this.currentAuthToken = void 0;
    this.isInitCalled = false;
    this.attributesMap = {
      dashboardId: "dashboard-id",
      dashboardSlug: "dashboard-slug",
      itemId: "item-id",
      language: "language",
      editorLanguage: "editor-language",
      screenMode: "screen-mode",
      authKey: "auth-key",
      authToken: "auth-token",
      editMode: "edit-mode",
      theme: "theme",
      mainColor: "main-color",
      loaderBackground: "loader-background",
      loaderFontColor: "loader-font-color",
      loaderSpinnerColor: "loader-spinner-color",
      loaderSpinnerBackground: "loader-spinner-background",
      appServer: "app-server",
      apiHost: "api-host",
      itemDimensions: "item-dimensions",
      timezoneId: "timezone-id"
    };
    this.loaderSize = 32;
    this.borderWidth = 3;
    this.minHeight = 400;
    this._viewportTrackingActive = false;
    this._webComponentLibraryLoadId = 0;
    // Post synchronously on scroll/resize (not via requestAnimationFrame) so the iframe receives the
    // new slice as early as possible in the frame, minimizing the lag of the pinned analyst panel.
    this._onViewportChange = () => {
      this._postViewport();
    };
    this._containerId = uuidv4();
    this._iframeId = `luzmo-dashboard-${this._containerId}`;
    this.iframeLoaded = false;
    this.promises = {};
    this.params = this._setOptions();
    this._onResize = () => {
      if (this.shadowRoot?.querySelector(".dashboard-container")) {
        this.containerWidth = this.luzmoEmbedContainer.offsetWidth;
        if (this.params.switchScreenModeOnResize && this.params.screenMode === "auto") {
          for (const d3 of EXTENTS) {
            if (d3.width[0] <= window.innerWidth && window.innerWidth <= d3.width[1]) {
              this.currentScreenMode = d3.mode;
            }
          }
        }
        if (this.iframeLoaded) {
          this._calculateDimAfterDashboardLoaded();
        } else {
          if (this.dimensions) {
            this.containerWidth = this.luzmoEmbedContainer.offsetWidth;
            _setCalculatedDimensions(this);
          }
        }
      }
    };
    this._resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || entries.length === 0) {
          return;
        }
        this._onResize();
      });
    });
  }
  // Set resize event listener
  connectedCallback() {
    super.connectedCallback();
  }
  // Set resize event listener
  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver.disconnect();
    this._stopViewportTracking();
    for (const promiseKey of Object.keys(this.promises)) {
      this.promises[promiseKey].reject(
        new Error("Dashboard component was removed")
      );
    }
  }
  // Relay the iframe's visible slice within the host viewport to the dashboard app, so embedded
  // overlays (e.g. the IQ analyst) can pin themselves to the visible area while the host page
  // scrolls the full-height iframe. Opt-in: started when the iframe requests it via 'trackViewport'.
  _startViewportTracking() {
    if (this.isWebComponentViewMode()) {
      return;
    }
    if (!this._viewportTrackingActive) {
      this._viewportTrackingActive = true;
      window.addEventListener("scroll", this._onViewportChange, { passive: true, capture: true });
      window.addEventListener("resize", this._onViewportChange, { passive: true });
    }
    this._postViewport();
  }
  _stopViewportTracking() {
    if (!this._viewportTrackingActive) {
      return;
    }
    this._viewportTrackingActive = false;
    window.removeEventListener("scroll", this._onViewportChange, { capture: true });
    window.removeEventListener("resize", this._onViewportChange);
  }
  _postViewport() {
    const contentWindow = this.iframe?.contentWindow;
    if (!contentWindow) {
      return;
    }
    const rect = this.iframe.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
    const offsetTop = Math.min(Math.max(-rect.top, 0), rect.height);
    contentWindow.postMessage({ action: "setViewport", offsetTop, visibleHeight }, "*");
  }
  firstUpdated() {
    this._loaderMsg = getLoader(this)?.loadingMsg;
    this._loaderStyles();
    luzmo_service_default._dashboardComponents.push(this);
    if (this.luzmoEmbedContainer) {
      this._resizeObserver.observe(this.luzmoEmbedContainer);
    }
  }
  initComponent() {
    this.params = this._setOptions();
    if (this.isWebComponentViewMode()) {
      this.params.itemEmbedding = this._itemEmbedding;
      this.iframeLoaded = false;
      this._loaderStyles();
      if (!this.iframeStyle.height) {
        this.iframeStyle = calculateIframeStyles(this);
      }
      this.dashboardError = false;
      this.dashboardErrorMsg = "";
      const appServer = this.params.appServer;
      const libraryLoadId = ++this._webComponentLibraryLoadId;
      if (!appServer) {
        return;
      }
      loadLibrary(appServer, dashboardRemote).then(async () => {
        if (libraryLoadId !== this._webComponentLibraryLoadId || !this.isWebComponentViewMode() || this.params.appServer !== appServer) {
          return;
        }
        this.isLibraryLoaded = true;
        await this.updateComplete;
        if (libraryLoadId !== this._webComponentLibraryLoadId) {
          return;
        }
        const el = document.createElement("dashboard-component");
        this.setAllAttributesOnElement(el);
        el.addEventListener("load", (payload) => {
          this.dashboardErrorMsg = "";
          this.containerWidth = el.offsetWidth;
          this.dimensions = payload.detail.dimensions;
          if (this._loadTimeoutHandle) {
            clearTimeout(this._loadTimeoutHandle);
            this._loadTimeoutHandle = void 0;
          }
          this.iframeLoaded = true;
          this._calculateDimAfterDashboardLoaded();
          window.dispatchEvent(new Event("resize"));
          this.dispatchEvent(new CustomEvent("load", payload));
        });
        el.addEventListener("itemsRendered", (payload) => this.dispatchEvent(new CustomEvent("itemsRendered", payload)));
        el.addEventListener("error", (event) => {
          this._handleEmbedError(event.detail);
        });
        el.addEventListener("customEvent", (payload) => this.dispatchEvent(new CustomEvent("customEvent", payload)));
        el.addEventListener("changedFilters", (payload) => this.dispatchEvent(new CustomEvent("changedFilters", payload)));
        el.addEventListener("dashboardAction", (payload) => this.dispatchEvent(new CustomEvent("dashboardAction", payload)));
        el.addEventListener("export", (payload) => this.dispatchEvent(new CustomEvent("exported", payload)));
        el.addEventListener("contextChanged", (payload) => this.dispatchEvent(new CustomEvent("contextChanged", payload)));
        const container = this.renderRoot.querySelector("#dashboard-wc-container");
        if (container) {
          container.append(el);
          this.dashboardReference = el;
        }
      }).catch((error3) => {
        if (libraryLoadId !== this._webComponentLibraryLoadId || !this.isWebComponentViewMode() || this.params.appServer !== appServer) {
          return;
        }
        const errorMsg = error3 instanceof Error ? error3.message : "Failed to load the dashboard application.";
        this._handleEmbedError({ errorMsg });
      });
    } else {
      this.containerWidth = this.container?.clientWidth;
      _extendAndValidate(this);
      _browserCheck(this);
      this._setupLoader();
      if (!this.params.error) {
        this._loaderStyles();
        _setEventHandler();
        this._iframeUrl = createIframeUrl(this);
        this.iframe?.setAttribute("src", this._iframeUrl);
        this.iframeStyle = calculateIframeStyles(this);
      }
    }
  }
  setAllAttributes() {
    if (this.dashboardReference) {
      this.setAllAttributesOnElement(this.dashboardReference);
    }
  }
  setAllAttributesOnElement(el) {
    if (!el) {
      return;
    }
    const propertyNames = Object.keys(this.attributesMap);
    const prioritizedPropertyNames = ["dashboardId", "appServer", "apiHost"];
    for (const propertyName of [
      ...prioritizedPropertyNames,
      ...propertyNames.filter((name) => !prioritizedPropertyNames.includes(name))
    ]) {
      this.setAttributeOnElement(el, propertyName);
    }
  }
  getAttributeValue(propertyName) {
    if (propertyName === "authKey") {
      return this.params.key;
    }
    if (propertyName === "authToken") {
      return this.params.token;
    }
    return this.params[propertyName];
  }
  setAttributeOnElement(el, propertyName) {
    const attributeName = this.attributesMap[propertyName];
    if (!attributeName) {
      return;
    }
    const value = this.getAttributeValue(propertyName);
    if (value === null || value === void 0) {
      el.removeAttribute(attributeName);
      return;
    }
    const normalizedValue = ["appServer", "apiHost"].includes(propertyName) && typeof value === "string" ? removeTrailingSlash(value) : value;
    const attributeValue = typeof normalizedValue === "object" ? JSON.stringify(normalizedValue) : String(normalizedValue);
    el.setAttribute(attributeName, attributeValue);
  }
  // Reload dashboard when triggerproperty changes
  updated(changedProperties) {
    const triggerProperties = /* @__PURE__ */ new Set([
      "dashboardId",
      "dashboardSlug",
      "itemId",
      "language",
      "editorLanguage",
      "theme",
      "editMode",
      "screenMode",
      "switchScreenModeOnResize",
      "authToken",
      "authKey",
      "appServer",
      "apiHost",
      "timezoneId",
      "itemDimensions"
    ]);
    const webComponentRenderProperties = /* @__PURE__ */ new Set([
      "dashboardId",
      "dashboardSlug",
      "itemId",
      "language",
      "editorLanguage",
      "theme",
      "screenMode",
      "timezoneId",
      "itemDimensions"
    ]);
    const conditionsToCheck = ["dashboardId", "dashboardSlug", "itemId"];
    let callInitComponent = false;
    for (const condition of conditionsToCheck) {
      callInitComponent = callInitComponent || changedProperties.has(condition) && changedProperties.get(condition) === void 0 && this[condition] !== void 0;
    }
    const isDashboardReferenceMissing = !this.dashboardReference || !this.dashboardReference.isConnected;
    if (callInitComponent && (!this.isInitCalled || isDashboardReferenceMissing)) {
      if (isDashboardReferenceMissing) {
        this.dashboardReference = void 0;
      }
      this.initComponent();
      this.isInitCalled = true;
      return;
    }
    if (this.isWebComponentViewMode()) {
      if (changedProperties.has("editMode") && (!this.dashboardReference || !this.dashboardReference.isConnected)) {
        this.iframeLoaded = false;
        this.dashboardReference = void 0;
        this._webComponentLibraryLoadId++;
        if (this._loadTimeoutHandle) {
          clearTimeout(this._loadTimeoutHandle);
          this._loadTimeoutHandle = void 0;
        }
        this.params = this._setOptions();
        this.initComponent();
        return;
      }
      if ([...changedProperties.keys()].some((propertyName) => triggerProperties.has(propertyName))) {
        this.params = this._setOptions();
      }
      if (changedProperties.has("screenMode") || changedProperties.has("switchScreenModeOnResize")) {
        this._onResize();
      }
      if (changedProperties.has("appServer") || changedProperties.has("apiHost") || changedProperties.has("authKey") || changedProperties.has("authToken")) {
        this.dashboardReference?.remove();
        this.dashboardReference = void 0;
        this.initComponent();
        return;
      }
      if (this.dashboardReference) {
        if ([...changedProperties.keys()].some((propertyName) => webComponentRenderProperties.has(propertyName))) {
          this.iframeLoaded = false;
          this._loaderStyles();
        }
        for (const [propertyName] of changedProperties.entries()) {
          if (this.attributesMap[propertyName] && propertyName !== "editMode") {
            this.setAttributeOnElement(this.dashboardReference, propertyName);
          }
        }
      }
    } else {
      for (const [propertyName, previousValue] of changedProperties.entries()) {
        if (propertyName === "editMode" && this.embedMode === "webComponent" && (previousValue === "view" || previousValue === void 0)) {
          this.dashboardReference = void 0;
          this._webComponentLibraryLoadId++;
          this._reloadIframeContent();
          return;
        }
        if (triggerProperties.has(propertyName) && propertyName !== "editMode") {
          this._reloadIframeContent();
        } else if (triggerProperties.has(propertyName) && propertyName === "editMode") {
          if (this.iframeLoaded) {
            this.setEditMode(this.editMode);
            this.params = this._setOptions();
          } else {
            this._reloadIframeContent();
          }
        }
      }
    }
  }
  _reloadIframeContent() {
    this.params = this._setOptions();
    _extendAndValidate(this);
    this._setupLoader();
    if (this.params.error) {
      if (this._loadTimeoutHandle) {
        clearTimeout(this._loadTimeoutHandle);
        this._loadTimeoutHandle = void 0;
      }
      this._loaderStyles();
      return;
    }
    this.iframeLoaded = false;
    if (this._loadTimeoutHandle) {
      clearTimeout(this._loadTimeoutHandle);
    }
    this._loadTimeoutHandle = setTimeout(() => {
      console.warn(
        "Failed to load dashboard, appServer is likely down or unreachable."
      );
    }, 15 * 1e3);
    this._loaderStyles();
    this._iframeUrl = createIframeUrl(this);
    if (this.iframe) {
      this._updateIframeUrl();
    }
    this.iframeStyle = calculateIframeStyles(this);
  }
  // Set params
  _setOptions() {
    const defaultParameters = {
      dashboardId: this.dashboardId,
      dashboardSlug: this.dashboardSlug
    };
    if (this.itemId) {
      defaultParameters.itemId = this.itemId;
      this._itemEmbedding = true;
    } else {
      this._itemEmbedding = false;
    }
    if (this.language) {
      defaultParameters.language = this.language;
    }
    if (this.editorLanguage) {
      defaultParameters.editorLanguage = this.editorLanguage;
    }
    if (this.screenMode) {
      defaultParameters.screenMode = this.screenMode;
    }
    defaultParameters.switchScreenModeOnResize = this.switchScreenModeOnResize;
    if (this.authToken) {
      defaultParameters.token = this.authToken;
    }
    if (this.authKey) {
      defaultParameters.key = this.authKey;
    }
    if (this.editMode) {
      defaultParameters.editMode = this.editMode;
    }
    if (this.theme) {
      defaultParameters.theme = this.theme;
    }
    if (this.mainColor) {
      defaultParameters.mainColor = this.mainColor;
    }
    if (this.loaderBackground) {
      defaultParameters.loaderBackground = this.loaderBackground;
    }
    if (this.loaderFontColor) {
      defaultParameters.loaderFontColor = this.loaderFontColor;
    }
    if (this.loaderSpinnerColor) {
      defaultParameters.loaderSpinnerColor = this.loaderSpinnerColor;
    }
    if (this.loaderSpinnerBackground) {
      defaultParameters.loaderSpinnerBackground = this.loaderSpinnerBackground;
    }
    if (this.timezoneId) {
      defaultParameters.timezoneId = this.timezoneId;
    }
    if (this.itemDimensions) {
      defaultParameters.itemDimensions = this.itemDimensions;
    }
    if (this.appServer) {
      this.appServer = this.isWebComponentViewMode() ? removeTrailingSlash(this.appServer) : addTrailingSlash(this.appServer);
      defaultParameters.appServer = this.appServer;
    } else {
      this.appServer = addTrailingSlash(
        DEFAULT_PARAMETERS.appServer
      );
      defaultParameters.appServer = this.appServer;
    }
    if (this.apiHost) {
      this.apiHost = this.isWebComponentViewMode() ? removeTrailingSlash(this.apiHost) : addTrailingSlash(this.apiHost);
      defaultParameters.apiHost = this.apiHost;
    } else {
      this.apiHost = this.appServer.includes("luzmo.com") ? this.appServer.replace("app", "api") : this.appServer;
      defaultParameters.apiHost = this.apiHost;
    }
    this.currentAuthKey = this.authKey;
    this.currentAuthToken = this.authToken;
    return defaultParameters;
  }
  _updateIframeUrl() {
    updateIframeUrl(this.iframe, this._iframeUrl);
  }
  // Setup loader / browser error
  _setupLoader() {
    const data = getLoader(this);
    this._loaderMsg = data.loadingMsg;
    if (data.errorMsg) {
      this._handleEmbedError({ errorMsg: data.errorMsg }, "browser");
    }
  }
  /**
   * Switch the embed shell into its error state and emit the public `error` event.
   * Used for iframe postMessage errors, webComponent CustomEvents, and browser checks.
   */
  _handleEmbedError(detail, kind = "dashboard") {
    const normalizedDetail = normalizeEmbedErrorDetail(detail);
    const errorMsg = normalizedDetail.errorMsg;
    if (kind === "browser") {
      this.browserError = true;
      this.browserErrorMsg = errorMsg;
    } else {
      this.dashboardError = true;
      this.dashboardErrorMsg = errorMsg;
      this.iframeLoaded = true;
    }
    if (this._loadTimeoutHandle) {
      clearTimeout(this._loadTimeoutHandle);
      this._loadTimeoutHandle = void 0;
    }
    this._displayError();
    console.error("Dashboard error:", errorMsg);
    this.dispatchEvent(new CustomEvent("error", { detail: normalizedDetail }));
  }
  _displayError() {
    if (this.dashboardError) {
      this._loaderStyles();
      this.iframeStyle.opacity = 1;
    }
    if (this.browserError) {
      this._containerStyle.display = "none";
    }
  }
  _calculateDimAfterDashboardLoaded() {
    this.dashboardError = false;
    this._loaderStyles();
    _setCalculatedDimensions(this);
  }
  // Set loader styles
  _loaderStyles() {
    this._containerStyle = containerStyles(this);
    this._loaderStyle = loaderStyles(this);
    this._loadingCircleStyle = plStyles(this);
    this._containerLoaderStyle = containerLoaderStyles(this);
    this._lcStyle = lcStyles(this);
  }
  static get styles() {
    return [dashboardStyles];
  }
  render() {
    let toBeRenderedHTML;
    const loader = b2`
      <div
        class="luzmo-container-loader"
        id="luzmo-container-loader-${this._containerId}"
        style=${o6(
      this._containerLoaderStyle
    )}
      >
        <div
          class="luzmo-loader"
          id="luzmo-loader-${this._containerId}"
          style=${o6(this._loaderStyle)}
        >
          <div
            class="luzmo-lc"
            style=${o6(this._lcStyle)}
          >
            <div
              class="luzmo-loading-circle"
              style=${o6(
      this._loadingCircleStyle
    )}
            ></div>
            ${this._itemEmbedding ? "" : b2`
                <div
                  class="luzmo-loading-message"
                  style=${o6({ color: this.loaderFontColor })}
                >
                  ${this._loaderMsg}
                </div>
              `}
          </div>
        </div>
      </div>
    `;
    if (this.isWebComponentViewMode()) {
      toBeRenderedHTML = this.dashboardError ? b2`
          <div id="luzmo-error-${this._containerId}">
            <h3 class="luzmo-error">${this.dashboardErrorMsg}</h3>
          </div>
        ` : this.isLibraryLoaded ? b2`
            ${this.dashboardId || this.dashboardSlug ? b2`
              <div id="dashboard-wc-container"></div>
            ` : b2`
              <div id="luzmo-error-${this._containerId}">
                <h3 class="luzmo-error">${this.browserErrorMsg}</h3>
              </div>
            `}
          ` : b2`${loader}`;
    } else {
      toBeRenderedHTML = b2`
        ${this.dashboardId || this.dashboardSlug ? b2`
            ${loader}
            <iframe
              class="luzmo-embed-dashboard ${this.isWebComponentViewMode() ? "" : `luzmo-embed-dashboard-ede`}"
              id="${this._iframeId}"
              name="${this._iframeId}"
              style=${o6(this.iframeStyle)}
              src="${this._iframeUrl}"
              frameborder="0"
            ></iframe>
          ` : b2`<!-- the dashboard will inititialize when you provide a dashboardSlug or a dashboardId -->`}
        ${this.browserError ? b2`
            <div id="luzmo-error-${this._containerId}">
              <h3 class="luzmo-error">${this.browserErrorMsg}</h3>
            </div>
          ` : ""}
      `;
    }
    return b2`
      <div class="${luzmoEmbedContainerClass} ${this.isWebComponentViewMode() ? "" : `${luzmoEmbedContainerClass}-ede`}">
        <div
          class="dashboard-container"
          style=${o6(Object.assign({}, this._containerStyle, {
      width: this.iframeStyle.width ?? "100%",
      height: this.iframeStyle.height ?? "100%"
    }))}
        >
          ${toBeRenderedHTML}
        </div>
      </div>

    `;
  }
  getDashboards() {
    return new Promise(
      (resolve) => resolve(luzmo_service_default._dashboardComponents)
    );
  }
  // Public methods
  getData(itemId) {
    const dashboardReference = this.dashboardReference;
    if (this.isWebComponentViewMode() && dashboardReference) {
      return Promise.resolve().then(() => dashboardReference.getData(itemId));
    }
    if (!this.isWebComponentViewMode()) {
      return getData(this, this.iframe, itemId);
    }
    return Promise.reject();
  }
  getFilters() {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.getFilters();
    }
    if (!this.isWebComponentViewMode()) {
      return getFilters(this, this.iframe);
    }
    return Promise.reject();
  }
  getInsights(options) {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.getInsights(options);
    }
    if (!this.isWebComponentViewMode()) {
      return getInsights(this, this.iframe, options);
    }
    return Promise.reject(new Error("getInsights is not available: dashboard reference is not ready."));
  }
  getDashboardContext() {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.getDashboardContext();
    }
    if (!this.isWebComponentViewMode()) {
      return getDashboardContext(this, this.iframe);
    }
    return Promise.reject(new Error("getDashboardContext is not available: dashboard reference is not ready."));
  }
  setSelectedData(itemId, filters) {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.setSelectedData(itemId, filters);
    }
    if (!this.isWebComponentViewMode()) {
      return setSelectedData(this, this.iframe, itemId, filters);
    }
    return Promise.reject();
  }
  setAuthorization(key, token) {
    this.currentAuthKey = key;
    this.currentAuthToken = token;
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.setAuthorization(key, token);
    }
    if (!this.isWebComponentViewMode()) {
      return setAuthorization(this, this.iframe, key, token);
    }
    return Promise.reject();
  }
  refreshData(itemId) {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.refreshData(itemId);
    }
    if (!this.isWebComponentViewMode()) {
      return itemId ? refreshData(this, this.iframe, itemId) : refreshData(this, this.iframe);
    }
    return Promise.reject();
  }
  reloadDashboard() {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.reloadDashboard();
    }
    if (!this.isWebComponentViewMode()) {
      return reloadDashboard(this, this.iframe);
    }
    return Promise.reject();
  }
  exportDashboard(format) {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.exportDashboard(format);
    }
    if (!this.isWebComponentViewMode()) {
      return format ? exportDashboard(this, this.iframe, format) : exportDashboard(this, this.iframe);
    }
    return Promise.reject();
  }
  getAccessibleDashboards() {
    return getAccessibleDashboards(this);
  }
  addFilters(itemId, filters) {
    if (!this.dashboardReference) {
      return Promise.reject();
    }
    return this.dashboardReference.addFilters(itemId, filters);
  }
  setEditMode(editMode) {
    if (this.dashboardReference && editMode === "view") {
      this.editMode = "view";
      this.params.editMode = "view";
      this.initComponent();
      return Promise.resolve({
        type: "setEditMode",
        editMode
      });
    }
    if (this.dashboardReference && editMode && ["editFull", "editLimited"].includes(editMode)) {
      this.editMode = editMode;
      this.params.editMode = editMode;
      this.initComponent();
      return Promise.resolve({
        type: "setEditMode",
        editMode
      });
    }
    if (this.isWebComponentViewMode() && this.dashboardReference && editMode) {
      return this.dashboardReference.setEditMode(editMode);
    }
    if (!this.isWebComponentViewMode()) {
      return setEditMode(this, this.iframe, editMode);
    }
    return Promise.reject();
  }
  setPreview(preview) {
    if (this.isWebComponentViewMode() && this.dashboardReference) {
      return this.dashboardReference.setPreview(preview);
    }
    return setPreview(this, this.iframe, preview);
  }
  sendExportEmail(type, subject, message) {
    if (this.isWebComponentViewMode() && this.dashboardReference && type) {
      return this.dashboardReference.sendExportEmail(type, subject, message);
    } else if (!this.isWebComponentViewMode()) {
      return sendExportEmail(this, this.iframe, type, subject, message);
    }
    return Promise.reject();
  }
  isWebComponentViewMode() {
    return this.embedMode === "webComponent" && (this.editMode === "view" || this.editMode === void 0);
  }
};
__decorateClass([
  e5(".dashboard-container")
], LuzmoDashboard.prototype, "container", 2);
__decorateClass([
  e5(`.${luzmoEmbedContainerClass}`)
], LuzmoDashboard.prototype, "luzmoEmbedContainer", 2);
__decorateClass([
  e5("iframe")
], LuzmoDashboard.prototype, "iframe", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "dashboardId", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "dashboardSlug", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "itemId", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "language", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "editorLanguage", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "screenMode", 2);
__decorateClass([
  n4({
    converter: {
      fromAttribute: (value) => value === "true",
      toAttribute: String
    }
  })
], LuzmoDashboard.prototype, "switchScreenModeOnResize", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "editMode", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "theme", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "mainColor", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "authToken", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "authKey", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "loaderBackground", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "loaderFontColor", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "loaderSpinnerColor", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "loaderSpinnerBackground", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "appServer", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "timezoneId", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "apiHost", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoDashboard.prototype, "itemDimensions", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "embedMode", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_containerId", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_iframeId", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "params", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_iframeUrl", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "iframeLoaded", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "promises", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "iframeStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_containerStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_loaderStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_lcStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_loadingCircleStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_containerLoaderStyle", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_loaderMsg", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "containerWidth", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "dimensions", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "currentScreenMode", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "_itemEmbedding", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "browserError", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "browserErrorMsg", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "dashboardError", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "dashboardErrorMsg", 2);
__decorateClass([
  n4({ attribute: false })
], LuzmoDashboard.prototype, "browserNotSupported", 2);
__decorateClass([
  n4()
], LuzmoDashboard.prototype, "libVersion", 2);
__decorateClass([
  r5()
], LuzmoDashboard.prototype, "isLibraryLoaded", 2);
__decorateClass([
  r5()
], LuzmoDashboard.prototype, "dashboardReference", 2);
__decorateClass([
  r5()
], LuzmoDashboard.prototype, "currentAuthKey", 2);
__decorateClass([
  r5()
], LuzmoDashboard.prototype, "currentAuthToken", 2);
__decorateClass([
  r5()
], LuzmoDashboard.prototype, "isInitCalled", 2);

// libs/embed-libs/embed/src/lib/dashboard/dashboard-component.ts
var LuzmoEmbedDashboard = class extends LuzmoDashboard {
};
if (!customElements.get("luzmo-embed-dashboard")) {
  customElements.define("luzmo-embed-dashboard", LuzmoEmbedDashboard);
}

// libs/dashboard-contents-types/src/lib/shared/version.ts
var CONTENTS_VERSION = "0.1.106";

// libs/embed-libs/embed/src/lib/viz-item/viz-item.base.ts
var dashboardContentsVersion = CONTENTS_VERSION;
var vizItemRemote = "VizItemApp";
function collectVizItemDatasetIds(slots) {
  const ids = /* @__PURE__ */ new Set();
  for (const slot of slots ?? []) {
    for (const content of slot?.content ?? []) {
      const column = content;
      const datasetId = column.datasetId ?? column.set;
      if (datasetId) {
        ids.add(datasetId);
      }
    }
  }
  return [...ids];
}
var LuzmoBaseVizItem = class extends i4 {
  constructor() {
    super(...arguments);
    this.appServer = "https://app.luzmo.com";
    this.apiHost = "https://api.luzmo.com";
    this.slots = [];
    this.version = version + "-wc-luzmo";
    this.dashboardContentsVersion = dashboardContentsVersion;
    this.libVersion = version + "-wc-luzmo";
    this.postInitCallQueue = [];
  }
  static {
    // Static styles to set host display to block, else it is not shown at all for some reason.
    this.styles = i`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    luzmo-embed-viz-item {
      width: 100%;
      height: 1000%;
      display: block;
    }
  `;
  }
  createRenderRoot() {
    if (!this.style.display) {
      this.style.display = "block";
    }
    if (!this.style.height) {
      this.style.height = "100%";
    }
    if (!this.style.width) {
      this.style.width = "100%";
    }
    return this;
  }
  canInitializeVizItem() {
    return !!(this.type || this.dashboardId && this.itemId);
  }
  getFilters() {
    return this.chartElement.getFilters();
  }
  /**
   * Snapshot of this flex chart's live context: its definition (type, slots,
   * options), current filters and the datasets it reads. Used by context-aware
   * embeds such as the Luzmo IQ chat component.
   */
  getVizItemContext() {
    const slots = this.slots ?? [];
    return {
      id: this.contextId ?? this.getAttribute("context-id") ?? this.id ?? this.itemId ?? "",
      type: this.type,
      slots,
      inlineData: this.inlineData,
      options: this.options,
      filters: typeof this.chartElement?.getContextFilters === "function" ? this.chartElement.getContextFilters() : typeof this.chartElement?.getFilters === "function" ? this.getFilters() : [],
      datasetIds: collectVizItemDatasetIds(slots)
    };
  }
  export(type = "png") {
    return this.chartElement.export(type);
  }
  getData() {
    return this.chartElement.getData();
  }
  getInsights(options) {
    return this.chartElement.getInsights(options);
  }
  refreshData() {
    return this.chartElement.refreshData();
  }
  setSelectedData(selectedDataInput) {
    return this.chartElement.setSelectedData(void 0, selectedDataInput);
  }
  setAuthorization(key, token) {
    return this.chartElement.setAuthorization(key, token);
  }
  attributeChangedCallback(name, _old, value) {
    super.attributeChangedCallback(name, _old, value);
    if (name === "selecteddata") {
      if (this.chartElement) {
        this.setSelectedData(JSON.parse(value ?? "{}"));
      } else {
        this.postInitCallQueue.push([this.setSelectedData, [JSON.parse(value ?? "{}")]]);
      }
    }
  }
  async firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    if (this.canInitializeVizItem()) {
      await loadLibrary(this.appServer, vizItemRemote);
      this.createAndAppendElement();
    }
  }
  createAndAppendElement() {
    if (!this.chartElement) {
      this.chartElement = document.createElement("chart-component");
      this.chartElement.setAttribute("embedding-mode", "chart");
      this.chartElement.style.height = "100%";
      this.chartElement.style.width = "100%";
      this.chartElement.style.display = "block";
      this.chartElement.addEventListener("load", (payload) => this.dispatchEvent(new CustomEvent("load", payload)));
      this.chartElement.addEventListener("rendered", (payload) => {
        if (this.postInitCallQueue?.length > 0) {
          for (const functionToCall of this.postInitCallQueue) {
            functionToCall[0].bind(this)(...functionToCall[1]);
          }
        } else {
          if (this.selectedData) {
            this.setSelectedData(this.selectedData);
          }
        }
        this.dispatchEvent(new CustomEvent("rendered", payload));
      });
      this.chartElement.addEventListener("changedFilters", (payload) => {
        this.dispatchEvent(new CustomEvent("changedFilters", payload));
        this.dispatchEvent(
          new CustomEvent("contextChanged", {
            detail: { data: { type: "contextChanged", context: this.getVizItemContext() } }
          })
        );
      });
      this.chartElement.addEventListener(
        "exported",
        (payload) => this.dispatchEvent(new CustomEvent("exported", payload))
      );
      this.chartElement.addEventListener(
        "customEvent",
        (payload) => this.dispatchEvent(new CustomEvent("customEvent", payload))
      );
      this.chartElement.addEventListener("error", (event) => {
        this.dispatchEvent(
          new CustomEvent("error", {
            detail: normalizeEmbedErrorDetail(event.detail)
          })
        );
      });
      this.chartElement.addEventListener(
        "authorizationExpired",
        (payload) => this.dispatchEvent(new CustomEvent("authorizationExpired", payload))
      );
      this.updateVizItemProperties();
      this.renderRoot.append(this.chartElement);
    }
  }
  updateVizItemProperties() {
    if (this.chartElement) {
      for (const key in libraryTypeToWebComponentTypeMapping) {
        const value = this[key];
        if (value) {
          const attributeValue = ["appServer", "apiHost"].includes(key) ? removeTrailingSlash(value) : value;
          this.chartElement.setAttribute(
            libraryTypeToWebComponentTypeMapping[key],
            typeof attributeValue === "object" ? JSON.stringify(attributeValue) : attributeValue
          );
        }
      }
    }
  }
  async updated(changedProperties) {
    if (this.chartElement) {
      for (const [propertyName] of changedProperties.entries()) {
        const mappedAttributeName = libraryTypeToWebComponentTypeMapping[propertyName] ?? propertyName;
        const value = this[propertyName];
        if (propertyName === "inlineData" && (value === void 0 || value === null)) {
          this.inlineData = void 0;
          this.chartElement.removeAttribute(mappedAttributeName);
        } else {
          const attributeValue = typeof value === "object" ? JSON.stringify(value) : value?.toString() ?? value;
          this.chartElement.setAttribute(mappedAttributeName, attributeValue);
        }
      }
      if (["inlineData", "options", "slots"].some((propertyName) => changedProperties.has(propertyName))) {
        this.dispatchEvent(
          new CustomEvent("contextChanged", {
            detail: { data: { type: "contextChanged", context: this.getVizItemContext() } }
          })
        );
      }
    } else {
      if (this.canInitializeVizItem()) {
        await loadLibrary(this.appServer, vizItemRemote);
        this.createAndAppendElement();
      }
    }
  }
  render() {
    return b2``;
  }
};
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "appServer", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "apiHost", 2);
__decorateClass([
  n4({ type: Array })
], LuzmoBaseVizItem.prototype, "slots", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoBaseVizItem.prototype, "inlineData", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoBaseVizItem.prototype, "options", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "type", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "authKey", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "authToken", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "version", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "contextId", 2);
__decorateClass([
  n4({
    converter: (value) => {
      if (value == null) {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  })
], LuzmoBaseVizItem.prototype, "canFilter", 2);
__decorateClass([
  n4({ type: Array })
], LuzmoBaseVizItem.prototype, "filters", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "dashboardId", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "itemId", 2);
__decorateClass([
  n4({ attribute: "ai-message-asset-id" })
], LuzmoBaseVizItem.prototype, "aiMessageAssetId", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoBaseVizItem.prototype, "selectedData", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "dashboardContentsVersion", 2);
__decorateClass([
  n4()
], LuzmoBaseVizItem.prototype, "libVersion", 2);

// libs/embed-libs/embed/src/lib/viz-item/viz-item-component.ts
var LuzmoEmbedVizItem = class extends LuzmoBaseVizItem {
};
if (!customElements.get("luzmo-embed-viz-item")) {
  customElements.define("luzmo-embed-viz-item", LuzmoEmbedVizItem);
}

// libs/embed-libs/embed/src/lib/iq-components/luzmo-iq-chat.ts
var inputMap = {
  aiEndpoint: "ai-endpoint",
  appServer: "app-server",
  apiHost: "api-host",
  options: "options",
  initialSuggestionsDatasetId: "initialSuggestionsDatasetId",
  authKey: "auth-key",
  authToken: "auth-token",
  version: "version",
  libVersion: "lib-version",
  aydHost: "ayd-host",
  availableDatasets: "available-datasets",
  dashboardContext: "dashboard-context",
  dashboardId: "dashboard-id",
  contextIds: "context-ids",
  agentId: "agent-id"
};
var embedChatTag = "luzmo-iq-embed-chat";
var chatComponentTag = "luzmo-iq-chat-component";
var LuzmoIQEmbedChatComponent = class extends i4 {
  constructor() {
    super(...arguments);
    this.appServer = "https://app.luzmo.com";
    this.apiHost = "https://api.luzmo.com";
    this.version = version + "-wc-luzmo";
    this.libVersion = version + "-wc-luzmo";
    this.remoteEntryServer = "http://localhost:4202/";
    this.aydHost = "https://ayd.luzmo.com/";
  }
  static {
    // Static styles to set host display to block, else it is not shown at all for some reason.
    this.styles = i`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;
  }
  createRenderRoot() {
    return this;
  }
  async firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    await loadLibrary(this.calculatedAppServer, "IQApp");
    this.createAndAppendElement();
  }
  get calculatedAppServer() {
    return this.appServer.startsWith("http://localhost") ? this.remoteEntryServer : this.appServer;
  }
  createAndAppendElement() {
    if (!this.chartElement) {
      this.chartElement = document.createElement(chatComponentTag);
      this.chartElement.addEventListener("load", (payload) => this.dispatchEvent(new CustomEvent("load", payload)));
      this.chartElement.addEventListener(
        "connectionStatusChanged",
        (event) => this.dispatchEvent(new CustomEvent("connectionStatusChanged", { detail: event.detail }))
      );
      this.updateVizItemProperties();
      this.renderRoot.append(this.chartElement);
    }
  }
  updateVizItemProperties() {
    if (this.chartElement) {
      for (const key in inputMap) {
        const value = this[key];
        if (value) {
          const attributeValue = ["appServer", "apiHost", "aydHost"].includes(key) ? removeTrailingSlash(value) : value;
          this.chartElement.setAttribute(
            inputMap[key],
            typeof attributeValue === "object" ? JSON.stringify(attributeValue) : attributeValue
          );
        }
      }
    }
  }
  async updated(changedProperties) {
    if (this.chartElement) {
      for (const [propertyName] of changedProperties.entries()) {
        const mappedAttributeName = inputMap[propertyName] ?? propertyName;
        const propertyValue = this[propertyName];
        if (propertyValue == null) {
          this.chartElement.removeAttribute(mappedAttributeName);
          continue;
        }
        const attributeValue = typeof propertyValue === "object" ? JSON.stringify(propertyValue) : propertyValue.toString();
        this.chartElement.setAttribute(mappedAttributeName, attributeValue);
      }
    } else {
      await loadLibrary(this.calculatedAppServer, "IQApp");
      this.createAndAppendElement();
    }
  }
  render() {
    return b2``;
  }
  connectedCallback() {
    super.connectedCallback();
    const embedChat = document.querySelector(embedChatTag);
    if (!embedChat) {
      return;
    }
    const observer = new MutationObserver(() => {
      const customChatWidgetContentSlot = embedChat.querySelector('*[slot="custom-chat-widget-content"]');
      if (!customChatWidgetContentSlot) {
        return;
      }
      const chatElement = embedChat.querySelector(chatComponentTag);
      if (chatElement) {
        chatElement.append(customChatWidgetContentSlot);
        observer.disconnect();
      }
    });
    observer.observe(embedChat, { childList: true, subtree: true });
  }
};
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "appServer", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "apiHost", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoIQEmbedChatComponent.prototype, "options", 2);
__decorateClass([
  n4({ type: String })
], LuzmoIQEmbedChatComponent.prototype, "initialSuggestionsDatasetId", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "aiEndpoint", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "authKey", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "authToken", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "version", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "libVersion", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "remoteEntryServer", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "aydHost", 2);
__decorateClass([
  n4({ type: Array })
], LuzmoIQEmbedChatComponent.prototype, "availableDatasets", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoIQEmbedChatComponent.prototype, "dashboardContext", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "dashboardId", 2);
__decorateClass([
  n4({ type: Array })
], LuzmoIQEmbedChatComponent.prototype, "contextIds", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedChatComponent.prototype, "agentId", 2);
if (!customElements.get(embedChatTag)) {
  customElements.define(embedChatTag, LuzmoIQEmbedChatComponent);
}

// libs/embed-libs/embed/src/lib/iq-components/luzmo-iq-answer.ts
var inputMap2 = {
  aiEndPoint: "ai-end-point",
  appServer: "app-server",
  apiHost: "api-host",
  options: "options",
  authKey: "auth-key",
  authToken: "auth-token",
  version: "version",
  libVersion: "lib-version",
  messages: "messages"
};
var componentTag = "luzmo-iq-embed-answer";
var LuzmoIQEmbedAnswerComponent = class extends i4 {
  constructor() {
    super(...arguments);
    this.appServer = "https://app.luzmo.com";
    this.apiHost = "https://api.luzmo.com";
    this.version = version + "-wc-luzmo";
    this.libVersion = version + "-wc-luzmo";
    this.remoteEntryServer = "http://localhost:4202";
  }
  static {
    // Static styles to set host display to block, else it is not shown at all for some reason.
    this.styles = i`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;
  }
  createRenderRoot() {
    return this;
  }
  async firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    await loadLibrary(this.calculatedAppServer, "IQApp");
    this.createAndAppendElement();
  }
  get calculatedAppServer() {
    return this.appServer.startsWith("http://localhost") ? this.remoteEntryServer : this.appServer;
  }
  createAndAppendElement() {
    if (!this.chartElement) {
      this.chartElement = document.createElement("luzmo-iq-answer-component");
      this.chartElement.addEventListener("addQuestion", (payload) => this.dispatchEvent(new CustomEvent("addQuestion", payload)));
      this.chartElement.addEventListener("addAnswer", (payload) => this.dispatchEvent(new CustomEvent("addAnswer", payload)));
      this.updateVizItemProperties();
      this.renderRoot.append(this.chartElement);
    }
  }
  updateVizItemProperties() {
    if (this.chartElement) {
      for (const key in inputMap2) {
        const value = this[key];
        if (value) {
          const attributeValue = ["appServer", "apiHost"].includes(key) ? removeTrailingSlash(value) : value;
          this.chartElement.setAttribute(
            inputMap2[key],
            typeof attributeValue === "object" ? JSON.stringify(attributeValue) : attributeValue
          );
        }
      }
    }
  }
  async updated(changedProperties) {
    if (this.chartElement) {
      for (const [propertyName] of changedProperties.entries()) {
        const mappedAttributeName = inputMap2[propertyName] ?? propertyName;
        const attributeValue = typeof this[propertyName] === "object" ? JSON.stringify(this[propertyName]) : this[propertyName]?.toString() ?? this[propertyName];
        this.chartElement.setAttribute(mappedAttributeName, attributeValue);
      }
    } else {
      await loadLibrary(this.calculatedAppServer, "IQApp");
      this.createAndAppendElement();
    }
  }
  render() {
    return b2`  `;
  }
};
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "appServer", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "apiHost", 2);
__decorateClass([
  n4({ type: Object })
], LuzmoIQEmbedAnswerComponent.prototype, "options", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "aiEndPoint", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "authKey", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "authToken", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "messages", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "version", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "libVersion", 2);
__decorateClass([
  n4()
], LuzmoIQEmbedAnswerComponent.prototype, "remoteEntryServer", 2);
if (!customElements.get(componentTag)) {
  customElements.define(componentTag, LuzmoIQEmbedAnswerComponent);
}

// libs/embed-libs/embed/src/lib/utils/json-schema-utils.ts
var cachedSchemas = {};
function addJSONSchemas(schemas) {
  if (schemas.some((schema) => !schema.$id)) {
    throw new Error("To add schemas they all must have an $id property.");
  }
  schemas.forEach((schema) => {
    cachedSchemas[schema.$id] = schema;
  });
}
function getCachedJSONSchema(schemaUrl) {
  return cachedSchemas[schemaUrl];
}
function getCachedJSONSchemas() {
  return cachedSchemas;
}
function getJSONSchemaUrl(schemaName) {
  return `https://developer.luzmo.com/assets/json-schemas/${dashboardContentsVersion}/${schemaName}.schema.json`;
}
async function fetchJSONSchema(schemaName) {
  const schemaUrl = getJSONSchemaUrl(schemaName);
  if (getCachedJSONSchema(schemaUrl)) {
    return getCachedJSONSchema(schemaUrl);
  }
  try {
    const response = await fetch(schemaUrl, { credentials: "omit" });
    if (!response.ok) {
      throw new Error(`Failed to fetch schema ${schemaUrl}, response status: ${response.status}`);
    }
    const schema = await response.json();
    addJSONSchemas([schema]);
    return schema;
  } catch (error3) {
    console.error(error3);
  }
}
var luzmoRefParserResolver = {
  order: 101,
  // 101 would make it run after the file resolver, but before the HTTP resolver
  canRead: (file) => {
    const isLuzmoUrl = file.url.startsWith("https://developer.luzmo.com");
    if (isLuzmoUrl) {
      return !!getCachedJSONSchema(file.url);
    }
    return false;
  },
  read: (file, callback) => {
    callback(null, getCachedJSONSchema(file.url));
  }
};
var luzmoRefParserOptions = {
  mutateInputSchema: false,
  resolve: {
    luzmo: luzmoRefParserResolver,
    external: true
  }
};

// libs/embed-libs/embed/src/index.ts
i4.disableWarning?.("change-in-update");
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/style-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

if(__exports != exports)module.exports = exports;return module.exports}));
