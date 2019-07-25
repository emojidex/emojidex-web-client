/* eslint-disable no-undef */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

this.ECSpec = null

const hubPath = 'https://www.emojidex.com/hub/1.0.0'
const helperChains = function (chainsData) {
  if (chainsData.functions.length === 0) {
    chainsData.end()
  } else {
    const chainFunction = chainsData.functions.shift()
    chainFunction(chainsData)
  }
}

this.helperChains = helperChains

const hasUserAccount = function () { // eslint-disable-line no-unused-vars
  return typeof userInfo !== 'undefined' && userInfo !== null
}

const hasPremiumAccount = function () {
  return typeof premiumUserInfo !== 'undefined' && premiumUserInfo !== null
}

/* eslint-disable camelcase */
const testUserToken = { authtype: 'token', username: testUserInfo.auth_user, auth_token: testUserInfo.auth_token }
let premiumUserToken = null
if (hasPremiumAccount()) {
  premiumUserToken = { authtype: 'token', username: premiumUserInfo.auth_user, auth_token: premiumUserInfo.auth_token }
}
/* eslint-enable camelcase */

const helperBefore = function (chainsData) {
  this.ECSpec = new EmojidexClient({
    storageHubPath: hubPath,
    onReady: EC => {
      EC.User.login(testUserToken).then(() => {
        helperChains(chainsData)
      })
    }
  })
}

this.helperBefore = helperBefore

const helperBeforeForPremiumUser = function (chainsData) {
  this.ECSpec = new EmojidexClient({
    storageHubPath: hubPath,
    limit: 1,
    onReady: () => {
      this.ECSpec.User.login(premiumUserToken).then(() => {
        helperChains(chainsData)
      })
    }
  })
}

this.helperBeforeForPremiumUser = helperBeforeForPremiumUser

const clearStorage = function (chainsData) {
  const CSC = new CrossStorageClient(hubPath, { frameId: 'emojidex-client-storage-hub' })
  return CSC.onReadyFrame().then(() => {
    return CSC.onConnect()
  }).then(() => {
    return CSC.clear()
  }).then(() => {
    helperChains(chainsData)
  })
}

this.clearStorage = clearStorage

const helperBeforeForEmojidexData = function (chainsData) {
  this.ECSpec = new EmojidexClient({
    storageHubPath: hubPath,
    onReady: () => {
      helperChains(chainsData)
    }
  })
}

this.helperBeforeForEmojidexData = helperBeforeForEmojidexData

/* eslint-disable no-unused-vars */
const getExtendedEmojiData = chainsData =>
  axios.get('https://www.emojidex.com/api/v1/extended_emoji').then(response => {
    this.emojiEmojidex = response.data
    helperChains(chainsData)
  })

const getFacesEmoji = chainsData =>
  axios.get('https://www.emojidex.com/api/v1/emoji', {
    params: { category: 'faces' }
  }).then(response => {
    this.facesEmoji = response.data.emoji
    helperChains(chainsData)
  })

const setPremiumUser = function (chainsData) {
  this.ECSpec.User.login(premiumUserToken).then(() => {
    helperChains(chainsData)
  })
}

const specTimer = function (time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}
/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */
