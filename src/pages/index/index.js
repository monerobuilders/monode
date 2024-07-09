const fs = require('fs');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

function checkProcessExists(processName) {
    return new Promise((resolve, reject) => {
        let command;
        if (process.platform === 'win32') {
            command = `tasklist /FI "IMAGENAME eq ${processName}"`;
        } else {
            command = `ps aux | grep ${processName}`;
        }

        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            const processExists = stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1;
            resolve(processExists);
        });
    });
}

async function main() {
    const configDir = os.homedir() + '/.monode';
    const output = document.getElementById("show-logs");
    const homedir = os.homedir();
    const configPath = homedir + '/.monode/config.json';
    const config = JSON.parse(fs.readFileSync(configPath));
    const daemonVersion = config.version;
    document.getElementById("daemon-version-p").innerText = "Daemon version: " + daemonVersion;
    if (checkProcessExists('monerod.exe')) {
        fs.readFile(configDir + '/logs/monerod.logs', 'utf8', (err, data) => {
            output.innerText = data;
            output.scrollTop = output.scrollHeight;
        });
        fs.watchFile(configDir + '/logs/monerod.logs', () => {
            fs.readFile(configDir + '/logs/monerod.logs', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                output.innerText = data;
                output.scrollTop = output.scrollHeight;
            });
        });
        document.getElementById("status-p").innerText = "Status: Daemon is running";
        document.getElementById("start-stop").textContent = "Stop";
    } else {
        document.getElementById("status-p").innerText = "Status: Daemon is not running";
        document.getElementById("start-stop").textContent = "Start";
    }
    /*
    exec(homedir + '/.monode/monode_monero/monerod.exe status').then((stdout) => {
        if (stdout.stdout.includes("Error: Couldn't connect to daemon:")) {
            
        } else {
            fs.readFile(configDir + '/logs/monerod.logs', 'utf8', (err, data) => {
                output.innerText = data;
                output.scrollTop = output.scrollHeight;
            });
            fs.watchFile(configDir + '/logs/monerod.logs', () => {
                fs.readFile(configDir + '/logs/monerod.logs', 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    output.innerText = data;
                    output.scrollTop = output.scrollHeight;
                });
            });
            document.getElementById("status-p").innerText = "Status: Daemon is running";
            document.getElementById("start-stop").textContent = "Stop";
        }
    });
    */
}

function killProcess(processName) {
    const command = process.platform === 'win32' ? `taskkill /f /im ${processName}` : `pkill -f ${processName}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing process: ${error}`);
            return;
        }
        console.log(`Process ${processName} killed successfully.`);
    });
}

function startStopDaemon() {
    const configDir = os.homedir() + '/.monode';
    const output = document.getElementById("show-logs");
    if (document.getElementById("start-stop").innerText == "Start") {
        if (fs.existsSync(configDir + '/logs/monerod.logs')) {
            fs.rmdirSync(configDir + '/logs', { recursive: true });
        }
        fs.mkdirSync(configDir + '/logs');
        fs.writeFileSync(configDir + '/logs/monerod.logs', '');
        fs.watchFile(configDir + '/logs/monerod.logs', () => {
            fs.readFile(configDir + '/logs/monerod.logs', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                output.innerText = data;
                output.scrollTop = output.scrollHeight;
            });
        });
        spawn(os.homedir() + '/.monode/monode_monero/monerod.exe', ['--non-interactive', '--log-file', configDir + '/logs/monerod.logs'], { detached: true, stdio: 'ignore' });
        document.getElementById("status-p").innerText = "Status: Daemon is running";
        document.getElementById("start-stop").textContent = "Stop";
    } else {
        // Stop the daemon
        killProcess('monerod.exe');
        output.innerText += "\nStopped the daemon\n";
        output.scrollTop = output.scrollHeight;
        fs.unwatchFile(configDir + '/logs/monerod.logs');
        document.getElementById("status-p").innerText = "Status: Daemon is not running";
        document.getElementById("start-stop").textContent = "Start";
    }
}

main(); 