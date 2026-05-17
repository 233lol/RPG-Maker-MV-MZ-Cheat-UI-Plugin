function validateNwjsVersion () {
    if (!(typeof require === 'function' && typeof process === 'object')) {
        return true
    }

    const nwjsVersion = process.versions['node-webkit']
    const minRequiredNwjsVersion = '0.26.4'

    const currentVersion = nwjsVersion.split(".");
    const minVersion = minRequiredNwjsVersion.split(".");

    let lowVersion = false;
    for (let i = 0; i < minVersion.length; i++) {
      if (currentVersion[i] && currentVersion[i] >= minVersion[i]) {
        break;
      } else {
        lowVersion = true;
      }
    }

    if (lowVersion) {
        let msg = ''
        let docsUrl = ''

        
        msg = `Node Webkit version of game is too low to using cheat
  - version=${nwjsVersion}, minimum required version=${minRequiredNwjsVersion}
Cheat may not work properly.

Click "OK" button to see the solution.
`
        docsUrl = 'https://github.com/paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin#if-embeded-nwjs-version-of-game-is-lower-than-0264'

        if (window.confirm(msg)) {
            window.open(docsUrl, '_blank');
        }
        return false
    }

    return true
}

function applyCheat () {
    function __addScript(type, src) {
        var cheatScript = document.createElement('script');
        cheatScript.type = type;
        cheatScript.src = src

        document.body.appendChild(cheatScript)
    }

    function __loadJavaScript(src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.async = false;
        script._url = src;
        document.body.appendChild(script);
    }

    // load libs
    __loadJavaScript('cheat/libs/axios.min.js')

    // add <div id='app'> node for vue
    const appDiv = document.createElement('div')

    appDiv.id = 'app'
    appDiv.innerHTML = `
<v-app
    app
    dark
    style="background-color: black;">
    <v-main
        dark>
        <main-component></main-component>
    </v-main>
</v-app>
`

    document.body.appendChild(appDiv)

    // import in head
    document.head.innerHTML += `
<link href="cheat/css/roboto.css" rel="stylesheet">
<link href="cheat/css/materialdesignicons.css" rel="stylesheet">
<link href="cheat/css/vuetify.css" rel="stylesheet">
<link href="cheat/css/main.css" rel="stylesheet">
`

    // import in body
    // __loadJavaScript('cheat/init/setup.js')
    __addScript('module', 'cheat/init/setup.js')
}

validateNwjsVersion()
applyCheat()
