/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

this.ECSpec = null

const hubPath = 'https://www.emojidex.com/hub/1.1.0' // emojidex.com hub
// const hubPath = 'http://localhost:9999' // local hub

const helperChains = async chainsMethod => {
  for (const method of chainsMethod) {
    await method() // eslint-disable-line no-await-in-loop
  }
}

const hasUserAccount = () => {
  return typeof userInfo !== 'undefined' && userInfo !== null
}

const hasPremiumAccount = () => {
  return typeof premiumUserInfo !== 'undefined' && premiumUserInfo !== null
}

/* eslint-disable camelcase */
const testUserToken = { authtype: 'token', username: testUserInfo.auth_user, auth_token: testUserInfo.auth_token }
let premiumUserToken = null
if (hasPremiumAccount()) {
  premiumUserToken = { authtype: 'token', username: premiumUserInfo.auth_user, auth_token: premiumUserInfo.auth_token }
}
/* eslint-enable camelcase */

const helperBefore = async () => {
  this.ECSpec = await new EmojidexClient({ storageHubPath: hubPath })
  await this.ECSpec.User.login(testUserToken)
}

const helperBeforeForPremiumUser = async () => {
  this.ECSpec = await new EmojidexClient({
    storageHubPath: hubPath,
    limit: 1
  })
  await this.ECSpec.User.login(premiumUserToken)
}

const clearStorage = async () => {
  const CSC = new CrossStorageClient(hubPath, { frameId: 'emojidex-client-storage-hub' })
  await CSC.onReadyFrame()
  await CSC.onConnect()
  await CSC.clear()
}

const helperBeforeForEmojidexData = async () => {
  this.ECSpec = await new EmojidexClient({ storageHubPath: hubPath })
}

const getExtendedEmojiData = async () => {
  const response = await axios.get('https://www.emojidex.com/api/v1/extended_emoji')
  this.emojiEmojidex = response.data
}

const getFacesEmoji = async () => {
  const response = await axios.get('https://www.emojidex.com/api/v1/emoji', { params: { category: 'faces' } })
  this.facesEmoji = response.data.emoji
}

const setPremiumUser = async () => {
  await this.ECSpec.User.login(premiumUserToken)
}

const specTimer = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}
/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */
