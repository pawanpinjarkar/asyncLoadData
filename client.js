const dataCache = require('./lib/dataCache');

let cachedData = {};

const settings = {
    db: process.env.db,
    username: process.env.username,
    password: process.env.password,
    host: process.env.host,
    parentKey: process.env.parentKey,
    parentConfig: process.env.parentConfig
};

exports.loadCache = () => {
    dataCache.loadCache(settings)
        .then((data) => {
            // console.log(`Successfully loaded config docs: ${cachedData}`);
            cachedData = data;
            console.log('You can now access the contents of each child document as below in your app -');
            for (const i in Object.keys(cachedData)) {
                console.log(`cachedData.${Object.keys(cachedData)[i]}`);
            }
        });
};

exports.refreshCache = (req, res) => {
    console.log('Refreshing cached data via API call from client.');
    dataCache.refreshCache()
        .then((response) => {
            console.log(`Cached data successfully refreshed: ${response}`);
            res.status(200).json({ message: 'Cached data successfully refreshed.............' });
        })
        .catch((error) => {
            console.error(`Error returned: ${error}}`);
            res.status(500).json(error);
        });
};
