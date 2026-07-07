function validateNwjsVersion() {
  if (!(typeof require === "function" && typeof process === "object")) {
    return true;
  }

  const nwjsVersion = process.versions["node-webkit"];
  const minRequiredNwjsVersion = "0.44.0";

  const lowVersion = nwjsVersion.localeCompare(minRequiredNwjsVersion, undefined, { numeric: true }) <0;

  if (lowVersion) {
    let msg = "";
    let docsUrl = "";

    msg = `Node Webkit version of game is too low to using cheat
  - version=${nwjsVersion}, minimum required version=${minRequiredNwjsVersion}
Cheat may not work properly.

Click "OK" button to see the solution.
`;
    docsUrl =
      "https://github.com/paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin#if-embeded-nwjs-version-of-game-is-lower-than-0264";

    if (window.confirm(msg)) {
      window.open(docsUrl, "_blank");
    }
    return false;
  }

  return true;
}

function applyCheat() {
  function __addScript(type, src) {
    var cheatScript = document.createElement("script");
    cheatScript.type = type;
    cheatScript.src = src;

    document.body.appendChild(cheatScript);
  }

  function __loadJavaScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.async = false;
    script._url = src;
    document.body.appendChild(script);
  }

  // add <div id='app'> node for vue
  const appDiv = document.createElement("div");

  appDiv.id = "app";
  appDiv.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;";
  appDiv.innerHTML = `
<v-app>
    <v-main>
        <main-component></main-component>
    </v-main>
</v-app>
`;

  document.body.appendChild(appDiv);

  // import in head
  document.head.innerHTML += `
<link href="cheat/css/roboto.css" rel="stylesheet">
<link href="cheat/css/materialdesignicons.css" rel="stylesheet">
<link href="cheat/css/vuetify.css" rel="stylesheet">
<link href="cheat/css/main.css" rel="stylesheet">
`;

  // import in body
  __addScript("module", "cheat/init/setup.js");
}

validateNwjsVersion();
applyCheat();
