emojidex Coffee/Java Script Client
==================================
The emojidex Coffee/Java Script client is set up to handle searching, listing, login, history,
favorites etc. against the emojidex API.

All examples here will be given as JavaScript. If you are bundling/using the client as Coffee
(which is the recommend way to use it) please use the original coffee file and convert syntax
accordingly.

Building
--------
You will need node with a usable npm, grunt, bower. In general grunt and bower should be
installed globally or should be present and usable in your path. We'll assume you have a
working node/npm that you either installed using your package manager or built yourself.

### Get the source
First off we need the actual source to build. Clone this repository if you haven't already.
```shell
git clone git@github.com:emojidex/emojidex-web-client.git
cd emojidex-web-client
```

### Install Packages and Obtain Required Sources
```shell
npm install
bower install
```

### Build
For a regular one-off build:
```shell
grunt
```

For development mode with dynamic compilation and dev server:
```shell
grunt dev
```
The jasmin spec runner page is left after each run at
[http://localhost:8000/build/_SpecRunner.html](http://localhost:8000/build/_SpecRunner.html).
You can open that file and play with the client in the javascript/debug terminal.

Design
======

The client is a state machine as much as it can be. Instance variables will usually apply to
the current state and will often be automatically changed after an operation. As such:
*DO NOT RELY ON INSTANCE VARIABLES TO BE ACCURATE AFTER CONSECUTIVE OR PARALLEL OPERATIONS*
Be careful not to create race conditions. Utilize callbacks efficiently.

_ALWAYS_ create a separate instance of the client for each widget or component you are using
the client in. If you have two separate pieces of code operating on the same view or in the same
module each piece of code should have a different client instance.

The client is broken up into a set of nested modules:<br>
Client<br>
  ┣Emoji<br>
  ┣Categories<br>
  ┣Indexes<br>
  ┣User<br>
  ┃  ┣History<br>
  ┃  ┗Favorites<br>
  ┣Search<br>
  ┣Data<br>
  ┗Util<br>

The Data modules should usually be ignored unless you're doing something particularly
hackish - but be warned that messing with these could be a quick way to break user data!
The Emoji and Search modules will likely be of the most interest to most developers. If you're
looking to play around with emoji these are good places to start.

Argument Layout
---------------

For the sake of uniformity and familiarity most methods will have the same layout:
```coffee
client_method(primary, secondary = [], callback = null, opts)
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
```coffee
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
```coffee
emojidex.User.login({"authtype": "plain", "username": "MeMeMe", "password": "******"});
```

If you need to log the user out you can log out by calling the logout method. Please avoid calling
this method unless you have a really good reason.
```coffee
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
```coffee
# coffee signature
search: term, callback = null, opts) ->
# usage
emojidex.Search.search("smile")
```

Advanced code search:
*note that more tags will yeiled fewer results (AND) and more categories will yield more results (OR)*
```coffee
# coffee signature
advanced: (search_details, callback = null, opts) ->
# usage
emojidex.Search.advanced({term: "smile", tags: ["happy"], categories: ["faces", "people"]})
```

Tag search:
```coffee
# coffee signature
tags: (tags, callback = null, opts) ->
# usage
emojidex.Search.tags(["open source", "education"])
```

History
-------

History is automatically obtained upon login / is saved locally so you will generally not need to
call "get", it will simply be available from:
```coffee
emojidex.User.History.all()
```

Add an item to history (please call whenever a user "uses" an emoji) using the emoji code:
```coffee
emojidex.User.History.set("combat_knife")
```

Favorites
---------

Favorites are automatically obtained upon login/ are saved locally so you will generally not need
to call "get", it will simply be available from:
```coffee
emojidex.User.Favorites.all()
```

Add an emoji to user favorites:
*note that despite "favorites" being plural this method takes a single emoji code*
```coffee
emojidex.User.Favorites.set("combat_knife")
```

Remove an emoji from user favorites:
*note that despite "favorites" being plural this method takes a single emoji code*
```coffee
emojidex.User.Favorites.unset("combat_knife")
```

The Magic "next" and "prev" Method
-----------------------
All search methods will set the "next" and "prev" method to get the next or prev page of that search.
You can call a search, then later simply call next() or prev() and get the page.
*When next is called and there are no more results an empty array will be returned*

```coffee
// first 32 results are returned and put in .results
emojidex.Search.search("face")
// next 32 results are returned and put in .results
emojidex.Search.next()
// prev 32 results are returned and put in .results
emojidex.Search.prev()
```

Utility Methods
---------------
```coffee
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
AUTH_TOKEN=0123456789abcdef
```
replacing the Your_UserName and 0123456789abcdef with your actual username and auth_token. 
The quickest way to find your auth_token is to log in on your browser, open up your user 
settings by clicking on your username in the top right, and scrolling down to the Auth Token 
field.

License
=======
emojidex and emojidex tools are licensed under the [emojidex Open License](https://www.emojidex.com/emojidex/emojidex_open_license).

©2013 the emojidex project / K.K. GenSouSha [Phantom Creation Inc.]
