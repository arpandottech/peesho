const mongoose = require('mongoose');
const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const Domain = require('../backend/models/Domain');

// Configuration
const APACHE_SITES_AVAILABLE = '/etc/apache2/sites-available';
const APACHE_LOG_DIR = '/var/log/apache2';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 10 });
        console.log('DB Connected');
        await processQueue();
    } catch (err) {
        console.error('DB Config Error:', err);
        process.exit(1);
    }
};

const executeCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Command Warning/Error: ${cmd}`, stderr);
                resolve({ success: false, output: stderr });
            } else {
                resolve({ success: true, output: stdout });
            }
        });
    });
};

const generateVHost = (domain) => {
    return `<VirtualHost *:80>
    ServerName ${domain}
    ServerAlias www.${domain}
    ServerAdmin admin@${domain}
    DocumentRoot /var/www/html/build

    <Directory /var/www/html/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/${domain}_error.log
    CustomLog \${APACHE_LOG_DIR}/${domain}_access.log combined
</VirtualHost>`;
};

const processQueue = async () => {
    console.log('Checking for Pending Domains...');
    // Fetch where EITHER apache or ssl is pending
    const pendingDomains = await Domain.find({
        $or: [{ apache_status: 'pending' }, { ssl_status: 'pending' }]
    });

    if (pendingDomains.length === 0) {
        console.log('No pending domains.');
        process.exit(0);
    }

    for (const doc of pendingDomains) {
        const domain = doc.domain_name;
        console.log(`Provisioning: ${domain}`);

        try {
            // ----------------------------------------
            // STEP 1: Apache VHost Setup
            // ----------------------------------------
            if (doc.apache_status === 'pending') {
                if (process.platform !== 'win32') {
                    const vhostContent = generateVHost(domain);
                    const vhostPath = path.join(APACHE_SITES_AVAILABLE, `${domain}.conf`);

                    await fs.writeFile(vhostPath, vhostContent);
                    console.log(`VHost written to ${vhostPath}`);

                    const enableSite = await executeCommand(`a2ensite ${domain}.conf`);
                    if (!enableSite.success) {
                        throw new Error(`Failed to enable site: ${enableSite.output}`);
                    }

                    const reloadApache = await executeCommand('systemctl reload apache2');
                    if (!reloadApache.success) {
                        throw new Error(`Failed to reload Apache: ${reloadApache.output}`);
                    }

                    doc.apache_status = 'active';
                    doc.setupLogs.push({ message: 'Apache VHost Configured & Reloaded' });
                } else {
                    console.log('Windows: Simulating Apache Setup...');
                    doc.apache_status = 'active';
                    doc.setupLogs.push({ message: 'Simulated Apache Setup Complete' });
                }
                await doc.save();
            }

            // ----------------------------------------
            // STEP 2: SSL Setup (Certbot)
            // ----------------------------------------
            if (doc.ssl_status === 'pending') {
                if (process.platform !== 'win32') {
                    console.log('Requesting SSL...');

                    // Command with www subdomain
                    const certCmd = `certbot --apache -d ${domain} -d www.${domain} --non-interactive --agree-tos --email admin@${domain} --redirect`;
                    const certDetails = await executeCommand(certCmd);

                    if (certDetails.success) {
                        doc.ssl_status = 'active';
                        doc.setupLogs.push({ message: 'SSL Secured & Active (www included)' });

                        // Reload Apache to apply SSL config
                        await executeCommand('systemctl reload apache2');
                    } else {
                        const output = certDetails.output || "";
                        // Smart Retry: If DNS issue, keep pending to retry later
                        if (output.includes('DNS problem') || output.includes('Connection refused') || output.includes('NXDOMAIN')) {
                            doc.ssl_status = 'pending'; // Stay pending to retry
                            doc.setupLogs.push({ message: 'SSL Retry: DNS not fully propagated yet.' });
                        } else {
                            doc.ssl_status = 'failed';
                            doc.setupLogs.push({ message: 'SSL Failed: ' + output.substring(0, 150) });
                        }
                    }
                } else {
                    console.log('Windows: Simulating SSL Setup...');
                    doc.ssl_status = 'active';
                    doc.setupLogs.push({ message: 'Simulated SSL Setup Complete' });
                }
                await doc.save();
            }

        } catch (err) {
            console.error(`Failed to provision ${domain}:`, err);
            doc.setupLogs.push({ message: 'General Error: ' + err.message });
            await doc.save();
        }
    }

    console.log('Queue Processed.');
    process.exit(0);
};

connectDB();
