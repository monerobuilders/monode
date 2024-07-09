const os = require('os');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const { ipcRenderer } = require('electron');

function is64Bit() {
    return ['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch())
}

function downloadFile(fileUrl, outputPath) {
    status_p = document.getElementById('status-p');
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        const handleResponse = (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = url.resolve(fileUrl, response.headers.location);
                downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${fileUrl}' (${response.statusCode})`));
                return;
            }

            const totalLength = parseInt(response.headers['content-length'], 10);
            let downloadedLength = 0;

            response.on('data', (chunk) => {
                downloadedLength += chunk.length;
                file.write(chunk);

                if (totalLength) {
                    const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
                    status_p.innerText = `Status: Downloading daemon (${percentage}%)`;
                }
            });

            response.on('end', () => {
                file.end();
                resolve();
            });
        };

        const parsedUrl = url.parse(fileUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(fileUrl, handleResponse).on('error', (err) => {
            fs.unlink(outputPath, () => { });
            reject(err);
        });
    });
}

async function win32() {
    status_p = document.getElementById('status-p');
    const version = is64Bit() ? '64' : '32';
    homedir = os.homedir();
    fs.mkdirSync(path.join(homedir, './.monode'), { recursive: true });
    configPath = path.join(homedir, './.monode/daemon.zip');
    status_p.innerText = 'Status: Downloading daemon'
    await downloadFile('https://downloads.getmonero.org/win' + version, configPath);
    status_p.innerText = 'Status: Extracting daemon'
    const decompress = require('decompress');
    await decompress(configPath, path.join(homedir, './.monode/'))
    status_p.innerText = 'Status: Configuring system'
    const moneroFolder = fs.readdirSync(path.join(homedir, './.monode/')).find((file) => file.startsWith('monero'));
    fs.renameSync(path.join(homedir, './.monode/', moneroFolder), path.join(homedir, './.monode/monode_monero'));
    const cp = require('child_process');
    const daemonVersion = cp.execSync(path.join(homedir, './.monode/monode_monero/monerod.exe') + ' --version').toString();
    const config = {
        'version': daemonVersion,
    };
    fs.writeFileSync(path.join(homedir, './.monode/config.json'), JSON.stringify(config));
    await ipcRenderer.invoke('setup-auto-launch', null);
    status_p.innerText = 'Status: Done. You can continue by pressing the button below.'
    continue_button = document.getElementById('continue-button');
    continue_button.style.visibility = 'visible';
}

function linux() {

}

function darwin() {

}

function downloadMonero() {
    if (process.platform === 'win32') {
        win32();
    } else if (process.platform === 'linux') {
        linux();
    } else if (process.platform === 'darwin') {
        darwin();
    }
}

function openIndex() {
    ipcRenderer.send('finished-initailization', null);
    window.close();
}

downloadMonero();