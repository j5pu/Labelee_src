import tweepy


class TwitterHelper:
    consumer_key = ""
    consumer_secret = ""
    access_token = ""
    access_token_secret = ""
    twitter_user = ""

    def __init__(self):
        # Go to http://dev.twitter.com and create an app.
        # The consumer key and secret will be generated for you after
        self.consumer_key = "CVGTvwY4CXqT9sXQ3fjtqQ"
        self.consumer_secret = "KSiLV87mUPereicFuXn87XwdXfpujGX6DcjlW6p6Xzc"

        # After the step above, you will be redirected to your app's page.
        # Create an access token under the the "Your access token" section
        self.access_token = "1354700762-5nORKEYHNDmcc7GTCWfGUTVtodiZ4QfX04QwPVW"
        self.access_token_secret = "zPUUFTQglOrQg5Ga2MGMgQqqtArhzxvgzkVwARNY"
        self.twitter_user = "Labeleee1"


    def getTweets(self):
        try:
            auth = tweepy.OAuthHandler(self.consumer_key,self.consumer_secret)
            auth.set_access_token(self.access_token,self.access_token_secret)
            api = tweepy.API(auth)
            return api.user_timeline(self.twitter_user)
        except Exception as ex:
            return []


