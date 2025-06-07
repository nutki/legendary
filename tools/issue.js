const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchIssueDescription(issueNumber) {
    const options = {
        hostname: 'api.github.com',
        path: `/repos/nutki/legendary/issues/${issueNumber}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Node.js',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    https.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const issue = JSON.parse(data);
                    const description = issue.body;
                    const lines = description.split('\n');
                    const jsonLineIdx = lines.findIndex(line => {
                        try {
                            const r = JSON.parse(line);
                            return r instanceof Object && r.numPlayers;
                        } catch {
                            return false;
                        }
                    });

                    if (jsonLineIdx > 1) {
                        console.log('JSON formatted line:', lines[jsonLineIdx], lines[jsonLineIdx - 1], lines[jsonLineIdx - 2]);
                        const legendaryLog = lines[jsonLineIdx - 1];
                        const legendarySetup = lines[jsonLineIdx];

                        const versionFileContent = `
                        localStorage.setItem('legendaryLog', ${JSON.stringify(legendaryLog)});
                        localStorage.setItem('legendarySetup', ${JSON.stringify(legendarySetup)});
                        `;

                        fs.writeFileSync('version.js', versionFileContent, 'utf8');
                        console.log('version.js file has been created.');
                    } else {
                        console.log('No debug information found in the issue description.');
                        console.log('Full description:', description);
                    }
                } catch (err) {
                    console.error('Error parsing issue data:', err.message);
                }
            } else {
                console.error(`Failed to fetch issue. Status code: ${res.statusCode}`);
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching issue:', err.message);
    });
}

const issueNumber = process.argv[2];
if (!issueNumber) {
    console.error('Please provide an issue number as a parameter.');
    process.exit(1);
}
fetchIssueDescription(issueNumber);
