const os = require('os');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');

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
            fs.unlink(outputPath, () => { }); // Delete the file async
            reject(err);
        });
    });
}

async function win32() {
    status_p = document.getElementById('status-p');
    const version = is64Bit() ? '64' : '32';
    homedir = os.homedir();
    fs.mkdirSync(path.join(homedir, './.monode'), { recursive: true });
    configPath = path.join(homedir, './.monode/monero.zip');
    status_p.innerText = 'Status: Downloading daemon'
    await downloadFile('https://downloads.getmonero.org/win' + version, configPath);
    status_p.innerText = 'Status: Setting up config'
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

downloadMonero();