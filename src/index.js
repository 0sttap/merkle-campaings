const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chains = require('./constants/chains');

const types = [1, 2, 3, 4, 7, 8];
const baseUrl = 'https://api.merkl.xyz/v3/campaigns?live=true';
const typesQuery = types.map(type => `&types=${type}`).join('');
const url = `${baseUrl}${typesQuery}`;

const logFilePath = path.join(__dirname, 'merkl-campaigns.json');
const newCampaignsFilePath = path.join(__dirname, 'new-campaigns.json');

const fetchAndUpdateCampaigns = async () => {
    try {
        const response = await axios.get(url);
        const data = response.data;
        const newIdsByChain = {};

        // Extract IDs from all chains
        for (const chain in data) {
            if (chains[chain]) {
                newIdsByChain[chains[chain]] = Object.keys(data[chain]);
            }
        }

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, JSON.stringify(newIdsByChain, null, 2));
            console.log('Log file created with all IDs.');
        } else {
            const existingData = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
            const newUniqueIdsByChain = {};

            for (const chain in newIdsByChain) {
                const existingIds = existingData[chain] || [];
                const newUniqueIds = newIdsByChain[chain].filter(id => !existingIds.includes(id));
                if (newUniqueIds.length > 0) {
                    newUniqueIdsByChain[chain] = newUniqueIds;
                }
            }

            if (Object.keys(newUniqueIdsByChain).length > 0) {
                fs.writeFileSync(newCampaignsFilePath, JSON.stringify(newUniqueIdsByChain, null, 2));

                console.log('New IDs:', newUniqueIdsByChain);
            } else {
                console.log('No new IDs found.');
            }

            fs.writeFileSync(logFilePath, JSON.stringify(newIdsByChain, null, 2));
            console.log('Log file updated with all IDs.');
        }
    } catch (error) {
        console.error('Error fetching campaigns:', error);
    }
};

fetchAndUpdateCampaigns();
