# State
runjs is still in a very early erlaboration phase yet.
# Feature Set
Its possible to generate a WebLog, that means a list of HTTP-Bookmarks exported from chrome. 
The bookmarks are stored within a couchDB Datatabase. 
The DB is updated by a deamon (`watcher`) that is triggered by changes of "chrome-bookmarks.html"
Most of the HTML is still hard-coded