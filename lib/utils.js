const cache = require('memory-cache');
const async = require('async');
let configDocs = [];

function findValueOfProperty(obj, propertyName) {
  let reg = new RegExp(propertyName, "i");
  return Object.keys(obj).reduce((result, key) => {
    if (reg.test(key)) result.push(obj[key]);
    return result;
  }, []);
}

exports.getConfigData = function(settings, configFile) {
  return new Promise(function(resolve,reject){
    let config = {};
    // compose the url from the components
    config.url = `https://${settings.username}:${settings.password}@${settings.host}`;
    // initialize the Cloudant library
    const cloudant = require('cloudant')(config);
    const db = cloudant.db.use(settings.db);

    db.get(configFile, null, function (error, body) {
      if (!error) {
        resolve(body);
      } else {
        console.error(`Couldn't GET ${configFile} and here's why: ${error}`);
        const errorObj = new Error(`Couldn't GET ${configFile} and here's why: ${error}`);
        reject(errorObj);
      }
    });
  });
}

exports.setCacheConfig = function (settings, configDocName) {
  return new Promise(function (resolve, reject) {
    module.exports.getConfigData(settings, configDocName)
    .then(function(result){
      console.log(`Setting data cache for config doc: ${configDocName}`);
      cache.put(configDocName, result);
      resolve(result)
    })
    .catch(function (error) {
      reject(error)
    })
  });
}

exports.loadParentConfig = function (settings, parentConfigFile) {
  // make a call to cloudant and get the contents of the parent doc
  return new Promise((resolve, reject) => {
    module.exports.getConfigData(settings, parentConfigFile)
      .then(function (parentConfigData) {
        console.log(`Parent document contents returned: ${parentConfigData._id}`);
        // console.log(`parentKey is set to: ${settings.parentKey}`);
        let keys = [];
        if (parentConfigData !== undefined) keys = (Object.keys(parentConfigData));
        let parentDockeys = [];
        for (let i = 0; i < keys.length; i = i + 1) parentDockeys.push(keys[i].toUpperCase());

        parentDockeys.sort();
        for (let i = 0; i < parentDockeys.length; i = i + 1) {
          if (settings.parentKey.toUpperCase().includes(parentDockeys[i])) {
            configDocs = findValueOfProperty(parentConfigData, settings.parentKey);
            break;
          }
        }
        return resolve(configDocs[0]);
      })
      .catch(function(error){
        return reject(error);
      });
  });

};

exports.getCachedData = ((configDocName) => {
  if (cache.get(configDocName) === null) {
    console.log('Incorrect key (config doc name).');
    // exit with a failure
     process.exit(1);
  }
  return (cache.get(configDocName));
});

String.prototype.toCamelCase = function () {
  return this.replace(/[^a-z ]/ig, '')
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g,
    function (match, index) {
      return +match === 0 ? "" : match[index === 0 ? 'toLowerCase' : 'toUpperCase']();
    });
};