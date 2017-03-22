emojidex Java Script Client
==================================
The emojidex Java Script client is set up to handle searching, listing, login, history,
favorites etc. against the emojidex API.

Building
--------
You will need node with a usable npm and grunt. In general grunt should be
installed globally or should be present and usable in your path. We'll assume you have a
working node/npm that you either installed using your package manager or built yourself.

### Get the source
First off we need the actual source to build. Clone this repository if you haven't already.
```shell
git clone git@github.com:emojidex/emojidex-web-client.git
cd emojidex-web-client
```

### Install Packages and Obtain Required Sources
First install NPM and Yarn.
  
Then:
```shell
yarn
```

### Build
For a regular one-off build:
```shell
gulp
```

For development mode with dynamic compilation and dev server:
```shell
gulp dev
```

For running specs:
```shell
gulp spec
```

The jasmin spec runner page is accessable on port 8888 of your local host
[http://localhost:8888](http://localhost:8888).

Design
======
The client is a state machine as much as it can be. Instance variables will usually apply to
the current state and will often be automatically changed after an operation. As such:
*DO NOT RELY ON INSTANCE VARIABLES TO BE ACCURATE AFTER CONSECUTIVE OR PARALLEL OPERATIONS*
Either be careful not to create race conditions or make sure you obtain data solely off of 
callbacks. Utilize callbacks efficiently.

_ALWAYS_ create a separate instance of the client for each widget or component you are using
the client in. If you have two separate pieces of code operating on the same view or in the same
module each piece of code should have a different client instance.

The client is broken up into a set of nested modules:  
Client  
  ┣Emoji  
  ┣Categories  
  ┣Indexes  
  ┣User  
  ┃  ┣History  
  ┃  ┗Favorites  
  ┣Search  
  ┣Data  
  ┗Util  

The Data modules should usually be ignored unless you're doing something particularly
hackish - but be warned that messing with these could be a quick way to break user data!
The Emoji, Search and Util modules will likely be of the most interest to most developers. 
If you're looking to play around with emoji these are good places to start.

Argument Layout
---------------
For the sake of uniformity and familiarity most methods will have the same layout:
```js
ClassObject.Tool.someMethod(primary, secondary = [], callback = null, opts)
```
That is:
  1. primary: the primary argument, such as the search term
  2. secondary: secondary, teritary, etc. arguments are always pre-initialized to some value, but
    can always be set to null to ignore them (the _breakout method checks and fixes nulls).
  3. callback: always the second to last argument, defines a callback method to which the results
    will be passed after a successful transaction.
  4. opts: can be ignored. The opts hash can contain any overrides you may want and is where you
    can manually specify "page", "limit", and "detailed" on a per-operation basis.

Usage
=====
Basic usage is listed here. For more usage patterns please check the JavaScript tabs on
[developer.emojidex.com](http://developer.emojidex.com).

Initialization/Instantiation
----------------------------
Basic initialization and usage:
```js
emojidex = new EmojidexClient();
```

Initialization can take a variety of overrides:

override key  | default value | description
----------------|---------------|------------
locale      | 'en'      | The language to use (currently only 'en' and 'ja' are supported)
size_code   | 'px32'    | The size this client will use. Default is 32px, see [here](http://developer.emojidex.com/#asset-formats) for more
limit     | 32      | Default limit per page. Protip: Use next() to get the next page.
detailed    | false     | Get detailed emoji info by default (not needed for most purposes)

A few other overrides exist but these are mostly just there for specialized distrobutions
(EG static deployment on intranets or limited internet access). Note that activating the overrides
not listed above could violate the Terms of Service or Open License. If you have questions please
open an issue on github.

Plain Auth / Login
------------------
If an API Key / Auth Token is already obtained it will be saved in local storage. The easiest way
to obtain an API Key is with basic authentication using a username or e-mail address and password.
```js
emojidex.User.login({"authtype": "plain", "username": "MeMeMe", "password": "******"});
```

If you need to log the user out you can log out by calling the logout method. Please avoid calling
this method unless you have a really good reason.
```js
emojidex.logout();
```

Search
------
Search results can be taken in a callback or can be found in the .results instance variable:
```json
emojidex.Search.results
> [{category: 'faces', code 'smiley face with winking eye'}, ...]
```

Basic code search:
```js
# signature
search(term, callback = null, opts)
# usage
emojidex.Search.search("smile");
```

Advanced code search:
*note that more tags will yeiled fewer results (AND) and more categories will yield more results (OR)*
```js
# signature
advanced(search_details, callback = null, opts)
# usage
emojidex.Search.advanced({term: "smile", tags: ["happy"], categories: ["faces", "people"]});
```

Tag search:
```js
# signature
tags: (tags, callback = null, opts) ->
# usage
emojidex.Search.tags(["open source", "education"]);
```

History
-------

History is automatically obtained upon login / is saved locally so you will generally not need to
call "get", it will simply be available from:
```js
emojidex.User.History.all();
```

Add an item to history (please call whenever a user "uses" an emoji) using the emoji code:
```js
emojidex.User.History.set("combat_knife");
```

Favorites
---------

Favorites are automatically obtained upon login/ are saved locally so you will generally not need
to call "get", it will simply be available from:
```js
emojidex.User.Favorites.all();
```

Add an emoji to user favorites:
*note that despite "favorites" being plural this method takes a single emoji code*
```js
emojidex.User.Favorites.set("combat_knife");
```

Remove an emoji from user favorites:
*note that despite "favorites" being plural this method takes a single emoji code*
```js
emojidex.User.Favorites.unset("combat_knife");
```

The Magic "next" and "prev" Method
-----------------------
All search methods will set the "next" and "prev" method to get the next or prev page of that search.
You can call a search, then later simply call next() or prev() and get the page.
*When next is called and there are no more results an empty array will be returned*

```js
// first 32 results are returned and put in .results
emojidex.Search.search("face");
// next 32 results are returned and put in .results
emojidex.Search.next();
// prev 32 results are returned and put in .results
emojidex.Search.prev();
```

Utility Methods
---------------
```js
// adds an aray of emoji to the emoji available in the emoji instance variable, removing dupes
selection = emojidex.Emoji.combine(emoji_we_want_users_to_use_on_our_site);

// returns an array of only emoji codes and asset URLs (default is from the results array)
results_for_a_list = emojidex.Util.simplify();
simple_list_of_seal_sized_emoji = emojidex.Util.simplify(emojidex.results, 'seal');
```

Building
========
Building requires node and npm. After cloning the repository, simply do:

```
npm install
grunt
```

Testing
=======
There are two types of specs: regular specs that use the test account and specs that require a
premium account with R-18 enabled. As a developer you are eligable to receive a complimentary 
upgrade to a premium account if you are working on either an emojidex package or module or 
integration of emojidex in your own software. Simply contact info@emojidex.com with the subject 
"Developer Account" and list the following details:
1. Your username on emojidex
2. The project(s) you intend to work on

.env (optional)
---------------
After obtaining a permium account you can use it for testing. To do this you need to create a 
file named '.env' with the following information:
```
USERNAME=Your_UserName
EMAIL=your@email.com
PASSWORD=YourPassword123
AUTH_TOKEN=0123456789abcdef
```
replacing the Your_UserName and 0123456789abcdef etc. with your actual username and auth_token... 
The quickest way to find your auth_token is to log in on your browser, open up your user 
settings by clicking on your username in the top right, and scrolling down to the Auth Token 
field (or to do an auth request with CURL as in the developer.emojidex.com documentation).

Building and Running Tests
--------------------------
For your initial build run `grunt` once. If there are no errors run `grunt dev` to start up the 
live development server.

Specs are using Jasmine, but due to some issues with phantomjs (async callbacks aren't supported?) 
we currently have it disabled. To try with phantomjs simply type `grunt jasmine`, but don't expect 
much for now.

To actually run the specs open up 
[http://localhost:8000/build/_SpecRunner.html](http://localhost:8000/build/_SpecRunner.html) 
in your browser.
After editing, check your terminal to make sure grunt has caught up compiling and refresh the 
SpecRunner page in your browser.

Running specs in your browser will taint your emojidex local storage entry, so be sure to log out 
and log back in on [https://www.emojidex.com](https://www.emojidex.com) when you're done.

License
=======
emojidex and emojidex tools are licensed under the [emojidex Open License](https://www.emojidex.com/emojidex/emojidex_open_license).

©2013 the emojidex project / K.K. GenSouSha [Phantom Creation Inc.]
