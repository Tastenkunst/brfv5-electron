# Beyond Reality Face SDK - v5.0.0 (BRFv5) - Platform: Windows/macOS via Electron

This is an Electron wrapper for the brfv5-browser repository demo. 
It's a basic show case on how to distribute BRFv5 as JavaScript application on Windows and macOS.

See the other repo for more information:
+ [GitHub repository of brfv5-browser](https://github.com/tastenkunst/brfv5-browser)
+ [How to distribute an Electron app](https://electronjs.org/docs/tutorial/application-distribution)

### Visit us online.

+ [GitHub (all repos)](https://github.com/Tastenkunst)
+ [BRFv5 Demo (platform: browser)](https://tastenkunst.github.io/brfv5-browser/)
+ [ARTOv5 - Augmented Reality Try-On based on BRFv5](https://artov5.com/)
+ [TPPTv5 - ThreeJS Post Processing Tool for ARTOv5](https://artov5.com/tpptv5/)
+ [Docs / API](https://tastenkunst.github.io/brfv5-docs/)
+ [Website](https://www.beyond-reality-face.com)
+ [Facebook](https://www.facebook.com/BeyondRealityFace)
+ [Twitter](https://twitter.com/tastenkunst)

### Things to note:

#### Camera access:
package.json would usually include a "script": "start": "electron .".
On macOS, while developing, start has to look like this to get camera access: 

"start": "open node_modules/electron/dist/Electron.app --args $PWD"

Starting like this will ask to allow Camera access.

#### ES6 modules:

See main.js and allow_es6_imports.js.

Once the app is ready, create a protocol:

createProtocol('app');

and set the base tag in the html file:

<base href="app://./brfv5/" />

This will allow the use of ES6 modules and import { ... } from 'path/to/script.js'.
