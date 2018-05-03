/**
 * @author Pawan Pinjarkar
 * @version 1.0
 *
 */

const deepcopy = require('deepcopy');
const utils = require('./utils');
const Promise = require("bluebird");

let configs = {};
let settings = {};

exports.configure = (configSettings) => {
  return new Promise((resolve,reject)=>{
    settings = deepcopy(configSettings);
    if (settings.hasOwnProperty("db") && settings.db !== '' && settings.db !== undefined
      && settings.hasOwnProperty("username") && settings.username !== '' && settings.username !== undefined
      && settings.hasOwnProperty("password") && settings.password !== '' && settings.password !== undefined
      && settings.hasOwnProperty("host") && settings.host !== '' && settings.host !== undefined
      && settings.hasOwnProperty("parentKey") && settings.parentKey !== '' && settings.parentKey !== undefined
      && settings.hasOwnProperty("parentConfig") && settings.parentConfig !== '' && settings.parentConfig !== undefined
    ) {
      console.log('The specified settings are correctly set.');
      return resolve(settings);
    }
    else {
      return reject('Make sure the settings object is correctly set.');
    }
  });
}

// a promise should only return another promise or synchronous value/undefined or throw an error
exports.loadCache = function (configSettings) {
  return new Promise((resolve, reject) => {
  module.exports.configure(configSettings)
  .then(function(settings){
      utils.loadParentConfig(settings, settings.parentConfig)
        .then(function (docs) {
          return Promise.map(docs, function (doc) {
            return utils.setCacheConfig(settings, doc);
          }, { concurrency: 5 });
        }).then(function (configContents) {
          const childDocs = {};
          for (let i = 0; i < configContents.length; i = i + 1) {
            const key = configContents[i]._id,
              obj = {
                [key]: configContents[i]._id
              };
            const childDoc = JSON.stringify(obj).split(':')[0].substring(2, JSON.stringify(obj).split(':')[0].length - 1)
            childDocs[childDoc] = childDoc;
          }
          let childDocKey = '';
          for (let doc in childDocs) {
            if (doc.toUpperCase().endsWith(settings.parentKey)) {
              childDocKey = doc.substring(0, doc.length - (settings.parentKey.length + 1)).toCamelCase();
              configs[childDocKey] = utils.getCachedData(doc);
            }
            else
              configs[doc.toCamelCase()] = utils.getCachedData(doc);
          }
          return resolve(configs);
        });
  })
  
});
}

exports.refreshCache = function () {
  console.log(`Refreshing cached data via API call.`);
  return new Promise((resolve, reject) => {
    return resolve(module.exports.loadCache(settings));
  });
};
