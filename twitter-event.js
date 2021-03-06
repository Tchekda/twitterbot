//Setting up local letaibles
let twit = null,
    errorLog = null,
    infoLog = null

//Receive all data
let init = function (infos) {
    twit = infos.twit
    errorLog = infos.errorLog
    infoLog = infos.infoLog
}

//When you are identified in a tweet
let identified = function (event) {
    if (event.user.id != process.env.USER_ID){
        for (let i = 0, len = event.entities.user_mentions.length; i < len; i++) {
            if(event.entities.user_mentions[i].id == process.env.USER_ID){
                likeTweet(event.id_str, event.user)
                break
            }
        }
    }
}

//When you are followed by someone
let followed = function (event) {
    if(event.source.id !== process.env.USER_ID){
        infoLog.info(regexAll(process.env.NEW_FOLLOWER, event.source.screen_name, event.source.name))
        tweetText(regexAll(process.env.NEW_FOLLOWER, event.source.screen_name, event.source.name))
    }
}

//When one of your tweet is quoted
let quoted = function (event) {
    if(event.source.id != process.env.USER_ID){
        likeTweet(event.target_object.id_str, event.target_object.user)
    }
}

//To Tweet some text
let tweetText = function (text) {
    let params = {
        status : text
    }
    twit.post('statuses/update', params, logData)
    function logData(err){
        if(err){
            errorLog.error('An error occured : ' + err)
        }else{
            infoLog.info(process.env.TWEETED.replace(/%text%/gi, text))
        }
    }
}

//Define Welcome Message in Direct Messages
let setWelcomeMessage = function () {
    let params = {
        "welcome_message": {
            "message_data": {
                "text": process.env.WELCOME_MESSAGE
            }
        }
    }

    twit.post('direct_messages/welcome_messages/new', params, sended)

    function sended(err){
        if(err){
            errorLog.error('An error occured : ' + err)
        }else{
            infoLog.info(process.env.WELCOME_MESSAGE_DEFINED.replace(/%text%/gi, params.welcome_message.message_data.text))
        }
    }
}

//Like someone's tweet
let likeTweet = function (tweetID, author) {
    let params = {
        id : tweetID
    }

    twit.post('favorites/create', params, liked)

    function liked(err){
        if(err){
            errorLog.error('An error occured : ' + err)
        }else{
            infoLog.info(regexAll(process.env.LIKED, author.screen_name, author.name))
        }
    }
}

//Delete one of your tweets
let deleteTweet = function (tweetID) {
    let params = {
        id: tweetID
    }
    twit.post('statuses/destroy', params, deleted)

    function deleted(err) {
        if (err) {
            errorLog.error('An error occured : ' + err)
        } else {
            infoLog.info(process.env.TWEET_DELETED)
        }
    }
}

//When you receive a direct message
let receiveMessage = function (event) {
    let to = event.direct_message.recipient.screen_name,
        splited = event.direct_message.text.toLowerCase().split(' ')
    if (event.direct_message.recipient.id === process.env.USER_ID) {
        if (splited.indexOf('bot') !== -1) {
            //In developpement
        }
    }
}

//Get ID of one of your tweets with the following text
let getTweetID = function (text) {
    let params = {
        q: text + ' from:' + process.env.USERNAME
    }

    twit.get('search/tweets', params, tweets)

    function tweets(err, data) {
        let tweetID = null
        if (err) {
            errorLog.error('An error occured : ' + err)
        } else {
            if (data.statuses.length === 0) {
                tweetID = null
            } else {
                tweetID = data.statuses[0].id_str
            }
        }
        return tweetID
    }
}

let retweetKeyWord = function (tweet) {
    //In developpement
}

let retweetTweetID = function (id) {
    twit.post('statuses/retweet/:id', { id: id }, callback)
    function callback(err, data){
        if (err){
            errorLog.error('An Error Occured while trying to retweet ' + err)
        }else{
            infoLog.log(regexAll(process.env.RETWEETED, data.user.screen_name, data.user.name))
        }
    }
}

let regexAll = function(text, username = null, name = null) {
    if (username != null)
        text = text.replace(/%username%/gi, username)
    if (name != null)
        text = text.replace(/%name%/gi, name)
    return text
}

//export all functions to the main module (bot.js)
module.exports = {
    init:               init,
    setWelcomeMessage:  setWelcomeMessage,
    quoted:             quoted,
    identified:         identified,
    followed:           followed,
    receiveMessage:     receiveMessage,
    retweetKeyWords:    retweetKeyWord
}