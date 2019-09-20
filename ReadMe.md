# Server side code for Vesica
Vesica is a small project by Varun Agarwal and Utkarsh Verma to demonstrate chat application using libp2p from IPFS module.The core code used to interact with Android app is in `vesica-core-server` folder while `vesica-misc` demos multi node setup wherein users can communicate with each other using `CLI`. An key exchange using DiffiHelman is initiated automatically upon setup. The encryption feature is not part of the Android app and therefore was pushed into a different repo altogether.

#### Deployment
- `npm i` in root folder
- `cd auth` followed by `node app.js`. This setsups the authentication APIs
- `cd nodes` followed by `node node-one-listener.js`. This relays the chat messages from one client to another
- Install the apk from https://github.com/varunagarwal315/vesica-android and run the application
- For basic tests refer to `vesica-core-server/auth/users.json` for hard coded auth values, to make them dynamic you make use `vesica-misc/auth` instead. This will require some reconfiguration.

#### Tests
- Several test scenarios are setup in `vesica-misc/tests`. As some require lot of user interaction (CLI inputs) `mocha` and `chai` have not been used to automate the tasks. To use basic chat (no encryption) and learn how lib2p2 functions you can use `/tests/chat` and run `primary.js` , `secondary.js` and `tertiary.js` in this order in different terminals.
- `/vesica-misc/components` has sample code for implementing encryption using `tweetnacl` and native `crypto` module with the corresponding tests in the `/tests` folder

#### Warning
This was a fun side project made by us and in no means to be used in production. The code requires lot of refractoring and cleaning but is functional.
