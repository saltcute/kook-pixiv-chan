const { exec } = require('node:child_process');

const process = exec("npm start", { windowsHide: true });

process.stdout.on('data', function (data) {
    console.log(data);
});